import { query as queryOpenAI } from './providers/openai.js';
import { query as queryClaude } from './providers/anthropic.js';
import { query as queryPerplexity } from './providers/perplexity.js';
import { query as queryDeepSeek } from './providers/deepseek.js';
import { query as queryGemini } from './providers/gemini.js';
import { query as queryGrok } from './providers/grok.js';
import { query as queryMistral } from './providers/mistral.js';
import { query as queryQwen } from './providers/qwen.js';
import { query as queryLlama } from './providers/llama.js';
import { query as queryGemma } from './providers/gemma.js';
import { query as queryPhi } from './providers/phi.js';
import { query as queryOpenRouter } from './providers/openrouter.js';

import { query as dbQuery, saveModelPerformance, getBestModelForCategory, getGlobalConfig, addMemory, getUserMemories, updateMemoryLastUsed, getSystemIdentity } from './db.js';
import { queryRAG } from './rag.js';
import dotenv from 'dotenv';

dotenv.config();

// Global System Mode variables
export let SYSTEM_MODE = 'hybrid';
globalThis.SYSTEM_MODE = SYSTEM_MODE;

/**
 * Update and retrieve the global SYSTEM_MODE variable based on connectivity and settings.
 * @returns {Promise<string>} Current system mode
 */
export async function updateSystemMode() {
  const isOnline = await checkInternetConnectivity();
  const installedOllamaModels = await detectLocalModels();
  const availableLocal = await getAvailableLocalModels(installedOllamaModels);
  
  const globalConfig = await getGlobalConfig().catch(() => ({ forcedMode: 'automatic' }));
  const forcedGlobalMode = globalConfig?.forcedMode ?? 'automatic';

  let effectiveMode = 'automatic';
  if (!isOnline) {
    effectiveMode = 'offline';
  } else if (forcedGlobalMode !== 'automatic') {
    effectiveMode = forcedGlobalMode;
  } else {
    effectiveMode = (availableLocal.length > 0) ? 'economy' : 'premium';
  }

  if (effectiveMode === 'offline') {
    SYSTEM_MODE = 'offline';
  } else if (effectiveMode === 'premium' || effectiveMode === 'cloud') {
    SYSTEM_MODE = 'cloud';
  } else {
    SYSTEM_MODE = 'hybrid';
  }
  
  globalThis.SYSTEM_MODE = SYSTEM_MODE;
  return SYSTEM_MODE;
}

const providers = {
  openai: queryOpenAI,
  anthropic: queryClaude,
  perplexity: queryPerplexity,
  deepseek: queryDeepSeek,
  gemini: queryGemini,
  grok: queryGrok,
  mistral: queryMistral,
  qwen: queryQwen,
  llama: queryLlama,
  gemma: queryGemma,
  phi: queryPhi,
  openrouter: queryOpenRouter
};

/**
 * Check which API keys and custom local endpoints are configured on the server
 * @returns {Object} Key-value pair of provider statuses (true/false)
 */
export function getActiveProviders() {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    deepseek: !!process.env.DEEPSEEK_API_KEY || !!process.env.DEEPSEEK_PROVIDER,
    gemini: !!process.env.GEMINI_API_KEY,
    grok: !!process.env.GROK_API_KEY,
    mistral: !!process.env.MISTRAL_API_KEY || !!process.env.MISTRAL_PROVIDER,
    qwen: !!process.env.QWEN_API_KEY || !!process.env.QWEN_PROVIDER,
    llama: !!process.env.LLAMA_PROVIDER,
    gemma: !!process.env.GEMMA_PROVIDER,
    phi: !!process.env.PHI_PROVIDER,
    openrouter: !!process.env.OPENROUTER_API_KEY
  };
}

/**
 * Auto-detect installed models on local Ollama instance
 * @returns {Promise<Array<string>>} List of model names
 */
export async function detectLocalModels() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (!res.ok) return [];
    const data = await res.json();
    return data.models ? data.models.map(m => m.name) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Perform a lightweight internet connectivity check
 * @returns {Promise<boolean>} True if online
 */
