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


const Like = async (mangaId) => {
    try {
        const query = `UPDATE mangas SET likes = likes + 1 WHERE id = ?`;
        await fetchManga(query, [mangaId]);
    } catch (err) {
        console.error('Error Liking:', err.message);
    }
};

const DiLike = async (mangaId) => {
    try {
        const query = `UPDATE mangas SET likes = likes - 1 WHERE id = ? AND likes > 0`;
        await fetchManga(query, [mangaId]);
    } catch (err) {
        console.error('Error DisLiking:', err.message);
    }
};

// Like a manga
router.post('/like/:id', async (req, res) => {
  const id = req.params.id;
  await Like(id);
});

// Dislike a manga
router.post('/dislike/:id', async (req, res) => {
  const id = req.params.id;
  await DiLike(id);
});

module.exports = router;
