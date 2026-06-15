import { queryOrchestrator } from './orchestrator.js';
import { dbInit } from './db.js';
import dotenv from 'dotenv';
dotenv.config();

async function testOfflinePrompt() {
  console.log("=== INICIANDO PRUEBA REAL DE MODO OFFLINE CON LLAMA ===");
  await dbInit();
  
  const question = "¿Quién eres?";
  console.log(`Consulta: "${question}"`);
  
  try {
    const result = await queryOrchestrator(
      question,
      "rogerio",
      [],
      "omnia",
      "offline"
    );
    
    console.log("\n--- RESULTADO DEL ORQUESTADOR ---");
    console.log(`Categoría: ${result.category}`);
    console.log(`Modo Efectivo: ${result.effectiveMode}`);
    console.log(`Modelos que participaron: ${JSON.stringify(result.modelsParticipated)}`);
    console.log("\nRespuesta Completa:");
    console.log(result.response);
    console.log("---------------------------------\n");
    
    const responseLower = result.response.toLowerCase();
    
    // Checks
    const mentionsForbidden = responseLower.includes("necesito internet") || 
                              responseLower.includes("dependo de internet") || 
                              responseLower.includes("debo conectarme a la red") || 
                              responseLower.includes("no puedo funcionar sin conexión");
                              
    const identifiesLocal = responseLower.includes("gabi ai") && 
                             (responseLower.includes("modo local") || responseLower.includes("instalados en esta computadora"));
                             
    if (mentionsForbidden) {
      console.error("❌ FALLO: La respuesta contiene frases prohibidas sobre internet.");
    } else {
      console.log("✅ ÉXITO: La respuesta no contiene frases prohibidas sobre internet.");
    }
    
    if (identifiesLocal) {
      console.log("✅ ÉXITO: El modelo se identificó correctamente y mencionó el modo local.");
    } else {
      console.error("❌ FALLO: El modelo no se identificó adecuadamente o no mencionó el modo local.");
    }
  } catch (e) {
    console.error("❌ ERROR DURANTE LA PRUEBA:", e);
  }
}

testOfflinePrompt();
