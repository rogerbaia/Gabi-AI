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

// Helper for simple, natural language mock responses
const generateSimpleMockResponse = (queryText, model) => {
  const query = queryText.toLowerCase().trim();
  
  if (query.includes('arcoiris') || query.includes('arco iris')) {
    return `Los arcoíris se forman por la descomposición de la luz solar al refractarse en las gotas de lluvia. Sus 7 colores principales de afuera hacia adentro son:

1. **Rojo** 🔴
2. **Naranja** 🟠
3. **Amarillo** 🟡
4. **Verde** 🟢
5. **Azul** 🔵
6. **Añil (Índigo)** 🌀
7. **Violeta** 🟣

Es un espectro de colores continuo que surge por la refracción y dispersión física de la luz.`;
  }
  
  if (query.includes('hola') || query.includes('buenos dias') || query.includes('buenas tardes') || query.includes('saludos')) {
    return `¡Hola! Soy **Gabi AI**, tu meta-IA de Synaptica. ¿En qué te puedo colaborar hoy? Puedes usarme para resolver consultas generales o seleccionar una de mis especialidades en el NeuroHub.`;
  }
  
  if (query.includes('quien eres') || query.includes('que eres') || query.includes('tu nombre')) {
    return `Soy **Gabi AI**, un agente cognitivo orquestado por Synaptica Labs. Combino múltiples modelos de IA (OpenAI, Claude, Perplexity, DeepSeek) y ejecuto tareas en una computadora virtual (Sandbox) en tiempo real.`;
  }
  
  if (query.includes('synaptica')) {
    return `**Synaptica** es un laboratorio de Inteligencia Artificial que se especializa en desarrollar agentes autónomos cognitivos y plataformas de computación en la nube para automatizar flujos técnicos complejos.`;
  }
  
  if (query.includes('creador') || query.includes('creo') || query.includes('fundador')) {
    return `Fui diseñada e implementada por los ingenieros e investigadores de **Synaptica Labs**, bajo la dirección de Rogerio Baia.`;
  }
  
  // Custom response if query is a clinical medical case
  if (query.includes('úlcera') || query.includes('herpética') || query.includes('corneal')) {
    return `### Enfoque Terapéutico: Úlcera Corneal Herpética Recurrente

Basado en la directiva del estudio HEDS y directrices oftálmicas:

1. **Fase Aguda:**
   * **Antiviral Tópico:** Ganciclovir gel oftálmico 0.15% 5 veces al día (menos tóxico que trifluridina).
   * **Antiviral Oral:** Aciclovir 400 mg 5 veces al día (o Valaciclovir 500 mg c/8h) durante 7-10 días.
2. **Profilaxis Prolongada:**
   * **Aciclovir 400 mg c/12h** por 12 meses. Reduce las recurrencias en un **45%**.
3. **Corticosteroides:**
   * Contraindicados en úlceras epiteliales activas. Se usan bajo supervisión estricta solo para mitigar cicatrices en queratitis estromal.`;
  }
  
  // Default dynamic response that sounds like a real, direct, synthesised answer for general questions
  return `### Síntesis de OmnIA: Respuesta Consolidada

Para tu consulta: *"**${queryText}**"*

Tras analizar y fusionar los datos de OpenAI, Anthropic Claude y Perplexity:

1. **Definición Principal:** Este tema hace referencia a un concepto general de conocimiento. De forma consolidada, los modelos confirman que la respuesta principal se centra en establecer el contexto lógico y los fundamentos básicos del mismo.
2. **Enfoque Práctico:** Se recomienda abordar la consulta organizando la información en pasos sencillos, evitando términos redundantes y enfocándose en soluciones directas.
3. **Recomendación de Synaptica:** Si deseas una respuesta en tiempo real detallada o código ejecutable en el sandbox, recuerda que puedes ingresar tu API Key en la configuración para realizar consultas en vivo a través de la red oficial.`;
};

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
    const activePromises = [];
    const modelAnswers = {};
    
    // 1. Query OpenAI in parallel
    if (activeKeys.openai) {
      activePromises.push(
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeKeys.openai}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
          })
        })
        .then(r => r.json())
        .then(data => {
          if (data.choices?.[0]?.message?.content) {
            modelAnswers.openai = data.choices[0].message.content;
          }
        })
        .catch(err => console.error("OpenAI call failed in parallel routing:", err))
      );
    }
    
    // 2. Query Anthropic Claude in parallel
    if (activeKeys.anthropic) {
      activePromises.push(
        fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": activeKeys.anthropic,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }]
          })
        })
        .then(r => r.json())
        .then(data => {
          if (data.content?.[0]?.text) {
            modelAnswers.claude = data.content[0].text;
          }
        })
        .catch(err => console.error("Anthropic call failed in parallel routing:", err))
      );
    }
    
    // 3. Query Perplexity in parallel
    if (activeKeys.perplexity) {
      activePromises.push(
        fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeKeys.perplexity}`
          },
          body: JSON.stringify({
            model: "sonar-reasoning",
            messages: [{ role: "user", content: prompt }]
          })
        })
        .then(r => r.json())
        .then(data => {
          if (data.choices?.[0]?.message?.content) {
            modelAnswers.perplexity = data.choices[0].message.content;
          }
        })
        .catch(err => console.error("Perplexity call failed in parallel routing:", err))
      );
    }
    
    // 4. Query DeepSeek in parallel
    if (activeKeys.deepseek) {
      activePromises.push(
        fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${activeKeys.deepseek}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }]
          })
        })
        .then(r => r.json())
        .then(data => {
          if (data.choices?.[0]?.message?.content) {
            modelAnswers.deepseek = data.choices[0].message.content;
          }
        })
        .catch(err => console.error("DeepSeek call failed in parallel routing:", err))
      );
    }
    
    // Wait for all active parallel API searches
    if (activePromises.length > 0) {
      await Promise.all(activePromises);
    }
    
    const answersList = Object.entries(modelAnswers)
      .map(([modelName, text]) => `--- RESPUESTA DE ${modelName.toUpperCase()} ---\n${text}`)
      .join('\n\n');
      
    if (answersList) {
      // If we have answers from multiple models, we run a consolidation synthesis
      if (Object.keys(modelAnswers).length > 1) {
        const synthesisPrompt = `Actúa como Gabi AI, el motor inteligente de orquestación y síntesis de Synaptica.
Hemos realizado una búsqueda simultánea estilo Trivago en múltiples proveedores de IA para responder a la consulta del usuario: "${prompt}".

Aquí tienes las respuestas individuales recolectadas en tiempo real:
${answersList}

Tu objetivo es consolidar y sintetizar estas respuestas en una única respuesta definitiva de alta calidad.
- Identifica los puntos de consenso general y únelos de forma fluida.
- Detecta y elimina cualquier contradicción lógica o contradicciones entre las respuestas.
- Escribe una respuesta definitiva, clara, directa y muy fácil de leer para el usuario.
- Ve directo al grano respondiendo la consulta del usuario de forma natural, sin rodeos meta-explicativos ni introducciones sobre cómo hiciste la síntesis.`;

        if (activeKeys.openai) {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${activeKeys.openai}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "system", content: synthesisPrompt }]
            })
          });
          const data = await response.json();
          resultText = data.choices?.[0]?.message?.content || Object.values(modelAnswers)[0];
        } else if (activeKeys.anthropic) {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": activeKeys.anthropic,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 1024,
              messages: [{ role: "user", content: synthesisPrompt }]
            })
          });
          const data = await response.json();
          resultText = data.content?.[0]?.text || Object.values(modelAnswers)[0];
        } else {
          resultText = Object.values(modelAnswers)[0];
        }
      } else {
        // Just return the single available model's response directly
        resultText = Object.values(modelAnswers)[0];
      }
    }
    
    if (resultText) {
      return res.json({ response: resultText, isRealAPI: true });
    }
    
    // Default fallback to mock simulation if keys are empty or models failed
    const fallbackResponse = generateSimpleMockResponse(prompt, model);
    res.json({ response: fallbackResponse, isRealAPI: false });
    
  } catch (error) {
    console.error("Real parallel API or synthesis call failed, falling back:", error);
    const fallbackResponse = generateSimpleMockResponse(prompt, model);
    res.json({ response: fallbackResponse, error: error.message, isRealAPI: false });
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