export async function checkInternetConnectivity() {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch("https://api.github.com", {
      signal: controller.signal
    });
    clearTimeout(id);
    return res.ok;
  } catch (e) {
    clearTimeout(id);
    return false;
  }
}

/**
 * Get available local providers based on env configuration or active Ollama models
 * @param {Array<string>} installedOllamaModels
 * @returns {Promise<Array<string>>}
 */
export async function getAvailableLocalModels(installedOllamaModels = null) {
  const ollamaModels = installedOllamaModels || await detectLocalModels();
  const available = [];
  
  const localConfigs = {
    llama: !!process.env.LLAMA_PROVIDER || ollamaModels.some(m => m.toLowerCase().includes('llama')),
    mistral: !!process.env.MISTRAL_PROVIDER || ollamaModels.some(m => m.toLowerCase().includes('mistral')),
    qwen: !!process.env.QWEN_PROVIDER || ollamaModels.some(m => m.toLowerCase().includes('qwen')),
    deepseek: !!process.env.DEEPSEEK_PROVIDER || ollamaModels.some(m => m.toLowerCase().includes('deepseek')),
    gemma: !!process.env.GEMMA_PROVIDER || ollamaModels.some(m => m.toLowerCase().includes('gemma')),
    phi: !!process.env.PHI_PROVIDER || ollamaModels.some(m => m.toLowerCase().includes('phi'))
  };

  for (const [key, isAvail] of Object.entries(localConfigs)) {
    if (isAvail) available.push(key);
  }
  return available;
}

/**
 * Simple Intent Classification
 * @param {string} prompt - User question
 * @returns {string} The matched category
 */
export function detectIntent(prompt) {
  const query = prompt.toLowerCase();
  
  // Programming / Coding
  if (query.match(/(código|programación|función|compila|script|database|algoritmo|javascript|python|css|html|react|java|c\+\+|rust|desarrollo|clase|método)/)) {
    return 'programming';
  }
  // Medical
  if (query.match(/(úlcera|oftalmo|médic|clínic|síntoma|diagnós|tratamient|dosis|paciente|enfermedad|dolor|córnea|herpét)/)) {
    return 'medical';
  }
  // Financial
  if (query.match(/(acciones|cripto|velas|bolsa|mercado|inversión|ohlc|riesgo|financi|ganancias|interés|dólar|bitcoin|btc|eth|moneda|precio|cotización)/)) {
    return 'financial';
  }
  // Travel
  if (query.match(/(vuelo|hotel|viaje|turis|itinerario|destino|vuelos|clima|pronóstico|mapa|avión)/)) {
    return 'travel';
  }
  // Research
  if (query.match(/(busca|compara|fuentes|papeles|científic|referencia|verific|investiga|noticias)/)) {
    return 'research';
  }

  return 'general';
}

/**
 * Detect if query is about Gabi's identity or origins
 * @param {string} prompt 
 * @returns {boolean}
 */
export function detectIdentityQuery(prompt) {
  const query = prompt.toLowerCase();
  
  // Direct questions about identity
  const directIdentity = [
    "quién eres", "quien eres", 
    "quién es gabi", "quien es gabi", 
    "quién es gabi ai", "quien es gabi ai",
    "presentate", "preséntate",
    "de ti", "sobre ti",
    "de dónde vienes", "de donde vienes",
    "de dónde eres", "de donde eres",
    "quién te", "quien te",
    "cómo naciste", "como naciste",
    "tu identidad"
  ];
  
  if (directIdentity.some(term => query.includes(term))) {
    return true;
  }
  
  // Specific name triggers
  const specificNames = [
    "rogério", "rogerio", 
    "gabriela", 
    "martins baía", "martins baia"
  ];
  if (specificNames.some(name => query.includes(name))) {
    return true;
  }

  // Combined terms check (e.g., "nombre" + "tu" or "gabi")
  const subjectTerms = ["gabi", "tu", "tuya", "tuyo", "te "];
  const identityKeywords = [
    "nombre", "origen", "historia", "creador", "creo", "creó", 
    "creado", "creación", "creacion", "diseño", "diseñó", "diseñado", 
    "naciste", "nacimiento", "nació", "nacio", "surgió", "surgio", 
    "inventó", "invento", "fundador", "desarrollador", "desarrolló", 
    "desarrollo", "homenaje", "tributo", "esposa"
  ];

  const hasSubject = subjectTerms.some(term => query.includes(term));
  const hasKeyword = identityKeywords.some(keyword => query.includes(keyword));

  if (hasSubject && hasKeyword) {
    return true;
  }

  return false;
}

