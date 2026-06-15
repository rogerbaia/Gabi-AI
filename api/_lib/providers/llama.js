import { queryHybrid } from './helper.js';

/**
 * Query Llama (Local or API fallback)
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const localProviderUrl = process.env.LLAMA_PROVIDER;
  const localModelName = process.env.LLAMA_MODEL || "llama3.3";
  const apiKey = process.env.LLAMA_API_KEY || process.env.GROQ_API_KEY;
  
  return queryHybrid({
    providerName: "llama",
    localProviderUrl,
    localModelName,
    apiEndpoint: "https://api.groq.com/openai/v1", // Default Groq API completions endpoint
    apiModelName: "llama-3.3-70b-specdec", // Standard fast API model
    apiKey,
    prompt,
    history,
    systemPrompt
  });
}
