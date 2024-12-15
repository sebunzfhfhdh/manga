const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();
require('dotenv').config();

// Initialize SQLite Cloud database connection
const db = new Database(process.env.DBinfo);



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


// Updated `formatMangaData` to use the new `transformImageUrl`
const formatMangaData = (manga, baseUrl) => ({
    ...manga,
    poster: transformImageUrl(manga.poster, baseUrl),
});

const fetchManga = async (query, params = []) => {
    try {
        const result = await db.sql(query, params);
        return result.length ? result : null;
    } catch (err) {
        console.error('Error querying the database:', err.message);
        throw new Error('Database error');
    }
};
// Updated `/` route
router.get('/', async (req, res, next) => {
    const { q = '', type = '', year = '', status = '', genre = ''} = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}/`; // Get base URL dynamically
    try{
        let filters = [];
        let params = [];

        if (q) {
            filters.push(`name LIKE ?`);
            params.push(`%${q}%`);
        }
        if (type) {
            filters.push(`type LIKE ?`);
            params.push(type);
        }
        if (year) {
            filters.push(`year = ?`);
            params.push(year);
        }
        if (status) {
            filters.push(`status LIKE ?`);
            params.push(status);
        }
        if (genre) {
            filters.push(`genres LIKE ?`);
            params.push(`%${genre}%`);
        }

        const query = filters.length
            ? `SELECT * FROM mangas WHERE ${filters.join(' AND ')}`
            : `SELECT * FROM mangas`;

        const result = await fetchManga(query, params);

        if (!result) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        const updatedMangaList = result.map(manga => formatMangaData(manga, baseUrl));

        res.json(updatedMangaList);
    } catch (err) {
        console.error('Error processing the request:', err.message);
        next(err); 
    }
});


// Add error handling middleware
router.use((err, req, res, next) => {
    console.error('Error handling middleware:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
