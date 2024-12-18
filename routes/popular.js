const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();
require('dotenv').config();

const db = new Database(process.env.DBinfo);

const fetchManga = async (query, params = []) => {
    try {
        const result = await db.sql(query, params);
        return result.length ? result : null;
    } catch (err) {
        console.error('Error querying the database:', err.message);
        throw new Error('Database error');
    }
};

const transformImageUrl = (url, baseUrl) => {
    try {
        const decodedUrl = decodeURIComponent(url); 
        let filePath;

        if (decodedUrl.includes('/mangap')) {
            filePath = decodedUrl.split('/mangap')[1];
        } else {
            filePath = decodedUrl; 
        }

        if (filePath && filePath.startsWith('/')) {
            filePath = filePath.substring(1);
        }

        return filePath
            ? `${baseUrl}images/${filePath}`
            : `${baseUrl}images/${decodedUrl}`; 

    } catch (err) {
        console.error('Error transforming image URL:', err.message);
        return `${baseUrl}images/${url}`;
    }
};

const formatMangaData = (manga, baseUrl) => ({
    ...manga,
    poster: transformImageUrl(manga.poster, baseUrl),
});

// Fetch maximum values for likes and views
const fetchMangaMaxValues = async () => {
    try {
        const maxValuesQuery = `
            SELECT 
                MAX(COALESCE(likes, 0)) AS maxLikes, 
                MAX(COALESCE(views, 0)) AS maxViews
            FROM mangas
        `;
        const result = await fetchManga(maxValuesQuery);
        return result?.[0] || { maxLikes: 1, maxViews: 1 };
    } catch (err) {
        console.error('Error fetching maximum values:', err.message);
        return { maxLikes: 1, maxViews: 1 }; // Default fallback values
    }
};

// Router
router.get('/', async (req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    try {
        // Get max values for normalization
        const { maxLikes, maxViews } = await fetchMangaMaxValues();

        // Define weights for likes and views
        const weights = { likes: 0.5, views: 0.5 };

        // Query to calculate popularity score
        const query = `
            SELECT *,
                (
                    (? * (likes * 1.0 / ?)) + 
                    (? * (views * 1.0 / ?))
                ) AS popularityScore
            FROM mangas
            ORDER BY popularityScore DESC
        `;
        const params = [
            weights.likes, maxLikes,
            weights.views, maxViews
        ];

        const result = await fetchManga(query, params);

        if (!result) {
            return res.status(404).json({ error: 'No popular manga found' });
        }

        // Format manga data
        const updatedMangaList = result.map(manga => formatMangaData(manga, baseUrl));

        // Return the sorted list of popular manga
        res.json(updatedMangaList);
    } catch (err) {
        console.error('Error fetching popular mangas:', err.message);
        next(err);
    }
});

// Error-handling middleware
router.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = router;
