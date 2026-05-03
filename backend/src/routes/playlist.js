const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');
const admin = require('firebase-admin');

router.use(verifyToken);

// Get all playlists for user
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('playlists')
      .where('userId', '==', req.user.uid)
      .orderBy('updatedAt', 'desc')
      .get();
    const playlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(playlists);
  } catch (err) {
    console.error('Playlist fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get single playlist with tracks
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('playlists').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Playlist not found' });
    const data = doc.data();
    // Allow if owner or public
    if (data.userId !== req.user.uid && !data.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ id: doc.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create playlist
router.post('/', async (req, res) => {
  try {
    const { name, description = '', coverImage = '', isPublic = false } = req.body;
    if (!name) return res.status(400).json({ error: 'Playlist name is required' });
    if (typeof name !== 'string' || name.length > 100)
      return res.status(400).json({ error: 'Name must be a string under 100 characters' });
    if (typeof description !== 'string' || description.length > 500)
      return res.status(400).json({ error: 'Description must be a string under 500 characters' });
    if (typeof isPublic !== 'boolean')
      return res.status(400).json({ error: 'isPublic must be a boolean' });

    const playlist = {
      name: name.trim(),
      description: description.trim(),
      coverImage,
      isPublic,
      userId: req.user.uid,
      tracks: [],
      trackCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const ref = await db.collection('playlists').add(playlist);
    res.status(201).json({ id: ref.id, ...playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update playlist metadata
router.put('/:id', async (req, res) => {
  try {
    const doc = await db.collection('playlists').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Playlist not found' });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ error: 'Access denied' });

    const { name, description, coverImage, isPublic } = req.body;
    const updateData = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    await db.collection('playlists').doc(req.params.id).update(updateData);
    res.json({ id: req.params.id, ...updateData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const doc = await db.collection('playlists').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Playlist not found' });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ error: 'Access denied' });

    await db.collection('playlists').doc(req.params.id).delete();
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add track to playlist
router.post('/:id/tracks', async (req, res) => {
  try {
    const { track } = req.body; // Full track object from Spotify
    if (!track || !track.id) return res.status(400).json({ error: 'Track data required' });

    const docRef = db.collection('playlists').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Playlist not found' });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ error: 'Access denied' });

    const tracks = doc.data().tracks || [];
    if (tracks.find(t => t.id === track.id)) {
      return res.status(409).json({ error: 'Track already in playlist' });
    }

    const trackData = {
      id: track.id,
      name: track.name,
      artists: track.artists?.map(a => ({ id: a.id, name: a.name })) || [],
      album: {
        id: track.album?.id,
        name: track.album?.name,
        images: track.album?.images || []
      },
      duration_ms: track.duration_ms,
      preview_url: track.preview_url || null,
      external_urls: track.external_urls || {},
      addedAt: new Date().toISOString()
    };

    await docRef.update({
      tracks: admin.firestore.FieldValue.arrayUnion(trackData),
      trackCount: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Track added', track: trackData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', async (req, res) => {
  try {
    const docRef = db.collection('playlists').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Playlist not found' });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ error: 'Access denied' });

    const tracks = doc.data().tracks || [];
    const updatedTracks = tracks.filter(t => t.id !== req.params.trackId);

    await docRef.update({
      tracks: updatedTracks,
      trackCount: updatedTracks.length,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Track removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder tracks
router.put('/:id/tracks/reorder', async (req, res) => {
  try {
    const { tracks } = req.body;
    if (!Array.isArray(tracks)) {
      return res.status(400).json({ error: 'tracks must be an array' });
    }
    const docRef = db.collection('playlists').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Playlist not found' });
    if (doc.data().userId !== req.user.uid) return res.status(403).json({ error: 'Access denied' });

    // Validate: reordered tracks must only contain IDs already in the playlist
    const existingIds = new Set((doc.data().tracks || []).map(t => t.id));
    const allValid = tracks.every(t => t && typeof t.id === 'string' && existingIds.has(t.id));
    if (!allValid) {
      return res.status(400).json({ error: 'Invalid track data in reorder request' });
    }

    await docRef.update({ tracks, updatedAt: new Date().toISOString() });
    res.json({ message: 'Tracks reordered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
