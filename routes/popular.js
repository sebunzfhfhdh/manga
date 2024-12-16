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

// Fetch popular mangas based on the weighted score
router.get('/', async (req, res, next) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/`; // Get base URL dynamically
    const minUsers = 100; // Minimum number of users required for weighted score

    try {
        // Calculate the mean score (C) across all mangas
        const meanScoreQuery = `SELECT AVG(score) AS meanScore FROM mangas WHERE score IS NOT NULL`;
        const meanScoreResult = await fetchManga(meanScoreQuery);
        const C = meanScoreResult?.[0]?.meanScore || 0; // Default to 0 if no data

        // SQL query to calculate weighted score
        const query = `
            SELECT *,
                ((votes / (votes + ?)) * score + (? / (votes + ?)) * ?) AS weightedScore
            FROM mangas
            WHERE score IS NOT NULL
            ORDER BY weightedScore DESC
        `;
        const params = [minUsers, minUsers, minUsers, C];
        const result = await fetchManga(query, params);

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
