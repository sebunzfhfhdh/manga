const express = require('express');
const router = express.Router();
const axios = require('axios');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
    'Referer': 'https://mangapill.com/',
};

const baseUrl = 'https://cdn.readdetectiveconan.com/file';

router.get('/*', async (req, res) => {
    let urlPath = req.params[0];
    let fullUrl;

    if (urlPath.startsWith('ill')) {
        const correctedPath = urlPath.replace('ill', 'mangapill');
        fullUrl = `${baseUrl}/${correctedPath}`;
    } else if (urlPath.startsWith('')) {
        fullUrl = `${baseUrl}/mangap/${urlPath}`;
    } else {
        console.log('Invalid path:', urlPath);
        return res.status(400).send('Invalid image path.');
    }

    try {
        // Fetch image from the external URL
        const response = await axios.get(fullUrl, {
            headers,
            responseType: 'arraybuffer',
        });

        // Set headers for the response
        res.set('Content-Type', response.headers['content-type']);
        res.set('Cache-Control', 'public, max-age=86400');  // You can adjust max-age based on your needs
        res.send(response.data);
    } catch (error) {
        console.error(`Error fetching image: ${error.message}`);
        
        if (error.response) {
            if (error.response.status === 404) {
                res.status(404).send('Image not found.');
            } else {
                res.status(error.response.status).send('Failed to fetch image from the source.');
            }
        } else {
            res.status(500).send('An internal server error occurred.');
        }
    }
});

module.exports = router;
