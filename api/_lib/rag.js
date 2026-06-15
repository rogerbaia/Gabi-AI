import { createRequire } from 'module';

// Polyfill for DOMMatrix in Node.js environment to prevent unpdf failures
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
    static fromMatrix() { return new DOMMatrix(); }
    translate() { return this; }
    scale() { return this; }
    multiply() { return this; }
    transformPoint(p) { return p; }
  };
}

const require = createRequire(import.meta.url);
const mammoth = require('mammoth');
import { getDocumentProxy, extractText } from 'unpdf';
import { convert } from 'html-to-text';
import dotenv from 'dotenv';
import { query as dbQuery } from './db.js';
import { getOllamaBaseUrl, getOllamaHeaders } from './providers/helper.js';

dotenv.config();

/**
 * Fallback function to extract plain text from PDF buffer using basic Regex pattern matching.
 * Used if unpdf fails or is unsupported.
 * @param {Buffer} buffer - Raw PDF bytes
 * @returns {string} Extracted text representation
 */
function extractRawTextFromPdfBufferFallback(buffer) {
  try {
    const str = buffer.toString('binary');
    // In PDF, text blocks are usually enclosed in parentheses and followed by Tj or TJ operators
    const matches = str.match(/\(([^)]+)\)\s*(Tj|TJ)/g) || [];
    let text = matches
      .map(m => {
        const content = m.match(/\(([^)]+)\)/);
        return content ? content[1] : '';
      })
      .join(' ')
      // Decode octal escape sequences (e.g. \361 -> ñ)
      .replace(/\\([0-7]{3})/g, (m, octal) => String.fromCharCode(parseInt(octal, 8)))
      // Decode general escapes (e.g. \(, \))
      .replace(/\\(.)/g, '$1');

    if (text.trim().length > 10) {
      console.log("[RAG] Texto recuperado exitosamente usando fallback de PDF Regex.");
      return text;
    }

    // Secondary fallback: filter printable ASCII characters
    console.log("[RAG] Fallback Regex insuficiente. Utilizando fallback secundario de caracteres imprimibles.");
    return str
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (e) {
    console.error("[RAG Fallback] Error en extractor alternativo de PDF:", e);
    return "";
  }
}

/**
 * Extract plain text from a file buffer based on mimetype
 * @param {Buffer} buffer - Raw file buffer
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} Plain text content of the document
 */
export async function extractTextFromBuffer(buffer, mimeType) {
  const type = mimeType.toLowerCase();

  if (type.includes('pdf')) {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text || "";
    } catch (err) {
      console.warn("[RAG] unpdf falló. Ejecutando extractor de respaldo (fallback)...", err.message);
      return extractRawTextFromPdfBufferFallback(buffer);
    }
  } 

  
  if (type.includes('wordprocessingml') || type.includes('docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } 
  
  if (type.includes('html')) {
    const htmlString = buffer.toString('utf-8');
    return convert(htmlString, { wordwrap: 130 }) || "";
  } 
  
  // Default to text (TXT, Markdown, etc.)
  return buffer.toString('utf-8');
}

/**
 * Split text into semantic overlapping chunks
 * @param {string} text - Raw document text
 * @param {number} chunkSize - Number of characters per chunk
 * @param {number} chunkOverlap - Overlap size
 * @returns {Array<string>} List of text chunks
 */
export function chunkText(text, chunkSize = 800, chunkOverlap = 150) {
  if (!text) return [];
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    // Attempt to split at a word boundary if not at the end
    if (endIndex < text.length) {
      const nextSpace = text.indexOf(' ', endIndex);
      if (nextSpace !== -1 && nextSpace - endIndex < 50) {
        endIndex = nextSpace;
      }
    }

    chunks.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex - chunkOverlap;

    // Prevent infinite loops if overlap equals or exceeds chunk size
    if (chunkOverlap >= chunkSize) {
      startIndex = endIndex;
    }
  }

  return chunks.filter(c => c.length > 10);
}

/**
 * Query OpenAI to generate embedding vector (1536 dimensions)
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Generated embedding array
 */
