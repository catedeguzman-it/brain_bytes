const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./models/db');
const { setDb } = require('./controllers/chatController');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { initializeAI } = require('./services/aiService');


dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

console.log('CLIENT_ORIGIN in backend:', process.env.CLIENT_ORIGIN);

// ───────────────────────
// MIDDLEWARE
// ───────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:4001',
  credentials: true,
}));
app.use(express.json());

// ───────────────────────
// ROUTES
// ───────────────────────
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);

// ──────── HEALTH CHECK ────────
app.get('/health', (req, res) => res.send('OK'));
// ───────────────────────
// START SERVER
// ───────────────────────
async function startServer() {
  const db = await connectToDatabase();
  initializeAI();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
