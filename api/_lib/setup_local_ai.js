import os from 'os';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Quantized models recommended specifically for RTX 3060 12 GB
const RECOMMENDED_MODELS = [
  { key: 'llama', tag: 'llama3.1:8b', size: '4.7 GB', desc: 'Llama 3.1 8B (General)' },
  { key: 'deepseek', tag: 'deepseek-r1:8b', size: '4.7 GB', desc: 'DeepSeek R1 Distill Qwen 8B (Razonamiento)' },
  { key: 'qwen', tag: 'qwen2.5-coder:7b', size: '4.7 GB', desc: 'Qwen 2.5 Coder 7B (Programación)' },
  { key: 'gemma', tag: 'gemma2:9b', size: '5.5 GB', desc: 'Gemma 2 9B (Google - Alta calidad)' },
  { key: 'phi', tag: 'phi3.5:3.8b', size: '2.2 GB', desc: 'Phi 3.5 3.8B (Ligero y rápido)' },
  { key: 'mistral', tag: 'mistral:7b', size: '4.1 GB', desc: 'Mistral 7B (Europa - Balanceado)' },
  { key: 'embeddings', tag: 'nomic-embed-text', size: '274 MB', desc: 'Nomic Embed Text (Embeddings locales para RAG)' }
];

// Helper to check connection to Ollama
async function isOllamaRunning() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Download helper with basic logging
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`[Descargador] Descargando desde: ${url}`);
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error de descarga HTTP ${response.statusCode}`));
        return;
      }
      
      let downloaded = 0;
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        // Print progress occasionally
        if (Math.random() < 0.05) {
          process.stdout.write(`Descargado: ${(downloaded / (1024 * 1024)).toFixed(1)} MB...\r`);
        }
      });

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`\n[Descargador] Archivo guardado con éxito en: ${destPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function runSetup() {
  console.log("=========================================================");
  console.log("   SYNAPTICA GABI AI - INSTALADOR DE INFRAESTRUCTURA IA  ");
  console.log("=========================================================");

  const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--simulate');
  if (isDryRun) {
    console.log("\n*** MODO DRY-RUN / SIMULACIÓN ACTIVADO ***");
    console.log("-> Se ejecutarán los diagnósticos pero se simularán las descargas e instalaciones.");
  }

  // Phase 1: Hardware Diagnostics
  console.log("\n[Fase 1] Diagnosticando Hardware Local...");
  
  const ramGb = Math.round(os.totalmem() / (1024 * 1024 * 1024));
  const cpuModel = os.cpus()[0]?.model || "Desconocido";
  const threads = os.cpus().length;
  
  console.log(`-> CPU: ${cpuModel} (${threads} hilos)`);
  console.log(`-> Memoria RAM: ${ramGb} GB DDR`);

  let gpuInfo = { name: "No detectada (CPU Only)", vramGb: 0, hasNvidia: false };
  
  if (process.platform === 'win32') {
    try {
      const wmicOut = execSync('wmic path win32_VideoController get Name,AdapterRAM /value', { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'ignore'] 
      });
      const lines = wmicOut.split('\n').map(l => l.trim()).filter(Boolean);
      let name = '';
      let bytes = 0;
      
      for (const line of lines) {
        if (line.toLowerCase().startsWith('name=')) {
          name = line.split('=')[1];
        }
        if (line.toLowerCase().startsWith('adapterram=')) {
          bytes = parseInt(line.split('=')[1]) || 0;
        }
      }
      
      if (name) {
        gpuInfo.name = name;
        gpuInfo.vramGb = Math.round(bytes / (1024 * 1024 * 1024));
        if (name.toLowerCase().includes('nvidia')) {
          gpuInfo.hasNvidia = true;
        }
      }
    } catch (e) {
      // fallback
    }
  }

  // Double check Nvidia GPU via nvidia-smi
  try {
    const smiOut = execSync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits', { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'ignore'] 
    });
    const parts = smiOut.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      gpuInfo.name = parts[0];
      gpuInfo.vramGb = Math.round(parseInt(parts[1]) / 1024);
      gpuInfo.hasNvidia = true;
    }
  } catch (err) {}

  console.log(`-> Tarjeta Gráfica (GPU): ${gpuInfo.name} (${gpuInfo.vramGb} GB VRAM)`);

  // Target recommendations evaluation
  const targetVram = gpuInfo.vramGb || 0;
  console.log(`\n[Recomendación] Detectados ${targetVram} GB VRAM.`);
  if (gpuInfo.hasNvidia && targetVram >= 11) {
    console.log("-> ¡Excelente! Tu hardware RTX 3060 (12 GB VRAM) cumple el perfil objetivo.");
    console.log("-> Gabi AI puede ejecutar modelos de 7B, 8B y 9B cargados al 100% en la GPU (Velocidad óptima).");
  } else if (gpuInfo.hasNvidia && targetVram >= 6) {
    console.log("-> GPU detectada. Puedes ejecutar modelos ligeros (3B, 8B cuantizados) parcialmente acelerados.");
  } else {
    console.log("-> Se ejecutará en modo CPU. La latencia de respuestas locales podría ser lenta.");
  }

  // Phase 2: Ollama Verification & Setup
  console.log("\n[Fase 2] Verificando Servidor Ollama...");
  let ollamaOk = await isOllamaRunning();
  
  if (ollamaOk) {
    console.log("-> ¡Ollama ya está corriendo y activo en el puerto 11434!");
  } else {
    console.log("-> Ollama no está corriendo. Verificando si está instalado en el sistema...");
    
    let isInstalled = false;
    let installPath = "";
    
    if (process.platform === 'win32') {
      const userProfile = process.env.USERPROFILE || "";
      const defaultWinPath = path.join(userProfile, 'AppData', 'Local', 'Programs', 'Ollama', 'ollama.exe');
      if (fs.existsSync(defaultWinPath)) {
        isInstalled = true;
        installPath = defaultWinPath;
      }
    }

    if (isInstalled) {
      console.log(`-> Ollama está instalado en: ${installPath}`);
      if (isDryRun) {
        console.log("-> [Simulación] Iniciando Ollama de forma asíncrona (omitido por modo dry-run)");
        ollamaOk = true;
      } else {
        console.log("-> Iniciando Ollama de forma asíncrona...");
        spawn(installPath, [], { detached: true, stdio: 'ignore' }).unref();
        // Wait for process to spawn
        console.log("-> Esperando 5 segundos a que levante el servidor...");
        await new Promise(r => setTimeout(r, 5000));
        ollamaOk = await isOllamaRunning();
      }
    } else {
      console.log("-> Ollama no se detecta instalado en esta PC.");
      if (isDryRun) {
        console.log("-> [Simulación] Ollama no detectado. Se descargaría OllamaSetup.exe e instalaría localmente.");
        ollamaOk = true;
      } else {
        if (process.platform === 'win32') {
          const installerPath = path.join(PROJECT_ROOT, 'OllamaSetup.exe');
          console.log(`-> Descargando instalador oficial de Ollama para Windows en: ${installerPath}`);
          try {
            await downloadFile("https://ollama.com/download/OllamaSetup.exe", installerPath);
            console.log("\n-> ¡Instalador descargado con éxito!");
            console.log("-> Ejecutando instalador 'OllamaSetup.exe'. Por favor completa los pasos del asistente en pantalla...");
            execSync(`"${installerPath}"`);
            
            console.log("-> Esperando 10 segundos a que finalices la instalación y levante el servicio...");
            await new Promise(r => setTimeout(r, 10000));
            ollamaOk = await isOllamaRunning();
          } catch (downloadErr) {
            console.error("-> Error al descargar/ejecutar el instalador:", downloadErr.message);
            console.log("-> Por favor descarga e instala Ollama manualmente desde: https://ollama.com");
          }
        } else {
          console.log("-> Por favor descarga e instala Ollama de forma manual para tu sistema operativo desde: https://ollama.com");
        }
      }
    }
  }

  // Phase 3: Model Ingestion (Ollama pull)
  if (ollamaOk) {
    console.log("\n[Fase 3] Instalando Modelos de IA Recomendados para tu RTX 3060...");
    console.log("Gabi AI instalará secuencialmente los modelos cuantizados optimizados:");
    
    for (const model of RECOMMENDED_MODELS) {
      console.log(`\n-> Iniciando descarga e instalación de: ${model.desc} (${model.tag} - tamaño: ${model.size})`);
      try {
        console.log(`Ejecutando: ollama pull ${model.tag}`);
        if (isDryRun) {
          console.log(`-> [Simulación] ollama pull ${model.tag} completado (omitido por modo dry-run).`);
        } else {
          execSync(`ollama pull ${model.tag}`, { stdio: 'inherit' });
          console.log(`-> Modelo ${model.tag} instalado correctamente.`);
        }
      } catch (pullErr) {
        console.error(`-> Error al instalar el modelo ${model.tag}:`, pullErr.message);
      }
    }
    
    // Phase 4: Local verification test
    console.log("\n[Fase 4] Ejecutando Prueba de Inferencia 100% Local (Offline Test)...");
    if (isDryRun) {
      console.log("\n-> [Simulación] Respuesta de Gabi local: \"Hola! Confirmo que respondo de forma 100% local en tu RTX 3060.\"");
      console.log("\n-> [Éxito] Todo el ecosistema de IA local está listo para producción (Simulación completada).");
    } else {
      try {
        const response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: RECOMMENDED_MODELS[0].tag,
            prompt: "Hola Gabi, confírmame si respondes de forma 100% local sin internet. Responde en una sola frase.",
            stream: false
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("\n-> ¡Respuesta exitosa recibida del modelo local!");
          console.log(`-> Respuesta de Gabi local: "${result.response.trim()}"`);
          console.log("\n-> [Éxito] Todo el ecosistema de IA local está listo para producción.");
        } else {
          console.warn("-> Servidor Ollama respondió con error en la prueba de generación.");
        }
      } catch (generateErr) {
        console.error("-> Prueba de inferencia local falló:", generateErr.message);
      }
    }
  } else {
    console.warn("\n[Advertencia] No se pudo conectar al servidor de Ollama local en el puerto 11434.");
    console.warn("-> Asegúrate de que Ollama esté instalado y corriendo antes de chatear en modo Offline.");
  }
  
  console.log("\n=========================================================");
  console.log("          PROCESO DE CONFIGURACIÓN CONCLUIDO             ");
  console.log("=========================================================");
}

// Check if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSetup();
}

export { runSetup };
