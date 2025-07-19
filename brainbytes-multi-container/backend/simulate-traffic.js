// simulate-traffic.js
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:10000'; // ✅ Set to your actual backend port

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateSessionLifecycle() {
  try {
    await fetch(`${BASE_URL}/api/session/start`);
    const qCount = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < qCount; i++) {
      const question = getRandomQuestion();
      const res = await fetch(`${BASE_URL}/api/question/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const body = await res.text();
      console.log(`→ Asked: "${question}" | Status: ${res.status}`);
      await delay(1000);
    }

    await fetch(`${BASE_URL}/api/session/end`);
    console.log(`→ Session ended`);
  } catch (err) {
    console.error('✖ Simulation error:', err.message);
  }
}

async function simulateTraffic() {
  while (true) {
    await simulateSessionLifecycle();
    await delay(Math.random() * 3000 + 2000); // 2–5s between sessions
  }
}

simulateTraffic();
