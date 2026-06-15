import dotenv from 'dotenv';
dotenv.config();

/**
 * Query OpenRouter API for completions
 * @param {string} prompt - The user prompt
 * @param {Array} history - Short-term memory message history
 * @param {string} systemPrompt - System instruction text
 * @param {string} overrideModel - Model identifier override
 * @returns {Promise<Object>} The normalized provider answer object
 */
export async function query(prompt, history = [], systemPrompt = "", overrideModel = "google/gemma-2-9b-it") {
  const provider = "openrouter";
  const model = overrideModel;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      provider,
      model,
      answer: "",
      sources: [],
      latencyMs: 0,
      error: "OpenRouter API key not configured",
      confidenceEstimate: 0
    };
  }

  const startTime = Date.now();
  try {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    
    history.forEach(msg => {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      });
    });

    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://gabiai.aureasynaptica.com",
        "X-Title": "Gabi AI"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7
      })
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      return {
        provider,
        model,
        answer: "",
        sources: [],
        latencyMs,
        error: `HTTP ${response.status}: ${errText}`,
        confidenceEstimate: 0
      };
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    return {
      provider,
      model,
      answer,
      sources: [],
      latencyMs,
      error: null,
      confidenceEstimate: 0.90
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      provider,
      model,
      answer: "",
      sources: [],
      latencyMs,
      error: err.message,
      confidenceEstimate: 0
    };
  }
}
