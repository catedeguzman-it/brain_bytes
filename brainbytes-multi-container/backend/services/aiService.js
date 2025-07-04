const fetch = require('node-fetch');

const MAX_LENGTH = 1000;

const responseCache = {};

const initializeAI = () => {
  console.log('✅ Groq AI service initialized');
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️ Warning: GROQ_API_KEY environment variable not set. API calls may fail.');
  }
};

async function generateResponse(question) {
    const cacheKey = question.trim().toLowerCase();
  if (responseCache[cacheKey]) {
    console.log('⚡ Returning cached response for:', cacheKey);
    return responseCache[cacheKey];
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return {
      category: 'General',
      topic: 'General',
      response: "The AI service is not configured. Please set the GROQ_API_KEY in your environment."
    };
  }

  const prompt = `
You are an intelligent AI tutor. Given a student's question, respond in this strict JSON format:

{
  "category": "Math | Science | English | History | Filipino | Support | General",
  "topic": "Short and specific topic name (e.g., 'Multiplication', 'Evaporation')",
  "response": "A helpful, concise, and accurate answer to the question"
}

The question is: "${question}"
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: "You are a helpful tutor. Return JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    clearTimeout(timeoutId);
    const raw = await response.text();
    const result = JSON.parse(raw);

    const content = result.choices?.[0]?.message?.content?.trim();

    if (!content) throw new Error('Empty response from AI');

    let parsed;
        try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.warn("⚠️ AI response not valid JSON. Using fallback.");
      const fallback = fallbackCategorization(question);
      responseCache[cacheKey] = fallback;
      return fallback;
    }

    const resultObj = {
      category: parsed.category || 'General',
      topic: parsed.topic || 'General',
      response: parsed.response?.slice(0, MAX_LENGTH) || 'No response provided.'
    };
    responseCache[cacheKey] = resultObj;
    return resultObj;

  } catch (error) {
    console.error('❌ Error generating response:', error);
    const fallback = fallbackCategorization(question);
    responseCache[cacheKey] = fallback;
    return fallback;
  }
}

function fallbackCategorization(question) {
  const lower = question.toLowerCase();
  let category = 'General';
  let topic = 'General';

  // 📐 MATH
  if (
    lower.includes('add') || lower.includes('+') ||
    lower.includes('subtract') || lower.includes('-') ||
    lower.includes('multiply') || lower.includes('x') || lower.includes('*') ||
    lower.includes('divide') || lower.includes('/') ||
    lower.match(/\d+\s*[+\-*/x]\s*\d+/)
  ) {
    category = 'Math';
    if (lower.includes('add') || lower.includes('+')) topic = 'Addition';
    else if (lower.includes('subtract') || lower.includes('-')) topic = 'Subtraction';
    else if (lower.includes('multiply') || lower.includes('x') || lower.includes('*')) topic = 'Multiplication';
    else if (lower.includes('divide') || lower.includes('/')) topic = 'Division';
    else topic = 'Math Problem';
  }

  // 🔬 SCIENCE
  else if (
    lower.includes('evaporation') || lower.includes('condensation') ||
    lower.includes('water cycle') || lower.includes('photosynthesis') ||
    lower.includes('states of matter') || lower.includes('solid') ||
    lower.includes('liquid') || lower.includes('gas')
  ) {
    category = 'Science';
    if (lower.includes('evaporation')) topic = 'Evaporation';
    else if (lower.includes('photosynthesis')) topic = 'Photosynthesis';
    else if (lower.includes('states of matter') || lower.includes('solid') || lower.includes('liquid') || lower.includes('gas')) topic = 'States of Matter';
    else topic = 'General Science';
  }

  // 📚 ENGLISH
  else if (
    lower.includes('grammar') || lower.includes('synonym') || lower.includes('antonym') ||
    lower.includes('verb') || lower.includes('adjective') || lower.includes('punctuation') ||
    lower.includes('sentence') || lower.includes('essay') || lower.includes('paragraph')
  ) {
    category = 'English';
    if (lower.includes('synonym')) topic = 'Synonyms';
    else if (lower.includes('verb')) topic = 'Verbs';
    else if (lower.includes('grammar')) topic = 'Grammar';
    else topic = 'English Topic';
  }

  // 🕰️ HISTORY
  else if (
    lower.includes('president') || lower.includes('philippine independence') ||
    lower.includes('world war') || lower.includes('revolution') || lower.includes('heroes')
  ) {
    category = 'History';
    if (lower.includes('president')) topic = 'Presidents';
    else if (lower.includes('independence')) topic = 'Philippine Independence';
    else if (lower.includes('world war')) topic = 'World Wars';
    else topic = 'Historical Topic';
  }

  // 🏛️ FILIPINO
  else if (
    lower.includes('salita') || lower.includes('pangungusap') || lower.includes('panitikan') ||
    lower.includes('kasaysayan') || lower.includes('kasingkahulugan') || lower.includes('kasalungat')
  ) {
    category = 'Filipino';
    if (lower.includes('kasingkahulugan')) topic = 'Kasingkahulugan';
    else if (lower.includes('kasalungat')) topic = 'Kasalungat';
    else if (lower.includes('pangungusap')) topic = 'Pangungusap';
    else topic = 'Paksa sa Filipino';
  }

  // 🧠 SUPPORT
  else if (
    lower.includes("i don't understand") || lower.includes('confused') ||
    lower.includes('hard') || lower.includes('difficult') ||
    lower.includes('can you help') || lower.includes('explain again')
  ) {
    category = 'Support';
    topic = 'Encouragement';
  }

  return {
    category,
    topic,
    response: "Here's a general answer. Sorry, I couldn't determine the exact topic."
  };
}

module.exports = {
  initializeAI,
  generateResponse
};
