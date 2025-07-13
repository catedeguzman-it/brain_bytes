const client = require('prom-client');

// Create a Registry and collect default Node.js metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ─────────────────────────────────────────────────────────────
// ⬛ Application Metrics
// ─────────────────────────────────────────────────────────────

// 1. Counter: Total HTTP Requests
const httpRequestCounter = new client.Counter({
  name: 'brainbytes_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register],
});

// 2. Histogram: HTTP Request Duration
const httpRequestDuration = new client.Histogram({
  name: 'brainbytes_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// 3. Gauge: Active Tutoring Sessions
const activeSessionsGauge = new client.Gauge({
  name: 'brainbytes_active_sessions',
  help: 'Current number of active tutoring sessions',
  registers: [register],
});
activeSessionsGauge.set(0); // initialize

// 4. Counter: AI Requests
const aiRequestCounter = new client.Counter({
  name: 'brainbytes_ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['model', 'status'],
  registers: [register],
});

// 5. Histogram: AI Response Duration
const aiResponseDuration = new client.Histogram({
  name: 'brainbytes_ai_response_duration_seconds',
  help: 'Duration of AI responses in seconds',
  labelNames: ['model'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 3, 5],
  registers: [register],
});

// ─────────────────────────────────────────────────────────────
// ⬛ Middleware to Collect HTTP Request Metrics
// ─────────────────────────────────────────────────────────────
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestCounter.inc({
      method: req.method,
      endpoint: req.path,
      status: res.statusCode,
    });

    httpRequestDuration.observe({
      method: req.method,
      endpoint: req.path,
      status: res.statusCode,
    }, duration);
  });

  next();
}

// ─────────────────────────────────────────────────────────────
// ⬛ Metrics Endpoint Handler
// ─────────────────────────────────────────────────────────────
async function metricsHandler(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

// ─────────────────────────────────────────────────────────────
// ⬛ Active Session Control
// ─────────────────────────────────────────────────────────────
function incrementActiveSessions() {
  activeSessionsGauge.inc();
}

function decrementActiveSessions() {
  activeSessionsGauge.dec();
}

// ─────────────────────────────────────────────────────────────
// ⬛ AI Metrics Usage Example (manual trigger from controller)
// ─────────────────────────────────────────────────────────────
function recordAIRequest(model, statusCode, durationInSeconds) {
  aiRequestCounter.inc({ model, status: statusCode });
  aiResponseDuration.observe({ model }, durationInSeconds);
}

// ─────────────────────────────────────────────────────────────
// ⬛ Exports
// ─────────────────────────────────────────────────────────────
module.exports = {
  metricsMiddleware,
  metricsHandler,
  incrementActiveSessions,
  decrementActiveSessions,
  recordAIRequest,
  register, // for testing/export
};
