import { dbInit, getUserMemories, addMemory, deleteMemory, updateMemory, updateMemoryLastUsed, updateModelPerformanceFeedback, getBestModelForCategory } from './db.js';
import { generateEmbedding } from './rag.js';
import { extractMemoriesInBackground } from './orchestrator.js';
import dotenv from 'dotenv';

dotenv.config();

// Force queryHybrid to execute API call in test environment so it intercepts mock fetch
process.env.LLAMA_API_KEY = "mock-groq-key";

// Mock fetch for headless test environment where Ollama or cloud APIs might be offline
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  const urlStr = String(url);

  // Catch chat completions calls (for local Ollama, Groq, OpenRouter)
  if (urlStr.includes('chat/completions') || urlStr.includes('completions')) {
    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"memories": [{"category": "user_preference", "content": "Prefiere usar TypeScript en el backend.", "confidence": 0.9, "affects_behavior": true}]}'
          }
        }]
      })
    };
  }

  // Catch Ollama tags or generate queries
  if (urlStr.includes('11434')) {
    if (urlStr.includes('api/embeddings')) {
      return {
        ok: true,
        json: async () => ({ embedding: new Array(768).fill(0.1) })
      };
    }
    if (urlStr.includes('api/tags')) {
      return {
        ok: true,
        json: async () => ({
          models: [{ name: 'llama3.1:8b' }, { name: 'nomic-embed-text' }]
        })
      };
    }
    return {
      ok: true,
      json: async () => ({
        response: '{"memories": [{"category": "user_preference", "content": "Prefiere usar TypeScript en el backend.", "confidence": 0.9, "affects_behavior": true}]}',
        answer: '{"memories": [{"category": "user_preference", "content": "Prefiere usar TypeScript en el backend.", "confidence": 0.9, "affects_behavior": true}]}'
      })
    };
  }
  
  // Catch OpenAI embeddings calls
  if (urlStr.includes('api.openai.com')) {
    return {
      ok: true,
      json: async () => ({
        data: [{ embedding: new Array(1536).fill(0.2) }]
      })
    };
  }

  // Fallback to real fetch
  try {
    return await originalFetch(url, options);
  } catch (err) {
    return {
      ok: false,
      text: async () => err.message,
      json: async () => ({ error: err.message })
    };
  }
};

