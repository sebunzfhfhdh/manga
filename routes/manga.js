const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();
require('dotenv').config();

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


const incrementViews = async (mangaId) => {
    try {
        const query = `UPDATE mangas SET views = views + 1 WHERE id = ?`;
        await fetchManga(query, [mangaId]);
    } catch (err) {
        console.error('Error incrementing views:', err.message);
    }
};


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


router.get('/', async (req, res, next) => {
    const { q = '', type = '', year = '', status = '', id = '', c = 'false', chapter = '' } = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}/`; 

    try {
        if (id) {
            await incrementViews(id);
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
                    chapter_link: `https://manga-yyxp.onrender.com/manga?chapter=${chapter.chapter_id}` 
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
        next(err); 
    }
});


router.use((err, req, res, next) => {
    console.error('Error handling middleware:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
