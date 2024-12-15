const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000; // Dynamic port for Render

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files (e.g., images, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/latest', require('./routes/latest'));
app.use('/popular', require('./routes/popular'));
app.use('/manga', require('./routes/manga'));
app.use('/search', require('./routes/search'));
app.use('/images', require('./routes/images'));
app.use('/add', require('./routes/likes'));

// Serve the main page (index.html) when accessing the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);  // Log the error for debugging
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
