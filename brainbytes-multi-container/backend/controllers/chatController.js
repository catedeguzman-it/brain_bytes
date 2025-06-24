const { ObjectId } = require('mongodb');
const { generateResponse } = require('../services/aiService');
const { updateSessionActivity } = require('../models/sessionModels');
const { getDb } = require('../models/db'); // Centralized DB access

const chatHandler = async (req, res) => {
  const db = getDb();

  try {
    const { message } = req.body;
    const sessionId = req.headers.sessionid;

    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId header' });

    await updateSessionActivity(sessionId);

    // Save user message
    await db.collection('messages').insertOne({
      sessionId: new ObjectId(sessionId),
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    // Get AI response
    const ai = await generateResponse(message);
    const aiResponse = ai.response;

    // Save AI response
    await db.collection('messages').insertOne({
      sessionId: new ObjectId(sessionId),
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date()
    });

    res.json({ message: aiResponse, sessionId });
  } catch (error) {
    console.error('❌ Error in chatHandler:', error);
    res.status(500).json({ error: 'Failed to process message.' });
  }
};

module.exports = { chatHandler };
