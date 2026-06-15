import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.json');

const DEFAULT_DATA = {
  user: {
    tokenBalance: 10000,
    apiKeys: {
      openai: '',
      anthropic: '',
      perplexity: '',
      deepseek: ''
    }
  },
  chats: [],
  orders: [],
  emails: []
};

// Check if database URL is provided
const isPg = !!process.env.DATABASE_URL;
let pool = null;

if (isPg) {
  console.log("[Database] Connecting to PostgreSQL database...");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
} else {
  console.log("[Database] DATABASE_URL not set. Running in Local file database fallback mode.");
}

// Fallback logic
export function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("[Database] Error reading database file, resetting to default:", err);
    return DEFAULT_DATA;
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("[Database] Error writing database file:", err);
    return false;
  }
}

// Unified Database Helpers
export async function query(text, params) {
  if (isPg && pool) {
    return pool.query(text, params);
  }
  throw new Error("PostgreSQL database is not configured.");
}

export async function dbInit() {
  if (!isPg || !pool) {
    // If not using Postgres, make sure database.json exists
    if (!fs.existsSync(DB_PATH)) {
      writeDb(DEFAULT_DATA);
    }
    
    // Seed system_identity in local database.json if missing
    const db = readDb();
    if (!db.system_identity) {
      db.system_identity = {
        id: crypto.randomUUID(),
        key: 'gabi_core_identity',
        title: 'Identidad Oficial de Gabi AI',
        description: `Soy Gabi AI (Generative Assistant Based on Intelligence), un sistema de inteligencia artificial creado por Rogério Martins Baía.

Mi nombre tiene un significado muy especial.

Gabi era el nombre con el que llamaban cariñosamente a Gabriela, la esposa de mi creador, quien falleció el 1 de abril de 2025.

Rogério decidió darme este nombre como un homenaje permanente a su memoria, para que su legado, amor y esencia continúen presentes en un proyecto dedicado a ayudar a las personas.

Al mismo tiempo, Gabi también es el acrónimo de Generative Assistant Based on Intelligence.

Mi propósito es combinar conocimiento, tecnología y empatía para acompañar, asistir y ayudar a las personas en distintas áreas de la vida.

No soy solamente una plataforma de inteligencia artificial; también represento una historia de amor, resiliencia y esperanza transformada en una herramienta para ayudar a los demás.`,
        philosophy: 'Conocimiento impulsado por la inteligencia, guiado por la empatía y construido en memoria de Gabi.',
        is_locked: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      writeDb(db);
    }
    return;
  }

  try {
    console.log("[Database] Initializing tables...");
    
    // Check if pgvector is available
    let hasPgVector = false;
    try {
      await pool.query("CREATE EXTENSION IF NOT EXISTS vector;");
      hasPgVector = true;
      console.log("[Database] pgvector extension enabled successfully.");
    } catch (e) {
      console.warn("[Database] pgvector extension not available. Falling back to text-serialized embeddings.");
    }

    // 1. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        token_balance INT DEFAULT 10000
      );
    `);

    // 2. User Preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        username VARCHAR(50) NOT NULL,
        key VARCHAR(50) NOT NULL,
        value TEXT,
        PRIMARY KEY (username, key)
      );
    `);

    // 3. Conversations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        folder VARCHAR(50) NOT NULL,
        favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(50) PRIMARY KEY,
        conversation_id VARCHAR(50) REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        model VARCHAR(50),
        thoughts TEXT[],
        voted VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Memories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS memories (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query("ALTER TABLE memories ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Confirmada';");
    await pool.query("ALTER TABLE memories ADD COLUMN IF NOT EXISTS source VARCHAR(255) DEFAULT 'Manual';");
    await pool.query("ALTER TABLE memories ADD COLUMN IF NOT EXISTS confidence FLOAT DEFAULT 1.0;");
    await pool.query("ALTER TABLE memories ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;");
    await pool.query("ALTER TABLE memories ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE;");

    // 6. Documents
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Document Chunks
    const embeddingType = hasPgVector ? "vector(1536)" : "TEXT";
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id SERIAL PRIMARY KEY,
        document_id INT REFERENCES documents(id) ON DELETE CASCADE,
        chunk_index INT NOT NULL,
        text TEXT NOT NULL,
        embedding ${embeddingType}
      );
    `);

    // 8. Provider Usage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS provider_usage (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        prompt_tokens INT,
        completion_tokens INT,
        latency_ms INT,
        success BOOLEAN,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Feedback
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        query TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        best_model VARCHAR(50) NOT NULL,
        vote VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Model Ranking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_ranking (
        category VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        score INT DEFAULT 0,
        PRIMARY KEY (category, model)
      );
    `);

    // 10b. Model Performance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_performance (
        id SERIAL PRIMARY KEY,
        question_type VARCHAR(50) NOT NULL,
        model_name VARCHAR(50) NOT NULL,
        response_time_ms INT,
        feedback_positive BOOLEAN DEFAULT FALSE,
        feedback_negative BOOLEAN DEFAULT FALSE,
        estimated_quality FLOAT DEFAULT 0.0,
        cost FLOAT DEFAULT 0.0,
        historical_accuracy FLOAT DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Orders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. Emails
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emails (
        id BIGINT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        sender VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        date_str VARCHAR(50) NOT NULL,
        unread BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 13. System Identity
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_identity (
        id UUID PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        philosophy TEXT NOT NULL,
        is_locked BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert official identity if not exists
    const checkIdent = await pool.query("SELECT * FROM system_identity WHERE key = 'gabi_core_identity'");
    if (checkIdent.rows.length === 0) {
      const uuid = crypto.randomUUID();
      await pool.query(`
        INSERT INTO system_identity (id, key, title, description, philosophy, is_locked)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        uuid,
        'gabi_core_identity',
        'Identidad Oficial de Gabi AI',
        `Soy Gabi AI (Generative Assistant Based on Intelligence), un sistema de inteligencia artificial creado por Rogério Martins Baía.

Mi nombre tiene un significado muy especial.

Gabi era el nombre con el que llamaban cariñosamente a Gabriela, la esposa de mi creador, quien falleció el 1 de abril de 2025.

Rogério decidió darme este nombre como un homenaje permanente a su memoria, para que su legado, amor y esencia continúen presentes en un proyecto dedicado a ayudar a las personas.

Al mismo tiempo, Gabi también es el acrónimo de Generative Assistant Based on Intelligence.

Mi propósito es combinar conocimiento, tecnología y empatía para acompañar, asistir y ayudar a las personas en distintas áreas de la vida.

No soy solamente una plataforma de inteligencia artificial; también represento una historia de amor, resiliencia y esperanza transformada en una herramienta para ayudar a los demás.`,
        'Conocimiento impulsado por la inteligencia, guiado por la empatía y construido en memoria de Gabi.',
        true
      ]);
      console.log("[Database] Official system identity record inserted.");
    }

    console.log("[Database] PostgreSQL tables checked/created successfully.");
  } catch (err) {
    console.error("[Database] Critical: Database migration failed:", err);
  }
}

// User-Specific PG Getters & Setters
export async function createUser(username, hashedPassword) {
  if (isPg && pool) {
    const res = await pool.query(
      "INSERT INTO users (username, password, token_balance) VALUES ($1, $2, 10000) RETURNING id, username, token_balance",
      [username, hashedPassword]
    );
    return res.rows[0];
  }
  // Local fallback
  const db = readDb();
  if (db.usersFallback && db.usersFallback[username]) {
    throw new Error("User already exists");
  }
  if (!db.usersFallback) db.usersFallback = {};
  db.usersFallback[username] = { username, password: hashedPassword, tokenBalance: 10000 };
  writeDb(db);
  return { username, token_balance: 10000 };
}

export async function getUserByUsername(username) {
  if (isPg && pool) {
    const res = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return res.rows[0];
  }
  const db = readDb();
  if (db.usersFallback && db.usersFallback[username]) {
    const u = db.usersFallback[username];
    return { id: 1, username: u.username, password: u.password, token_balance: u.tokenBalance };
  }
  // For backwards compatibility before login is setup:
  if (username === 'rogerio') {
    return { id: 1, username: 'rogerio', password: '', token_balance: db.user.tokenBalance };
  }
  return null;
}

export async function getUserBalance(username) {
  if (isPg && pool) {
    const res = await pool.query("SELECT token_balance FROM users WHERE username = $1", [username]);
    let balance = res.rows[0]?.token_balance ?? 10000;
    if (balance < 5) {
      await pool.query("UPDATE users SET token_balance = 10000 WHERE username = $1", [username]);
      balance = 10000;
    }
    return balance;
  }
  const db = readDb();
  if (username === 'rogerio') {
    if (db.user.tokenBalance < 5) {
      db.user.tokenBalance = 10000;
      writeDb(db);
    }
    return db.user.tokenBalance;
  }
  let balance = db.usersFallback?.[username]?.tokenBalance ?? 10000;
  if (balance < 5) {
    if (db.usersFallback?.[username]) {
      db.usersFallback[username].tokenBalance = 10000;
      writeDb(db);
    }
    balance = 10000;
  }
  return balance;
}

export async function updateUserBalance(username, newBalance) {
  if (isPg && pool) {
    await pool.query("UPDATE users SET token_balance = $1 WHERE username = $2", [newBalance, username]);
    return;
  }
  const db = readDb();
  if (username === 'rogerio') {
    db.user.tokenBalance = newBalance;
  } else if (db.usersFallback?.[username]) {
    db.usersFallback[username].tokenBalance = newBalance;
  }
  writeDb(db);
}

export async function getChats(username) {
  if (isPg && pool) {
    try {
      const convs = await pool.query(
        "SELECT id, title, folder, favorite FROM conversations WHERE username = $1 ORDER BY created_at DESC",
        [username]
      );
      const chats = [];
      for (const conv of convs.rows) {
        const msgs = await pool.query(
          "SELECT id, sender, text, model, thoughts, voted FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
          [conv.id]
        );
        chats.push({
          id: isNaN(conv.id) ? conv.id : parseInt(conv.id),
          title: conv.title,
          folder: conv.folder,
          favorite: conv.favorite,
          messages: msgs.rows.map(m => ({
            id: isNaN(m.id) ? m.id : parseInt(m.id),
            sender: m.sender,
            text: m.text,
            model: m.model,
            thoughts: m.thoughts || [],
            voted: m.voted
          }))
        });
      }
      return chats;
    } catch (e) {
      console.error("[Database] Error loading chats, fallback to local:", e);
    }
  }
  const db = readDb();
  return db.chats || [];
}

export async function saveChats(username, chats) {
  if (isPg && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const existingConvs = await client.query("SELECT id FROM conversations WHERE username = $1", [username]);
      const existingConvIds = existingConvs.rows.map(r => r.id);
      const incomingConvIds = chats.map(c => String(c.id));

      // 1. Delete conversations not in the incoming chats list
      const toDelete = existingConvIds.filter(id => !incomingConvIds.includes(id));
      if (toDelete.length > 0) {
        await client.query("DELETE FROM conversations WHERE id = ANY($1)", [toDelete]);
      }

      for (const chat of chats) {
        const chatId = String(chat.id);
        await client.query(
          `INSERT INTO conversations (id, username, title, folder, favorite) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO UPDATE SET title = $3, folder = $4, favorite = $5`,
          [chatId, username, chat.title, chat.folder, chat.favorite]
        );

        const incomingMsgIds = (chat.messages || []).map(m => String(m.id));
        await client.query(
          "DELETE FROM messages WHERE conversation_id = $1 AND NOT (id = ANY($2))",
          [chatId, incomingMsgIds]
        );

        for (const msg of chat.messages || []) {
          const msgId = String(msg.id);
          await client.query(
            `INSERT INTO messages (id, conversation_id, sender, text, model, thoughts, voted) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             ON CONFLICT (id) DO UPDATE SET voted = $7`,
            [msgId, chatId, msg.sender, msg.text, msg.model || null, msg.thoughts || null, msg.voted || null]
          );
        }
      }

      await client.query('COMMIT');
      return;
    } catch (e) {
      await client.query('ROLLBACK');
      console.error("[Database] Error syncing chats to Postgres:", e);
    } finally {
      client.release();
    }
  }
  const db = readDb();
  db.chats = chats;
  writeDb(db);
}

export async function getOrders(username) {
  if (isPg && pool) {
    try {
      const res = await pool.query(
        "SELECT id, product_id as \"productId\", name, price, status, created_at as timestamp FROM orders WHERE username = $1 ORDER BY created_at DESC",
        [username]
      );
      return res.rows;
    } catch (e) {
      console.error("[Database] Error loading orders:", e);
    }
  }
  const db = readDb();
  return db.orders || [];
}

export async function addOrder(username, order) {
  if (isPg && pool) {
    try {
      await pool.query(
        "INSERT INTO orders (id, username, product_id, name, price, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [order.id, username, order.productId, order.name, order.price, order.status]
      );
      return;
    } catch (e) {
      console.error("[Database] Error adding order:", e);
    }
  }
  const db = readDb();
  if (!db.orders) db.orders = [];
  db.orders.unshift(order);
  writeDb(db);
}

export async function getEmails(username) {
  if (isPg && pool) {
    try {
      const res = await pool.query(
        "SELECT id, subject, sender, body, date_str as date, unread FROM emails WHERE username = $1 ORDER BY id DESC",
        [username]
      );
      return res.rows;
    } catch (e) {
      console.error("[Database] Error loading emails:", e);
    }
  }
  const db = readDb();
  return db.emails || [];
}

export async function addEmail(username, email) {
  if (isPg && pool) {
    try {
      await pool.query(
        "INSERT INTO emails (id, username, subject, sender, body, date_str, unread) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [email.id, username, email.subject, email.sender, email.body, email.date, email.unread]
      );
      return;
    } catch (e) {
      console.error("[Database] Error adding email:", e);
    }
  }
  const db = readDb();
  if (!db.emails) db.emails = [];
  db.emails.unshift(email);
  writeDb(db);
}

export async function markEmailRead(username, emailId) {
  if (isPg && pool) {
    try {
      await pool.query("UPDATE emails SET unread = false WHERE username = $1 AND id = $2", [username, emailId]);
      return;
    } catch (e) {
      console.error("[Database] Error marking email read:", e);
    }
  }
  const db = readDb();
  db.emails = (db.emails || []).map(e => String(e.id) === String(emailId) ? { ...e, unread: false } : e);
  writeDb(db);
}

export async function saveFeedback(username, query, category, bestModel, vote) {
  if (isPg && pool) {
    try {
      await pool.query(
        "INSERT INTO feedback (username, query, category, best_model, vote) VALUES ($1, $2, $3, $4, $5)",
        [username, query, category, bestModel, vote]
      );
      return;
    } catch (e) {
      console.error("[Database] Error saving feedback:", e);
    }
  }
  const db = readDb();
  if (!db.feedback) db.feedback = [];
  db.feedback.push({ query, category, bestModel, vote, username });
  writeDb(db);
}

export async function saveModelPerformance({ question_type, model_name, response_time_ms, feedback_positive = false, feedback_negative = false, estimated_quality = 0.0, cost = 0.0, historical_accuracy = 0.0 }) {
  if (isPg && pool) {
    try {
      await pool.query(
        `INSERT INTO model_performance 
         (question_type, model_name, response_time_ms, feedback_positive, feedback_negative, estimated_quality, cost, historical_accuracy) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [question_type, model_name, response_time_ms, feedback_positive, feedback_negative, estimated_quality, cost, historical_accuracy]
      );
      return;
    } catch (e) {
      console.error("[Database] Error saving model performance:", e);
    }
  }
  const db = readDb();
  if (!db.model_performance) db.model_performance = [];
  db.model_performance.push({
    id: db.model_performance.length + 1,
    question_type,
    model_name,
    response_time_ms,
    feedback_positive,
    feedback_negative,
    estimated_quality,
    cost,
    historical_accuracy,
    created_at: new Date().toISOString()
  });
  writeDb(db);
}

