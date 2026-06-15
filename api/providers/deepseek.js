import { queryHybrid } from './helper.js';

/**
 * Query DeepSeek (Local or API fallback)
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const localProviderUrl = process.env.DEEPSEEK_PROVIDER;
  const localModelName = process.env.DEEPSEEK_MODEL || "deepseek-coder";
  const apiKey = process.env.DEEPSEEK_API_KEY;

  return queryHybrid({
    providerName: "deepseek",
    localProviderUrl,
    localModelName,
    apiEndpoint: "https://api.deepseek.com",
    apiModelName: "deepseek-chat",
    apiKey,
    prompt,
    history,
    systemPrompt
  });
}
