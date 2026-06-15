import { queryHybrid } from './helper.js';

/**
 * Query Qwen (Local or API fallback)
 */
export async function query(prompt, history = [], systemPrompt = "") {
  const localProviderUrl = process.env.QWEN_PROVIDER;
  const localModelName = process.env.QWEN_MODEL || "qwen2.5";
  const apiKey = process.env.QWEN_API_KEY;

  return queryHybrid({
    providerName: "qwen",
    localProviderUrl,
    localModelName,
    apiEndpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiModelName: "qwen-turbo",
    apiKey,
    prompt,
    history,
    systemPrompt
  });
}