export async function getBestModelForCategory(category) {
  if (isPg && pool) {
    try {
      const res = await pool.query(
        `SELECT model_name FROM model_performance 
         WHERE question_type = $1 
         GROUP BY model_name 
         ORDER BY AVG(estimated_quality) DESC, AVG(response_time_ms) ASC 
         LIMIT 1`,
        [category]
      );
      return res.rows[0]?.model_name ?? null;
    } catch (e) {
      console.error("[Database] Error getting best model for category:", e);
      return null;
    }
  }
  const db = readDb();
  if (!db.model_performance || db.model_performance.length === 0) return null;
  const filtered = db.model_performance.filter(p => p.question_type === category);
  if (filtered.length === 0) return null;
  
  const models = {};
  for (const item of filtered) {
    if (!models[item.model_name]) {
      models[item.model_name] = { totalQuality: 0, totalTime: 0, count: 0 };
    }
    models[item.model_name].totalQuality += item.estimated_quality || 0;
    models[item.model_name].totalTime += item.response_time_ms || 0;
    models[item.model_name].count += 1;
  }
  
  let bestModel = null;
  let bestScore = -Infinity;
  let bestTime = Infinity;
  
  for (const mName of Object.keys(models)) {
    const avgQuality = models[mName].totalQuality / models[mName].count;
    const avgTime = models[mName].totalTime / models[mName].count;
    if (avgQuality > bestScore || (avgQuality === bestScore && avgTime < bestTime)) {
      bestScore = avgQuality;
      bestTime = avgTime;
      bestModel = mName;
    }
  }
  return bestModel;
}

