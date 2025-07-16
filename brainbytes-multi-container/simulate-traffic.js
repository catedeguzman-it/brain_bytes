// simulate-traffic.js
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:10000';

const endpoints = [
  {
    path: '/api/session/start',
    method: 'GET'
  },
  {
    path: '/api/session/end',
    method: 'GET'
  },
  {
    path: '/api/question/ask',
    method: 'POST',
    body: () => ({
      question: getRandomQuestion()
    })
  }
];

function getRandomQuestion() {
  const questions = [
    "What is BrainBytes?",
    "How do I start a tutoring session?",
    "Tell me about Prometheus.",
    "What is AI?",
    "Explain REST APIs.",
    "How does Room DB work?"
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

async function makeRequest() {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const url = `${BASE_URL}${endpoint.path}`;

  const options = {
    method: endpoint.method,
    headers: {}
  };

  if (endpoint.method === 'POST') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(endpoint.body());
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    console.log(`→ ${endpoint.method} ${endpoint.path}: ${response.status} ${text}`);
  } catch (error) {
    console.error(`✖ Error with ${endpoint.path}:`, error.message);
  }
}

async function simulateTraffic() {
  while (true) {
    await makeRequest();
    await new Promise(r => setTimeout(r, Math.random() * 4000 + 1000)); // 1-5 seconds
  }
}

simulateTraffic();
