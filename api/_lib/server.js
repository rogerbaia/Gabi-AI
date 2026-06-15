import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { 
  dbInit, 
  getUserBalance, 
  updateUserBalance, 
  getChats, 
  saveChats, 
  getOrders, 
  addOrder, 
  getEmails, 
  markEmailRead, 
  saveFeedback,
  getGlobalConfig,
  updateGlobalConfig,
  getHealthStats,
  getUserMemories,
  deleteMemory,
  updateMemory,
  updateModelPerformanceFeedback
} from './db.js';
import os from 'os';
import { runCommand, writeFile, listWorkspaceFiles } from './sandbox.js';
import authRouter, { authenticateToken } from './auth.js';
import { ingestDocument } from './rag.js';
import { 
  queryOrchestrator, 
  getActiveProviders, 
  detectLocalModels, 
  checkInternetConnectivity, 
  getAvailableLocalModels,
  extractMemoriesInBackground,
  updateSystemMode
} from './orchestrator.js';
import { getOllamaDetailedStatus } from './providers/helper.js';

dotenv.config();

// Initialize database schema/tables
dbInit();

const app = express();

app.use(cors());
app.use(express.json());

// Set up upload handler in memory
const upload = multer({ storage: multer.memoryStorage() });

// Mount User Auth Router
app.use('/api/auth', authRouter);

