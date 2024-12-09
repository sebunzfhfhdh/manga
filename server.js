const express = require('express');
const path = require('path');
const app = express();
const port = 5000; 
const imageRoutes = require('./routes/images');


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/latest', require('./routes/new'));
app.use('/popular', require('./routes/popular'));
app.use('/manga', require('./routes/manga'));
app.use('/images', imageRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
