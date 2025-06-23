const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');



const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/brainbytes';

let db;

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// ───────────────────────
// MongoDB Connection
// ───────────────────────
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
    db = client.db();
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// ───────────────────────
// Helper Functions
// ───────────────────────
async function createSession(userId) {
  const session = {
    sessionId: crypto.randomUUID(),
    userId: new ObjectId(userId),
    startedAt: new Date(),
    lastActiveAt: new Date(),
    isActive: true
  };
  const result = await db.collection('sessions').insertOne(session);
  return result.insertedId.toString();
}

async function updateSessionActivity(sessionId) {
  await db.collection('sessions').updateOne(
    { _id: new ObjectId(sessionId) },
    { $set: { lastActiveAt: new Date() } }
  );
}

// ───────────────────────
// Middleware for JWT Authentication
// ───────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}` });
});



// ───────────────────────
// ROUTES
// ───────────────────────

// POST /api/register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashed,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(user);
    const userId = result.insertedId;

    const sessionId = await createSession(userId);

    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({ userId, sessionId, token });
  } catch (err) {
    console.error('❌ Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });

  const sessionId = await createSession(user._id);

  res.json({ token, sessionId, user: { name: user.name, email: user.email } });
});


// POST /api/chat
app.post('/api/chat', async (req, res) => {
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

    // Basic AI reply logic (can be replaced with Hugging Face/OpenAI)
    const lower = message.toLowerCase();
    let aiResponse;

    if (lower.includes('hello') || lower.includes('hi')) {
      aiResponse = 'Hello! How can I help you with your studies today?';
    } else if (lower.includes('math')) {
      aiResponse = 'I can help with math problems. What specific topic are you studying?';
    } else if (lower.includes('science')) {
      aiResponse = 'Science is fascinating! Do you have questions about biology, chemistry, or physics?';
    } else {
      aiResponse = 'I\'m here to help with your academic questions. Could you provide more details about what you\'re studying?';
    }

    await db.collection('messages').insertOne({
      sessionId: new ObjectId(sessionId),
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date()
    });

    res.json({ message: aiResponse, sessionId });
  } catch (error) {
    console.error('❌ Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process message.' });
  }
});

// GET /api/chat/history/:sessionId
app.get('/api/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Don't wrap sessionId in ObjectId since it's a string
    const messages = await db.collection('messages')
      .find({ sessionId }) // ✅ Match string to string
      .sort({ timestamp: 1 })
      .toArray();

    res.json({ messages });
  } catch (error) {
    console.error('❌ Error retrieving chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
});

// Start server
async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
// ───────────────────────
// End of server.js