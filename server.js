const express = require('express');
const path = require('path');
const app = express();
const port = 5000;
const imageRoutes = require('./routes/images');
const { runEvery12Hours } = require('./updater'); // Import updater

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.use('/manga', require('./routes/manga'));
app.use('/images', imageRoutes);

// Serve the main page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the updater in the background when the server starts
const startUpdater = async () => {
    try {
        console.log('Starting the manga update process...');
        await runEvery12Hours(); // Corrected this line
        console.log('Manga updates completed successfully.');
    } catch (err) {
        console.error('Error running the manga update:', err.message);
    }
};

// Run the updater in the background
startUpdater();

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
