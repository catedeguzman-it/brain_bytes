const fetch = require('node-fetch');
const { recordAIRequest } = require('../metrics'); // ✅ Prometheus tracker

const MAX_LENGTH = 1000;
const responseCache = {};

const CATEGORIES = [
  'Math', 'Science', 'English', 'History', 'Filipino', 'Geography',
  'Technology', 'Arts', 'Music', 'Health', 'Civics', 'Support', 'General'
];

function detectCategoryFromKeywords(question) {
  const lower = question.toLowerCase();
  if (lower.includes('president') || lower.includes('rizal') || lower.includes('revolution')) return 'History';
  if (lower.includes('philippines') || lower.includes('manila') || lower.includes('region')) return 'Geography';
  if (lower.includes('salita') || lower.includes('pangungusap') || lower.includes('panitikan')) return 'Filipino';
  if (lower.includes('math') || /\d+\s*[\+\-\*\/]\s*\d+/.test(lower)) return 'Math';
  if (lower.includes('science') || lower.includes('evaporation') || lower.includes('atom')) return 'Science';
  return 'General';
}

const initializeAI = () => {
  console.log('✅ Groq AI service initialized');
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY is not set.');
  }
};

async function generateResponse(question) {
  const cacheKey = question.trim().toLowerCase();
  if (responseCache[cacheKey]) {
    console.log('⚡ Using cached result for:', cacheKey);
    return responseCache[cacheKey];
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return {
      category: 'General',
      topic: 'General',
      response: "AI configuration missing. Please set GROQ_API_KEY."
    };
  }

  const preCategory = detectCategoryFromKeywords(question);
  const startTime = Date.now();

  const prompt = `
You are an expert AI tutor for Filipino students. Respond in JSON format only:

{
  "category": "One of: ${CATEGORIES.join(' | ')}",
  "topic": "Short specific topic (e.g., 'Photosynthesis', 'Fractions', 'Philippine Presidents')",
  "response": "A clear and factual explanation tailored for students in the Philippines"
}

Question: "${question}"
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
          { role: "system", content: "You are a helpful tutor. Respond only with JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400
      })
    });

    clearTimeout(timeoutId);
    const raw = await response.text();
    const parsedRaw = JSON.parse(raw);
    const content = parsedRaw.choices?.[0]?.message?.content?.trim();

    if (!content) throw new Error("Empty response from LLM");

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      parsed = JSON.parse(jsonMatch?.[0] || '{}');
    } catch (err) {
      console.warn("⚠️ Failed to parse JSON from LLM. Falling back.");
      const fallback = fallbackCategorization(question);
      responseCache[cacheKey] = fallback;
      return fallback;
    }

    const finalCategory = CATEGORIES.includes(parsed.category) ? parsed.category : preCategory || 'General';
    const formatted = {
      category: finalCategory,
      topic: parsed.topic || 'General',
      response: (parsed.response || 'No answer provided.').slice(0, MAX_LENGTH)
    };

    const duration = (Date.now() - startTime) / 1000;
    recordAIRequest("llama-4-scout", "200", duration); // ✅ success metric

    console.log(`✅ [LLM Parsed] Category: ${formatted.category}, Topic: ${formatted.topic}`);
    responseCache[cacheKey] = formatted;
    return formatted;

  } catch (error) {
    console.error("❌ AI call failed:", error);

    recordAIRequest("llama-4-scout", "500", 0); // ✅ failure metric

    const fallback = fallbackCategorization(question);
    responseCache[cacheKey] = fallback;
    return fallback;
  }
}

function fallbackCategorization(question) {
  const cat = detectCategoryFromKeywords(question);
  return {
    category: cat,
    topic: 'General',
    response: "I'm not quite sure, but this may relate to " + cat + ". Can you clarify your question?"
  };
}

module.exports = {
  initializeAI,
  generateResponse
};
