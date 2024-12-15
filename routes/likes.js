const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const router = express.Router();
require('dotenv').config();

// Initialize SQLite Cloud database connection
const db = new Database(process.env.DBinfo);

// Helper function for database queries
const fetchManga = async (query, params = []) => {
    try {
        const result = await db.sql(query, params);
        return result.length ? result : null;
    } catch (err) {
        console.error('Error querying the database:', err.message);
        throw new Error('Database error');
    }
};

// Like a manga
router.post('/like/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Increment likes for the specified manga ID
        const updateQuery = `UPDATE mangas SET likes = likes + 1 WHERE id = ?`;
        await fetchManga(updateQuery, [id]);

        // Fetch the updated likes count
        const selectQuery = `SELECT likes FROM mangas WHERE id = ?`;
        const updatedManga = await fetchManga(selectQuery, [id]);

        if (!updatedManga) {
            return res.status(404).json({ message: 'Manga not found' });
        }

        res.json({ id, likes: updatedManga[0].likes });
    } catch (err) {
        console.error('Error liking manga:', err.message);
        res.status(500).json({ message: 'Failed to like manga', error: err.message });
    }
});

// Dislike a manga
router.post('/dislike/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Decrement likes for the specified manga ID, ensuring likes can't go below 0
        const updateQuery = `UPDATE mangas SET likes = likes - 1 WHERE id = ? AND likes > 0`;
        await fetchManga(updateQuery, [id]);

        // Fetch the updated likes count
        const selectQuery = `SELECT likes FROM mangas WHERE id = ?`;
        const updatedManga = await fetchManga(selectQuery, [id]);

        if (!updatedManga) {
            return res.status(404).json({ message: 'Manga not found' });
        }

        res.json({ id, likes: updatedManga[0].likes });
    } catch (err) {
        console.error('Error disliking manga:', err.message);
        res.status(500).json({ message: 'Failed to dislike manga', error: err.message });
    }
});

module.exports = router;