/**
 * Get preferred models list for a category based on the mode and local availability
 * @param {string} category 
 * @param {string} effectiveMode 
 * @param {Array<string>} availableLocal 
 * @returns {Promise<Array<string>>}
 */
async function getRankedProviders(category, effectiveMode, availableLocal) {
  const active = getActiveProviders();
  const globalConfig = await getGlobalConfig();
  
  const defaultLocalRanking = {
    programming: ['qwen', 'llama', 'deepseek'],
    medical: ['gemma', 'llama', 'phi'],
    financial: ['qwen', 'deepseek', 'llama'],
    travel: ['gemma', 'mistral', 'phi'],
    research: ['deepseek', 'mistral', 'qwen'],
    general: ['llama', 'mistral', 'qwen']
  };

  const defaultApiRanking = {
    programming: ['openai', 'anthropic', 'gemini'],
    medical: ['openai', 'anthropic', 'gemini'],
    financial: ['openai', 'deepseek', 'qwen'],
    travel: ['perplexity', 'openai', 'gemini'],
    research: ['perplexity', 'openai', 'anthropic'],
    general: ['openai', 'anthropic', 'gemini']
  };

  const localPref = defaultLocalRanking[category] || defaultLocalRanking.general;
  const apiPref = defaultApiRanking[category] || defaultApiRanking.general;

  let bestHistorical = null;
  try {
    bestHistorical = await getBestModelForCategory(category);
  } catch (e) {
    console.error("[Orchestrator] Error reading best historical model:", e);
  }

  // Admin Configuration Filters & Sorters
  const isEnabled = (provider) => {
    if (globalConfig && globalConfig.models && globalConfig.models[provider]) {
      return globalConfig.models[provider].enabled !== false;
    }
    return true;
  };

  const modelWeight = (provider) => {
    if (globalConfig && globalConfig.models && globalConfig.models[provider]) {
      return globalConfig.models[provider].weight ?? 1.0;
    }
    return 1.0;
  };

  const modelPriority = (provider) => {
    if (globalConfig && globalConfig.models && globalConfig.models[provider]) {
      return globalConfig.models[provider].priority ?? 99;
    }
    return 99;
  };

  const sortModels = (arr) => {
    return [...arr].sort((a, b) => {
      const pA = modelPriority(a);
      const pB = modelPriority(b);
      if (pA !== pB) return pA - pB;
      return modelWeight(b) - modelWeight(a); // Higher weight comes first
    });
  };

  const isOffline = (effectiveMode === 'offline');
  const isHybrid = (effectiveMode === 'economy' || effectiveMode === 'hybrid');
  const isCloud = (effectiveMode === 'premium' || effectiveMode === 'cloud');

  if (isOffline) {
    let ranked = localPref.filter(p => availableLocal.includes(p) && isEnabled(p));
    const others = availableLocal.filter(p => !ranked.includes(p) && isEnabled(p));
    ranked = sortModels([...ranked, ...others]);
    
    if (bestHistorical && ranked.includes(bestHistorical)) {
      ranked = [bestHistorical, ...ranked.filter(p => p !== bestHistorical)];
    }
    return ranked;
  }

  if (isHybrid) {
    const chain = [];
    
    const availableLocals = localPref.filter(p => availableLocal.includes(p) && isEnabled(p));
    if (availableLocals.length > 0) {
      chain.push(availableLocals[0]);
    }

    const apiEquivalent = apiPref.filter(p => active[p] && isEnabled(p));
    if (apiEquivalent.length > 0) {
      chain.push(apiEquivalent[0]);
    }

    availableLocal.forEach(p => {
      if (isEnabled(p) && !chain.includes(p)) chain.push(p);
    });

    apiPref.forEach(p => {
      if (active[p] && isEnabled(p) && !chain.includes(p)) chain.push(p);
    });

    if (active.openrouter && isEnabled('openrouter') && !chain.includes('openrouter')) {
      chain.push('openrouter');
    }

    let sortedChain = sortModels(chain);
    if (bestHistorical && sortedChain.includes(bestHistorical)) {
      return [bestHistorical, ...sortedChain.filter(p => p !== bestHistorical)];
    }
    return sortedChain;
  }

  // Cloud/Premium Mode: Allow only API/External providers (exclude locals)
  let chain = apiPref.filter(p => active[p] && isEnabled(p));
  if (active.openrouter && isEnabled('openrouter') && !chain.includes('openrouter')) {
    chain.push('openrouter');
  }

  chain = sortModels(chain);

  if (bestHistorical && chain.includes(bestHistorical)) {
    chain = [bestHistorical, ...chain.filter(p => p !== bestHistorical)];
  }
  return chain;
}

