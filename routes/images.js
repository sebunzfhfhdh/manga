const express = require('express');
const router = express.Router();
const axios = require('axios');

// Headers required to fetch images from the external source
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
    'Referer': 'https://mangapill.com/',
};

// Proxy images from the external source
router.get('/:urlPath', async (req, res) => {
    try {
        // Decode the URL path to get the full URL (this is the URL-encoded path passed in the request)
        const imageUrl = decodeURIComponent(req.params.urlPath);

        // Ensure the URL starts with 'http' or 'https' to make sure it's a valid URL
        if (!/^https?:\/\//i.test(imageUrl)) {
            return res.status(400).send('Invalid image URL.');
        }

        // Fetch the image from the external source
        const response = await axios.get(imageUrl, {
            headers,
            responseType: 'arraybuffer', // Ensure binary response for the image
        });

        // Set the content type and headers in the response
        res.set('Content-Type', response.headers['content-type']);
        res.set('Cache-Control', 'public, max-age=86400'); // Optional caching header

        // Send the image data directly (no JSON)
        res.send(response.data);
    } catch (error) {
        console.error(`Error fetching image: ${error.message}`);

        // Handle errors and set appropriate status codes
        if (error.response) {
            res.status(error.response.status).send('Failed to fetch image from the source.');
        } else {
            res.status(500).send('An internal server error occurred.');
        }
    }
});

module.exports = router;
