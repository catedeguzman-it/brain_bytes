const axios = require('axios');

async function simulateUserBehavior() {
  const models = ['gpt2', 'mistral', 'llama'];
  const errors = [200, 200, 200, 500, 502];
  const randomStatus = () => errors[Math.floor(Math.random() * errors.length)];
  const randomModel = () => models[Math.floor(Math.random() * models.length)];
  const baseURL = 'http://localhost:3000/simulate';

  for (let i = 0; i < 100; i++) {
    const delay = Math.random() * 3000;
    setTimeout(async () => {
      try {
        await axios.post(`${baseURL}`, {
          model: randomModel(),
          status: randomStatus()
        });
      } catch (e) {
        console.error('Sim error', e.message);
      }
    }, delay);
  }
}

// Run when script is called directly
simulateUserBehavior();
