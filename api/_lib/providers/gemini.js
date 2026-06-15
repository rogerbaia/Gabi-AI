import dotenv from 'dotenv';
dotenv.config();

/**
 * Query Google Gemini API for completions
 * @param {string} prompt - The user prompt
 * @param {Array} history - Short-term memory message history
 * @param {string} systemPrompt - System instruction text
 * @returns {Promise<Object>} The normalized provider answer object
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const provider = "gemini";
  const model = "gemini-1.5-flash";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      provider,
      model,
      answer: "",
      sources: [],
      latencyMs: 0,
      error: "API key not configured",
      confidenceEstimate: 0
    };
  }

  const startTime = Date.now();
  try {
    const contents = [];
    
    // Format history for Gemini (uses "user" and "model" roles)
    history.forEach(msg => {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      });
    });

    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const bodyParams = {
      contents
    };

    if (systemPrompt) {
      bodyParams.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyParams)
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
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      provider,
      model,
      answer,
      sources: [],
      latencyMs,
      error: null,
      confidenceEstimate: 0.92
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
