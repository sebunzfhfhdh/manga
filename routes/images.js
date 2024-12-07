const express = require('express');
const router = express.Router();
const axios = require('axios');
const LRU = require('lru-cache');

// Cache configuration (in-memory LRU cache)
const imageCache = new LRU({
    max: 500, // Max 500 items
    maxSize: 50 * 1024 * 1024, // Max cache size: 50MB
    sizeCalculation: (value, key) => value.length,
    ttl: 1000 * 60 * 60, // Cache duration: 1 hour
});

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
    'Referer': 'https://mangapill.com/',
};

const baseUrl = 'https://cdn.readdetectiveconan.com/file';

router.get('/*', async (req, res) => {
    const urlPath = req.params[0];
    let fullUrl;

    if (urlPath.startsWith('ill')) {
        const correctedPath = urlPath.replace('ill', 'mangapill');
        fullUrl = `${baseUrl}/${correctedPath}`;
    } else if (urlPath) {
        fullUrl = `${baseUrl}/mangap/${urlPath}`;
    } else {
        console.log('Invalid path:', urlPath);
        return res.status(400).send('Invalid image path.');
    }

    // Check if the image is already cached
    const cachedImage = imageCache.get(fullUrl);
    if (cachedImage) {
        res.set('Content-Type', cachedImage.contentType);
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(cachedImage.data);
    }

    try {
        // Fetch image from the external URL
        const response = await axios.get(fullUrl, {
            headers,
            responseType: 'arraybuffer',
        });

        const contentType = response.headers['content-type'];
        const imageData = response.data;

        // Cache the image for future requests
        imageCache.set(fullUrl, { contentType, data: imageData });

        // Set headers for the response
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400'); // 1-day caching
        res.send(imageData);
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
