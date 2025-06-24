const fetch = require('node-fetch');

const MAX_LENGTH = 1000;

// Initialize our AI service
const initializeAI = () => {
  console.log('✅ Hugging Face AI service initialized');
  if (!process.env.HUGGINGFACE_TOKEN) {
    console.warn('⚠️ Warning: HUGGINGFACE_TOKEN environment variable not set. API calls may fail.');
  }
};

async function generateResponse(question) {
  const lowerQuestion = question.toLowerCase();

  const isMath = lowerQuestion.includes('calculate') || lowerQuestion.includes('math') || lowerQuestion.includes('1+1') || /[+\-*\/=]/.test(lowerQuestion);
  const isHistory = lowerQuestion.includes('history') || lowerQuestion.includes('capital') || lowerQuestion.includes('philippines') || lowerQuestion.includes('president');
  const isScience = lowerQuestion.includes('science') || lowerQuestion.includes('evaporation') || lowerQuestion.includes('precipitation') || lowerQuestion.includes('water') || lowerQuestion.includes('chemical');

  let category = 'general';
  if (isMath) category = 'math';
  if (isHistory) category = 'history';
  if (isScience) category = 'science';

  // Direct fallback responses
  if (lowerQuestion === 'what is 1+1' || lowerQuestion === '1+1') {
    return { category: 'math', response: "The answer to 1+1 is 2." };
  }
  if (lowerQuestion === 'what is evaporation') {
    return {
      category: 'science',
      response: "Evaporation is the process where liquid water changes into water vapor (gas). This happens when water molecules gain enough energy from heat to break free from the liquid's surface."
    };
  }
  if (lowerQuestion === 'what is science') {
    return {
      category: 'science',
      response: "Science is the systematic study of the natural world through observation, experimentation, and hypothesis testing."
    };
  }

  const isFrustrated = lowerQuestion.includes("i don't understand") || lowerQuestion.includes('confused') || lowerQuestion.includes('hard') || lowerQuestion.includes('difficult');
  if (isFrustrated) {
    return {
      category: 'support',
      response: "It seems you're feeling stuck. Don't worry—let's break it down step by step. Can you tell me where you got lost?"
    };
  }

  const token = process.env.HUGGINGFACE_TOKEN;
  const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";
  const prompt = `Answer concisely and directly. Do not explain. Just the factual answer: ${question}`;


  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        options: {
          wait_for_model: true
        }
      })
    });

    clearTimeout(timeoutId);

    const status = response.status;
    const raw = await response.text();
    console.log("🔵 Status:", status);
    console.log("🟢 Raw text:", raw);

    if (status !== 200) {
      return { category, response: `The AI service returned status ${status}: ${raw}` };
    }

    const result = JSON.parse(raw);
    let reply = result[0]?.generated_text?.trim() || '';

    // Trim overly long responses to avoid MongoDB error
    if (reply.length > MAX_LENGTH) {
      reply = reply.slice(0, MAX_LENGTH - 3) + '...';
    }

    return { category, response: reply };

  } catch (error) {
    console.error("❌ Error calling Hugging Face API:", error);
    return { category, response: getDetailedResponse(category, question) };
  }
}


// More detailed fallback responses when the API call fails
function getDetailedResponse(category, question) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion === 'what is 1+1' || lowerQuestion === '1+1') {
    return "The answer to 1+1 is 2.";
  }

  if (lowerQuestion === 'what is evaporation') {
    return "Evaporation is the process where liquid water turns into vapor.";
  }

  if (lowerQuestion === 'what is science') {
    return "Science is the systematic study of the natural world.";
  }

  if (category === 'science') {
    if (lowerQuestion.includes('precipitation')) {
      return "Precipitation is water released from clouds in the form of rain, snow, sleet, or hail.";
    }
    if (lowerQuestion.includes('evaporation')) {
      return "Evaporation is the process where liquid water turns into vapor.";
    }
    return "That's an interesting science question! Please provide more details.";
  }

  if (category === 'math') {
    return "I can help with your math question. Please provide more details or a specific equation.";
  }

  if (category === 'history') {
    if (lowerQuestion.includes('capital of the philippines')) {
      return "The capital of the Philippines is Manila.";
    }
    if (lowerQuestion.includes('fish in filipino')) {
      return "The word for 'fish' in Filipino is 'isda'.";
    }
    return "Interesting history question! Can you provide more detail?";
  }

  return "I'm not sure I understand. Could you rephrase or be more specific?";
}

module.exports = {
  initializeAI,
  generateResponse
};
