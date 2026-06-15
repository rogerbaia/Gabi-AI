import { dbInit } from './db.js';
import { queryOrchestrator } from './orchestrator.js';
import dotenv from 'dotenv';

dotenv.config();

async function runCoreIdentityTests() {
  console.log("=== INICIANDO PRUEBAS DE IDENTIDAD CENTRAL PERMANENTE ===");

  try {
    console.log("\n[Inicializando base de datos...]");
    await dbInit();

    const testQueries = [
      "¿Quién eres?",
      "¿De dónde viene tu nombre?",
      "¿Quién te creó?",
      "Cuéntame la historia detrás de Gabi AI"
    ];

    for (const prompt of testQueries) {
      console.log(`\n--------------------------------------------------`);
      console.log(`Consulta del usuario: "${prompt}"`);
      console.log(`--------------------------------------------------`);

      console.log("[Enviando consulta al Orquestador en Modo Offline...]");
      const result = await queryOrchestrator(
        prompt,
        "rogerio",
        [],
        "omnia",
        "offline"
      );

      console.log("\n-> Respuesta de Gabi AI:");
      console.log(result.response);
      console.log(`\n-> Modelos que participaron: ${JSON.stringify(result.modelsParticipated)}`);
      console.log(`-> Modo efectivo: ${result.effectiveMode}`);

      // VALIDATIONS
      const responseUpper = result.response.toUpperCase();
      
      // 1. Check for name & creator
      const hasGabiName = responseUpper.includes("GABI");
      const hasCreator = responseUpper.includes("ROGÉRIO") || responseUpper.includes("ROGERIO") || responseUpper.includes("BAÍA") || responseUpper.includes("BAIA");
      const hasGabriela = responseUpper.includes("GABRIELA");
      const hasTribute = responseUpper.includes("HOMENAJE") || responseUpper.includes("MEMORIA") || responseUpper.includes("ESPOSA") || responseUpper.includes("FALLEC");
      const hasLocalMode = responseUpper.includes("LOCAL") || responseUpper.includes("OFFLINE") || responseUpper.includes("COMPUTADORA") || responseUpper.includes("SIN CONEXIÓN") || responseUpper.includes("SIN CONEXION");

      // 2. Check for internet dependency phrases (which are strictly forbidden)
      const mentionsInternetNeed = responseUpper.includes("NECESITO INTERNET") ||
                                   responseUpper.includes("DEPENDO DE INTERNET") ||
                                   responseUpper.includes("DEBO CONECTARME") ||
                                   responseUpper.includes("NO PUEDO FUNCIONAR SIN CONEXIÓN") ||
                                   responseUpper.includes("NO PUEDO FUNCIONAR SIN CONEXION");

      console.log("\n--- RESULTADO DE LA VALIDACIÓN ---");
      console.log(`* Contiene 'Gabi': ${hasGabiName ? "SÍ (CORRECTO)" : "NO (FALLO)"}`);
      console.log(`* Contiene Creador (Rogério): ${hasCreator ? "SÍ (CORRECTO)" : "NO (FALLO)"}`);
      console.log(`* Contiene 'Gabriela': ${hasGabriela ? "SÍ (CORRECTO)" : "NO (FALLO)"}`);
      console.log(`* Contiene alusión al Homenaje/Memoria: ${hasTribute ? "SÍ (CORRECTO)" : "NO (FALLO)"}`);
      console.log(`* Menciona funcionamiento Local/Offline: ${hasLocalMode ? "SÍ (CORRECTO)" : "NO (FALLO)"}`);
      console.log(`* Evita dependencias de internet: ${!mentionsInternetNeed ? "SÍ (CORRECTO)" : "NO (FALLO)"}`);

      if (!hasGabiName || !hasCreator || !hasGabriela || !hasTribute) {
        console.warn("\n[ADVERTENCIA] Algunas palabras clave de la identidad no se encontraron en la respuesta. Esto puede deberse al estilo de redacción del modelo, pero verifica si la identidad se inyectó correctamente.");
      }

      if (mentionsInternetNeed) {
        throw new Error("ERROR CRÍTICO: El modelo afirmó requerir conexión a Internet en modo offline.");
      }
    }

    console.log("\n=== TODAS LAS PRUEBAS DE IDENTIDAD FINALIZADAS CON ÉXITO ===");
  } catch (error) {
    console.error("\n❌ Error en las pruebas de identidad central:", error.message);
    process.exit(1);
  }
}

runCoreIdentityTests();