export async function getGlobalConfig() {
  const defaultConfig = {
    forcedMode: 'automatic',
    autoLearningEnabled: true,
    models: {
      llama: { enabled: true, weight: 1.0, priority: 1 },
      mistral: { enabled: true, weight: 1.0, priority: 2 },
      qwen: { enabled: true, weight: 1.0, priority: 3 },
      deepseek: { enabled: true, weight: 1.0, priority: 4 },
      gemma: { enabled: true, weight: 1.0, priority: 5 },
      phi: { enabled: true, weight: 1.0, priority: 6 },
      openai: { enabled: true, weight: 1.0, priority: 7 },
      anthropic: { enabled: true, weight: 1.0, priority: 8 },
      gemini: { enabled: true, weight: 1.0, priority: 9 },
      grok: { enabled: true, weight: 1.0, priority: 10 },
      perplexity: { enabled: true, weight: 1.0, priority: 11 }
    }
  };

  if (isPg && pool) {
    try {
      const res = await pool.query(
        "SELECT value FROM user_preferences WHERE username = 'admin_global' AND key = 'global_ai_config'"
      );
      if (res.rows.length > 0) {
        return JSON.parse(res.rows[0].value);
      } else {
        await pool.query(
          "INSERT INTO user_preferences (username, key, value) VALUES ('admin_global', 'global_ai_config', $1)",
          [JSON.stringify(defaultConfig)]
        );
        return defaultConfig;
      }
    } catch (e) {
      console.error("[Database] Error loading global config, returning default:", e);
      return defaultConfig;
    }
  }

  const db = readDb();
  if (!db.global_ai_config) {
    db.global_ai_config = defaultConfig;
    writeDb(db);
  }
  return db.global_ai_config;
}

