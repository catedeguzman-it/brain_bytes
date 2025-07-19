const { ObjectId } = require('mongodb');
const { generateResponse } = require('../services/aiService');
const { updateSessionActivity } = require('../models/sessionModels');
const { getDb } = require('../models/db');
const { recordAIRequest } = require('../metrics');

// ✅ Prometheus custom metrics
const {
  questionsCounter,
  sessionsCounter
} = require('../metrics');

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

    // ✅ Count valid user question
    questionsCounter.inc();

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

    // Detect language preference
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

    // Get last 10 messages
    const previousMessages = await db.collection('messages')
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const orderedMessages = previousMessages.reverse();

    // Retrieve session data
    const sessionData = await db.collection('chat_sessions').findOne({ sessionId });
    const langPref = sessionData?.languagePreference || 'english';

    const systemInstruction = langPref === 'tagalog'
      ? "Ikaw ay isang AI tutor. Sumagot sa Tagalog maliban na lang kung hilingin ng user ang Ingles."
      : "You are an AI tutor. Respond in English unless the user specifically requests Tagalog.";

    const contextPrompt = systemInstruction + '\n' +
      orderedMessages.map(m =>
        `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`
      ).join('\n') +
      `\nUser: ${message}\nAI:`;

    
    // Generate AI response
    let aiCategory = 'General';
    let aiTopic = 'General';
    let aiText = "I'm here to help, but I need a bit more context.";
    let aiStatus = 'success';
    let aiModel = 'groq'; // change to actual model name if dynamic

    const startTime = process.hrtime(); // ⏱️ Start timing

    try {
      console.log('[🧠 Prompt sent to AI]:', contextPrompt);
      const ai = await generateResponse(contextPrompt);
      console.log('[✅ AI responded]:', ai);

      aiText = ai.response || aiText;
      aiCategory = ai.category || aiCategory;
      aiTopic = ai.topic || aiTopic;

      const duration = process.hrtime(startTime);
      const durationInSeconds = duration[0] + duration[1] / 1e9;

      // Record metric
      recordAIRequest(aiModel, aiStatus, durationInSeconds);

    } catch (err) {
      console.error('❌ AI response failed:', err);
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

    // Update or insert session
    const result = await db.collection('chat_sessions').updateOne(
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

    // ✅ Track new session creation
    if (result.upsertedCount > 0) {
      sessionsCounter.inc();
    }

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
