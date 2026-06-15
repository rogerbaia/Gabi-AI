import { queryHybrid } from './helper.js';

/**
 * Query Gemma (Local or API fallback via OpenRouter)
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const localProviderUrl = process.env.GEMMA_PROVIDER;
  const localModelName = process.env.GEMMA_MODEL || "gemma2";

  return queryHybrid({
    providerName: "gemma",
    localProviderUrl,
    localModelName,
    apiEndpoint: "", // No official Gemma REST API endpoint (relies on OpenRouter fallback)
    apiModelName: "google/gemma-2-9b-it",
    apiKey: "",
    prompt,
    history,
    systemPrompt
  });
}
