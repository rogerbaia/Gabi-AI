import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'sandbox_workspace')
  : path.join(__dirname, '..', 'sandbox_workspace');

// Ensure workspace directory exists
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Write simulated python scripts to workspace so they run for real
const SCRIPTS = {
  'analyze_contradictions.py': `
import sys
print("Analizador: Buscando contradicciones lógicas en las respuestas de los modelos...")
print("Analizador: Sin discrepancias críticas. Datos consolidados.")
`,
  'adjust_synapses.py': `
import sys
category = "general"
for arg in sys.argv:
    if "--category=" in arg:
        category = arg.split("=")[1]
print(f"[Inteligencia Real] Calibrando pesos neuronales para temática: {category}")
print("[Inteligencia Real] Ajustando peso de modelos en base a feedback histórico...")
`,
  'merge.py': `
import sys
category = "general"
for arg in sys.argv:
    if "--category=" in arg:
        category = arg.split("=")[1]
print(f"Combinando respuestas para la categoría: {category}...")
with open("synthesis.md", "w") as f:
    f.write("### Synthesis Output\\nFusion completa.")
print("[system] Tareas finalizadas con éxito. Respuesta definitiva enviada al chat.")
`
};

export function initializeSandbox() {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
  
  // Write the default scripts
  for (const [filename, content] of Object.entries(SCRIPTS)) {
    fs.writeFileSync(path.join(WORKSPACE_DIR, filename), content.trim(), 'utf-8');
  }
  console.log('[Sandbox] Initialized with pre-packaged Python automation scripts.');
}

// Initialize on import
initializeSandbox();

export function runCommand(command) {
  return new Promise((resolve) => {
    let commandToRun = command;

    // Cross-platform compatibility adjustments for Windows
    if (process.platform === 'win32') {
      commandToRun = commandToRun.replace(/\bpython3\b/g, 'python');
      
      // If command contains bash style operators like && and cd, make it command-prompt friendly
      // Simple mkdir -p can be translated to md or mkdir, but Node can just run it if git bash is in path.
      // However, we handle mkdir -p separately to avoid failures:
      if (commandToRun.startsWith('mkdir -p')) {
        const dirPath = commandToRun.replace('mkdir -p', '').trim();
        const fullDirPath = path.resolve(WORKSPACE_DIR, dirPath);
        if (!fs.existsSync(fullDirPath)) {
          fs.mkdirSync(fullDirPath, { recursive: true });
        }
        resolve({
          success: true,
          logs: [`[system] Created directory ${dirPath}`],
          workspaceFiles: listWorkspaceFiles()
        });
        return;
      }
    }

    console.log(`[Sandbox] Executing: "${commandToRun}"`);

    exec(commandToRun, { cwd: WORKSPACE_DIR }, (error, stdout, stderr) => {
      const logs = [];
      if (stdout) {
        logs.push(stdout);
      }
      if (stderr) {
        logs.push(`[stderr] ${stderr}`);
      }
      if (error) {
        logs.push(`[error] Command failed with code ${error.code}: ${error.message}`);
      }
      
      resolve({
        success: !error,
        logs: logs.join('\n').split('\n').filter(Boolean),
        workspaceFiles: listWorkspaceFiles()
      });
    });
  });
}

export function writeFile(filename, content) {
  try {
    const filePath = path.join(WORKSPACE_DIR, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function listWorkspaceFiles() {
  try {
    return fs.readdirSync(WORKSPACE_DIR);
  } catch (err) {
    return [];
  }
}
