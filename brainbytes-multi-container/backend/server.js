const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./models/db');
const { initializeAI } = require('./services/aiService');

// ─── Route Imports ─────────────────────────────
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const metricRoutes = require('./routes/metricRoutes');
const materialRoutes = require('./routes/materialRoutes'); // ✅ Added material routes

// ─── Prometheus Setup ──────────────────────────
const promClient = require('prom-client');
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// ─── App Initialization ────────────────────────
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

console.log('✅ CLIENT_ORIGIN in backend:', process.env.CLIENT_ORIGIN);

// ───────────────────────
// MIDDLEWARE
// ───────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://brainbytes-frontend-zk1e.onrender.com',
  ],
  credentials: true,
}));

app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
  });
  next();
});

// ───────────────────────
// ROUTES
// ───────────────────────
app.use('/api', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);
app.use('/api', metricRoutes);
app.use('/api', materialRoutes); // ✅ Register the materials route

// ────────────────
// HEALTH & METRICS
// ────────────────
app.get('/health', (req, res) => res.send('OK'));

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ────────────────
// 404 HANDLER
// ────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ───────────────────────
// START SERVER
// ───────────────────────
async function startServer() {
  try {
    const db = await connectToDatabase();
    initializeAI();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

