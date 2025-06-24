const { ObjectId } = require('mongodb');
const { generateResponse } = require('../services/aiService');
const { updateSessionActivity } = require('../models/sessionModels');
const { getDb } = require('../models/db');

// ─── Primary Hardcoded Logic ─────────────────────────────
const fallbackResponse = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hello! How can I help you with your studies today?';
  } else if (lower.includes('math')) {
    return 'I can help with math problems. What specific topic are you studying?';
  } else if (lower.includes('science')) {
    return 'Science is fascinating! Do you have questions about biology, chemistry, or physics?';
  } else {
    return null; // This triggers fallback to Hugging Face
  }
};

const chatHandler = async (req, res) => {
  const db = getDb();

  try {
    const { message } = req.body;
    const sessionId = req.headers.sessionid;

    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId header' });

    await updateSessionActivity(sessionId);

    await db.collection('messages').insertOne({
      sessionId: new ObjectId(sessionId),
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    // Primary: Try fallbackResponse
    let aiResponse = fallbackResponse(message);

    // If no match, fallback to Hugging Face
    if (!aiResponse) {
      try {
        const ai = await generateResponse(message);
        aiResponse = ai.response || "I'm here to help, but I need a bit more context.";
      } catch (error) {
        console.warn('⚠️ Hugging Face fallback failed');
        aiResponse = "Sorry, I'm having trouble understanding right now. Try again later.";
      }
    }

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
