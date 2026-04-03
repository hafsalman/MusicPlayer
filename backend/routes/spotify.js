const express = require("express");
const router = express.Router();
const { searchSongs } = require("../services/spotifyService");

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const songs = await searchSongs(query);

        const formatted = songs.map(song => ({
            id: song.id,
            name: song.name,
            artist: song.artists[0].name,
            album: song.album.name,
            image: song.album.images[0]?.url,
            preview: song.preview_url
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: "Error fetching songs" });
    }
});

module.exports = router;