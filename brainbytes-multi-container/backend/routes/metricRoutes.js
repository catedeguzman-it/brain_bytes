const express = require('express');
const {
  metricsMiddleware,
  incrementActiveSessions,
  decrementActiveSessions,
  metricsHandler
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

// Metrics endpoint
router.get('/metrics', metricsHandler);

module.exports = router;
