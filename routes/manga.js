const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();

// Initialize SQLite Cloud database connection
const db = new Database('sqlitecloud://ch3an8wnhz.sqlite.cloud:8860/manga.db?apikey=2pkgTi7BtfuN4DjZjLOrhsHgBBIArm7PAtiEOq5ioHI');

// Helper function to format manga data and encode URLs
const formatMangaData = (manga, baseUrl) => ({
    ...manga,
    // Encoding the poster URL
    poster: !manga.poster.startsWith(baseUrl)
        ? `${baseUrl}images/${encodeURIComponent(manga.poster)}`
        : manga.poster,
});

// Helper function to fetch manga and format it
const fetchManga = async (query, params = []) => {
    try {
        const result = await db.sql(query, params);
        return result.length ? result : null;
    } catch (err) {
        console.error('Error querying the database:', err.message);
        throw new Error('Database error');
    }
};

// API to fetch manga by ID or apply filters
router.get('/', async (req, res, next) => {
    const { q = '', type = '', year = '', status = '', id = '' } = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}/`; // Get base URL dynamically

    try {
        if (id) {
            // Fetch manga details and chapters by ID
            const result = await fetchManga('SELECT * FROM mangas WHERE id = ?', [id]);
            if (!result.length) {
                return res.status(404).json({ error: 'Manga not found' });
            }

            const manga = result[0];
            const chaptersResult = await fetchManga('SELECT * FROM chapters WHERE manga_id = ?', [id]);
            const updatedManga = {
                ...formatMangaData(manga, baseUrl),
                chapters: chaptersResult.map(chapter => ({
                    ...chapter,
                    image_urls: chapter.image_urls
                        .split(',')
                        .map(url => `${baseUrl}images/${encodeURIComponent(url.trim())}`) // Encoding chapter image URLs
                }))
            };
            return res.json(updatedManga);
        }

        // Combine all filter parameters into one query
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

        // If there are any filters, build the query with those parameters
        const query = filters.length
            ? `SELECT * FROM mangas WHERE ${filters.join(' AND ')}` // Improved SQL query
            : `SELECT * FROM mangas`;

        const result = await fetchManga(query, params);

        if (!result) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        const updatedMangaList = result.map(manga => formatMangaData(manga, baseUrl));

        res.json(updatedMangaList);
    } catch (err) {
        console.error('Error processing the request:', err.message);
        next(err); // Pass error to error handling middleware
    }
});

module.exports = router;