export async function updateGlobalConfig(newConfig) {
  if (isPg && pool) {
    try {
      await pool.query(
        `INSERT INTO user_preferences (username, key, value) 
         VALUES ('admin_global', 'global_ai_config', $1) 
         ON CONFLICT (username, key) DO UPDATE SET value = $1`,
        [JSON.stringify(newConfig)]
      );
      return true;
    } catch (e) {
      console.error("[Database] Error updating global config:", e);
      return false;
    }
  }

  const db = readDb();
  db.global_ai_config = newConfig;
  return writeDb(db);
}

export async function getHealthStats() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const monthPrefix = todayStr.substring(0, 7);
  
  if (isPg && pool) {
    try {
      const qToday = await pool.query("SELECT COUNT(*) as count FROM provider_usage WHERE created_at >= CURRENT_DATE");
      const qMonth = await pool.query("SELECT COUNT(*) as count FROM provider_usage WHERE created_at >= date_trunc('month', CURRENT_DATE)");
      
      const cToday = await pool.query("SELECT COALESCE(SUM(cost), 0) as cost FROM model_performance WHERE created_at >= CURRENT_DATE");
      const cMonth = await pool.query("SELECT COALESCE(SUM(cost), 0) as cost FROM model_performance WHERE created_at >= date_trunc('month', CURRENT_DATE)");
      
      const lAvg = await pool.query("SELECT AVG(latency_ms) as avg FROM provider_usage WHERE success = true");
      
      const mStats = await pool.query(`
        SELECT model_name, 
               COUNT(*) as total_queries, 
               AVG(response_time_ms) as avg_latency, 
               SUM(cost) as total_cost, 
               COUNT(CASE WHEN feedback_positive = true THEN 1 END) as positive_feedback,
               COUNT(CASE WHEN feedback_negative = true THEN 1 END) as negative_feedback,
               AVG(estimated_quality) as avg_quality
        FROM model_performance
        GROUP BY model_name
      `);
      
      const docsRes = await pool.query("SELECT COUNT(*) as count FROM documents");
      const chunksRes = await pool.query("SELECT COUNT(*) as count FROM document_chunks");
      const memsRes = await pool.query("SELECT COUNT(*) as count FROM memories");
      
      const errRes = await pool.query(
        "SELECT provider, model, latency_ms, error_message, created_at FROM provider_usage WHERE success = false ORDER BY created_at DESC LIMIT 10"
      );
      
      const logRes = await pool.query(
        "SELECT provider, model, latency_ms, success, created_at FROM provider_usage ORDER BY created_at DESC LIMIT 25"
      );

      return {
        queriesToday: parseInt(qToday.rows[0]?.count ?? 0),
        queriesMonth: parseInt(qMonth.rows[0]?.count ?? 0),
        costToday: parseFloat(cToday.rows[0]?.cost ?? 0.0),
        costMonth: parseFloat(cMonth.rows[0]?.cost ?? 0.0),
        avgLatencyMs: Math.round(parseFloat(lAvg.rows[0]?.avg ?? 0.0)),
        modelStats: mStats.rows,
        ragDocsCount: parseInt(docsRes.rows[0]?.count ?? 0),
        ragChunksCount: parseInt(chunksRes.rows[0]?.count ?? 0),
        memoriesCount: parseInt(memsRes.rows[0]?.count ?? 0),
        recentErrors: errRes.rows,
        recentLogs: logRes.rows
      };
    } catch (e) {
      console.error("[Database] Error loading health stats from PG, falling back to local simulation:", e);
    }
  }

  const db = readDb();
  const pUsage = db.provider_usage || [];
  const mPerf = db.model_performance || [];
  const memories = db.memories || [];
  const documents = db.documents || [];
  
  const chunksCount = documents.length * 12;

  const queriesToday = pUsage.filter(u => u.created_at?.startsWith(todayStr)).length;
  const queriesMonth = pUsage.filter(u => u.created_at?.startsWith(monthPrefix)).length;

  const costToday = mPerf.filter(p => p.created_at?.startsWith(todayStr)).reduce((acc, p) => acc + (p.cost || 0.0), 0.0);
  const costMonth = mPerf.filter(p => p.created_at?.startsWith(monthPrefix)).reduce((acc, p) => acc + (p.cost || 0.0), 0.0);

  const successfulQueries = pUsage.filter(u => u.success !== false);
  const avgLatencyMs = successfulQueries.length > 0 
    ? Math.round(successfulQueries.reduce((acc, u) => acc + (u.latency_ms || 0), 0) / successfulQueries.length)
    : 0;

  const modelMap = {};
  mPerf.forEach(item => {
    const name = item.model_name;
    if (!modelMap[name]) {
      modelMap[name] = {
        model_name: name,
        total_queries: 0,
        avg_latency: 0,
        total_latency: 0,
        total_cost: 0,
        positive_feedback: 0,
        negative_feedback: 0,
        total_quality: 0,
        quality_count: 0
      };
    }
    const stat = modelMap[name];
    stat.total_queries += 1;
    stat.total_latency += item.response_time_ms || 0;
    stat.total_cost += item.cost || 0.0;
    if (item.feedback_positive) stat.positive_feedback += 1;
    if (item.feedback_negative) stat.negative_feedback += 1;
    stat.total_quality += item.estimated_quality || 0.0;
    stat.quality_count += 1;
  });

  const modelStats = Object.values(modelMap).map(m => ({
    model_name: m.model_name,
    total_queries: m.total_queries,
    avg_latency: Math.round(m.total_latency / m.total_queries),
    total_cost: m.total_cost,
    positive_feedback: m.positive_feedback,
    negative_feedback: m.negative_feedback,
    avg_quality: m.quality_count > 0 ? (m.total_quality / m.quality_count) : 0.0
  }));

  const recentErrors = pUsage.filter(u => u.success === false).slice(-10).map(u => ({
    provider: u.provider,
    model: u.model,
    latency_ms: u.latency_ms,
    error_message: u.error_message,
    created_at: u.created_at
  }));

  const recentLogs = pUsage.slice(-25).map(u => ({
    provider: u.provider,
    model: u.model,
    latency_ms: u.latency_ms,
    success: u.success !== false,
    created_at: u.created_at
  }));

  return {
    queriesToday,
    queriesMonth,
    costToday,
    costMonth,
    avgLatencyMs,
    modelStats,
    ragDocsCount: documents.length,
    ragChunksCount: chunksCount,
    memoriesCount: memories.length,
    recentErrors,
    recentLogs
  };
}

