const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios'); // Reserved for future external API calls (e.g., real AI)

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection string (with fallback)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brainbytes';

let db;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
    db = client.db(); // Use the default db from the connection string
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1); // Exit the app if DB fails
  }
}

// POST /api/chat - handle user message + AI reply
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const sessionId = req.headers.sessionid || new ObjectId().toString();

    // Save user message
    await db.collection('messages').insertOne({
      text: message,
      sender: 'user',
      sessionId,
      timestamp: new Date()
    });

    // Basic AI response logic
    let aiResponse;
    const lower = message.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi')) {
      aiResponse = 'Hello! How can I help you with your studies today?';
    } else if (lower.includes('math')) {
      aiResponse = 'I can help with math problems. What specific topic are you studying?';
    } else if (lower.includes('science')) {
      aiResponse = 'Science is fascinating! Do you have questions about biology, chemistry, or physics?';
    } else {
      aiResponse = 'I\'m here to help with your academic questions. Could you provide more details about what you\'re studying?';
    }

    // Save AI response
    await db.collection('messages').insertOne({
      text: aiResponse,
      sender: 'ai',
      sessionId,
      timestamp: new Date()
    });

    res.json({ message: aiResponse, sessionId });
  } catch (error) {
    console.error('❌ Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process message.' });
  }
});

// GET /api/chat/history/:sessionId - retrieve all messages
app.get('/api/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await db.collection('messages')
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();

    res.json({ messages });
  } catch (error) {
    console.error('❌ Error retrieving chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
});

// Start the server after DB connection
async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