export async function generateEmbedding(text) {
  let embedding = null;

  // 1. Try local Ollama embedding first
  const baseUrl = getOllamaBaseUrl();
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/api/embeddings`, {
        method: "POST",
        headers: getOllamaHeaders(),
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: text
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.embedding && Array.isArray(data.embedding)) {
          embedding = data.embedding;
          console.log(`[RAG] Generado embedding local usando nomic-embed-text (${embedding.length} dims).`);
        }
      }
    } catch (err) {
      console.log("[RAG] Ollama local embedding not available or failed. Falling back to OpenAI...", err.message);
    }
  } else {
    console.log("[RAG] Ollama local/tunnel not configured or disabled in Vercel. Falling back to OpenAI...");
  }

  // 2. Fallback to OpenAI if local fails or is empty
  if (!embedding) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Ollama local está desconectado y no se configuró OPENAI_API_KEY para fallback de embeddings.");
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: text.replace(/\n/g, " "),
        model: "text-embedding-3-small"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Embedding API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    embedding = data.data[0].embedding;
    console.log(`[RAG] Generado embedding en la nube usando OpenAI (${embedding.length} dims).`);
  }

  // 3. Dimensional constraint wrapper (Pad or truncate to exactly 1536 dimensions for pgvector)
  const targetDimension = 1536;
  if (embedding.length < targetDimension) {
    const padded = new Array(targetDimension).fill(0.0);
    for (let i = 0; i < embedding.length; i++) {
      padded[i] = embedding[i];
    }
    return padded;
  } else if (embedding.length > targetDimension) {
    return embedding.slice(0, targetDimension);
  }

  return embedding;
}

/**
 * Calculate Cosine Similarity in JavaScript (for database fallback)
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Ingest document into Postgres: Parse, chunk, embed, and save
 * @param {string} name - Filename
 * @param {string} type - File MIME type
 * @param {Buffer} buffer - Raw file bytes
 */
export async function ingestDocument(name, type, buffer) {
  const text = await extractTextFromBuffer(buffer, type);
  if (!text.trim()) {
    throw new Error("El documento no contiene texto legible.");
  }

  // 1. Save document header
  const docResult = await dbQuery(
    "INSERT INTO documents (name, type, content) VALUES ($1, $2, $3) RETURNING id",
    [name, type, text]
  );
  const docId = docResult.rows[0].id;

  // 2. Chunk text
  const chunks = chunkText(text);
  console.log(`[RAG] Split "${name}" into ${chunks.length} chunks.`);

  // 3. Check vector column type to see if pgvector is active
  const colQuery = await dbQuery(
    "SELECT data_type FROM information_schema.columns WHERE table_name = 'document_chunks' AND column_name = 'embedding';"
  );
  const isVectorType = colQuery.rows[0]?.data_type === 'USER-DEFINED';

  // 4. Generate embeddings and save each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunkTextStr = chunks[i];
    const embedding = await generateEmbedding(chunkTextStr);

    if (isVectorType) {
      // Format as postgres vector format: '[0.1, 0.2, ...]'
      const vecString = `[${embedding.join(',')}]`;
      await dbQuery(
        "INSERT INTO document_chunks (document_id, chunk_index, text, embedding) VALUES ($1, $2, $3, $4)",
        [docId, i, chunkTextStr, vecString]
      );
    } else {
      // Fallback to text stringified JSON
      const jsonString = JSON.stringify(embedding);
      await dbQuery(
        "INSERT INTO document_chunks (document_id, chunk_index, text, embedding) VALUES ($1, $2, $3, $4)",
        [docId, i, chunkTextStr, jsonString]
      );
    }
  }

  return { success: true, docId, chunksCount: chunks.length };
}

/**
 * Query RAG system: search matching chunks and return consolidated context string
 * @param {string} userQuery - The question/query text
 * @param {number} limit - Maximum number of chunks to return
 * @returns {Promise<Array<Object>>} Chunks with source details
 */
export async function queryRAG(userQuery, limit = 4) {
  try {
    const queryVector = await generateEmbedding(userQuery);

    // Check if pgvector is active
    const colQuery = await dbQuery(
      "SELECT data_type FROM information_schema.columns WHERE table_name = 'document_chunks' AND column_name = 'embedding';"
    );
    const isVectorType = colQuery.rows[0]?.data_type === 'USER-DEFINED';

    if (isVectorType) {
      // Native pgvector cosine similarity (<=> represents cosine distance)
      const vecString = `[${queryVector.join(',')}]`;
      const res = await dbQuery(
        `SELECT dc.text, d.name as source_doc, (dc.embedding <=> $1) as distance 
         FROM document_chunks dc
         JOIN documents d ON dc.document_id = d.id
         ORDER BY distance ASC
         LIMIT $2`,
        [vecString, limit]
      );
      
      return res.rows.map(row => ({
        text: row.text,
        source: row.source_doc,
        similarity: 1 - row.distance
      }));
    } else {
      // JavaScript fallback cosine similarity
      const res = await dbQuery(
        `SELECT dc.text, dc.embedding, d.name as source_doc 
         FROM document_chunks dc
         JOIN documents d ON dc.document_id = d.id`
      );

      const scoredChunks = res.rows.map(row => {
        let chunkVector;
        try {
          chunkVector = JSON.parse(row.embedding);
        } catch (e) {
          chunkVector = [];
        }

        const similarity = cosineSimilarity(queryVector, chunkVector);
        return {
          text: row.text,
          source: row.source_doc,
          similarity
        };
      });

      // Sort by similarity descending and slice
      return scoredChunks
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    }
  } catch (err) {
    console.error("[RAG] RAG Query failed:", err.message);
    return []; // Return empty context on failure
  }
}