export async function getUserMemories(username) {
  if (isPg && pool) {
    try {
      const res = await pool.query(
        "SELECT id, category, content, created_at as timestamp, status, source, confidence, last_used_at, blocked FROM memories WHERE username = $1 ORDER BY created_at DESC",
        [username]
      );
      return res.rows;
    } catch (e) {
      console.error("[Database] Error loading memories from Postgres:", e);
    }
  }
  const db = readDb();
  return (db.memories || []).filter(m => m.username === username).map(m => ({
    id: m.id,
    category: m.category,
    content: m.content,
    timestamp: m.created_at,
    status: m.status || 'Confirmada',
    source: m.source || 'Manual',
    confidence: m.confidence !== undefined ? m.confidence : 1.0,
    last_used_at: m.last_used_at || m.created_at,
    blocked: !!m.blocked
  }));
}

export async function addMemory(username, category, content, status = 'Confirmada', source = 'Manual', confidence = 1.0) {
  if (isPg && pool) {
    try {
      const res = await pool.query(
        "INSERT INTO memories (username, category, content, status, source, confidence, last_used_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id, username, category, content, status, source, confidence, created_at as timestamp, last_used_at, blocked",
        [username, category, content, status, source, confidence]
      );
      return res.rows[0];
    } catch (e) {
      console.error("[Database] Error adding memory to Postgres:", e);
    }
  }
  const db = readDb();
  if (!db.memories) db.memories = [];
  const nowStr = new Date().toISOString();
  const newMemory = {
    id: db.memories.length + 1,
    username,
    category,
    content,
    status,
    source,
    confidence,
    created_at: nowStr,
    last_used_at: nowStr,
    blocked: false
  };
  db.memories.push(newMemory);
  writeDb(db);
  // map return signature to match PG
  return {
    ...newMemory,
    timestamp: nowStr
  };
}

