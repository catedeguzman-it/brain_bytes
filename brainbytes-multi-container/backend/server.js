const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./models/db');
const { initializeAI } = require('./services/aiService');

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const metricRoutes = require('./routes/metricRoutes');

// ✅ Prometheus metrics middleware
const {
  metricsMiddleware,
  metricsHandler
} = require('./metrics');

// Load environment variables
dotenv.config();

// App setup
const app = express();
const PORT = process.env.PORT || 4000;
console.log('CLIENT_ORIGIN in backend:', process.env.CLIENT_ORIGIN);

// ───────────────────────────────
// MIDDLEWARE
// ───────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://brainbytes-frontend-zk1e.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(metricsMiddleware); // Prometheus request tracking

// ───────────────────────────────
// ROUTES
// ───────────────────────────────
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);
app.use('/api', metricRoutes);

// ───────────────────────────────
// SYSTEM ROUTES
// ───────────────────────────────
app.get('/health', (req, res) => res.send('OK'));
app.get('/metrics', metricsHandler);
app.get('/', (req, res) => res.send('BrainBytes backend root route!'));

// ───────────────────────────────
// START SERVER
// ───────────────────────────────
async function startServer() {
  await connectToDatabase();
  initializeAI();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
