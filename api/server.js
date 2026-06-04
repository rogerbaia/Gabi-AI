import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readDb, writeDb } from './db.js';
import { runCommand, writeFile, listWorkspaceFiles } from './sandbox.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Helper to update user config
const getUserConfig = () => {
  const db = readDb();
  return db.user;
};

// Endpoints for User profile / Tokens
app.get('/api/tokens', (req, res) => {
  const user = getUserConfig();
  res.json({ tokenBalance: user.tokenBalance, apiKeys: user.apiKeys });
});

app.post('/api/tokens', (req, res) => {
  const { amount, apiKeys, balance } = req.body;
  const db = readDb();
  
  if (balance !== undefined) {
    db.user.tokenBalance = Math.max(0, balance);
  } else if (amount !== undefined) {
    db.user.tokenBalance = Math.max(0, db.user.tokenBalance + amount);
  }
  if (apiKeys !== undefined) {
    db.user.apiKeys = { ...db.user.apiKeys, ...apiKeys };
  }
  
  writeDb(db);
  res.json({ tokenBalance: db.user.tokenBalance, apiKeys: db.user.apiKeys });
});

// Endpoints for Chats Sincronization
app.get('/api/chats', (req, res) => {
  const db = readDb();
  res.json(db.chats || []);
});

app.post('/api/chats', (req, res) => {
  const chats = req.body;
  const db = readDb();
  db.chats = chats;
  writeDb(db);
  res.json({ success: true, count: db.chats.length });
});

// Sandbox Code Execution Endpoints
app.post('/api/sandbox/run', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }
  
  const result = await runCommand(command);
  res.json(result);
});

app.post('/api/sandbox/write', (req, res) => {
  const { filename, content } = req.body;
  if (!filename || content === undefined) {
    return res.status(400).json({ error: 'Filename and content are required' });
  }
  
  const result = writeFile(filename, content);
  res.json(result);
});

app.get('/api/sandbox/files', (req, res) => {
  res.json({ files: listWorkspaceFiles() });
});

// NeuroStore Endpoints
app.get('/api/store/orders', (req, res) => {
  const db = readDb();
  res.json(db.orders || []);
});

app.post('/api/store/buy', (req, res) => {
  const { productId, name, price, tokensDeducted } = req.body;
  const db = readDb();
  
  if (db.user.tokenBalance < tokensDeducted) {
    return res.status(400).json({ error: 'Insufficient NeuroTokens' });
  }
  
  // Deduct tokens
  db.user.tokenBalance = Math.max(0, db.user.tokenBalance - tokensDeducted);
  
  // Create order
  const orderId = 'AMZ-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: orderId,
    productId,
    name,
    price,
    status: 'Procesando devolución en almacén',
    timestamp: new Date().toISOString()
  };
  
  db.orders.unshift(newOrder);
  
  // Send email tracking simulation
  const newEmail = {
    id: Date.now(),
    subject: `Confirmación de Envío: Pedido ${orderId}`,
    sender: 'amazon-logistics@synaptica.net',
    body: `Estimado Cliente,\n\nTu canje de ${name} ha sido procesado mediante nuestro modelo de retorno de inversión de Amazon Logistics.\n\nNúmero de Pedido: ${orderId}\nPrecio Canjeado: ${price} NTK\nEstado: En almacén listo para retorno.\n\nContrato Legal: El reembolso será acreditado al balance de Synaptica tras la liquidación del lote.\n\nSaludos,\nEquipo de Logística Synaptica.`,
    date: 'Hoy',
    unread: true
  };
  
  db.emails.unshift(newEmail);
  
  writeDb(db);
  res.json({ success: true, order: newOrder, tokenBalance: db.user.tokenBalance });
});

// Emails Endpoints
app.get('/api/store/emails', (req, res) => {
  const db = readDb();
  res.json(db.emails || []);
});

app.post('/api/store/emails/read', (req, res) => {
  const { id } = req.body;
  const db = readDb();
  db.emails = (db.emails || []).map(e => e.id === id ? { ...e, unread: false } : e);
  writeDb(db);
  res.json({ success: true });
});

// External Real APIs proxy integration
app.post('/api/chat', async (req, res) => {
  const { prompt, model, apiKeys } = req.body;
  
  // Resolve keys prioritizing those sent in request, then database, then environment variables
  const dbKeys = getUserConfig().apiKeys || {};
  const activeKeys = {
    openai: apiKeys?.openai || dbKeys.openai || process.env.OPENAI_API_KEY,
    anthropic: apiKeys?.anthropic || dbKeys.anthropic || process.env.ANTHROPIC_API_KEY,
    perplexity: apiKeys?.perplexity || dbKeys.perplexity || process.env.PERPLEXITY_API_KEY,
    deepseek: apiKeys?.deepseek || dbKeys.deepseek || process.env.DEEPSEEK_API_KEY
  };
  
  try {
    let resultText = "";
    
    // Check key availability based on model selected
    if (model === 'omnia' && activeKeys.openai) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeKeys.openai}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      resultText = data.choices?.[0]?.message?.content || JSON.stringify(data);
    } 
    else if (model === 'investia' && activeKeys.perplexity) {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeKeys.perplexity}`
        },
        body: JSON.stringify({
          model: "sonar-reasoning",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      resultText = data.choices?.[0]?.message?.content || JSON.stringify(data);
    } 
    else if (model === 'viajia' && activeKeys.deepseek) {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeKeys.deepseek}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      resultText = data.choices?.[0]?.message?.content || JSON.stringify(data);
    }
    
    if (resultText) {
      return res.json({ response: resultText, isRealAPI: true });
    }
    
    // Default fallback to mock simulation if keys are empty or model not matched
    res.json({ response: null, isRealAPI: false });
    
  } catch (error) {
    console.error("API Call error, falling back to simulation:", error);
    res.json({ response: null, error: error.message, isRealAPI: false });
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