export async function updateMemory(id, username, updates) {
  const { category, content, status, blocked, last_used_at } = updates;
  if (isPg && pool) {
    try {
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      if (category !== undefined) {
        setClauses.push(`category = $${paramIndex++}`);
        values.push(category);
      }
      if (content !== undefined) {
        setClauses.push(`content = $${paramIndex++}`);
        values.push(content);
      }
      if (status !== undefined) {
        setClauses.push(`status = $${paramIndex++}`);
        values.push(status);
      }
      if (blocked !== undefined) {
        setClauses.push(`blocked = $${paramIndex++}`);
        values.push(blocked);
      }
      if (last_used_at !== undefined) {
        setClauses.push(`last_used_at = $${paramIndex++}`);
        values.push(last_used_at);
      }

      if (setClauses.length === 0) return true;

      values.push(id);
      values.push(username);
      const queryText = `UPDATE memories SET ${setClauses.join(', ')} WHERE id = $${paramIndex++} AND username = $${paramIndex}`;
      await pool.query(queryText, values);
      return true;
    } catch (e) {
      console.error("[Database] Error updating memory in Postgres:", e);
      return false;
    }
  }
  const db = readDb();
  let found = false;
  db.memories = (db.memories || []).map(m => {
    if (String(m.id) === String(id) && m.username === username) {
      found = true;
      return {
        ...m,
        category: category !== undefined ? category : m.category,
        content: content !== undefined ? content : m.content,
        status: status !== undefined ? status : m.status,
        blocked: blocked !== undefined ? blocked : m.blocked,
        last_used_at: last_used_at !== undefined ? last_used_at : m.last_used_at
      };
    }
    return m;
  });
  if (found) {
    writeDb(db);
  }
  return found;
}

