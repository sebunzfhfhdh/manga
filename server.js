const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000; // Dynamic port for Render



// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/latest', require('./routes/latest'));
app.use('/popular', require('./routes/popular'));
app.use('/manga', require('./routes/manga'));
app.use('/search', require('./routes/search'));
app.use('/images', require('./routes/images'));
app.use('/likes', require('./routes/likes'));
// Serve the main page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});