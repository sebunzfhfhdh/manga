const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();
require('dotenv').config();

// Initialize SQLite Cloud database connection
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
        const decodedUrl = decodeURIComponent(url); // Decode the URL
        let filePath;

        if (decodedUrl.includes('/mangap')) {
            filePath = decodedUrl.split('/mangap')[1]; // Extract the path after `/mangap/`
        } else {
            filePath = decodedUrl; // Use raw URL if the format is unexpected
        }

        // Remove leading slashes if they exist, to avoid double slashes
        if (filePath && filePath.startsWith('/')) {
            filePath = filePath.substring(1);
        }

        // Construct and return the final URL
        return filePath
            ? `${baseUrl}images/${filePath}`
            : `${baseUrl}images/${decodedUrl}`; // Fallback to using raw URL

    } catch (err) {
        console.error('Error transforming image URL:', err.message);
        return `${baseUrl}images/${url}`; // Return raw URL if there's an error
    }
};


// Fetch popular mangas based on the number of views (popularity)
router.get('/', async (req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/`; // Get base URL dynamically

    try {
        const query = `SELECT * FROM mangas ORDER BY views DESC`;
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
