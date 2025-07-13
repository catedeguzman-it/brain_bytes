const express = require('express');
const {
  metricsMiddleware,
  incrementActiveSessions,
  decrementActiveSessions,
  metricsHandler,
  recordAIRequest
} = require('../metrics');

const router = express.Router();

router.use(metricsMiddleware);

// Core monitored routes
router.get('/session/start', (req, res) => {
  incrementActiveSessions();
  res.json({ success: true });
});

router.get('/session/end', (req, res) => {
  decrementActiveSessions();
  res.json({ success: true });
});

router.post('/question/ask', (req, res) => {
  const { question } = req.body;
  res.json({ answer: "This is a dummy answer to: " + question });
});

// Simulated AI request for testing metrics
router.post('/simulate', (req, res) => {
  const { model, status } = req.body;
  const duration = Math.random() * 3; // Simulate duration in seconds
  recordAIRequest(model, status, duration);
  res.status(200).json({ success: true, model, status, duration });
});

// Metrics endpoint
router.get('/metrics', metricsHandler);

module.exports = router;
