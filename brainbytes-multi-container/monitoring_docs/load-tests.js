// load-test.js - Using k6 (https://k6.io/)
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp up to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '5m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests < 500ms
    'http_req_failed': ['rate<0.01'],   // Less than 1% failures
  },
};

const BASE_URL = 'https://brainbytes-frontend-zk1e.onrender.com/';

// Simulate a student session
export default function () {
  // Start session
  const startRes = http.post(`${BASE_URL}/api/session/start`, JSON.stringify({
    subject: 'math',
    gradeLevel: 'high',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(startRes, {
    '✅ session started': (r) => r.status === 200,
  });

  const sessionId = startRes.json('sessionId') || 'dummy-session';

  // Ask 3–5 questions
  const questionCount = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < questionCount; i++) {
    const questionRes = http.post(`${BASE_URL}/api/question`, JSON.stringify({
      sessionId,
      question: `What is the derivative of x^${i + 2}?`,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(questionRes, {
      '✅ question answered': (r) => r.status === 200,
      '⚡ response time ok': (r) => r.timings.duration < 2000,
    });

    sleep(Math.random() * 5 + 3); // Think time: 3–8s
  }

  // End session
  const endRes = http.post(`${BASE_URL}/api/session/end`, JSON.stringify({
    sessionId,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(endRes, {
    '✅ session ended': (r) => r.status === 200,
  });

  // Cooldown before next user
  sleep(Math.random() * 10 + 5); // 5–15s between sessions
}
