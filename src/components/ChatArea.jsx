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
  Columns,
  Paperclip,
  Menu
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
  addFeedbackToHistory,
  token,
  onOpenSettings,
  onOpenMenu
}) {
  const [inputText, setInputText] = useState('');

  // Verified Memory state & helpers
  const [pendingMemories, setPendingMemories] = useState([]);

  const fetchPendingMemories = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/memories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const pending = (data || []).filter(m => m.status === 'Pendiente de Confirmación' && !m.blocked);
        setPendingMemories(pending);
      }
    } catch (err) {
      console.error("Error fetching pending memories in ChatArea:", err);
    }
  };

  const handleConfirmAllPending = async () => {
    try {
      await Promise.all(pendingMemories.map(mem => 
        fetch(`/api/memories/${mem.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Confirmada' })
        })
      ));
      setPendingMemories([]);
      alert("¡Todas las preferencias detectadas han sido guardadas con éxito!");
    } catch (err) {
      console.error("Error confirming all pending memories:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingMemories();
    }
  }, [token]);
  
  // Hybrid Routing addition
  const [selectedMode, setSelectedMode] = useState('automatic');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [localModelsList, setLocalModelsList] = useState([]);
  const [availableLocalProvidersList, setAvailableLocalProvidersList] = useState([]);

  useEffect(() => {
    async function detectProviders() {
      try {
        const res = await fetch('/api/providers/detect', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setIsOfflineMode(data.offlineMode);
          setLocalModelsList(data.localModels || []);
          setAvailableLocalProvidersList(data.availableLocalProviders || []);
        }
      } catch (err) {
        console.error("Error detecting local providers:", err);
      }
    }
    if (token) {
      detectProviders();
      const timer = setInterval(detectProviders, 10000);
      return () => clearInterval(timer);
    }
  }, [token]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [showThinkingDetails, setShowThinkingDetails] = useState(true);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // File Upload State
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sandbox state
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al subir el archivo.');
      }
      
      alert(data.message || 'Documento indexado con éxito.');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (err) {
      alert(`Error al subir documento: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    "Buscando concordancia semántica con la memoria a largo plazo...",
    "Extrayendo y vectorizando fragmentos del archivo de RAG...",
    "Estableciendo enlaces paralelos con IAs asociadas (Omni-Routing)...",
    "Consultando a múltiples modelos en producción en paralelo...",
    "Analizando respuestas parciales, detectando coincidencias y contradicciones...",
    "Ejecutando motor de Inteligencia Real para ajustar pesos sinápticos...",
    "Consolidando y sintetizando respuesta definitiva en formato premium..."
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

  // Razonador interactivo
  useEffect(() => {
    let timer;
    if (isThinking && isPlaying) {
      const durationPerStep = nostalgicMode ? 800 : 400;
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

  // Generar logs dinámicos para el sandbox terminal
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
        "ubuntu@gabi-sandbox:~/search_workspace$ # Buscando en memoria a largo plazo...",
        "ubuntu@gabi-sandbox:~/search_workspace$ python3 fetch_memories.py --user=active"
      ],
      [
        "ubuntu@gabi-sandbox:~/search_workspace$ # Ejecutando RAG vector search...",
        "ubuntu@gabi-sandbox:~/search_workspace$ python3 search_kb.py --query=\"" + querySnippet + "\""
      ],
      [
        `ubuntu@gabi-sandbox:~/search_workspace$ echo "Query: ${querySnippet}" > query.txt`,
        "ubuntu@gabi-sandbox:~/search_workspace$ python3 -m venv env && source env/bin/activate"
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ # Ejecutando consultas paralelas a los modelos...",
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ curl -s -X POST \"https://api.openai.com/v1/chat/completions\" ...",
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ curl -s -X POST \"https://api.anthropic.com/v1/messages\" ..."
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ python3 analyze_contradictions.py",
        "Analizador: Buscando contradicciones lógicas en las respuestas..."
      ],
      [
        "(env) ubuntu@gabi-sandbox:~/search_workspace$ python3 adjust_synapses.py --category=" + category,
        "[Inteligencia Real] Ajustando peso de modelos en base a feedback histórico..."
      ],
      [
        `(env) ubuntu@gabi-sandbox:~/search_workspace$ python3 merge.py --output=synthesis.md`,
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

  useEffect(() => {
    if (!currentQueryText) {
      setSandboxLogs(['[system] Computadora lista. Esperando consulta...']);
      return;
    }

    async function runRealSandboxCommand() {
      const stepLogs = getLogsForStep(thinkingStep, currentQueryText, selectedModel);
      const commandLine = stepLogs.find(log => log.includes('ubuntu@gabi-sandbox:') || log.includes('(env) ubuntu@gabi-sandbox:'));
      
      if (commandLine) {
        const cleanCommand = commandLine
          .replace(/ubuntu@gabi-sandbox:~\$ /g, '')
          .replace(/ubuntu@gabi-sandbox:~\/search_workspace\$ /g, '')
          .replace(/\(env\) ubuntu@gabi-sandbox:~\/search_workspace\$ /g, '')
          .trim();
          
        if (cleanCommand && !cleanCommand.startsWith('#')) {
          try {
            const res = await fetch('/api/sandbox/run', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ command: cleanCommand })
            });
            if (res.ok) {
              const data = await res.json();
              if (data.logs && data.logs.length > 0) {
                const realOutputs = data.logs.map(log => `[sandbox-stdout] ${log}`);
                setSandboxLogs([
                  ...stepLogs,
                  `[system] Ejecución real en Sandbox completada para: "${cleanCommand}"`,
                  ...realOutputs
                ]);
                return;
              }
            }
          } catch (err) {
            // fallback quietly
          }
        }
      }
      setSandboxLogs(stepLogs);
    }

    runRealSandboxCommand();
  }, [thinkingStep, currentQueryText, selectedModel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (tokenBalance < 5) {
      alert("Necesitas al menos 5 NeuroTokens para realizar una consulta. Ve al Mercado de Tokens para ganar o comprar más.");
      return;
    }

    const userMsg = inputText.trim();
    setInputText('');
    
    // Add user message to chat state
    addMessageToChat({
      id: Date.now(),
      sender: 'user',
      text: userMsg
    });

    setCurrentQueryText(userMsg);
    setThinkingStep(0);
    setIsThinking(true);
    setIsPlaying(true);
    setShowThinkingDetails(true);

    if (sandboxState === 'hidden') {
      setSandboxState('minimized');
    }

    if (nostalgicMode) {
      playDialUpSound();
    }
  };

  const triggerResponseGeneration = async () => {
    const userMsg = currentQueryText || "Consulta";
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: userMsg,
          model: selectedModel,
          mode: selectedMode
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error de conexión con el backend.');
      }

      if (data.tokenBalance !== undefined) {
        setTokenBalance(data.tokenBalance);
      }

      // Add actual consolidated response to chat
      addMessageToChat({
        id: Date.now() + 1,
        sender: 'omnia',
        text: data.response,
        model: selectedModel,
        voted: null,
        modelsParticipated: data.modelsParticipated || [],
        sources: data.sources || [],
        thoughts: reasoningTasks.map((t) => `[OK] ${t}`)
      });

      // Refetch pending memories in 3 seconds to catch async background extraction output
      setTimeout(fetchPendingMemories, 3000);
      
    } catch (err) {
      alert(`Error: ${err.message}`);
      // Add error response
      addMessageToChat({
        id: Date.now() + 1,
        sender: 'omnia',
        text: `### Error en la consulta\n\nNo se pudo obtener una respuesta del servidor de Gabi AI. Detalle: ${err.message}`,
        model: selectedModel,
        voted: null,
        thoughts: ['[ERROR] Falló la comunicación con los servidores']
      });
    } finally {
      if (nostalgicMode) {
        stopDialUpSound();
      }
    }
  };

  const handleVote = async (msgId, voteType) => {
    // Marcamos localmente
    addMessageToChat({
      id: msgId,
      sender: 'omnia_vote_update',
      vote: voteType
    });

    if (voteType === 'up') {
      setTokenBalance(prev => prev + 5);
      confetti({
        particleCount: 60,
        spread: 40,
        colors: ['#10B981', '#39ff14'],
        origin: { y: 0.8 }
      });
    }

    // Registrar en servidor
    try {
      const msg = activeChat.messages.find(m => m.id === msgId);
      const userMsg = activeChat.messages.find(m => m.sender === 'user')?.text || 'Consulta';
      
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          queryText: userMsg,
          category: selectedModel,
          bestModel: msg?.modelsParticipated?.[0] || 'openai',
          vote: voteType
        })
      });
    } catch (e) {
      console.warn("Feedback sync failed:", e);
    }
  };

  const handlePlayPause = () => {
    if (isThinking) {
      setIsPlaying(prev => !prev);
      if (nostalgicMode) {
        if (!isPlaying) playDialUpSound();
        else stopDialUpSound();
      }
    } else {
      setIsThinking(true);
      setIsPlaying(true);
      setThinkingStep(0);
      if (nostalgicMode) playDialUpSound();
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
              title="Minimizar a resumen de tareas"
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
            const isUserCommand = log.includes('ubuntu@gabi-sandbox:') || log.includes('(env) ubuntu@gabi-sandbox:');
            
            let logColor = nostalgicMode ? 'text-[#39ff14]' : 'text-slate-350';
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
        <div className={`h-[68px] px-6 flex items-center justify-between ${
          nostalgicMode ? 'border-b border-[#39ff14] bg-black' : 'bg-slate-900/20'
        }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMenu}
              className={`md:hidden p-1.5 rounded-lg border ${
                nostalgicMode ? 'border-[#39ff14] text-[#39ff14]' : 'border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Menu size={16} />
            </button>
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

            {isOfflineMode ? (
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                nostalgicMode ? 'border border-red-500 text-red-500' : 'bg-red-950 text-red-400 border border-red-900/30'
              }`}>
                <Activity size={10} className="animate-pulse" />
                OFFLINE
              </span>
            ) : (
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                nostalgicMode ? 'border border-[#39ff14] text-[#39ff14]' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
              }`}>
                <Activity size={10} className="animate-ping" />
                ONLINE
              </span>
            )}
          </div>
        </div>

        {isOfflineMode && (
          <div className="bg-red-950/40 border-b border-red-900/30 py-2 px-6 flex items-center justify-between text-xs text-red-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <strong>Modo Offline Activado:</strong> Ejecución restringida a modelos de IA locales (Ollama/vLLM).
            </span>
            <span className="text-[10px] opacity-75">Sin consumo de API externa</span>
          </div>
        )}

        {pendingMemories.length > 0 && (
          <div className={`py-2.5 px-6 border-b flex items-center justify-between gap-4 text-xs ${
            nostalgicMode 
              ? 'bg-black border-[#39ff14]/30 text-[#39ff14] font-mono' 
              : 'bg-indigo-950/40 border-indigo-900/30 text-indigo-300'
          }`}>
            <span className="flex items-center gap-2">
              <BrainCircuit className="text-indigo-400 animate-pulse" size={14} />
              <span>
                Gabi detectó <strong>{pendingMemories.length}</strong> posible{pendingMemories.length > 1 ? 's' : ''} preferencia{pendingMemories.length > 1 ? 's' : ''}. ¿Deseas guardarla{pendingMemories.length > 1 ? 's' : ''}?
              </span>
            </span>
            <div className="flex gap-2 font-sans select-none shrink-0">
              <button 
                onClick={handleConfirmAllPending}
                className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-600 text-white rounded font-bold text-[10px] transition-colors cursor-pointer"
              >
                Guardar
              </button>
              <button 
                onClick={() => onOpenSettings?.('data')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded font-semibold text-[10px] transition-colors cursor-pointer"
              >
                Revisar
              </button>
            </div>
          </div>
        )}

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
                  Escribe tu consulta y observa el proceso de razonamiento en la computadora. Gabi AI consultará de forma paralela y silenciosa a los mejores modelos y sintetizará la respuesta definitiva.
                </p>
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

                    {/* Model Participation Badges */}
                    {msg.sender === 'omnia' && msg.modelsParticipated && msg.modelsParticipated.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-2 border-t border-slate-900">
                        <span className="text-[10px] text-slate-500 font-mono flex items-center">Modelos:</span>
                        {msg.modelsParticipated.map((m, idx) => (
                          <span key={idx} className="text-[9.5px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-900 text-sky-400 font-mono">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Document and Web Search Citations */}
                    {msg.sender === 'omnia' && msg.sources && msg.sources.length > 0 && (
                      <div className="space-y-1.5 mt-3 p-3 rounded-xl bg-slate-950/40 border border-slate-900">
                        <div className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">Fuentes de Información:</div>
                        <div className="flex flex-col gap-1 text-[10.5px]">
                          {msg.sources.map((src, idx) => {
                            const isWeb = src.startsWith('http://') || src.startsWith('https://');
                            return (
                              <div key={idx} className="flex items-center gap-1.5 text-slate-400">
                                <span className="text-emerald-400 font-mono">•</span>
                                {isWeb ? (
                                  <a href={src} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400 flex items-center gap-1 font-mono truncate max-w-full">
                                    <span className="truncate">{src}</span>
                                    <ExternalLink size={10} className="flex-shrink-0" />
                                  </a>
                                ) : (
                                  <span className="font-semibold text-emerald-300 font-mono">[Archivo] {src}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                nostalgicMode ? 'border-[#39ff14] bg-black text-[#39ff14]' : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400 animate-pulse'
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

        {/* Input Box */}
        <div className={`px-4 pt-1 pb-0 ${
          nostalgicMode ? 'bg-black' : 'bg-slate-950/20'
        }`}>
          <div className="max-w-3xl mx-auto flex flex-col gap-[7px]">
            
            {/* Box 1: Minimized / Expanded Terminal Card (AI brain) */}
            {currentQueryText && (sandboxState === 'minimized' || sandboxState === 'reduced') && (
              sandboxState === 'minimized' ? (
                <div
                  className={`w-full max-w-3xl mx-auto flex items-center justify-between p-1.5 text-xs font-mono rounded-2xl border transition-all duration-300 ${
                    nostalgicMode
                      ? 'border-[#39ff14] bg-black text-[#39ff14]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-355'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSandboxState('reduced')}
                    className="flex-1 flex items-center justify-between pl-2.5 pr-4 py-0.5 focus:outline-none hover:opacity-85 text-left truncate"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex-shrink-0">
                        {isThinking ? (
                          <span className="flex items-center justify-center w-5 h-5 rounded-full animate-pulse bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                            <Loader2 size={10} className="animate-spin" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-5 h-5 rounded-full text-center leading-3 font-bold text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/40">
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
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px] sm:max-w-[320px]">
                          {isThinking ? reasoningTasks[thinkingStep] : "Entregar resultados finales"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`font-bold ${
                        isThinking ? 'animate-pulse text-emerald-400' : 'text-emerald-400'
                      }`}>
                        {isThinking ? `${thinkingStep + 1}/8` : '8/8'}
                      </span>
                      <ChevronUp size={12} className="text-slate-500" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSandboxState('split')}
                    className="w-[106px] h-5 relative flex-shrink-0 focus:outline-none"
                    title="Abrir terminal de comandos"
                  >
                    <div className={`absolute top-1/2 -translate-y-1/2 mt-[-30px] right-[20px] md:right-[-4px] w-[106px] h-[76px] rounded-2xl border overflow-hidden bg-black shadow-2xl transition-all duration-300 hover:scale-105 z-20 ${
                      nostalgicMode 
                        ? 'border-[#39ff14]/70 shadow-[#39ff14]/30' 
                        : 'border-slate-700/80 shadow-slate-950/80'
                    }`}>
                      <div className="w-[212px] h-[152px] scale-50 origin-top-left flex flex-col justify-between p-3 select-none">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1 px-1 opacity-70">
                          <span className="font-bold text-[11px] text-slate-400 font-mono">gabi-sh</span>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${nostalgicMode ? 'bg-[#39ff14]' : 'bg-synaptica-green'}`} />
                        </div>
                        <div className="flex-1 font-mono text-[9.5px] leading-[12px] pt-2 px-1 opacity-90 space-y-[3px] overflow-hidden text-left">
                          {sandboxLogs.slice(-6).map((log, idx) => {
                            const isSystem = log.startsWith('[system]');
                            const isUserCommand = log.includes('ubuntu@gabi-sandbox:') || log.includes('(env) ubuntu@gabi-sandbox:');
                            
                            let logColor = nostalgicMode ? 'text-[#39ff14]' : 'text-slate-350';
                            if (isSystem) {
                              logColor = 'text-emerald-400 font-bold';
                            } else if (isUserCommand) {
                              logColor = 'text-white font-bold';
                            } else if (log.startsWith('OpenAI:') || log.startsWith('Claude:') || log.startsWith('Perplexity:') || log.startsWith('Analizador:')) {
                              logColor = 'text-sky-400';
                            } else if (log.startsWith('[Inteligencia Real]')) {
                              logColor = 'text-amber-400';
                            }
                            
                            let cleanLog = log
                              .replace('ubuntu@gabi-sandbox:~$ ', '$ ')
                              .replace('ubuntu@gabi-sandbox:~/search_workspace$ ', '$ ')
                              .replace('(env) ubuntu@gabi-sandbox:~/search_workspace$ ', '(env) $ ');
                              
                            return (
                              <div key={idx} className={`${logColor} truncate max-w-[190px]`}>
                                {cleanLog}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div
                  className={`w-full max-w-3xl mx-auto rounded-2xl border p-4 shadow-xl font-mono transition-all duration-300 ${
                    nostalgicMode 
                      ? 'bg-black border-[#39ff14] text-[#39ff14]' 
                      : 'bg-slate-900/65 border-slate-800 text-slate-100 backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850 mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSandboxState('split')}
                        className={`w-[48px] h-[34px] rounded-lg border overflow-hidden bg-black transition-all hover:scale-105 flex-shrink-0 ${
                          nostalgicMode ? 'border-[#39ff14]' : 'border-slate-800 hover:border-slate-700'
                        }`}
                        title="Abrir ordenador completo"
                      >
                        <div className="w-[96px] h-[68px] scale-50 origin-top-left flex flex-col justify-between p-1 select-none">
                          <div className="flex items-center justify-between border-b border-slate-950 pb-0.5 px-0.5 opacity-60">
                            <span className="font-bold text-[8px] text-slate-400 font-mono">gabi-sh</span>
                            <span className={`w-1 h-1 rounded-full animate-pulse ${nostalgicMode ? 'bg-[#39ff14]' : 'bg-synaptica-green'}`} />
                          </div>
                          <div className="flex-1 font-mono text-[7px] leading-[9px] pt-1 px-0.5 opacity-80 overflow-hidden text-left">
                            $ gabi-sandbox
                          </div>
                        </div>
                      </button>

                      <div className="text-left">
                        <h4 className="text-xs font-bold font-display">La computadora de Gabi</h4>
                        <p className="text-[9px] text-slate-500">Gabi está usando Terminal</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSandboxState('split')}
                        className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                          nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Abrir ordenador completo"
                      >
                        <Monitor size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSandboxState('minimized')}
                        className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                          nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Minimizar"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                      <span>Progreso de la tarea</span>
                      <span className={`font-bold ${
                        isThinking ? 'animate-pulse text-emerald-400' : 'text-emerald-405'
                      }`}>
                        {isThinking ? `${thinkingStep + 1}/8` : '8/8'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-[11px] leading-relaxed">
                      {reasoningTasks.map((task, idx) => {
                        const isDone = thinkingStep > idx;
                        const isActive = thinkingStep === idx;
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 transition-all duration-200 ${
                              isDone 
                                ? 'text-emerald-450 font-bold' 
                                : isActive 
                                  ? 'text-slate-100 font-bold' 
                                  : 'text-slate-500'
                            }`}
                          >
                            <span className="flex-shrink-0 mt-0.5">
                              {isDone ? (
                                <span className="inline-block w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900 text-center leading-3 font-bold text-[9px]">✓</span>
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

                  <div className="mt-3 pt-2 border-t border-slate-850/60 flex items-center justify-between text-[9px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {isThinking ? (isPlaying ? 'Ejecutando razonamiento...' : 'Pausado') : 'Finalizado'}
                    </span>
                    <span>Consola Gabi Virtual Sandbox</span>
                  </div>
                </div>
              )
            )}

            {/* Box 2: Dialogue input form */}
            <form onSubmit={handleSendMessage} className="w-full max-w-3xl mx-auto">
              <div className={`rounded-2xl border flex flex-col transition-all ${
                nostalgicMode
                  ? 'border-[#39ff14] bg-black focus-within:ring-2 focus-within:ring-[#39ff14]'
                  : 'border-slate-800 bg-slate-900/60 focus-within:border-slate-700 focus-within:bg-slate-900/90'
              }`}>
                <div className="px-3 pt-2 pb-1.5 flex flex-col gap-1.5">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={selectedModel === 'omnia' ? 'Haz una pregunta a Gabi AI (IA Multimodelo)...' : `Consulta a ${selectedModel.toUpperCase()}...`}
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
                      {/* Document Ingestion input and button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.docx,.txt,.md,.html"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-xl transition-all ${
                          isUploading
                            ? 'bg-indigo-950 text-slate-100 animate-pulse'
                            : nostalgicMode
                              ? 'text-[#39ff14] hover:bg-[#39ff14]/15'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                        title="Subir archivo a la base de conocimiento RAG (.pdf, .docx, .txt, .md, .html)"
                      >
                        {isUploading ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : <Paperclip size={16} />}
                      </button>

                      {/* Voice microphone button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2 rounded-xl transition-all ${
                          isListening
                            ? 'bg-rose-550 text-slate-950 animate-pulse'
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
                            : 'bg-[#A98EFA] text-slate-950 hover:bg-[#beabfd] shadow-md shadow-violet-950/10'
                        }`}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between pt-1.5 mt-1 text-xs">
                    <NeuroHubMenu
                      selectedModel={selectedModel}
                      setSelectedModel={setSelectedModel}
                      isOpen={modelSelectorOpen}
                      setIsOpen={setModelSelectorOpen}
                      nostalgicMode={nostalgicMode}
                    />

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-mono">Red:</span>
                        <select
                          value={selectedMode}
                          onChange={(e) => setSelectedMode(e.target.value)}
                          className={`text-[10px] bg-slate-950 border border-slate-850 rounded px-1.5 py-0.5 font-mono text-slate-300 focus:outline-none cursor-pointer ${
                            nostalgicMode ? 'bg-black border-[#39ff14] text-[#39ff14]' : ''
                          }`}
                        >
                          <option value="automatic">Auto (Consenso)</option>
                          <option value="economy">Económico (Local)</option>
                          <option value="premium">Premium (API)</option>
                          <option value="offline">Offline (Forzar Local)</option>
                        </select>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        Consumo: <strong>5 NTK</strong> | Saldo: <strong className={nostalgicMode ? 'text-[#39ff14]' : 'text-emerald-400'}>{tokenBalance} NTK</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Split/Fullscreen Sidebar Panel (Right) */}
      {(sandboxState === 'split' || sandboxState === 'fullscreen') && (
        <div className="absolute md:relative inset-y-0 right-0 z-30 h-full flex">
          {renderTerminalSidebar()}
        </div>
      )}
    </div>
  );
}
