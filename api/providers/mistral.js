import { queryHybrid } from './helper.js';

/**
 * Query Mistral (Local or API fallback)
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const localProviderUrl = process.env.MISTRAL_PROVIDER;
  const localModelName = process.env.MISTRAL_MODEL || "mistral";
  const apiKey = process.env.MISTRAL_API_KEY;

  return queryHybrid({
    providerName: "mistral",
    localProviderUrl,
    localModelName,
    apiEndpoint: "https://api.mistral.ai/v1",
    apiModelName: "mistral-large-latest",
    apiKey,
    prompt,
    history,
    systemPrompt
  });
}
