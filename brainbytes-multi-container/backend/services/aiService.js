const fetch = require('node-fetch');
const MAX_LENGTH = 1000;
const responseCache = {};

const initializeAI = () => {
  console.log('✅ Groq AI service initialized');
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY is not set.');
  }
};

/**
 * Generates a focused response based on the selected subject and material
 * @param {string} question - User's question
 * @param {{ subject: string, topic: string }} materialContext - Selected subject and topic
 */
async function generateResponse(question, materialContext = { subject: 'General', topic: 'General' }) {
  const cacheKey = `${question.trim().toLowerCase()}|${materialContext.subject}|${materialContext.topic}`;
  if (responseCache[cacheKey]) {
    console.log('⚡ Using cached result for:', cacheKey);
    return responseCache[cacheKey];
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return {
      category: materialContext.subject,
      topic: materialContext.topic,
      response: "AI configuration missing. Please set GROQ_API_KEY."
    };
  }

  const prompt = `
You are a highly intelligent tutor for K–12 Filipino students.

Only answer questions related to the following material:

📚 Subject: "${materialContext.subject}"
📘 Topic: "${materialContext.topic}"

Always explain concepts clearly, like you're helping a student understand this topic deeply. Use student-friendly language.

Respond ONLY in this JSON format:

{
  "category": "${materialContext.subject}",
  "topic": "${materialContext.topic}",
  "response": "..."
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
      console.warn("⚠️ Failed to parse JSON from LLM. Returning fallback response.");
      return {
        category: materialContext.subject,
        topic: materialContext.topic,
        response: "Sorry, I had trouble understanding your question. Please rephrase it."
      };
    }

    const formatted = {
      category: materialContext.subject,
      topic: materialContext.topic,
      response: (parsed.response || 'No answer provided.').slice(0, MAX_LENGTH)
    };

    console.log(`✅ [LLM Parsed] Subject: ${formatted.category}, Topic: ${formatted.topic}`);
    responseCache[cacheKey] = formatted;
    return formatted;

  } catch (error) {
    console.error("❌ AI call failed:", error);
    return {
      category: materialContext.subject,
      topic: materialContext.topic,
      response: "Sorry, I encountered a problem while answering. Please try again."
    };
  }
}

module.exports = {
  initializeAI,
  generateResponse
};