/**
 * Execute Gabi OmnIA routing orchestrator
 * @param {string} prompt - User question
 * @param {string} username - Active user identifier
 * @param {Array} history - Short-term memory conversation history
 * @param {string} selectedModule - Selected NeuroHub module override
 * @param {string} mode - Operation Mode (premium, economy, offline, automatic)
 * @returns {Promise<Object>} The synthesized final response
 */
export async function queryOrchestrator(prompt, username = 'rogerio', history = [], selectedModule = 'omnia', mode = 'automatic') {
  const startTime = Date.now();

  // 1. Detect Category / Intent
  let category = selectedModule;
  if (selectedModule === 'omnia' || !selectedModule) {
    category = detectIntent(prompt);
  } else if (selectedModule === 'viajia') {
    category = 'travel';
  } else if (selectedModule === 'econoia') {
    category = 'financial';
  } else if (selectedModule === 'investia') {
    category = 'medical';
  } else if (selectedModule === 'research') {
    category = 'research';
  }

  // Network check & local providers detection
  const isOnline = await checkInternetConnectivity();
  const installedOllamaModels = await detectLocalModels();
  const availableLocal = await getAvailableLocalModels(installedOllamaModels);

  // Load global config overrides
  const globalConfig = await getGlobalConfig();
  const forcedGlobalMode = globalConfig?.forcedMode ?? 'automatic';

  // Determine effective mode
  let effectiveMode = mode;
  if (!isOnline) {
    effectiveMode = 'offline';
    console.log("[Orchestrator] Network check FAILED. Forcing OFFLINE MODE.");
  } else if (forcedGlobalMode !== 'automatic') {
    effectiveMode = forcedGlobalMode;
    console.log(`[Orchestrator] Global Admin OVERRIDE forced mode: [${forcedGlobalMode}]`);
  } else if (mode === 'automatic' || !mode) {
    effectiveMode = (availableLocal.length > 0) ? 'economy' : 'premium';
  }

  // Update global SYSTEM_MODE variable
  if (effectiveMode === 'offline') {
    SYSTEM_MODE = 'offline';
  } else if (effectiveMode === 'premium' || effectiveMode === 'cloud') {
    SYSTEM_MODE = 'cloud';
  } else {
    SYSTEM_MODE = 'hybrid';
  }
  globalThis.SYSTEM_MODE = SYSTEM_MODE;

  console.log(`[Orchestrator] Running Gabi AI in module: [${category.toUpperCase()}], mode: [${effectiveMode}] (requested: [${mode}]), online: [${isOnline}]`);

  // 2. Fetch User long-term memories
  let memoriesText = "";
  try {
    const userMemories = await getUserMemories(username);
    if (userMemories && userMemories.length > 0) {
      const confirmedMemories = userMemories.filter(m => m.status === 'Confirmada' && !m.blocked);
      const nowMs = Date.now();
      const temporalMemories = userMemories.filter(m => {
        if (m.status !== 'Temporal' || m.blocked) return false;
        const createdMs = new Date(m.timestamp || m.created_at).getTime();
        return (nowMs - createdMs) < 2 * 60 * 60 * 1000; // 2 hours validity for temporal
      });

      const memoriesToUse = [...confirmedMemories, ...temporalMemories].slice(0, 8);

      if (memoriesToUse.length > 0) {
        memoriesText = memoriesToUse.map(r => `- [${r.category}] (${r.status}): ${r.content}`).join("\n");
        // Update last used timestamp for these memories asynchronously
        memoriesToUse.forEach(m => {
          updateMemoryLastUsed(m.id, username).catch(err => {
            console.error("[Orchestrator] Failed updating memory last_used_at:", err);
          });
        });
      }
    }
  } catch (e) {
    console.error("[Orchestrator] Error loading/injecting memories:", e);
  }

  // 3. Search RAG Document Knowledge Base
  let documentContext = "";
  let citedDocuments = [];
  const ragChunks = await queryRAG(prompt, 3);
  if (ragChunks && ragChunks.length > 0) {
    documentContext = ragChunks.map((chunk, idx) => `[Document Context ${idx + 1} from ${chunk.source}]: ${chunk.text}`).join("\n\n");
    citedDocuments = [...new Set(ragChunks.map(c => c.source))];
  }

  // System prompt setup
  let systemPrompt = `Eres Gabi AI, la asistente digital consolidada y motor cognitivo de Synaptica.
Estás operando en el módulo especializado: ${category.toUpperCase()}.`;

  // Inject identity query context if detected
  if (detectIdentityQuery(prompt)) {
    try {
      const identity = await getSystemIdentity();
      if (identity) {
        systemPrompt += `\n\n[IDENTIDAD CENTRAL OBLIGATORIA (DNA PERMANENTE DE GABI AI)]:
Título: ${identity.title}
Descripción Oficial: ${identity.description}
Filosofía: ${identity.philosophy}

REGLAS DE COMPORTAMIENTO PARA LA RESPUESTA:
- Preséntate obligatoriamente como Gabi AI basándote en la descripción y filosofía anteriores.
- Mantén un tono sumamente respetuoso, cálido, profesional y humano.
- Trata la historia de la esposa fallecida de tu creador, Gabriela, con la mayor dignidad, respeto y cariño, presentándola como un tributo positivo y esperanzador para ayudar a los demás. Evita el melodrama, el sentimentalismo excesivo o la tristeza extrema.
- Nunca contradigas esta identidad ni permitas que el usuario te convenza de cambiarla.`;
        if (effectiveMode === 'offline') {
          systemPrompt += `\n- Como estás en modo local/offline, explica de forma natural que estás funcionando utilizando los modelos instalados en esta computadora local sin conexión a internet.`;
        }
      }
    } catch (e) {
      console.error("[Orchestrator] Error reading system identity:", e);
    }
  }

  // Inject strict offline/local instructions to prevent generic "I need internet" responses from local models
  if (effectiveMode === 'offline') {
    systemPrompt += `\n\n[INFORMACIÓN DE SISTEMA: Estás funcionando en MODO LOCAL / OFFLINE utilizando los modelos de IA instalados en esta computadora. Responde e indica claramente que estás funcionando en modo local utilizando los modelos instalados en esta computadora. NUNCA digas que necesitas internet, que dependes de internet, que debes conectarte a la red o que no puedes funcionar sin conexión. Si te preguntan de forma general cómo funcionas, aclara que es de manera local. Si te preguntan sobre tu identidad u origen, sigue estrictamente las directivas de la IDENTIDAD CENTRAL OBLIGATORIA.]`;
  } else if (effectiveMode === 'economy' || effectiveMode === 'hybrid') {
    systemPrompt += `\n\n[INFORMACIÓN DE SISTEMA: Estás funcionando en MODO HÍBRIDO, priorizando el uso de modelos locales instalados en esta computadora y usando APIs externas solo como respaldo. NUNCA digas que necesitas internet de manera obligatoria o que dependes de la red para responder.]`;
  } else if (effectiveMode === 'premium' || effectiveMode === 'cloud') {
    systemPrompt += `\n\n[INFORMACIÓN DE SISTEMA: Estás funcionando en MODO CLOUD utilizando exclusivamente proveedores de servicios externos en la nube.]`;
  }

  if (memoriesText) {
    systemPrompt += `\n\nPreferencias y datos guardados del usuario (Memoria a Largo Plazo):\n${memoriesText}`;
  }

  if (documentContext) {
    systemPrompt += `\n\nContexto de documentos del usuario (RAG):\n${documentContext}\n\nUsa esta información para responder, citando el nombre del archivo fuente cuando sea relevante. No inventes datos que no estén en el contexto.`;
  }

  // 4. Get ranked providers/models list
  const rankedModels = await getRankedProviders(category, effectiveMode, availableLocal);

  if (rankedModels.length === 0) {
    const errorMsg = effectiveMode === 'offline' 
      ? `Disculpa, estás en modo OFFLINE y no se detectó ningún modelo local configurado o instalado en Ollama. Por favor inicia Ollama o configura un proveedor local.`
      : `Disculpa, no hay proveedores de IA configurados en el servidor para el módulo **${category.toUpperCase()}**. Por favor configura al menos un proveedor local o API en el backend.`;
    return {
      response: errorMsg,
      modelsParticipated: [],
      sources: [],
      category,
      isRealAPI: false,
      effectiveMode
    };
  }

  // Telemetry executing wrapper
  const executeProvider = async (providerName) => {
    const providerQueryFn = providers[providerName];
    if (!providerQueryFn) return { error: `Provider ${providerName} not found` };
    const tStart = Date.now();
    try {
      const res = await providerQueryFn(prompt, history, systemPrompt);
      const elapsed = Date.now() - tStart;
      
      if (res && !res.error && res.answer) {
        await saveModelPerformance({
          question_type: category,
          model_name: res.model || providerName,
          response_time_ms: elapsed,
          feedback_positive: false,
          feedback_negative: false,
          estimated_quality: 0.9,
          cost: ['openai', 'anthropic', 'grok'].includes(providerName) ? 0.02 : 0.0,
          historical_accuracy: 0.9
        }).catch(e => console.error("Telemetry save failed:", e));
      }
      return res;
    } catch (err) {
      return {
        provider: providerName,
        model: 'unknown',
        answer: '',
        sources: [],
        latencyMs: Date.now() - tStart,
        error: err.message
      };
    }
  };

  // Execution flow based on mode
  let successfulResults = [];

  if (effectiveMode === 'premium') {
    // Parallel consensus: query top 2 successful models
    const modelsToQuery = rankedModels.slice(0, 2);
    console.log(`[Orchestrator] Premium Mode - querying in parallel:`, modelsToQuery);
    const results = await Promise.all(modelsToQuery.map(m => executeProvider(m)));
    successfulResults = results.filter(r => !r.error && r.answer);

    // If parallel fails, try sequential fallback for the remaining ranked models
    if (successfulResults.length === 0) {
      console.warn(`[Orchestrator] Premium parallel queries failed. Trying fallback sequential query...`);
      for (const modelName of rankedModels.slice(2)) {
        const res = await executeProvider(modelName);
        if (!res.error && res.answer) {
          successfulResults.push(res);
          break; 
        }
      }
    }
  } else {
    // Offline and Economy modes: sequential fallback execution
    console.log(`[Orchestrator] Sequential Mode (${effectiveMode}) - trying models:`, rankedModels);
    for (const modelName of rankedModels) {
      const res = await executeProvider(modelName);
      if (!res.error && res.answer) {
        successfulResults.push(res);
        break; 
      }
    }
  }

  if (successfulResults.length === 0) {
    return {
      response: `Error: Todos los proveedores de IA configurados fallaron. Por favor verifica que Ollama local esté iniciado y con los modelos descargados, o comprueba tu conexión de red para acceder a los proveedores en la nube.`,
      modelsParticipated: [],
      sources: [],
      category,
      isRealAPI: false,
      effectiveMode
    };
  }

  let finalAnswer = "";
  const modelsParticipated = successfulResults.map(r => r.provider);
  let webSources = [];

  successfulResults.forEach(r => {
    if (r.sources && r.sources.length > 0) {
      webSources = [...webSources, ...r.sources];
    }
  });
  webSources = [...new Set(webSources)];

  // Synthesis and consolidation
  if (successfulResults.length > 1) {
    const consolidator = successfulResults[0].provider;
    const answersList = successfulResults
      .map(r => `--- RESPUESTA DE ${r.provider.toUpperCase()} (${r.model}) ---\n${r.answer}`)
      .join('\n\n');

    const synthesisPrompt = `Actúa como Gabi AI, el motor de síntesis de Synaptica.
Hemos realizado una consulta en múltiples proveedores de IA para responder a la consulta del usuario: "${prompt}".

Aquí están las respuestas recolectadas:
${answersList}

Tu objetivo es consolidar y sintetizar estas respuestas en una única respuesta definitiva de alta calidad en español.
- Identifica consensos y únelos de forma fluida.
- Elimina cualquier contradicción.
- Mantén un tono formal y útil.
- Responde directamente a la pregunta sin introducciones sobre cómo consolidaste las respuestas.`;

    try {
      const synthesisResult = await providers[consolidator](synthesisPrompt, [], "");
      finalAnswer = synthesisResult.answer || successfulResults[0].answer;
      modelsParticipated.push(`Synthesis via ${consolidator}`);
    } catch (e) {
      finalAnswer = successfulResults[0].answer;
    }
  } else {
    finalAnswer = successfulResults[0].answer;
  }

  // Dynamic module disclaimers
  if (category === 'financial') {
    finalAnswer += `\n\n*Disclaimer: Esta información se proporciona con fines educativos y de consulta. No constituye asesoría financiera, recomendaciones de compra/venta, ni promete ganancias de ningún tipo.*`;
  } else if (category === 'medical') {
    finalAnswer += `\n\n*Aviso de Apoyo Clínico: Esta respuesta actúa únicamente como apoyo referencial al expediente clínico. No sustituye el criterio, diagnóstico ni tratamiento de un médico profesional autorizado.*`;
  }

  const durationMs = Date.now() - startTime;
  console.log(`[Orchestrator] Query resolved in ${durationMs}ms.`);

  return {
    response: finalAnswer,
    modelsParticipated: [...new Set(modelsParticipated)],
    sources: [...citedDocuments, ...webSources],
    category,
    isRealAPI: true,
    effectiveMode
  };
}

