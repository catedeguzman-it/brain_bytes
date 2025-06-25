const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./models/db');
const { setDb } = require('./controllers/chatController');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
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

// ──────── HEALTH CHECK ────────
app.get('/health', (req, res) => res.status(200).send('OK'));

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
