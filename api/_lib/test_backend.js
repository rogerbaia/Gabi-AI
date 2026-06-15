import { dbInit, getUserBalance, query as dbQuery, saveModelPerformance, getBestModelForCategory, getGlobalConfig, updateGlobalConfig, getHealthStats } from './db.js';
import { chunkText } from './rag.js';
import { detectIntent, getActiveProviders, checkInternetConnectivity, detectLocalModels, getAvailableLocalModels, queryOrchestrator } from './orchestrator.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE RESPALDO DE GABI AI ===");

  // Test 1: Database Check
  console.log("\n[Test 1] Verificando base de datos...");
  try {
    await dbInit();
    console.log("-> dbInit ejecutado correctamente.");
    
    const balance = await getUserBalance("rogerio");
    console.log(`-> Saldo recuperado para 'rogerio': ${balance} NTK.`);
  } catch (e) {
    console.error("-> Test 1 falló:", e.message);
  }

  // Test 2: RAG Chunking Check
  console.log("\n[Test 2] Verificando algoritmo de fragmentación (RAG Chunker)...");
  const testText = "Este es un fragmento largo que sirve para probar que el cargador de RAG funcione. " + 
                   "Gabi AI debe dividir este texto en trozos con overlap. " +
                   "Esto ayuda a alimentar el contexto del modelo con datos específicos sin pasarse del límite de tokens.";
  try {
    const chunks = chunkText(testText, 100, 20);
    console.log(`-> Texto original dividido en ${chunks.length} fragmentos.`);
    console.log("-> Primer fragmento:", chunks[0]);
  } catch (e) {
    console.error("-> Test 2 falló:", e.message);
  }

  // Test 3: Intent Routing Check
  console.log("\n[Test 3] Verificando detector de intenciones (Omni-Routing)...");
  try {
    const medIntent = detectIntent("¿Cómo se trata una úlcera corneal herpética?");
    const finIntent = detectIntent("¿Cuál es el precio de Bitcoin hoy?");
    const travIntent = detectIntent("Busca un vuelo directo a Madrid");
    const resIntent = detectIntent("Investiga las fuentes científicas de este artículo");
    const codIntent = detectIntent("escribe una función en javascript para ordenar un array");
    const genIntent = detectIntent("Cuéntame un chiste");

    console.log(`-> Consulta Médica -> categoría detectada: '${medIntent}' (Esperado: medical)`);
    console.log(`-> Consulta Financiera -> categoría detectada: '${finIntent}' (Esperado: financial)`);
    console.log(`-> Consulta de Viaje -> categoría detectada: '${travIntent}' (Esperado: travel)`);
    console.log(`-> Consulta de Investigación -> categoría detectada: '${resIntent}' (Esperado: research)`);
    console.log(`-> Consulta de Programación -> categoría detectada: '${codIntent}' (Esperado: programming)`);
    console.log(`-> Consulta General -> categoría detectada: '${genIntent}' (Esperado: general)`);
  } catch (e) {
    console.error("-> Test 3 falló:", e.message);
  }

  // Test 4: Provider Active status
  console.log("\n[Test 4] Verificando proveedores configurados en .env...");
  try {
    const providers = getActiveProviders();
    console.log("-> Proveedores activos detectados en servidor:");
    Object.entries(providers).forEach(([name, status]) => {
      console.log(`   * ${name.toUpperCase()}: ${status ? "CONFIGURADO (ACTIVO)" : "INACTIVO"}`);
    });
  } catch (e) {
    console.error("-> Test 4 falló:", e.message);
  }

  // Test 5: Connectivity Check and Local Provider Detection
  console.log("\n[Test 5] Verificando conectividad de red y Ollama local...");
  try {
    const isOnline = await checkInternetConnectivity();
    console.log(`-> Conectado a Internet: ${isOnline ? "SÍ" : "NO"}`);

    const localModels = await detectLocalModels();
    console.log(`-> Modelos detectados en Ollama local (localhost:11434):`, localModels);

    const availableLocal = await getAvailableLocalModels(localModels);
    console.log(`-> Proveedores locales disponibles configurados:`, availableLocal);
  } catch (e) {
    console.error("-> Test 5 falló:", e.message);
  }

  // Test 6: Telemetry Database Check
  console.log("\n[Test 6] Verificando tabla de métricas y guardado de rendimiento...");
  try {
    const testPerformance = {
      question_type: 'programming',
      model_name: 'llama-test-local',
      response_time_ms: 250,
      feedback_positive: true,
      feedback_negative: false,
      estimated_quality: 0.95,
      cost: 0.0,
      historical_accuracy: 0.95
    };
    await saveModelPerformance(testPerformance);
    console.log("-> Métricas de rendimiento guardadas con éxito.");

    const bestModel = await getBestModelForCategory('programming');
    console.log(`-> El mejor modelo sugerido para 'programming' es: ${bestModel}`);
  } catch (e) {
    console.error("-> Test 6 falló:", e.message);
  }

  // Test 7: Orchestrator Routing Simulation
  console.log("\n[Test 7] Ejecutando ruteador híbrido del orquestador en modo Offline...");
  try {
    const result = await queryOrchestrator(
      "¿Cómo implementar ordenamiento burbuja?", 
      "rogerio", 
      [], 
      "omnia", 
      "offline"
    );
    console.log("-> Resultado obtenido del orquestador (Modo Offline):");
    console.log(`   * Categoría: ${result.category}`);
    console.log(`   * Modo Efectivo: ${result.effectiveMode}`);
    console.log(`   * Modelos que participaron: ${JSON.stringify(result.modelsParticipated)}`);
    console.log(`   * Respuesta resumida: ${result.response.substring(0, 100)}...`);
  } catch (e) {
    console.error("-> Test 7 falló:", e.message);
  }

  // Test 8: Admin Panel Configs & Telemetry
  console.log("\n[Test 8] Verificando panel administrativo (AI Health Center)...");
  try {
    const originalConfig = await getGlobalConfig();
    console.log("-> Configuración global de IAs actual recuperada con éxito.");

    // Update config
    const updated = {
      ...originalConfig,
      forcedMode: 'economy'
    };
    await updateGlobalConfig(updated);
    console.log("-> Configuración forzada en 'economy' guardada con éxito.");

    const retrieved = await getGlobalConfig();
    console.log(`-> Configuración recuperada forzada: '${retrieved.forcedMode}' (Esperado: economy).`);

    // Reset config
    await updateGlobalConfig({ ...originalConfig, forcedMode: 'automatic' });
    console.log("-> Configuración restablecida a 'automatic' con éxito.");

    // Health stats
    const stats = await getHealthStats();
    console.log("-> Métricas agregadas de salud del sistema recuperadas:");
    console.log(`   * Consultas hoy: ${stats.queriesToday}`);
    console.log(`   * Costo hoy: $${stats.costToday} USD`);
    console.log(`   * Documentos RAG: ${stats.ragDocsCount}`);
    console.log(`   * Memorias guardadas: ${stats.memoriesCount}`);
  } catch (e) {
    console.error("-> Test 8 falló:", e.message);
  }

  console.log("\n=== PRUEBAS FINALIZADAS ===");
}

runTests();
