const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getDb } = require('../controllers/chatController');

router.get('/messages/recent/:userId', async (req, res) => {
  const db = getDb();
  const userId = req.params.userId;
  try {
    const messages = await db.collection('messages')
      .find({ userId: new ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load recent messages' });
  }
});

module.exports = router;