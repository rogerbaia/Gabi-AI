import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.json');

const DEFAULT_DATA = {
  user: {
    tokenBalance: 120,
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

// Initialize DB file if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
}

export function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading database file, resetting to default:", err);
    return DEFAULT_DATA;
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}
