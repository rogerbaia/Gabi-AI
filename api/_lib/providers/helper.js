import dotenv from 'dotenv';
dotenv.config();

// Default Ollama local endpoint
const OLLAMA_DEFAULT_URL = "http://localhost:11434/v1/chat/completions";

/**
 * Helper to fetch a URL with a timeout
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 4000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Attempt to match local modelName with tags installed in Ollama.
 * Performs exact, case-insensitive, prefix, and base-name (first word) matching.
 * @param {string} modelName 
 * @returns {Promise<string|null>} Resolved installed model name or null if Ollama is offline or no match found
 */
export async function getBestOllamaModelMatch(modelName) {
  if (!modelName) return null;
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.models && data.models.length > 0) {
      const lowerModel = modelName.toLowerCase();
      // 1. Exact match
      let match = data.models.find(m => m.name.toLowerCase() === lowerModel);
      if (match) return match.name;

      // 2. Match by stripping tags (e.g., query "llama3.3" -> check if contains "llama3.3")
      const queryName = lowerModel.split(':')[0];
      match = data.models.find(m => m.name.toLowerCase().includes(queryName));
      if (match) return match.name;

      // 3. Fallback to base name (e.g. if we query "llama3.3" and have "llama3.1:8b", match "llama")
      const baseQuery = queryName.split('-')[0].replace(/[0-9.]/g, ''); 
      if (baseQuery.length >= 3) {
        match = data.models.find(m => m.name.toLowerCase().includes(baseQuery));
        if (match) return match.name;
      }
    }
  } catch (e) {
    // Ollama is offline
  }
  return null;
}

/**
 * Check if Ollama is running and has the model installed
 * @param {string} modelName - Model name to check
 * @returns {Promise<boolean>} True if model is available in local Ollama
 */
export async function isOllamaModelAvailable(modelName) {
  const match = await getBestOllamaModelMatch(modelName);
  return !!match;
}

/**
 * Unified hybrid query executor (Local -> API same model -> OpenRouter)
 * @param {Object} params - Query execution parameters
 * @returns {Promise<Object>} Normalized provider response
 */
