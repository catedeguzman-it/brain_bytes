const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../models/db');

// GET /api/sessions/:userId → Get recent sessions for a user
router.get('/sessions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDb();

    const sessions = await db.collection('sessions')
      .find({ userId })
      .sort({ lastActive: -1 })  // Most recent sessions first
      .limit(10)
      .toArray();

    res.json({ sessions });
  } catch (err) {
    console.error('❌ Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to load sessions' });
  }
});

module.exports = router;
