const express = require('express');
const router = express.Router();
const spotify = require('../config/spotifyService');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Dashboard
router.get('/dashboard', async (req, res) => {
  const year = new Date().getFullYear();
  try {
    const [pop, artists, albums, hiphop] = await Promise.all([
      spotify.search(`top hits ${year}`, 'track', 10),
      spotify.search(`popular artists ${year}`, 'artist', 10),
      spotify.search(`best albums ${year}`, 'album', 10),
      spotify.search('hip hop hits', 'track', 10),
    ]);
    res.json({
      topTracks: pop.tracks?.items || [],
      topArtists: artists.artists?.items || [],
      newReleases: { albums: { items: albums.albums?.items || [] } },
      hiphopTracks: hiphop.tracks?.items || [],
      featured: { playlists: { items: [] } },
      categories: { categories: { items: [] } },
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'track,artist,album', limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });
    const data = await spotify.search(q, type, Math.min(parseInt(limit) || 20, 50));
    res.json(data);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Multiple tracks (specific route before parameterized)
router.get('/tracks', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'Missing ids parameter' });
    const data = await spotify.getTracks(ids.split(','));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single track
router.get('/tracks/:id', async (req, res) => {
  try {
    const data = await spotify.getTrack(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Artist full page
router.get('/artists/:id', async (req, res) => {
  try {
    const artist = await spotify.getArtist(req.params.id);
    
    // top-tracks is restricted, use search instead
    const searchResult = await spotify.search(artist.name, 'track', 10);
    const topTracks = { tracks: searchResult.tracks?.items || [] };

    const albums = await spotify.getArtistAlbums(req.params.id);

    // related artists also restricted, search similar
    let related = { artists: [] };
    try {
      const relSearch = await spotify.search(artist.name + ' similar artists', 'artist', 8);
      related = { artists: relSearch.artists?.items || [] };
    } catch (e) {}

    res.json({ artist, topTracks, albums, related });
  } catch (err) {
    console.error('Artist error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Album full page
router.get('/albums/:id', async (req, res) => {
  try {
    const data = await spotify.getAlbum(req.params.id);
    res.json(data);
  } catch (err) {
    console.error('Album error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Genre page - search by genre name instead of restricted endpoints
router.get('/recommendations', async (req, res) => {
  try {
    const { genre, limit = 20 } = req.query;
    const query = genre || 'popular';
    const data = await spotify.search(query, 'track', parseInt(limit));
    res.json({ tracks: data.tracks?.items || [] });
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Genres list - return a static list since the endpoint is restricted
router.get('/genres', async (req, res) => {
  res.json({
    genres: [
      'pop', 'hip-hop', 'rock', 'r-n-b', 'electronic',
      'jazz', 'classical', 'country', 'latin', 'indie',
      'metal', 'soul', 'reggae', 'blues', 'folk'
    ]
  });
});

// Category playlists - replaced with search
router.get('/categories/:id/playlists', async (req, res) => {
  try {
    const data = await spotify.search(req.params.id, 'track', 10);
    res.json({ tracks: data.tracks?.items || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;