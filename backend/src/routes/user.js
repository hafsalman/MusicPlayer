const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const docRef = db.collection('users').doc(req.user.uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      // Create default profile
      const defaultProfile = {
        uid: req.user.uid,
        email: req.user.email,
        username: req.user.email.split('@')[0],
        displayName: req.user.name || '',
        bio: '',
        photoURL: req.user.picture || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await docRef.set(defaultProfile);
      return res.json(defaultProfile);
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { username, displayName, bio } = req.body;
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    if (username !== undefined) updateData.username = username;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;

    await db.collection('users').doc(req.user.uid).set(updateData, { merge: true });
    res.json({ message: 'Profile updated', ...updateData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