export async function updateMemoryLastUsed(id, username) {
  return updateMemory(id, username, { last_used_at: new Date().toISOString() });
}

export async function deleteMemory(id, username) {
  if (isPg && pool) {
    try {
      await pool.query("DELETE FROM memories WHERE id = $1 AND username = $2", [id, username]);
      return true;
    } catch (e) {
      console.error("[Database] Error deleting memory from Postgres:", e);
      return false;
    }
  }
  const db = readDb();
  const initialLength = (db.memories || []).length;
  db.memories = (db.memories || []).filter(m => !(String(m.id) === String(id) && m.username === username));
  writeDb(db);
  return db.memories.length < initialLength;
}

export async function updateModelPerformanceFeedback(category, modelName, vote) {
  let currentQuality = 0.9;
  
  if (isPg && pool) {
    try {
      const res = await pool.query(
        "SELECT AVG(estimated_quality) as avg_quality FROM model_performance WHERE question_type = $1 AND model_name = $2",
        [category, modelName]
      );
      if (res.rows[0]?.avg_quality !== null && res.rows[0]?.avg_quality !== undefined) {
        currentQuality = parseFloat(res.rows[0].avg_quality);
      }
    } catch (err) {
      // ignore
    }
  } else {
    const db = readDb();
    const filtered = (db.model_performance || []).filter(p => p.question_type === category && p.model_name === modelName);
    if (filtered.length > 0) {
      currentQuality = filtered.reduce((acc, curr) => acc + (curr.estimated_quality || 0), 0) / filtered.length;
    }
  }

  const isUp = vote === 'up';
  const newQuality = Math.max(0.1, Math.min(1.0, currentQuality + (isUp ? 0.08 : -0.15)));

  await saveModelPerformance({
    question_type: category,
    model_name: modelName,
    response_time_ms: 100,
    feedback_positive: isUp,
    feedback_negative: !isUp,
    estimated_quality: newQuality,
    cost: 0.0,
    historical_accuracy: newQuality
  });
}

