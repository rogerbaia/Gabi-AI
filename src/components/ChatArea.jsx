import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  ThumbsDown, 
  Activity,
  Bot,
  User,
  ExternalLink,
  Coins,
  Monitor,
  Maximize2,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Terminal,
  Loader2,
  Minimize2,
  Columns
} from 'lucide-react';
import { playDialUpSound, stopDialUpSound } from '../utils/audio';
import NeuroHubMenu from './NeuroHubMenu';
import confetti from 'canvas-confetti';

export default function ChatArea({
  nostalgicMode,
  tokenBalance,
  setTokenBalance,
  activeChat,
  addMessageToChat,
  selectedModel,
  setSelectedModel,
  addFeedbackToHistory
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [showThinkingDetails, setShowThinkingDetails] = useState(true);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Sandbox (Computadora virtual de Gabi) state
  const [sandboxState, setSandboxState] = useState(() => {
    return localStorage.getItem('synaptica_sandbox_state') || 'minimized';
  });
  const [sandboxLogs, setSandboxLogs] = useState([]);
  const [currentQueryText, setCurrentQueryText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const terminalEndRef = useRef(null);

  // Guardar estado del sandbox
  useEffect(() => {
    localStorage.setItem('synaptica_sandbox_state', sandboxState);
  }, [sandboxState]);

  // Web Speech API recognition setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'es-ES';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
      };
      rec.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };
      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("La transcripción por voz no está soportada en este navegador. Inténtalo en Chrome o Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isThinking]);

  // Auto-scroll simulated terminal
  useEffect(() => {
    if (sandboxState !== 'hidden' && sandboxState !== 'minimized') {
      setTimeout(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [sandboxLogs, sandboxState]);

  // Tasks Checklist for Meta-IA Reasoning (Estilo DeepSeek + Manus)
  const reasoningTasks = [
    "Interpretando consulta e identificando dominios temáticos...",
    "Estableciendo enlaces paralelos con IAs asociadas (Omni-Routing)...",
    "Consultando a OpenAI (GPT-4) - Solicitando estructuración clínica y dosificación...",
    "Consultando a Anthropic (Claude 3) - Generando tono comprensivo y educación del paciente...",
    "Consultando a Perplexity - Buscando papers científicos recientes y citas en JAMA/HEDS...",
    "Analizando respuestas parciales, detectando coincidencias y contradicciones científicas...",
    "Ejecutando motor de Inteligencia Real para ajustar pesos sinápticos...",
    "Compilando y sintetizando respuesta definitiva en formato premium..."
  ];

  // Sincronizar consulta cuando cambia el chat activo
  useEffect(() => {
    if (activeChat && activeChat.messages && activeChat.messages.length > 0) {
      const userMsgs = activeChat.messages.filter(m => m.sender === 'user');
      if (userMsgs.length > 0) {
        const lastUserMsg = userMsgs[userMsgs.length - 1].text;
        setCurrentQueryText(lastUserMsg);
        setThinkingStep(reasoningTasks.length - 1);
        setIsThinking(false);
        setIsPlaying(false);
      } else {
        setCurrentQueryText('');
        setThinkingStep(0);
        setIsThinking(false);
        setIsPlaying(false);
      }
    } else {
      setCurrentQueryText('');
      setThinkingStep(0);
      setIsThinking(false);
      setIsPlaying(false);
    }
  }, [activeChat?.id]);

  // Efecto del temporizador de razonamiento para la simulación
  useEffect(() => {
    let timer;
    if (isThinking && isPlaying) {
      const durationPerStep = nostalgicMode ? 950 : 500;
      timer = setTimeout(() => {
        if (thinkingStep < reasoningTasks.length - 1) {
          setThinkingStep(prev => prev + 1);
        } else {
          setIsThinking(false);
          setIsPlaying(false);
          triggerResponseGeneration();
        }
      }, durationPerStep);
    }
    return () => clearTimeout(timer);
  }, [isThinking, isPlaying, thinkingStep, nostalgicMode]);

  // Generar logs en base al paso actual, la consulta y el modelo
  const getLogsForStep = (step, queryText, model) => {
    if (!queryText) return ['[system] Computadora lista. Esperando consulta...'];
    const querySnippet = queryText.substring(0, 30) + (queryText.length > 30 ? '...' : '');
    const category = model === 'omnia' ? 'general' : model;
    
    const allLogs = [
      [
        "[system] Inicializando sandbox virtual de Gabi AI...",
        "ubuntu@gabi-sandbox:~$ mkdir -p ./search_workspace && cd ./search_workspace"
      ],
      [
        `ubuntu@gabi-sandbox:~/search_workspace$ echo "Query: ${querySnippet}" > query.txt`,
        "ubuntu@gabi-sandbox:~/search_workspace$ python3 -m venv env && source env/bin/activate"
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ # Consultando OpenAI GPT-4 para estructura clínica...",
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ python3 -c \"import openai; print('OpenAI API connection OK')\"",
        "OpenAI: Obteniendo directrices para la consulta..."
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ # Consultando Anthropic Claude para tono y soporte...",
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ curl -s -X POST \"https://api.anthropic.com/v1/messages\" -d \"model=claude-3\" ...",
        "Claude: Generando respuestas estructuradas y guías de interacción."
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ # Buscando papers en Perplexity para citas académicas...",
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ curl -s -X POST \"https://api.perplexity.ai/chat/completions\" ...",
        "Perplexity: Referencias bibliográficas cargadas con éxito."
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ python3 analyze_contradictions.py --inputs=openai,claude,perplexity",
        "Analizador: Buscando contradicciones lógicas en las respuestas de los modelos...",
        "Analizador: Sin discrepancias críticas. Datos consolidados."
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ python3 adjust_synapses.py --category=" + category,
        "[Inteligencia Real] Calibrando pesos neuronales para temática: " + category,
        "[Inteligencia Real] Ajustando peso de modelos en base a feedback histórico..."
      ],
      [
        `(env) ubuntu@gabi-sandbox:~/search_workspace$ python3 merge.py --category=${category} --output=synthesis.md`,
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ cat ./synthesis.md",
        "[system] Tareas finalizadas con éxito. Respuesta definitiva enviada al chat."
      ]
    ];

    let logs = [];
    for (let i = 0; i <= step; i++) {
      if (allLogs[i]) {
        logs = [...logs, ...allLogs[i]];
      }
    }
    return logs;
  };

  // Actualizar logs cuando cambia el paso o la consulta
  useEffect(() => {
    setSandboxLogs(getLogsForStep(thinkingStep, currentQueryText, selectedModel));
  }, [thinkingStep, currentQueryText, selectedModel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (tokenBalance < 5) {
      alert("Necesitas al menos 5 NeuroTokens para realizar una consulta multimodelo. Ve al Mercado de Tokens para ganar o comprar más.");
      return;
    }

    // Deduct tokens
    setTokenBalance(prev => Math.max(0, prev - 5));

    const userMsg = inputText.trim();
    setInputText('');
    
    // Add user message to chat state
    addMessageToChat({
      id: Date.now(),
      sender: 'user',
      text: userMsg
    });

    // Iniciar simulación reactiva controlada por useEffect
    setCurrentQueryText(userMsg);
    setThinkingStep(0);
    setIsThinking(true);
    setIsPlaying(true);
    setShowThinkingDetails(true);

    // Ajustar vista de la computadora a split si estaba minimizada o cerrada
    if (sandboxState === 'hidden' || sandboxState === 'minimized') {
      setSandboxState('split');
    }

    if (nostalgicMode) {
      playDialUpSound();
    }
  };

  const triggerResponseGeneration = () => {
    const userMsg = currentQueryText || "Consulta";
    let aiResponse = "";
    
    if (userMsg.toLowerCase().includes('úlcera') || userMsg.toLowerCase().includes('herpética')) {
      aiResponse = `### Enfoque Terapéutico para Úlcera Corneal Herpética Recurrente

Basado en la consolidación sinérgica de modelos médicos y bases de datos académicas (HEDS, JAMA Ophthalmology):

1. **Tratamiento Activo (Fase Aguda):**
   * **Antivirales Tópicos:** Ganciclovir gel oftálmico 0.15% 5 veces al día (preferido sobre trifluridina por menor toxicidad epitelial).
   * **Antivirales Orales:** Aciclovir 400 mg 5 veces al día (o Valaciclovir 500 mg cada 8 horas) durante 7-10 días para reducir la carga viral.

2. **Profilaxis Prolongada (Prevención de Recurrencias):**
   * **Aciclovir Oral 400 mg cada 12 horas** por 6 a 12 meses.
   * **Evidencia HEDS:** Esta dosificación oral a largo plazo reduce la tasa de recurrencias en un **45%** de manera estadísticamente significativa.

3. **Corticosteroides (Uso Crítico):**
   * **Contraindicados** en presencia de úlcera epitelial activa (queratitis dendrítica).
   * **Indicados únicamente** bajo cobertura antiviral estricta en casos de compromiso estromal inmunológico para mitigar cicatrices corneales.

4. **Aspectos Psicosociales y de Educación (Aporte Claude):**
   * El paciente debe evitar desencadenantes conocidos (estrés emocional, exposición a radiación UV sin lentes de sol, estados de inmunosupresión).
   * Se requiere apego estricto y seguimiento clínico para evaluar adelgazamiento estromal.`;
    } else if (selectedModel === 'viajia') {
      aiResponse = `### Propuesta Consolidada de Viaje (ViajIA engine)

Hemos consultado múltiples agregadores de tarifas hoteleras y de aerolíneas para darte la mejor opción estilo Trivago:

1. **Vuelos Encontrados:**
   * **Opción Económica:** Vuelo directo operado por aerolínea de bajo coste ($180 USD, excelente horario matutino).
   * **Opción Corporativa:** Vuelo tradicional con equipaje incluido ($240 USD).

2. **Alojamiento Recomendado (Coincidencia Semántica 4.8★):**
   * **Hotel Vista Hermosa:** Calificado como el mejor precio/beneficio en 4 plataformas distintas. Tarifa: $85 USD/noche (Incluye desayuno y cancelación gratuita).

3. **Itinerario Sugerido:**
   * **Día 1:** Arribo, check-in, paseo por el centro histórico y cena recomendada por guías locales.
   * **Día 2:** Tour guiado de museos y mirador principal.`;
    } else if (selectedModel === 'nutriia') {
      aiResponse = `### Plan de Nutrición y Bienestar Personalizado (NutriIA)

Comparando guías nutricionales y recomendaciones médicas preventivas:

1. **Estructura Calórica:**
   * Distribución sugerida: 45% carbohidratos complejos, 30% proteínas limpias, 25% grasas saludables.

2. **Recomendaciones de Alimentos:**
   * Incrementar ingesta de espinacas, almendras, salmón and aguacate.
   * Evitar azúcares procesados para optimizar la salud de la microbiota local.

3. **Rutina de Ejercicios:**
   * Cardio moderado (30 mins al día) y entrenamiento de fuerza funcional 3 veces por semana.
   * Consulta al oftalmólogo o médico familiar antes de iniciar levantamientos de carga pesada si tienes antecedentes de presión intraocular elevada.`;
    } else {
      aiResponse = `### Respuesta Consolidada de OmnIA

Hemos combinado los aportes lógicos de GPT-4, la redacción estructurada de Claude, y los datos en tiempo real de Perplexity para responder a: *"**${userMsg}**"*

* **Análisis Inicial:** Identificado como una consulta general. Hemos coordinado las respuestas de 5 modelos de IA distintos para filtrar y compilar los puntos de mayor coincidencia científica y eliminar contradicciones.
* **Solución Compilada:**
  1. La mayoría de los modelos coinciden en estructurar la respuesta con base en prioridades lógicas inmediatas.
  2. Perplexity aporta que las fuentes académicas recientes recomiendan mantener un enfoque holístico del problema.
  3. Claude enfatiza los factores psicosociales y de interacción del usuario con su entorno.
  4. GPT-4 sintetiza el código o la estructura técnica de manera ordenada.
  
*¿Deseas que profundice en algún punto específico o cambie a un cerebro del NeuroHub?*`;
    }

    // Add response to chat state
    addMessageToChat({
      id: Date.now() + 1,
      sender: 'omnia',
      text: aiResponse,
      model: selectedModel,
      wasVoted: false,
      thoughts: reasoningTasks.map((t, i) => `[OK] ${t}`)
    });

    if (nostalgicMode) {
      stopDialUpSound();
    }
  };

  const handleVote = (msgId, voteType) => {
    // Award +5 NTK on positive feedback, simulate learning
    if (voteType === 'up') {
      setTokenBalance(prev => prev + 5);
      confetti({
        particleCount: 80,
        spread: 50,
        colors: ['#10B981', '#39ff14'],
        origin: { y: 0.8 }
      });
      alert("¡Gracias por tu feedback! Tu voto ayuda a calibrar los pesos sinápticos de la Inteligencia Real. Se te han acreditado +5 NeuroTokens.");
    }
    
    // Register item in synaptic map history
    addFeedbackToHistory({
      query: activeChat.messages.find(m => m.sender === 'user')?.text || 'Consulta',
      category: selectedModel === 'omnia' ? 'general' : selectedModel,
      bestModel: selectedModel === 'omnia' ? 'claude' : (selectedModel === 'clinica' ? 'perplexity' : 'deepseek'),
      vote: voteType
    });

    // Mark message as voted in chat
    addMessageToChat({
      id: msgId,
      sender: 'omnia_vote_update',
      vote: voteType
    });
  };

  const handlePlayPause = () => {
    if (isThinking) {
      setIsPlaying(prev => !prev);
      if (nostalgicMode) {
        if (!isPlaying) {
          playDialUpSound();
        } else {
          stopDialUpSound();
        }
      }
    } else {
      // Re-run simulation
      setIsThinking(true);
      setIsPlaying(true);
      setThinkingStep(0);
      if (nostalgicMode) {
        playDialUpSound();
      }
    }
  };

  const renderReducedOverlay = () => {
    return (
      <div className={`w-full rounded-2xl border p-5 shadow-2xl ${
        nostalgicMode 
          ? 'bg-black border-[#39ff14] text-[#39ff14] font-mono' 
          : 'bg-slate-900/95 border-slate-800 backdrop-blur-md text-slate-100'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border ${
              nostalgicMode ? 'border-[#39ff14]' : 'bg-slate-950 border-slate-800 text-emerald-400'
            }`}>
              <Terminal size={14} className={isThinking && isPlaying ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h4 className="text-xs font-bold font-display">La computadora de Gabi</h4>
              <p className="text-[9px] text-slate-500 font-mono">Gabi está usando Terminal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSandboxState('split')}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Acoplar a la derecha"
            >
              <Columns size={12} />
            </button>
            <button
              type="button"
              onClick={() => setSandboxState('minimized')}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Minimizar"
            >
              <ChevronDown size={12} />
            </button>
          </div>
        </div>

        <div className="space-y-3 font-mono text-[11px] leading-relaxed">
          <div className="text-xs font-bold text-slate-400 mb-2">Progreso de la tarea</div>
          <div className="space-y-2">
            {reasoningTasks.map((task, idx) => {
              const isDone = thinkingStep > idx;
              const isActive = thinkingStep === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 transition-all duration-200 ${
                    isDone 
                      ? 'text-emerald-400 font-bold' 
                      : isActive 
                        ? 'text-slate-100 font-bold' 
                        : 'text-slate-500'
                  }`}
                >
                  <span className="flex-shrink-0 mt-0.5">
                    {isDone ? (
                      <span className="inline-block w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-center leading-3 font-bold text-[9px]">✓</span>
                    ) : isActive ? (
                      isThinking && isPlaying ? (
                        <Loader2 size={12} className="animate-spin text-emerald-400" />
                      ) : (
                        <span className="inline-block w-4 h-4 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-center leading-3 font-bold text-[9px]">▶</span>
                      )
                    ) : (
                      <span className="inline-block w-4 h-4 rounded-full bg-transparent text-transparent border border-slate-800 text-center leading-3 font-bold text-[9px]">•</span>
                    )}
                  </span>
                  <span>{task}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isThinking ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
            {isThinking ? (isPlaying ? 'Procesando...' : 'Pausado') : 'Completado'}
          </span>
          <span>{thinkingStep + 1} / 8 tareas</span>
        </div>
      </div>
    );
  };

  const renderTerminalSidebar = () => {
    const isFullscreen = sandboxState === 'fullscreen';
    
    return (
      <div className={`h-full border-l flex flex-col overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'w-full md:w-[70vw] lg:w-[80vw]' : 'w-full md:w-[480px] lg:w-[500px]'
      } ${
        nostalgicMode 
          ? 'bg-black border-[#39ff14] text-[#39ff14]' 
          : 'bg-synaptica-dark border-slate-850'
      }`}>
        <div className={`px-4 py-3 flex items-center justify-between border-b ${
          nostalgicMode ? 'border-[#39ff14]' : 'border-slate-850 bg-slate-900/40'
        }`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`p-1 rounded ${
              nostalgicMode ? 'border border-[#39ff14]' : 'bg-slate-950 text-emerald-400'
            }`}>
              <Terminal size={12} />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold truncate">Ordenador de Gabi</h3>
              <p className="text-[9px] text-slate-500 font-mono truncate">
                {isThinking ? 'Ejecutando proceso de razonamiento...' : 'Computadora lista - Conexión SSH'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSandboxState('reduced')}
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Convertir en panel flotante"
            >
              <Monitor size={12} />
            </button>
            <button
              type="button"
              onClick={() => setSandboxState(isFullscreen ? 'split' : 'fullscreen')}
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isFullscreen ? "Restaurar tamaño lateral" : "Expandir a pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Columns size={12} />}
            </button>
            <button
              type="button"
              onClick={() => setSandboxState('minimized')}
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Minimizar panel"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-black font-mono text-[11px] leading-relaxed space-y-2">
          {sandboxLogs.map((log, idx) => {
            const isSystem = log.startsWith('[system]');
            const isUserCommand = log.includes('ubuntu@gabi-sandbox:~$') || log.includes('ubuntu@gabi-sandbox:~/search_workspace$') || log.includes('(env) ubuntu@gabi-sandbox:');
            
            let logColor = nostalgicMode ? 'text-[#39ff14]' : 'text-slate-300';
            if (isSystem) {
              logColor = 'text-emerald-500 font-bold';
            } else if (isUserCommand) {
              logColor = 'text-white font-bold';
            } else if (log.startsWith('OpenAI:') || log.startsWith('Claude:') || log.startsWith('Perplexity:') || log.startsWith('Analizador:')) {
              logColor = 'text-sky-400';
            } else if (log.startsWith('[Inteligencia Real]')) {
              logColor = 'text-amber-400';
            }
            
            return (
              <div key={idx} className={`${logColor} whitespace-pre-wrap`}>
                {log}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>

        <div className={`p-3 border-t flex flex-col gap-2 ${
          nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-850 bg-slate-950'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <input
              type="range"
              min="0"
              max={reasoningTasks.length - 1}
              value={thinkingStep}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setThinkingStep(val);
                setIsPlaying(false);
                if (isThinking && nostalgicMode) {
                  stopDialUpSound();
                }
              }}
              className="flex-1 accent-emerald-500 h-1 rounded bg-slate-800 cursor-pointer"
            />
            
            <div className="flex items-center gap-1.5 text-[9px] font-mono select-none flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${
                isPlaying && isThinking 
                  ? 'bg-emerald-500 animate-ping' 
                  : 'bg-red-500'
              }`} />
              <span className={isPlaying && isThinking ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {isPlaying && isThinking ? 'EN VIVO' : 'PAUSADO'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={thinkingStep === 0}
                onClick={() => {
                  setThinkingStep(prev => Math.max(0, prev - 1));
                  setIsPlaying(false);
                  if (nostalgicMode) stopDialUpSound();
                }}
                className={`p-1.5 rounded hover:bg-slate-800/80 transition-colors disabled:opacity-30 ${
                  nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Paso Anterior"
              >
                <SkipBack size={12} />
              </button>
              
              <button
                type="button"
                onClick={handlePlayPause}
                className={`p-1.5 rounded hover:bg-slate-800/80 transition-colors ${
                  nostalgicMode ? 'text-[#39ff14]' : 'text-slate-200 hover:text-white'
                }`}
                title={isPlaying && isThinking ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying && isThinking ? <Pause size={12} /> : <Play size={12} />}
              </button>

              <button
                type="button"
                disabled={thinkingStep === reasoningTasks.length - 1}
                onClick={() => {
                  setThinkingStep(prev => Math.min(reasoningTasks.length - 1, prev + 1));
                  setIsPlaying(false);
                  if (nostalgicMode) stopDialUpSound();
                }}
                className={`p-1.5 rounded hover:bg-slate-800/80 transition-colors disabled:opacity-30 ${
                  nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Paso Siguiente"
              >
                <SkipForward size={12} />
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono text-right max-w-[70%] truncate">
              {reasoningTasks[thinkingStep]}
            </div>
          </div>
        </div>

        <div className={`px-4 py-2 text-[10px] font-mono flex items-center justify-between border-t select-none ${
          nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-850 bg-slate-900/60'
        }`}>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
            <span>✓</span>
            <span className="truncate">
              {thinkingStep === reasoningTasks.length - 1 ? 'Entregar resultados finales' : reasoningTasks[thinkingStep]}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>{thinkingStep + 1}/{reasoningTasks.length}</span>
            <ChevronUp size={10} className="opacity-60" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden">
      {/* Chat Pane (Left) */}
      <div className={`relative flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
        sandboxState === 'fullscreen' ? 'hidden md:flex md:max-w-[20%]' : 'w-full'
      } ${
        nostalgicMode ? 'nostalgic-crt text-[#39ff14]' : 'bg-slate-950'
      }`}>
        {/* Top Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              nostalgicMode ? 'border-[#39ff14]' : 'bg-slate-900 border-slate-800 text-emerald-400'
            }`}>
              <BrainCircuit size={18} className={nostalgicMode ? 'text-[#39ff14]' : 'animate-pulse'} />
            </div>
            <div>
              <h2 className={`text-sm font-bold ${nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'}`}>
                Gabi AI
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">
                By Synaptica | {selectedModel.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Terminal Trigger Toggle button */}
            <button
              type="button"
              onClick={() => setSandboxState(prev => prev === 'minimized' ? 'split' : 'minimized')}
              className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all duration-300 ${
                nostalgicMode
                  ? 'border-[#39ff14] hover:bg-[#39ff14]/15 text-[#39ff14]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title="Abrir/Cerrar computadora virtual"
            >
              <Terminal size={14} className={isThinking ? 'animate-pulse text-emerald-400' : ''} />
              <span className="hidden sm:inline">Computadora</span>
            </button>

            <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
              nostalgicMode ? 'border border-[#39ff14] text-[#39ff14]' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
            }`}>
              <Activity size={10} className="animate-ping" />
              ONLINE
            </span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeChat?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto space-y-4">
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${
                nostalgicMode ? 'border-[#39ff14]' : 'bg-slate-900 border-slate-800 text-emerald-400'
              }`}>
                <BrainCircuit size={32} />
              </div>
              <div className="space-y-1">
                <h3 className={`text-lg font-bold font-display ${nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-200'}`}>
                  Pregunta a Gabi AI
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Escribe tu consulta y observa el proceso de razonamiento en tiempo real. Gabi AI consultará a 5 IAs distintas para darte la mejor síntesis filtrada.
                </p>
              </div>
              {/* Try simulated medical query */}
              <div className="flex gap-2 flex-wrap justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputText('¿Cuál es el mejor enfoque terapéutico para una úlcera corneal herpética recurrente?');
                  }}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all ${
                    nostalgicMode
                      ? 'border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/10 font-mono'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Simular Caso Clínico (Úlcera Corneal) 🩺
                </button>
              </div>
            </div>
          ) : (
            activeChat?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg border flex-shrink-0 flex items-center justify-center ${
                  msg.sender === 'user'
                    ? nostalgicMode ? 'border-[#39ff14]' : 'bg-slate-800 border-slate-700 text-slate-300'
                    : nostalgicMode ? 'border-[#39ff14] bg-black text-[#39ff14]' : 'bg-emerald-950 border-emerald-900/40 text-emerald-400'
                }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble Body */}
                <div className="space-y-3 flex-1 overflow-hidden">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                    msg.sender === 'user'
                      ? nostalgicMode
                        ? 'bg-black border-[#39ff14] text-[#39ff14]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-100'
                      : nostalgicMode
                        ? 'bg-black border-[#39ff14] text-[#39ff14]'
                        : 'bg-slate-900/30 border-slate-850/70 text-slate-200 backdrop-blur-sm'
                  }`}>
                    {/* Markdown simulator (simple parsing for titles/bullets) */}
                    <div className="space-y-3">
                      {msg.text.split('\n').map((line, idx) => {
                        if (line.startsWith('### ')) {
                          return <h4 key={idx} className="font-bold font-display text-base text-slate-100 mt-2">{line.replace('### ', '')}</h4>;
                        }
                        if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                          return <div key={idx} className="font-bold text-slate-200 mt-1">{line}</div>;
                        }
                        if (line.startsWith('   * ') || line.startsWith(' * ') || line.startsWith('o ') || line.startsWith('• ')) {
                          return <div key={idx} className="pl-5 text-slate-400 flex items-start gap-1.5"><span className="text-emerald-400">•</span><span>{line.replace(/^(\s*\*\s*|\s*o\s*|\s*•\s*)/, '')}</span></div>;
                        }
                        return <p key={idx} className="text-xs text-slate-300 font-sans leading-relaxed">{line}</p>;
                      })}
                    </div>
                  </div>

                  {/* Rating & Action buttons for AI messages */}
                  {msg.sender === 'omnia' && (
                    <div className="flex items-center gap-3 text-xs pl-2">
                      <span className="text-[10px] text-slate-500 font-mono">¿Te sirvió la síntesis?</span>
                      <button
                        type="button"
                        disabled={msg.voted}
                        onClick={() => handleVote(msg.id, 'up')}
                        className={`flex items-center gap-1 py-0.5 px-2 rounded hover:bg-slate-800 transition-colors ${
                          msg.voted === 'up' 
                            ? 'text-emerald-400 font-bold bg-emerald-950/20' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <ThumbsUp size={12} />
                        <span>Útil (+5 NTK)</span>
                      </button>
                      <button
                        type="button"
                        disabled={msg.voted}
                        onClick={() => handleVote(msg.id, 'down')}
                        className={`flex items-center gap-1 py-0.5 px-2 rounded hover:bg-slate-800 transition-colors ${
                          msg.voted === 'down' 
                            ? 'text-rose-400 font-bold bg-rose-950/20' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <ThumbsDown size={12} />
                        <span>Impreciso</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Simple step display inside messages area if terminal is closed */}
          {isThinking && (sandboxState === 'hidden' || sandboxState === 'minimized') && (
            <div className="flex gap-4 max-w-3xl">
              <div className={`w-8 h-8 rounded-lg border flex-shrink-0 flex items-center justify-center ${
                nostalgicMode ? 'border-[#39ff14] bg-black text-[#39ff14]' : 'bg-emerald-950 border-emerald-900/40 text-emerald-400 animate-pulse'
              }`}>
                <BrainCircuit size={16} />
              </div>
              <div className="flex-1 space-y-2">
                <div className={`p-4 rounded-2xl border ${
                  nostalgicMode 
                    ? 'bg-black border-[#39ff14] text-[#39ff14] font-mono' 
                    : 'bg-slate-900/35 border-slate-850/80 backdrop-blur-md text-slate-300'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold mb-2">
                    <Loader2 size={12} className="animate-spin text-emerald-400" />
                    <span>Pensando... ({thinkingStep + 1}/8)</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {reasoningTasks[thinkingStep]}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Minimized Terminal Badge and Input Box stacked in two separate containers */}
        <div className={`p-4 border-t ${
          nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-950/20'
        }`}>
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            
            {/* Box 1: Minimized Terminal Badge (AI brain) */}
            {sandboxState === 'minimized' && currentQueryText && (
              <button
                type="button"
                onClick={() => setSandboxState('split')}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-mono transition-all duration-300 rounded-2xl border ${
                  nostalgicMode
                    ? 'border-[#39ff14] bg-black text-[#39ff14] hover:bg-[#39ff14]/10 focus:outline-none focus:ring-1 focus:ring-[#39ff14]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-350 hover:bg-slate-900/90 hover:border-slate-700 focus:outline-none focus:border-slate-700'
                }`}
              >
                {/* Left: Checkmark status and details */}
                <div className="flex items-center gap-3 truncate">
                  <div className="flex-shrink-0">
                    {isThinking ? (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                        <Loader2 size={10} className="animate-spin" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-center leading-3 font-bold text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  <div className="text-left truncate">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="truncate">
                        {isThinking ? "Pensando en tiempo real..." : "Cerebro de la computadora"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-[400px]">
                      {isThinking ? reasoningTasks[thinkingStep] : "Entregar resultados finales"}
                    </div>
                  </div>
                </div>

                {/* Right: Progress ratio and terminal thumbnail */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-bold ${isThinking ? 'animate-pulse text-emerald-400' : 'text-emerald-500'}`}>
                    {isThinking ? `${thinkingStep + 1}/8` : '8/8'}
                  </span>
                  
                  {/* Terminal screen thumbnail - RIGHT ALIGNED */}
                  <div className={`w-10 h-7 rounded border flex flex-col justify-between overflow-hidden bg-black text-[6px] p-0.5 flex-shrink-0 ${
                    nostalgicMode ? 'border-[#39ff14] text-[#39ff14]' : 'border-slate-800 text-emerald-500'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-900 pb-[0.5px] px-[2px] opacity-60">
                      <span className="scale-75 origin-left">gabi-sh</span>
                      <span className="w-1 h-1 rounded-full bg-emerald-400 scale-75 animate-pulse" />
                    </div>
                    <div className="flex-1 font-mono leading-[5px] scale-[0.7] origin-top-left pt-0.5 px-[2px] opacity-80">
                      <div>$ python</div>
                      <div className="text-slate-500">ir_weights..</div>
                    </div>
                  </div>
                  
                  <ChevronUp size={12} className="text-slate-500" />
                </div>
              </button>
            )}

            {/* Box 2: Dialogue input form */}
            <form onSubmit={handleSendMessage} className="w-full">
              <div className={`rounded-2xl border flex flex-col overflow-hidden transition-all ${
                nostalgicMode
                  ? 'border-[#39ff14] bg-black focus-within:ring-2 focus-within:ring-[#39ff14]'
                  : 'border-slate-800 bg-slate-900/60 focus-within:border-slate-700 focus-within:bg-slate-900/90'
              }`}>
                {/* Main Input Textarea and Actions */}
                <div className="p-3 flex flex-col gap-2">
                  {/* Top Row: Textarea and Actions */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={selectedModel === 'omnia' ? 'Habla con Gabi AI (IA Multimodelo)...' : `Consulta a ${selectedModel.toUpperCase()}...`}
                        rows={1}
                        className="w-full bg-transparent border-0 outline-none text-sm text-slate-100 placeholder-slate-500 resize-none max-h-40 px-2 py-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>
                    
                    {/* Input action items */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800/50 flex-shrink-0">
                      {/* Voice microphone button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2 rounded-xl transition-all ${
                          isListening
                            ? 'bg-rose-500 text-slate-950 animate-pulse'
                            : nostalgicMode
                              ? 'text-[#39ff14] hover:bg-[#39ff14]/15'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                        title={isListening ? "Detener grabación de voz" : "Dictar consulta con micrófono"}
                      >
                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>

                      <button
                        type="submit"
                        className={`p-2 rounded-xl transition-all ${
                          nostalgicMode
                            ? 'retro-button border border-[#39ff14] text-[#39ff14]'
                            : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
                        }`}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Specialization selection and balance info (No border-t divider) */}
                  <div className="flex items-center justify-between pt-2.5 mt-1 text-xs">
                    <NeuroHubMenu
                      selectedModel={selectedModel}
                      setSelectedModel={setSelectedModel}
                      isOpen={modelSelectorOpen}
                      setIsOpen={setModelSelectorOpen}
                      nostalgicMode={nostalgicMode}
                    />

                    <span className="text-[10px] text-slate-500 font-mono">
                      Consumo: <strong>5 NTK</strong> | Saldo: <strong className={nostalgicMode ? 'text-[#39ff14]' : 'text-emerald-400'}>{tokenBalance} NTK</strong>
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Floating Reduced Overlay Panel (Rendered absolutely inside the relative Chat area) */}
        {sandboxState === 'reduced' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {renderReducedOverlay()}
            </div>
          </div>
        )}
      </div>

      {/* Split/Fullscreen Sidebar Panel (Right) */}
      {(sandboxState === 'split' || sandboxState === 'fullscreen') && renderTerminalSidebar()}
    </div>
  );
}
