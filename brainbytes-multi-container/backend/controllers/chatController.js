const { ObjectId } = require('mongodb');
const { generateResponse } = require('../services/aiService');
const { updateSessionActivity } = require('../models/sessionModels');
const { getDb } = require('../models/db');

const chatHandler = async (req, res) => {
  const db = getDb();

  try {
    const { message, userId, subject, material } = req.body;
    const sessionId = req.headers.sessionid;

    if (!sessionId || !message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Invalid sessionId or message' });
    }

    if (!userId || !subject || !material) {
      return res.status(400).json({ error: 'Missing userId, subject, or material' });
    }

    await updateSessionActivity(sessionId);

    const timestamp = new Date();

    // Save user message
    await db.collection('messages').insertOne({
      sessionId,
      userId,
      sender: 'user',
      text: message,
      timestamp
    });

    // Retrieve previous messages (limit to last 10)
    const previousMessages = await db.collection('messages')
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const orderedMessages = previousMessages.reverse();

    // Generate prompt context for the model
    const contextPrompt = orderedMessages.map(m =>
      `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`
    ).join('\n') + `\nUser: ${message}\nAI:`;

    // ✨ Call generateResponse with specific material context
    let aiText = "I'm here to help, but I need a bit more context.";

    try {
      const ai = await generateResponse(contextPrompt, {
        subject,
        topic: material
      });

      aiText = ai.response || aiText;
    } catch (err) {
      console.warn('⚠️ AI fallback failed:', err);
    }

    // Save AI response
    await db.collection('messages').insertOne({
      sessionId,
      userId,
      sender: 'ai',
      text: aiText,
      category: subject,
      topic: material,
      timestamp: new Date()
    });

    // Update session record with selected material
    await db.collection('chat_sessions').updateOne(
      { sessionId },
      {
        $set: {
          topic: `${subject} – ${material}`,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    res.json({
      message: aiText,
      category: subject,
      topic: material,
      sessionId
    });

  } catch (error) {
    console.error('❌ Error in chatHandler:', error);
    res.status(500).json({ error: 'Failed to process message.' });
  }
};

module.exports = { chatHandler };