export async function queryHybrid({
  providerName,
  localProviderUrl,
  localModelName,
  apiEndpoint,
  apiModelName,
  apiKey,
  prompt,
  history = [],
  systemPrompt = "",
  customHeaders = {}
}) {
  const startTime = Date.now();
  
  // Format messages in OpenAI schema
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

  let localAttemptSuccess = false;
  let activeModel = localModelName;
  let answer = "";
  let queryError = null;

  const currentSystemMode = globalThis.SYSTEM_MODE || 'hybrid';

  const hasAnyActiveApi = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.PERPLEXITY_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.DEEPSEEK_PROVIDER ||
    process.env.GEMINI_API_KEY ||
    process.env.GROK_API_KEY ||
    process.env.MISTRAL_API_KEY ||
    process.env.MISTRAL_PROVIDER ||
    process.env.QWEN_API_KEY ||
    process.env.QWEN_PROVIDER ||
    process.env.LLAMA_PROVIDER ||
    process.env.GEMMA_PROVIDER ||
    process.env.PHI_PROVIDER ||
    process.env.OPENROUTER_API_KEY
  );

  // 1. ATTEMPT LOCAL EXECUTION (Priority High)
  // Skip local execution if system mode is cloud, UNLESS there are no active cloud APIs configured
  let matchedModel = null;
  if (currentSystemMode !== 'cloud' || !hasAnyActiveApi) {
    matchedModel = await getBestOllamaModelMatch(localModelName);
  }
  const localUrl = localProviderUrl || (matchedModel ? OLLAMA_DEFAULT_URL : (!hasAnyActiveApi ? OLLAMA_DEFAULT_URL : null));

  if (localUrl) {
    const cleanLocalUrl = localUrl.endsWith('/chat/completions') 
      ? localUrl 
      : localUrl.replace(/\/$/, '') + '/chat/completions';

    const activeLocalModel = matchedModel || localModelName;
    console.log(`[Hybrid] Attempting LOCAL execution for [${providerName}] using model [${activeLocalModel}] via ${cleanLocalUrl}...`);
    try {
      const localRes = await fetchWithTimeout(cleanLocalUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: activeLocalModel,
          messages,
          temperature: 0.7
        }),
        timeout: 60000 // 60s timeout for local to allow model loading
      });

      if (localRes.ok) {
        const data = await localRes.json();
        answer = data.choices?.[0]?.message?.content || "";
        if (answer) {
          localAttemptSuccess = true;
          activeModel = `${activeLocalModel} (Local)`;
          console.log(`[Hybrid] Local execution succeeded for [${providerName}].`);
        }
      } else {
        const errTxt = await localRes.text();
        queryError = `Local HTTP ${localRes.status}: ${errTxt}`;
      }
    } catch (err) {
      queryError = `Local connection error: ${err.message}`;
    }
  } else {
    queryError = currentSystemMode === 'cloud' 
      ? "Skipping local execution (Cloud Mode active)."
      : "No local provider or Ollama model configured/installed.";
  }

  // 2. ATTEMPT API FALLBACK (Priority Secondary)
  if (!localAttemptSuccess) {
    if (currentSystemMode === 'offline') {
      console.warn(`[Hybrid] Local execution failed and API fallback blocked (Offline Mode active).`);
      return {
        provider: providerName,
        model: localModelName,
        answer: "",
        sources: [],
        latencyMs: Date.now() - startTime,
        error: `Offline mode is active. Local execution failed: ${queryError}`,
        confidenceEstimate: 0
      };
    }

    console.warn(`[Hybrid] Local [${providerName}] unavailable/failed (${queryError}). Falling back to API...`);
    
    // Check if official API key is set
    if (apiKey && apiEndpoint) {
      activeModel = apiModelName;
      const cleanApiUrl = apiEndpoint.endsWith('/chat/completions') 
        ? apiEndpoint 
        : apiEndpoint.replace(/\/$/, '') + '/chat/completions';

      try {
        const response = await fetch(cleanApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            ...customHeaders
          },
          body: JSON.stringify({
            model: apiModelName,
            messages,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          answer = data.choices?.[0]?.message?.content || "";
          if (answer) {
            console.log(`[Hybrid] API execution succeeded for [${providerName}].`);
            return {
              provider: providerName,
              model: activeModel,
              answer,
              sources: [],
              latencyMs: Date.now() - startTime,
              error: null,
              confidenceEstimate: 0.90
            };
          }
        } else {
          const errTxt = await response.text();
          queryError = `API HTTP ${response.status}: ${errTxt}`;
        }
      } catch (err) {
        queryError = `API connection error: ${err.message}`;
      }
    }

    // 3. ATTEMPT OPENROUTER FALLBACK (Last Resort)
    if (process.env.OPENROUTER_API_KEY) {
      console.log(`[Hybrid] API key missing or failed for [${providerName}]. Attempting OpenRouter fallback...`);
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://gabiai.aureasynaptica.com",
            "X-Title": "Gabi AI"
          },
          body: JSON.stringify({
            model: `openrouter/${apiModelName}`, // Request standard model from OpenRouter catalog
            messages,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          answer = data.choices?.[0]?.message?.content || "";
          if (answer) {
            console.log(`[Hybrid] OpenRouter backup succeeded for [${providerName}].`);
            return {
              provider: providerName,
              model: `${apiModelName} (OpenRouter)`,
              answer,
              sources: [],
              latencyMs: Date.now() - startTime,
              error: null,
              confidenceEstimate: 0.88
            };
          }
        } else {
          const errTxt = await response.text();
          queryError = `OpenRouter HTTP ${response.status}: ${errTxt}`;
        }
      } catch (err) {
        queryError = `OpenRouter connection error: ${err.message}`;
      }
    }

    // If all fail, return the error object
    return {
      provider: providerName,
      model: apiModelName,
      answer: "",
      sources: [],
      latencyMs: Date.now() - startTime,
      error: `All endpoints failed. last error: ${queryError}`,
      confidenceEstimate: 0
    };
  }

  // Return local success answer
  return {
    provider: providerName,
    model: activeModel,
    answer,
    sources: [],
    latencyMs: Date.now() - startTime,
    error: null,
    confidenceEstimate: 0.85
  };
}
