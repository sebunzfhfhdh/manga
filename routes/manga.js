const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();

// Initialize SQLite Cloud database connection
const db = new Database('sqlitecloud://ch3an8wnhz.sqlite.cloud:8860/manga.db?apikey=zOzZi3yzTEnn9At12oRBBMQCIszUYB6zPtMUStzmNCA');


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
    const { q = '', type = '', year = '', status = '', id = '', c = 'false', chapter = '' } = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}/`; // Get base URL dynamically

    try {
        if (id) {
            const result = await fetchManga('SELECT * FROM mangas WHERE id = ?', [id]);
            if (!result.length) {
                return res.status(404).json({ error: 'Manga not found' });
            }

            const manga = result[0];
            const ChaptersFlag = c.toLowerCase() === 'true';

            let updatedManga = formatMangaData(manga, baseUrl);

            
            if (ChaptersFlag) {
                const chaptersResult = await fetchManga('SELECT * FROM chapters WHERE manga_id = ?', [id]);
                updatedManga.chapters = chaptersResult.map(chapter => ({
                    chapter_id: chapter.chapter_id,
                    chapter_link: `https://manga-yyxp.onrender.com/manga?chapter=${chapter.chapter_id}` // Link to the chapter page
                }));
            }
            

            return res.json(updatedManga);
        }

        if (chapter) {
            const result = await fetchManga('SELECT * FROM chapters WHERE chapter_id = ?', [chapter]);
            if (!result.length) {
                return res.status(404).json({ error: 'Chapter not found' });
            }
            const chapterData = result[0];
            const updatedChapter = {
                ...chapterData,
                image_urls: chapterData.image_urls
                    .split(',')
                    .map(url => transformImageUrl(url.trim(), baseUrl)) 
            };
            return res.json(updatedChapter);
        }

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
        next(err); // Pass error to error-handling middleware
    }
});


// Add error handling middleware
router.use((err, req, res, next) => {
    console.error('Error handling middleware:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