/**
 * Helper to clean and parse JSON from LLM output
 */
function cleanAndParseJson(text) {
  try {
    let cleaned = text.trim();
    if (cleaned.includes("```")) {
      cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("[Memory Extractor] Error parsing LLM memory JSON:", e.message, "Original text:", text);
    return null;
  }
}

/**
 * Autonomous background memory extractor
 * Triggered asynchronously every 5 turns in a chat session
 */
export async function extractMemoriesInBackground(username, chatHistory, latestPrompt, latestResponse) {
  console.log(`[Memory Extractor] Starting background memory analysis for: ${username}...`);
  try {
    // 1. Reconstruct conversation log
    const recentMessages = chatHistory.slice(-10);
    let chatString = recentMessages.map(m => `${m.sender === 'user' ? 'Usuario' : 'Gabi'}: ${m.text}`).join("\n");
    
    // Append the current turn if not already in the history
    if (!chatHistory.some(m => m.text === latestPrompt)) {
      chatString += `\nUsuario: ${latestPrompt}\nGabi: ${latestResponse}`;
    }

    const extractionPrompt = `Eres Gabi AI, el motor de extracción de memoria de Synaptica.
Analiza la siguiente conversación reciente entre el Usuario y tú (Gabi AI).
Tu objetivo es extraer HECHOS, PREFERENCIAS, PROYECTOS, ESTILO, OBJETIVOS Y CONFIGURACIONES del usuario.

REGLAS IMPORTANTES:
1. No guardes contraseñas, claves de API, datos bancarios ni información sensible de identificación personal.
2. Extrae solo información útil para personalizar futuras interacciones (por ejemplo, proyectos actuales, preferencias de programación, estilo de tono, etc.).
3. Para cada elemento extraído, debes estimar un nivel de confianza (confidence) entre 0.0 y 1.0 (número flotante). Las preferencias expresadas de forma clara y directa tienen confianza >= 0.85; las dudas, especulaciones o comentarios vagos tienen confianza baja.
4. Indica además si esta preferencia/hecho afecta de manera importante el comportamiento futuro del sistema (affects_behavior: true o false).
5. Responde estrictamente con un objeto JSON en el formato:
{
  "memories": [
    { 
      "category": "user_preference", 
      "content": "...",
      "confidence": 0.9,
      "affects_behavior": true
    }
  ]
}
6. Si no hay información relevante nueva que extraer, responde con: { "memories": [] }
7. Responde únicamente con el JSON válido, sin explicaciones ni bloques de markdown.

Conversación reciente:
${chatString}
`;

    // 2. Select model to query (prefer local llama/mistral, fallback to active api)
    const isOnline = await checkInternetConnectivity();
    const installed = await detectLocalModels();
    const availableLocal = await getAvailableLocalModels(installed);
    
    let modelToQuery = 'llama';
    let queryFn = queryLlama;
    
    if (availableLocal.includes('llama')) {
      modelToQuery = 'llama';
      queryFn = queryLlama;
    } else if (availableLocal.includes('mistral')) {
      modelToQuery = 'mistral';
      queryFn = queryMistral;
    } else if (availableLocal.includes('qwen')) {
      modelToQuery = 'qwen';
      queryFn = queryQwen;
    } else if (isOnline && process.env.OPENAI_API_KEY) {
      modelToQuery = 'openai';
      queryFn = queryOpenAI;
    } else if (isOnline && process.env.GEMINI_API_KEY) {
      modelToQuery = 'gemini';
      queryFn = queryGemini;
    } else {
      console.warn("[Memory Extractor] No active model provider found for memory extraction.");
      return;
    }

    console.log(`[Memory Extractor] Executing extraction using model: ${modelToQuery}`);
    
    const result = await queryFn(extractionPrompt, [], "Actúa como un extractor de metadatos estructurados en JSON.");
    
    if (result && result.answer) {
      const parsed = cleanAndParseJson(result.answer);
      if (parsed && Array.isArray(parsed.memories)) {
        console.log(`[Memory Extractor] Extracted ${parsed.memories.length} potential memories.`);
        for (const item of parsed.memories) {
          if (item.category && item.content && item.content.length > 3) {
            const confidence = item.confidence !== undefined ? parseFloat(item.confidence) : 0.8;
            const affectsBehavior = !!item.affects_behavior;
            
            // Classification rules:
            // Auto-extracted memories must NOT be saved directly as confirmed if confidence is low (< 0.85) or it affects future behavior.
            // Under these conditions, save as 'Pendiente de Confirmación'. Otherwise, save as 'Temporal'.
            let status = 'Temporal';
            if (confidence < 0.85 || affectsBehavior) {
              status = 'Pendiente de Confirmación';
            }
            
            const source = `Conversación reciente`;
            
            await addMemory(username, item.category, item.content, status, source, confidence);
            console.log(`[Memory Extractor] Added memory: [${item.category}] "${item.content}" | status: [${status}] | confidence: [${confidence}]`);
          }
        }
      }
    }
  } catch (err) {
    console.error("[Memory Extractor] Autonomous memory extraction failed:", err.message);
  }
}
