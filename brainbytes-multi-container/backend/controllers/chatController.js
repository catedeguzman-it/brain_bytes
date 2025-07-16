const { ObjectId } = require('mongodb');
const { generateResponse } = require('../services/aiService');
const { updateSessionActivity } = require('../models/sessionModels');
const { getDb } = require('../models/db');

const chatHandler = async (req, res) => {
  const db = getDb();

  try {
    const { message, userId } = req.body;
    const sessionId = req.headers.sessionid;

    if (!sessionId || !message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Invalid sessionId or message' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
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

    // Detect and store language preference if explicitly stated
    let detectedPreference = null;
    if (/i prefer english/i.test(message) || /english only/i.test(message)) {
      detectedPreference = 'english';
    } else if (/gusto ko.*tagalog/i.test(message) || /tagalog only/i.test(message)) {
      detectedPreference = 'tagalog';
    }

    if (detectedPreference) {
      await db.collection('chat_sessions').updateOne(
        { sessionId },
        { $set: { languagePreference: detectedPreference } }
      );
    }

    // Retrieve previous messages (limit to last 10 for performance)
    const previousMessages = await db.collection('messages')
      .find({ sessionId })
      .sort({ timestamp: -1 }) // newest first
      .limit(10)
      .toArray();

    const orderedMessages = previousMessages.reverse(); // back to chronological

    // Retrieve language preference from session (if set)
    const sessionData = await db.collection('chat_sessions').findOne({ sessionId });
    const langPref = sessionData?.languagePreference || 'english';

    // Build system instruction based on preference
    const systemInstruction = langPref === 'tagalog'
      ? "Ikaw ay isang AI tutor. Sumagot sa Tagalog maliban na lang kung hilingin ng user ang Ingles."
      : "You are an AI tutor. Respond in English unless the user specifically requests Tagalog.";

    // Build prompt with system instruction + limited message history
    const contextPrompt = systemInstruction + '\n' +
      orderedMessages.map(m =>
        `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`
      ).join('\n') +
      `\nUser: ${message}\nAI:`;

    // Generate AI response
    let aiCategory = 'General';
    let aiTopic = 'General';
    let aiText = "I'm here to help, but I need a bit more context.";

    try {
      const ai = await generateResponse(contextPrompt);
      aiText = ai.response || aiText;
      aiCategory = ai.category || aiCategory;
      aiTopic = ai.topic || aiTopic;
    } catch (err) {
      console.warn('⚠️ GROQ fallback failed:', err);
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

    // Update session
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
