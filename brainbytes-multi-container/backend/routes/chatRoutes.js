const express = require('express');
const router = express.Router();
const { chatHandler } = require('../controllers/chatController');
const { getMessagesBySession } = require('../utils/messageUtils');


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

module.exports = router;
