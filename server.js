// server.js
const express = require('express');
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware (if needed)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Download endpoint using GET
app.get('/download', async (req, res) => {
    try {
        // Get TikTok URL from query parameter
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'TikTok URL is required',
                example: 'http://localhost:3000/download?url=https://vt.tiktok.com/ZS2vSs5fL/'
            });
        }

        // Download content
        const result = await downloadTiktok(url);

        if (!result.status) {
            return res.status(500).json({
                error: 'Failed to process TikTok URL',
                details: result
            });
        }

        // Structure the response
        const downloads = result.result.dl_link;
        let responseData = {
            creator: result.creator,
            title: result.result.title,
            image: result.result.image
        };

        if (downloads.images) {
            responseData.type = 'images';
            responseData.downloads = downloads.images;
        } else {
            responseData.type = 'video';
            responseData.downloads = {
                mp4: downloads.download_mp4_1,
                mp4_hd: downloads.download_mp4_hd,
                mp3: downloads.download_mp3
            };
        }

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
