const { ObjectId } = require('mongodb');
const { generateResponse } = require('../services/aiService');
const { updateSessionActivity } = require('../models/sessionModels');
const { getDb } = require('../models/db');

const chatHandler = async (req, res) => {
  const db = getDb();

  try {
    const { message, userId } = req.body;
    const sessionId = req.headers.sessionid;

    if (!sessionId || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Invalid sessionId or message' });
    }

    await updateSessionActivity(sessionId);

    // Save user message
    await db.collection('messages').insertOne({
      sessionId,
      userId,
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    // Call AI
    let aiCategory = 'General';
    let aiTopic = 'General';
    let aiText = "I'm here to help, but I need a bit more context.";

    try {
      const ai = await generateResponse(message);
      aiText = ai.response || aiText;
      aiCategory = ai.category || aiCategory;
      aiTopic = ai.topic || aiTopic;
    } catch (err) {
      console.warn('⚠️ GROQ fallback failed');
    }

    // Save AI response
    await db.collection('messages').insertOne({
      sessionId,
      userId,
      sender: 'ai',
      text: aiText,
      category: aiCategory,
      topic: aiTopic,
      timestamp: new Date()
    });

    // Update chat session record
    await db.collection('chat_sessions').updateOne(
      { sessionId },
      {
        $set: {
          topic: `${aiCategory} – ${aiTopic}`,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // Send all fields back
    res.json({
      message: aiText,
      category: aiCategory,
      topic: aiTopic,
      sessionId
    });

  } catch (error) {
    console.error('❌ Error in chatHandler:', error);
    res.status(500).json({ error: 'Failed to process message.' });
  }
};

module.exports = { chatHandler };
