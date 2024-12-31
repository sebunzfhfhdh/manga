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

const formatMangaData = (manga, baseUrl) => ({
    ...manga,
    poster: transformImageUrl(manga.poster, baseUrl),
});

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


// Fetch popular mangas based on the number of views (popularity)
router.get('/', async (req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/`; 

    try {
        const query = `
            SELECT *, (views * 0.7 + likes * 0.3) AS popularity
            FROM mangas
            ORDER BY popularity DESC
        `;
        const result = await fetchManga(query);

        if (!result) {
            return res.status(404).json({ error: 'No popular manga found' });
        }

        const updatedMangaList = result.map(manga => formatMangaData(manga, baseUrl));

        res.json(updatedMangaList);
    } catch (err) {
        console.error('Error fetching popular mangas:', err.message);
        next(err);
    }
});

router.use((err, req, res, next) => {
    console.error('Error handling middleware:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
