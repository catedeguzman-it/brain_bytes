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

// ───────────────────────
// MIDDLEWARE
// ───────────────────────
app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
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
// SERVE FRONTEND STATIC BUILD
// ───────────────────────
app.use(express.static(path.join(__dirname, '../frontend/out')));

// Fallback: send index.html for unmatched routes (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/out/index.html'));
});

// ───────────────────────
// START SERVER
// ───────────────────────
async function startServer() {
  const db = await connectToDatabase();
  initializeAI(); // start Hugging Face integration log
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
