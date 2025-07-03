const express = require('express');
const router = express.Router();
const { chatHandler } = require('../controllers/chatController');
const { getMessagesBySession } = require('../utils/messageUtils');
const { getDb } = require('../models/db');

// ─── POST: Handle chat messages ───────────────────────────
router.post('/chat', chatHandler);

// ─── GET: Chat history for session ─────────────────────────
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

// ─── GET: All messages by user ─────────────────────────────
router.get('/chat/history/user/:userId', async (req, res) => {
  const db = getDb();
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const messages = await db.collection('messages')
      .find({ userId })
      .sort({ timestamp: 1 })
      .toArray();

    res.json({ messages });
  } catch (err) {
    console.error('Error fetching user messages:', err);
    res.status(500).json({ error: 'Failed to fetch user messages.' });
  }
});

// ─── GET: Recent chat sessions for sidebar ─────────────────
router.get('/chat/sessions/:userId', async (req, res) => {
  const db = getDb();
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const sessions = await db.collection('chat_sessions')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    // Get last message per session
    const sessionIds = sessions.map((s) => s.sessionId);
    const messages = await db.collection('messages')
      .aggregate([
        { $match: { sessionId: { $in: sessionIds } } },
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$sessionId',
            lastMessage: { $first: '$text' },
            lastTime: { $first: '$timestamp' },
          }
        }
      ])
      .toArray();

    // Merge last message into session data
    const messagesMap = Object.fromEntries(messages.map(m => [m._id, m]));
    const enrichedSessions = sessions.map(session => ({
      sessionId: session.sessionId,
      topic: session.topic || 'Untitled',
      updatedAt: session.updatedAt,
      lastMessage: messagesMap[session.sessionId]?.lastMessage || '',
      lastTime: messagesMap[session.sessionId]?.lastTime || session.updatedAt
    }));

    res.json({ sessions: enrichedSessions });
  } catch (err) {
    console.error('Error fetching chat sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

module.exports = router;
