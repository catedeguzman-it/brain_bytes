// simulate-demo.js
const axios = require('axios');
const delay = (ms) => new Promise(res => setTimeout(res, ms));
const BASE_URL = process.env.DEMO_API_URL || 'http://localhost:10000/api';

const normalQuestions = [
  "What is JavaScript?",
  "Explain REST APIs.",
  "How does Node.js work?",
  "What is Prometheus?",
  "Tell me about AI monitoring.",
];

const errorScenarios = [
  { method: 'POST', url: '/question/ask', data: null },
  { method: 'GET', url: '/bad-endpoint' },
  { method: 'POST', url: '/question/ask', data: { question: '' } }
];

async function startSession() {
  await axios.get(`${BASE_URL}/session/start`);
  return 'demo-session-' + Math.random().toString(36).substring(2);
}

async function askQuestion(sessionId, question) {
  await axios.post(`${BASE_URL}/question/ask`, { sessionId, question });
}

async function endSession(sessionId) {
  await axios.get(`${BASE_URL}/session/end`, { params: { sessionId } });
}

async function simulateNormalSession() {
  const sessionId = await startSession();
  for (const q of normalQuestions) {
    console.log(`🟢 Asking: "${q}"`);
    await askQuestion(sessionId, q);
    await delay(300); // Normal latency
  }
  await endSession(sessionId);
  console.log(`✅ Normal session completed.\n`);
}

async function simulateHighLoad(sessions = 10) {
  console.log(`🚨 Simulating ${sessions} concurrent sessions...`);
  const promises = [];
  for (let i = 0; i < sessions; i++) {
    promises.push(simulateNormalSession());
    await delay(100); // Staggered start
  }
  await Promise.all(promises);
  console.log(`✅ High load simulation completed.\n`);
}

async function simulateErrors() {
  console.log("💣 Simulating API errors...");
  for (const scenario of errorScenarios) {
    try {
      await axios({
        method: scenario.method,
        url: `${BASE_URL}${scenario.url}`,
        data: scenario.data,
      });
    } catch (err) {
      const status = err.response?.status || 'unknown';
      console.log(`❌ Simulated error at ${scenario.url} → HTTP ${status}`);
    }
  }
  console.log(`✅ Error simulation completed.\n`);
}

async function simulateLatencySpike() {
  console.log("🐢 Simulating latency spike...");
  const sessionId = await startSession();
  const longQuestion = "Explain in detail: ".repeat(100); // Long prompt
  await askQuestion(sessionId, longQuestion);
  await endSession(sessionId);
  console.log(`✅ Latency spike completed.\n`);
}

async function runDemo() {
  console.log("\n🚀 Running BrainBytes Monitoring Demo...\n");

  try {
    await simulateNormalSession();
    await simulateHighLoad(10);
    await simulateErrors();
    await simulateLatencySpike();
    console.log("🎉 Demo complete! Check Grafana for metrics and alerts.\n");
  } catch (err) {
    console.error("💥 Demo failed:", err.message || 'Unknown error');
    if (err.config) {
      console.error("🔍 Request URL:", err.config.url);
      console.error("🔍 Method:", err.config.method);
      if (err.config.data) {
        console.error("🔍 Sent Data:", err.config.data);
      }
    }
    if (err.response) {
      console.error("🔍 Response Status:", err.response.status);
      console.error("🔍 Response Data:", err.response.data);
    } else if (err.request) {
      console.error("📡 No response received. Check if the server is up.");
    }
  }
}

runDemo().catch(err => {
  console.error("💥 Demo failed:", err.message);
});
// End of simulate-demo.js