import dotenv from 'dotenv';
dotenv.config();

/**
 * Query Anthropic Claude API for completions
 * @param {string} prompt - The user prompt
 * @param {Array} history - Short-term memory message history
 * @param {string} systemPrompt - System instruction text
 * @returns {Promise<Object>} The normalized provider answer object
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const provider = "anthropic";
  const model = "claude-3-5-sonnet-20241022";
  const apiKey = process.env.ANTHROPIC_API_KEY;

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
    const messages = [];
    
    // Inject history (excluding system messages)
    history.forEach(msg => {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      });
    });

    messages.push({ role: "user", content: prompt });

    const bodyParams = {
      model,
      max_tokens: 1024,
      messages,
      temperature: 0.7
    };

    if (systemPrompt) {
      bodyParams.system = systemPrompt;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
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
    const answer = data.content?.[0]?.text || "";

    return {
      provider,
      model,
      answer,
      sources: [],
      latencyMs,
      error: null,
      confidenceEstimate: 0.98
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