// Token Wallet Routes
app.get('/api/tokens', authenticateToken, async (req, res) => {
  try {
    const balance = await getUserBalance(req.user.username);
    res.json({ tokenBalance: balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tokens', authenticateToken, async (req, res) => {
  const { amount, balance } = req.body;
  try {
    const currentBalance = await getUserBalance(req.user.username);
    let newBalance = currentBalance;
    if (balance !== undefined) {
      newBalance = Math.max(0, balance);
    } else if (amount !== undefined) {
      newBalance = Math.max(0, currentBalance + amount);
    }
    await updateUserBalance(req.user.username, newBalance);
    res.json({ tokenBalance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chats History Sync Routes
app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const chats = await getChats(req.user.username);
    res.json(chats || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats', authenticateToken, async (req, res) => {
  const chats = req.body;
  try {
    await saveChats(req.user.username, chats);
    res.json({ success: true, count: chats.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sandbox Code execution Endpoints
app.post('/api/sandbox/run', authenticateToken, async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }
  const result = await runCommand(command);
  res.json(result);
});

app.post('/api/sandbox/write', authenticateToken, (req, res) => {
  const { filename, content } = req.body;
  if (!filename || content === undefined) {
    return res.status(400).json({ error: 'Filename and content are required' });
  }
  const result = writeFile(filename, content);
  res.json(result);
});

app.get('/api/sandbox/files', authenticateToken, (req, res) => {
  res.json({ files: listWorkspaceFiles() });
});

// Store & Orders Routes
app.get('/api/store/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await getOrders(req.user.username);
    res.json(orders || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/store/buy', authenticateToken, async (req, res) => {
  const { productId, name, price, tokensDeducted } = req.body;
  const username = req.user.username;

  try {
    const tokenBalance = await getUserBalance(username);
    if (tokenBalance < tokensDeducted) {
      return res.status(400).json({ error: 'Insufficient NeuroTokens' });
    }

    const newBalance = Math.max(0, tokenBalance - tokensDeducted);
    await updateUserBalance(username, newBalance);

    const orderId = 'AMZ-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      productId,
      name,
      price,
      status: 'Procesando devolución en almacén',
      timestamp: new Date().toISOString()
    };
    await addOrder(username, newOrder);

    const newEmail = {
      id: Date.now(),
      subject: `Confirmación de Envío: Pedido ${orderId}`,
      sender: 'amazon-logistics@synaptica.net',
      body: `Estimado Cliente,\n\nTu canje de ${name} ha sido procesado mediante nuestro modelo de retorno de inversión de Amazon Logistics.\n\nNúmero de Pedido: ${orderId}\nPrecio Canjeado: ${price} NTK\nEstado: En almacén listo para retorno.\n\nContrato Legal: El reembolso será acreditado al balance de Synaptica tras la liquidación del lote.\n\nSaludos,\nEquipo de Logística Synaptica.`,
      date: 'Hoy',
      unread: true
    };
    await addEmail(username, newEmail);

    res.json({ success: true, order: newOrder, tokenBalance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Emails Simulation Routes
app.get('/api/store/emails', authenticateToken, async (req, res) => {
  try {
    const emails = await getEmails(req.user.username);
    res.json(emails || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/store/emails/read', authenticateToken, async (req, res) => {
  const { id } = req.body;
  try {
    await markEmailRead(req.user.username, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Provider API Status Route
app.get('/api/providers/status', authenticateToken, (req, res) => {
  res.json({ status: getActiveProviders() });
});

// Route to check local models & connection status dynamically
app.get('/api/providers/detect', authenticateToken, async (req, res) => {
  try {
    const isOnline = await checkInternetConnectivity();
    const installed = await detectLocalModels();
    const available = await getAvailableLocalModels(installed);
    const ollamaStatus = await getOllamaDetailedStatus();
    
    res.json({
      offlineMode: !isOnline,
      localModels: installed,
      availableLocalProviders: available,
      ollamaStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin health telemetry and control endpoints
app.get('/api/admin/health', authenticateToken, async (req, res) => {
  try {
    const dbStats = await getHealthStats();
    const globalConfig = await getGlobalConfig();
    const systemMode = await updateSystemMode();
    const ollamaStatus = await getOllamaDetailedStatus();

    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg();
    const cpus = os.cpus();
    
    const simulatedGpuUsage = Math.round(20 + Math.random() * 45);
    const simulatedVramUsage = Math.round(4.2 + Math.random() * 3.1);
    const simulatedGpuTemp = Math.round(55 + Math.random() * 15);

    res.json({
      dbStats,
      globalConfig,
      systemMode,
      ollamaStatus,
      system: {
        cpuUsage: cpuLoad,
        cpusCount: cpus.length,
        totalRamGb: Math.round(totalMem / (1024 * 1024 * 1024)),
        usedRamGb: Math.round(usedMem / (1024 * 1024 * 1024)),
        gpuUsagePct: simulatedGpuUsage,
        usedVramGb: simulatedVramUsage,
        gpuTempC: simulatedGpuTemp,
        uptimeHours: Math.round(os.uptime() / 3600)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/config', authenticateToken, async (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration payload' });
    }
    const success = await updateGlobalConfig(newConfig);
    if (success) {
      res.json({ success: true, config: newConfig });
    } else {
      res.status(500).json({ error: 'Failed to persist configurations' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback Logging Route
app.post('/api/feedback', authenticateToken, async (req, res) => {
  const { queryText, category, bestModel, vote } = req.body;
  try {
    await saveFeedback(req.user.username, queryText, category, bestModel, vote);
    
    // Dynamic quality adaptation based on user votes
    if (category && bestModel && vote) {
      await updateModelPerformanceFeedback(category, bestModel, vote);
      console.log(`[Feedback] Adjusted quality for model "${bestModel}" under category "${category}" due to user "${vote}" vote.`);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Memories Review and Management Routes
app.get('/api/memories', authenticateToken, async (req, res) => {
  try {
    const list = await getUserMemories(req.user.username);
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/memories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { category, content, status, blocked } = req.body;
  try {
    const success = await updateMemory(id, req.user.username, { category, content, status, blocked });
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/memories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const success = await deleteMemory(id, req.user.username);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/memories/export', authenticateToken, async (req, res) => {
  try {
    const list = await getUserMemories(req.user.username);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=gabi_memories_${req.user.username}.json`);
    res.json(list || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RAG Document Upload Route
app.post('/api/documents/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    const result = await ingestDocument(req.file.originalname, req.file.mimetype, req.file.buffer);
    res.json({ success: true, message: `Documento "${req.file.originalname}" indexado correctamente (${result.chunksCount} fragmentos).` });
  } catch (err) {
    console.error("[Server] Document upload ingestion failed:", err);
    res.status(500).json({ error: `Error al procesar el archivo: ${err.message}` });
  }
});

// Unified Gabi AI Orchestration Route
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { prompt, model, mode } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'El prompt es requerido.' });
  }

  try {
    // 1. Check token balance (OmnIA queries cost 5 tokens)
    const tokenBalance = await getUserBalance(req.user.username);
    if (tokenBalance < 5) {
      return res.status(402).json({ error: 'Saldo de NeuroTokens insuficiente para realizar la consulta.' });
    }

    // Deduct tokens
    const nextBalance = Math.max(0, tokenBalance - 5);
    await updateUserBalance(req.user.username, nextBalance);

    // 2. Load short term memory history from synced chats
    const chats = await getChats(req.user.username);
    let activeHistory = [];
    if (chats && chats.length > 0) {
      // Find active conversation matching the frontend request context
      // As a fallback, we grab messages from the most recent active chat
      activeHistory = chats[0].messages || [];
    }

    // 3. Query multi-model orchestrator
    const result = await queryOrchestrator(prompt, req.user.username, activeHistory, model, mode);

    // 4. Autonomous memory extraction trigger (every 5 turns / 10 messages)
    try {
      const globalConfig = await getGlobalConfig();
      const isAutoLearningEnabled = globalConfig?.autoLearningEnabled !== false;
      const currentMessageCount = activeHistory.length + 2;
      
      if (isAutoLearningEnabled && currentMessageCount > 0 && currentMessageCount % 10 === 0) {
        console.log(`[Server] Conversation turn count reached a multiple of 5 (${currentMessageCount} messages). Triggering background memory extraction...`);
        extractMemoriesInBackground(req.user.username, activeHistory, prompt, result.response).catch(err => {
          console.error("[Server] Error in background memory extraction:", err);
        });
      }
    } catch (configErr) {
      console.error("[Server] Auto-learning configuration check failed:", configErr);
    }

    res.json({
      response: result.response,
      modelsParticipated: result.modelsParticipated,
      sources: result.sources,
      category: result.category,
      isRealAPI: result.isRealAPI,
      tokenBalance: nextBalance,
      effectiveMode: result.effectiveMode
    });
  } catch (err) {
    console.error("[Server] Orchestration chat error:", err);
    res.status(500).json({ error: `Error en el motor OmnIA: ${err.message}` });
  }
});

// Start Express server locally
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[Server] Gabi AI Backend running on http://localhost:${PORT}`);
  });
}

export default app;
