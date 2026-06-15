import { queryHybrid } from './helper.js';

/**
 * Query Phi (Local or API fallback via OpenRouter)
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const localProviderUrl = process.env.PHI_PROVIDER;
  const localModelName = process.env.PHI_MODEL || "phi3";

  return queryHybrid({
    providerName: "phi",
    localProviderUrl,
    localModelName,
    apiEndpoint: "", // No official Phi REST API (relies on OpenRouter fallback)
    apiModelName: "microsoft/phi-3-medium-128k-instruct",
    apiKey: "",
    prompt,
    history,
    systemPrompt
  });
}