async function runLearningTests() {
  console.log("=== INICIANDO PRUEBAS DE APRENDIZAJE Y MEMORIA REAL ===");

  await dbInit();

  // Test 1: Fallback Memory Operations
  console.log("\n[Test 1] Probando operaciones de memoria relacional / fallback...");
  try {
    // Clean up any test memories
    const initialMems = await getUserMemories("test_user");
    for (const m of initialMems) {
      await deleteMemory(m.id, "test_user");
    }

    // Add memories with custom statuses
    const mem1 = await addMemory("test_user", "user_preference", "Prefiere código en JavaScript y React", "Pendiente de Confirmación", "Conversación reciente", 0.9);
    const mem2 = await addMemory("test_user", "project_details", "Trabaja en el proyecto Synaptica", "Confirmada", "Manual", 1.0);

    console.log("-> Memorias agregadas:", mem1, mem2);

    const activeMems = await getUserMemories("test_user");
    console.log(`-> Recuperadas ${activeMems.length} memorias para 'test_user'.`);
    if (activeMems.length !== 2) {
      throw new Error(`Se esperaban 2 memorias, se recuperaron ${activeMems.length}`);
    }

    const retrievedMem1 = activeMems.find(m => m.id === mem1.id);
    if (retrievedMem1.status !== 'Pendiente de Confirmación' || retrievedMem1.confidence !== 0.9) {
      throw new Error(`Los metadatos de la memoria recuperada son incorrectos: status=${retrievedMem1.status}, confidence=${retrievedMem1.confidence}`);
    }
    console.log("-> Metadatos iniciales validados correctamente.");

    // Edit/Update memory
    console.log("-> Editando y confirmando la memoria pendiente...");
    await updateMemory(mem1.id, "test_user", { status: 'Confirmada', content: 'Prefiere JS y React modificado' });
    const postEditMems = await getUserMemories("test_user");
    const retrievedMem1Updated = postEditMems.find(m => m.id === mem1.id);
    if (retrievedMem1Updated.status !== 'Confirmada' || retrievedMem1Updated.content !== 'Prefiere JS y React modificado') {
      throw new Error(`Fallo al editar/confirmar memoria.`);
    }

    // Block memory
    console.log("-> Probando bloqueo de memoria...");
    await updateMemory(mem1.id, "test_user", { blocked: true });
    const postBlockMems = await getUserMemories("test_user");
    const retrievedMem1Blocked = postBlockMems.find(m => m.id === mem1.id);
    if (!retrievedMem1Blocked.blocked) {
      throw new Error("Fallo al bloquear la memoria.");
    }

    // Update last used
    console.log("-> Probando actualización de última vez utilizada...");
    const oldLastUsed = retrievedMem1Blocked.last_used_at;
    await new Promise(r => setTimeout(r, 100)); // sleep 100ms
    await updateMemoryLastUsed(mem1.id, "test_user");
    const postLastUsedMems = await getUserMemories("test_user");
    const retrievedMem1LastUsed = postLastUsedMems.find(m => m.id === mem1.id);
    if (retrievedMem1LastUsed.last_used_at === oldLastUsed) {
      throw new Error("Fallo al actualizar el timestamp last_used_at.");
    }
    console.log("-> Timestamp last_used_at actualizado con éxito.");

    // Delete one memory
    const delResult = await deleteMemory(mem1.id, "test_user");
    console.log(`-> Eliminación de memoria id ${mem1.id}:`, delResult ? "ÉXITO" : "FALLO");

    const postDeleteMems = await getUserMemories("test_user");
    console.log(`-> Memorias remanentes: ${postDeleteMems.length}`);
    if (postDeleteMems.length !== 1) {
      throw new Error("Fallo al borrar memoria");
    }
  } catch (err) {
    console.error("-> Test 1 falló:", err.message);
  }

  // Test 2: Local Embeddings Dimension Adapter
  console.log("\n[Test 2] Probando RAG Embeddings local y empaquetador dimensional...");
  try {
    // Generate an embedding for a simple string
    // This will try local nomic-embed-text (dimension: 768) and we expect the wrapper to pad it to 1536
    const embedding = await generateEmbedding("Hola mundo desde Gabi local");
    console.log(`-> Vector de embedding generado exitosamente.`);
    console.log(`-> Longitud de dimensiones del vector: ${embedding.length} (Esperado: 1536)`);
    if (embedding.length !== 1536) {
      throw new Error(`Dimensión incorrecta: ${embedding.length}`);
    }
    console.log("-> Primeras 5 dimensiones:", embedding.slice(0, 5));
  } catch (err) {
    console.error("-> Test 2 falló:", err.message);
  }

  // Test 3: Active Feedback & Model Performance Shifting
  console.log("\n[Test 3] Probando bucle de feedback activo y ordenamiento de ranking...");
  try {
    // Let's check who is the best model for "programming" right now
    const bestBefore = await getBestModelForCategory("programming");
    console.log(`-> Mejor modelo inicial para 'programming': ${bestBefore}`);

    // Give some DOWNVOTES to llama on programming to degrade it
    console.log("-> Degradando llama con 3 downvotes en 'programming'...");
    await updateModelPerformanceFeedback("programming", "llama", "down");
    await updateModelPerformanceFeedback("programming", "llama", "down");
    await updateModelPerformanceFeedback("programming", "llama", "down");

    // Give UPVOTES to qwen on programming to boost it
    console.log("-> Elevando qwen con 3 upvotes en 'programming'...");
    await updateModelPerformanceFeedback("programming", "qwen", "up");
    await updateModelPerformanceFeedback("programming", "qwen", "up");
    await updateModelPerformanceFeedback("programming", "qwen", "up");

    const bestAfter = await getBestModelForCategory("programming");
    console.log(`-> Mejor modelo adaptado para 'programming': ${bestAfter}`);
  } catch (err) {
    console.error("-> Test 3 falló:", err.message);
  }

  // Test 4: Autonomous Background Memory Extraction
  console.log("\n[Test 4] Simulando extracción autónoma de memoria en background...");
  try {
    const mockHistory = [
      { sender: "user", text: "Hola Gabi, actualmente estoy trabajando en una librería de animación en React llamada MotionFX." },
      { sender: "assistant", text: "Qué interesante! MotionFX suena como un gran proyecto. ¿Cómo puedo ayudarte con él?" },
      { sender: "user", text: "Quiero programar en Javascript y me gusta el estilo de respuestas concisas sin introducciones." },
      { sender: "assistant", text: "Entendido, seré breve y directo a partir de ahora." }
    ];

    console.log("-> Lanzando extractor autónomo de memoria...");
    // Trigger extraction directly (will use our mock fetch responses above)
    await extractMemoriesInBackground("rogerio", mockHistory, "Recuérdame usar TypeScript en el backend.", "De acuerdo, recordaré TypeScript en el backend.");

    // Retrieve rogerio memories
    const rogerMems = await getUserMemories("rogerio");
    console.log("-> Memorias aprendidas de forma autónoma para 'rogerio':");
    rogerMems.forEach(m => {
      console.log(`   * [${m.category}] ${m.content}`);
    });
  } catch (err) {
    console.error("-> Test 4 falló:", err.message);
  }

  console.log("\n=== PRUEBAS DE APRENDIZAJE FINALIZADAS ===");
}

runLearningTests();
