const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/config', (req, res) => {
    res.json({
        gameServerUrl: process.env.GAME_SERVER_URL || 'http://localhost:80'
    });
});

app.listen(PORT, () => {
    console.log(`Web Client running on port ${PORT}`);
});
