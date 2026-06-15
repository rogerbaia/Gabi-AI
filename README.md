# Synaptica Gabi AI - Production Platform

Gabi AI (**Generative Assistance Based on Intelligence**) es una plataforma cognitiva unificada que funciona como un orquestador inteligente multimodelo estilo "Trivago" para inteligencias artificiales. 

Esta versión cuenta con un backend seguro (sin credenciales expuestas al cliente), soporte para base de datos relacional PostgreSQL/Supabase, indexación de documentos para búsqueda semántica local (RAG) y autenticación de usuarios por JWT.

---

## Módulos Principales (NeuroHub)
1. **OmnIA:** Orquestador principal. Realiza búsquedas paralelas en proveedores activos (OpenAI, Claude, DeepSeek, etc.) y genera una respuesta consolidada detectando contradicciones.
2. **Gabi Travel:** Especializado en itinerarios, vuelos y clima (sin respuestas simuladas, se bloquea si las APIs no están provistas).
3. **Gabi Financial:** Acciones, criptomonedas y análisis de mercado (incluye descargo de responsabilidad legal).
4. **Gabi Medical:** Protocolos y asistencia clínica (incluye advertencia médica).
5. **Gabi Research:** Búsqueda web profunda y comparación de fuentes con citas académicas estructuradas.

---

## Requisitos de Instalación (Windows)

1. **Node.js:** Asegúrate de tener Node.js instalado (Versión 18 o superior recomendada).
2. **Base de Datos:** Requiere una base de datos PostgreSQL activa (puede ser una instancia local de PostgreSQL o un proyecto en la nube como **Supabase** o **Neon**).

---

## Configuración del Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env.example`:

```env
PORT=3001
DATABASE_URL=postgresql://tu_usuario:tu_contraseña@tu_host:5432/tu_base_de_datos
JWT_SECRET=escribe_una_clave_secreta_segura_aqui

# Proveedores de IA (Ingresa las llaves que desees activar)
OPENAI_API_KEY=tu_openai_key
ANTHROPIC_API_KEY=tu_anthropic_key
PERPLEXITY_API_KEY=tu_perplexity_key
DEEPSEEK_API_KEY=tu_deepseek_key
GEMINI_API_KEY=tu_gemini_key
GROK_API_KEY=tu_grok_key
MISTRAL_API_KEY=tu_mistral_key
QWEN_API_KEY=tu_qwen_key

# Configuración personalizada de LLama (Opcional)
LLAMA_PROVIDER=https://api.groq.com/openai/v1
LLAMA_MODEL=llama3-8b
LLAMA_API_KEY=tu_groq_key
```

*Nota: La base de datos creará las tablas automáticamente al iniciar el servidor por primera vez.*

---

## Instrucciones para Ejecutar Localmente

1. **Instalar Dependencias:**
   Abre una terminal (PowerShell o CMD) en el directorio del proyecto y ejecuta:
   ```bash
   npm install
   ```

2. **Iniciar Entorno de Desarrollo (Vite + Express):**
   ```bash
   npm run dev
   ```
   Esto levantará concurrentemente el frontend en `http://localhost:5173` y el backend en `http://localhost:3001`.

---

## Verificación y Pruebas del Backend

Para validar que la base de datos, el parser RAG y el Omni-Routing funcionan correctamente, ejecuta:
```bash
node api/test_backend.js
```

Para validar el sistema de aprendizaje autónomo, la memoria a largo plazo, el bucle de feedback activo y el empaquetador de embeddings locales, ejecuta:
```bash
node api/test_learning.js
```

---

## Instalador Automatizado de IA Local (Ollama)

Cuando migres el proyecto a tu PC principal con hardware dedicado (Windows 11, Ryzen 7, RTX 3060 12GB), puedes configurar todo el entorno local automáticamente.

Abre una terminal en el directorio del proyecto y ejecuta:
```bash
node api/setup_local_ai.js
```

**Este script automatizará:**
1. **Diagnóstico de Hardware:** Detección de CPU, hilos de ejecución, memoria RAM total y tarjeta gráfica NVIDIA (VRAM dedicada).
2. **Instalador de Ollama:** Comprobación del servicio. Si no existe, descarga y ejecuta el instalador oficial de Ollama para Windows (`OllamaSetup.exe`).
3. **Descarga de Modelos recomendados para RTX 3060 12GB:** Descarga secuencial de modelos optimizados (Llama 3.1 8B, DeepSeek R1 8B, Qwen 2.5 Coder 7B, Gemma 2 9B, Phi 3.5, Mistral y el modelo de embeddings locales `nomic-embed-text`).
4. **Verificación de Inferencia:** Ejecución de pruebas de generación completas offline para asegurar el correcto funcionamiento sin APIs.

---

## Sistema de Memoria y RAG (Generación Recuperada por Contexto)

* **Subida de Archivos:** En la caja de chat, haz clic en el icono del **Clip (Paperclip)** para cargar archivos (.pdf, .docx, .txt, .md, .html).
* **Indexación y Embeddings Híbridos (Local/Cloud):** El backend divide el texto en fragmentos con solapamiento y genera los vectores. Si tienes Ollama activo con `nomic-embed-text`, la indexación y consultas se realizan de forma **100% local e independiente de internet**. Si Ollama no está disponible, se realiza un fallback a OpenAI (`text-embedding-3-small`). Los vectores de diferente dimensión se ajustan (zero-padded) automáticamente a 1536 dimensiones para mantener compatibilidad total con `pgvector` en PostgreSQL.
* **Respuesta Inteligente:** Cuando hagas preguntas relacionadas con tus archivos, Gabi AI recuperará automáticamente los fragmentos más similares e inyectará el contexto con citas exactas del documento fuente.
