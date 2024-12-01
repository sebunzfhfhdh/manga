const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000; // Dynamic port for Render
const imageRoutes = require('./routes/images');

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/manga', require('./routes/manga'));
app.use('/images', imageRoutes);

// Serve the main page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/doc', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'doc.html'));
});



// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
