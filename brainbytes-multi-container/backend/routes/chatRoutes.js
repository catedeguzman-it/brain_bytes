const express = require('express');
const router = express.Router();
const { chatHandler } = require('../controllers/chatController');
const { getMessagesBySession } = require('../utils/messageUtils');
const { getDb } = require('../models/db');


router.post('/chat', chatHandler);

router.get('/chat/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const messages = await getMessagesBySession(sessionId);
    if (!messages) {
      return res.status(404).json({ error: 'No message history found for this session.' });
    }
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New: Get all messages for a user
router.get('/chat/history/user/:userId', async (req, res) => {
  const db = getDb();
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const messages = await db.collection('messages')
    .find({ userId })
    .sort({ timestamp: 1 })
    .toArray();

  res.json({ messages });
});

module.exports = router;
