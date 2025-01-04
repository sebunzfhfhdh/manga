const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000; 
const favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/latest', require('./routes/latest'));
app.use('/popular', require('./routes/popular'));
app.use('/manga', require('./routes/manga'));
app.use('/search', require('./routes/search'));
app.use('/images', require('./routes/images'));
app.use('/add', require('./routes/likes'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
