const client = require('prom-client');

// ✅ Create and expose a shared Prometheus Registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ────────────────────────────────
// ⬛ Application Metrics
// ────────────────────────────────

// 1. Counter: Total HTTP Requests
const httpRequestCounter = new client.Counter({
  name: 'brainbytes_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'endpoint', 'status'],
});
register.registerMetric(httpRequestCounter);

// 2. Histogram: HTTP Request Duration
const httpRequestDuration = new client.Histogram({
  name: 'brainbytes_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'endpoint', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

// 3. Gauge: Active Tutoring Sessions
const activeSessionsGauge = new client.Gauge({
  name: 'brainbytes_active_sessions',
  help: 'Current number of active tutoring sessions',
});
register.registerMetric(activeSessionsGauge);
activeSessionsGauge.set(0); // initialize

// 4. Counter: AI Requests
const aiRequestCounter = new client.Counter({
  name: 'brainbytes_ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['model', 'status'],
});
register.registerMetric(aiRequestCounter);

// 5. Histogram: AI Response Duration
const aiResponseDuration = new client.Histogram({
  name: 'brainbytes_ai_response_duration_seconds',
  help: 'Duration of AI responses in seconds',
  labelNames: ['model'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 3, 5],
});
register.registerMetric(aiResponseDuration);

// 6. Counter: Questions Asked
const questionsCounter = new client.Counter({
  name: 'brainbytes_questions_total',
  help: 'Total number of questions asked',
});
register.registerMetric(questionsCounter);

// 7. Counter: Tutoring Sessions
const sessionsCounter = new client.Counter({
  name: 'brainbytes_tutoring_sessions_total',
  help: 'Total number of tutoring sessions completed',
});
register.registerMetric(sessionsCounter);

// 8. Histogram: Tutoring Session Duration
const sessionDurationHistogram = new client.Histogram({
  name: 'brainbytes_session_duration_seconds',
  help: 'Duration of tutoring sessions in seconds',
  buckets: [60, 300, 600, 1200, 1800, 3600],
});
register.registerMetric(sessionDurationHistogram);

// ────────────────────────────────
// ⬛ Middleware for HTTP Metrics
// ────────────────────────────────
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

// ────────────────────────────────
// ⬛ Prometheus /metrics handler
// ────────────────────────────────
async function metricsHandler(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

// ────────────────────────────────
// ⬛ AI & Session Helpers
// ────────────────────────────────
function incrementActiveSessions() {
  activeSessionsGauge.inc();
}

function decrementActiveSessions() {
  activeSessionsGauge.dec();
}

function recordAIRequest(model, statusCode, durationInSeconds) {
  aiRequestCounter.inc({ model, status: statusCode });
  aiResponseDuration.observe({ model }, durationInSeconds);
}

// ────────────────────────────────
// ⬛ Export everything needed
// ────────────────────────────────
module.exports = {
  metricsMiddleware,
  metricsHandler,
  incrementActiveSessions,
  decrementActiveSessions,
  recordAIRequest,
  register,
  questionsCounter,
  sessionsCounter,
  sessionDurationHistogram,
};
