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


router.get('/', async (req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    try {
        const query = `SELECT * FROM mangas ORDER BY CAST(id AS UNSIGNED) DESC;`;
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
