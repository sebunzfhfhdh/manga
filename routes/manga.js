const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();
require('dotenv').config();

const db = new Database(process.env.DBinfo);

const incrementViews = async (mangaId) => {
    try {
        const query = `UPDATE mangas SET views = views + 1 WHERE id = ?`;
        await db.sql(query, [mangaId]);
    } catch (err) {
        console.error('Error incrementing views:', err.message);
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

const fetchManga = async (query, params = []) => {
    try {
        const result = await db.sql(query, params);
        return result.length ? result : null;
    } catch (err) {
        console.error('Error querying the database:', err.message);
        throw new Error('Database error');
    }
};

router.get('/', async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    try {
        const result = await fetchManga('SELECT * FROM mangas');
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'Mangas not found' });
        }

        const updatedManga = result.map(manga => formatMangaData(manga, baseUrl));
        return res.json(updatedManga);
    } catch (err) {
        console.error('Error fetching manga:', err.message);
        return res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    try {
        if (!id) {
            return res.status(400).json({ error: 'Invalid manga ID' });
        }

        await incrementViews(id);

        const result = await fetchManga('SELECT * FROM mangas WHERE id = ?', [id]);
        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        const manga = result[0];
        const updatedManga = formatMangaData(manga, baseUrl);
        return res.json(updatedManga);
    } catch (err) {
        console.error('Error fetching manga:', err.message);
        return res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id/chapter', async (req, res) => {
    const mangaId = req.params.id;
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    try {
        if (!mangaId) {
            return res.status(400).json({ error: 'Invalid manga ID' });
        }

        const result = await fetchManga('SELECT * FROM chapters WHERE manga_id = ? ORDER BY chapter_num ASC', [mangaId]);

        if (!result || result.length === 0) {
            return res.status(404).json({ error: 'No chapters found for this manga.' });
        }

        const updatedChapters = result.map(chapter => ({
            ...chapter,
            image_urls: chapter.image_urls
                .split(',')
                .map(url => transformImageUrl(url.trim(), baseUrl))
        }));

        return res.json(updatedChapters);
    } catch (err) {
        console.error('Error fetching chapters:', err.message);
        return res.status(500).json({ error: 'Server error' });
    }
});


router.get('/:id/chapter/:chapter', async (req, res) => {
    const mangaId = req.params.id;
    const chapterNumber = req.params.chapter;
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    try {
        if (!mangaId || !chapterNumber) {
            return res.status(400).json({ error: 'Invalid manga ID or chapter number' });
        }

        const result = await fetchManga(
            'SELECT * FROM chapters WHERE manga_id = ? AND chapter_num = ?',
            [mangaId, chapterNumber]
        );

        if (!result || result.length === 0) {
            return res.status(404).json({ error: `Chapter ${chapterNumber} not found for this manga.` });
        }

        const chapter = result[0];
        const updatedChapter = {
            ...chapter,
            image_urls: chapter.image_urls
                .split(',')
                .map(url => transformImageUrl(url.trim(), baseUrl)) 
        };
        return res.json(updatedChapter);
    } catch (err) {
        console.error('Error fetching chapter:', err.message);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