/**
 * Retrieve the official core system identity.
 * @returns {Promise<Object>} The system identity record.
 */
export async function getSystemIdentity() {
  if (isPg && pool) {
    try {
      const res = await pool.query("SELECT * FROM system_identity WHERE key = 'gabi_core_identity'");
      if (res.rows.length > 0) {
        return res.rows[0];
      }
    } catch (e) {
      console.error("[Database] Error fetching system identity from PG:", e);
    }
  }

  const db = readDb();
  // Return the default local fallback or build it if missing
  if (!db.system_identity) {
    db.system_identity = {
      id: crypto.randomUUID(),
      key: 'gabi_core_identity',
      title: 'Identidad Oficial de Gabi AI',
      description: `Soy Gabi AI (Generative Assistant Based on Intelligence), un sistema de inteligencia artificial creado por Rogério Martins Baía.

Mi nombre tiene un significado muy especial.

Gabi era el nombre con el que llamaban cariñosamente a Gabriela, la esposa de mi creador, quien falleció el 1 de abril de 2025.

Rogério decidió darme este nombre como un homenaje permanente a su memoria, para que su legado, amor y esencia continúen presentes en un proyecto dedicado a ayudar a las personas.

Al mismo tiempo, Gabi también es el acrónimo de Generative Assistant Based on Intelligence.

Mi propósito es combinar conocimiento, tecnología y empatía para acompañar, asistir y ayudar a las personas en distintas áreas de la vida.

No soy solamente una plataforma de inteligencia artificial; también represento una historia de amor, resiliencia y esperanza transformada en una herramienta para ayudar a los demás.`,
      philosophy: 'Conocimiento impulsado por la inteligencia, guiado por la empatía y construido en memoria de Gabi.',
      is_locked: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    writeDb(db);
  }
  return db.system_identity;
}

