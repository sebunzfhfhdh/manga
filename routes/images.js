const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
    'Referer': 'https://mangapill.com/',
};

const baseUrl = 'https://cdn.readdetectiveconan.com/file/mangap';

router.get('/*', async (req, res) => {
    let urlPath = req.params[0];
    const fullUrl = `${baseUrl}/${urlPath}`;

    try {
        const response = await axios.get(fullUrl, {
            headers,
            responseType: 'arraybuffer',
        });

        res.set('Content-Type', response.headers['content-type']);
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(response.data);
    } catch (error) {
        console.error(`Error fetching image: ${error.message}`);
        if (error.response) {
            res.status(error.response.status).send('Failed to fetch image from the source.');
        } else {
            res.status(500).send('An internal server error occurred.');
        }
    }
});


module.exports = router;
