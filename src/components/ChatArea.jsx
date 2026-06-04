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
  Coins
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

    setIsThinking(true);
    setThinkingStep(0);
    setShowThinkingDetails(true);

    // If Nostalgic mode is on, play dial-up sounds
    if (nostalgicMode) {
      playDialUpSound();
    }

    // Simulate step by step thinking
    const totalSteps = reasoningTasks.length;
    const durationPerStep = nostalgicMode ? 950 : 500; // longer if dial-up is playing to match audio

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps) {
        setThinkingStep(currentStep);
      } else {
        clearInterval(interval);
        
        // Generate simulated response based on the query or select template
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
   * Incrementar ingesta de espinacas, almendras, salmón y aguacate.
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

        setIsThinking(false);
        if (nostalgicMode) {
          stopDialUpSound();
        }
      }
    }, durationPerStep);
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

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${
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
              Meta-IA Consolidada
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">
              Omni-routing activo | {selectedModel.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Tokens gastados: 5 NTK por envío
          </span>
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
                Pregunta a Synaptica
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Escribe tu consulta y observa el proceso de razonamiento en tiempo real. Synaptica consultará a 5 IAs distintas para darte la mejor síntesis filtrada.
              </p>
            </div>
            {/* Try simulated medical query */}
            <div className="flex gap-2 flex-wrap justify-center pt-2">
              <button
                onClick={() => setInputText('¿Cuál es el mejor enfoque terapéutico para una úlcera corneal herpética recurrente?')}
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

        {/* Real-time Reasoning Terminal Panel (Manus/DeepSeek Style) */}
        {isThinking && (
          <div className="flex gap-4 max-w-3xl">
            <div className={`w-8 h-8 rounded-lg border flex-shrink-0 flex items-center justify-center ${
              nostalgicMode ? 'border-[#39ff14] bg-black text-[#39ff14]' : 'bg-emerald-950 border-emerald-900/40 text-emerald-400 animate-pulse'
            }`}>
              <BrainCircuit size={16} />
            </div>

            <div className="flex-1 space-y-3">
              <div className={`p-5 rounded-2xl border ${
                nostalgicMode 
                  ? 'bg-black border-[#39ff14] text-[#39ff14] font-mono' 
                  : 'bg-slate-900/35 border-slate-850/80 backdrop-blur-md'
              }`}>
                {/* Thinking Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${nostalgicMode ? 'bg-[#39ff14]' : 'bg-emerald-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${nostalgicMode ? 'bg-[#39ff14]' : 'bg-emerald-500'}`}></span>
                    </span>
                    <span className="text-xs font-bold font-display">Pensamiento de Synaptica (Consolidación)</span>
                  </div>

                  <button
                    onClick={() => setShowThinkingDetails(!showThinkingDetails)}
                    className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[11px]"
                  >
                    <span>{showThinkingDetails ? 'Ocultar bitácora' : 'Ver bitácora'}</span>
                    {showThinkingDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                {/* Checklist steps */}
                {showThinkingDetails && (
                  <div className="space-y-2 mb-4 font-mono text-[11px] leading-relaxed">
                    {reasoningTasks.map((task, idx) => {
                      const isDone = thinkingStep > idx;
                      const isActive = thinkingStep === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 transition-all ${
                            isDone 
                              ? 'text-emerald-400' 
                              : isActive 
                                ? 'text-slate-200 font-bold' 
                                : 'text-slate-600'
                          }`}
                        >
                          <span className="flex-shrink-0">
                            {isDone ? "☑" : isActive ? "▶" : "☐"}
                          </span>
                          <span>{task}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ares/Napster vintage Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Progreso de Synaptica: {thinkingStep + 1} de {reasoningTasks.length} tareas</span>
                    <span>{Math.round(((thinkingStep + 1) / reasoningTasks.length) * 100)}%</span>
                  </div>
                  
                  {nostalgicMode ? (
                    /* Ares retro progress bar style */
                    <div className="retro-progress-container">
                      <div
                        className="retro-progress-bar"
                        style={{ width: `${((thinkingStep + 1) / reasoningTasks.length) * 100}%` }}
                      />
                    </div>
                  ) : (
                    /* Premium modern gradient progress bar */
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800/40">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${((thinkingStep + 1) / reasoningTasks.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Text Box Input Area */}
      <div className={`p-4 border-t ${
        nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-950'
      }`}>
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto space-y-3">
          
          {/* Main big search input container */}
          <div className={`rounded-2xl border flex items-end p-2 transition-all ${
            nostalgicMode
              ? 'border-[#39ff14] bg-black focus-within:ring-2 focus-within:ring-[#39ff14]'
              : 'border-slate-800 bg-slate-900/60 focus-within:border-slate-700 focus-within:bg-slate-900/90'
          }`}>
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedModel === 'omnia' ? 'Habla con OmnIA (IA Multimodelo)...' : `Consulta a ${selectedModel.toUpperCase()}...`}
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
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800/50">
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

          {/* Model selection and balance info bar */}
          <div className="flex items-center justify-between text-xs px-2">
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
        </form>
      </div>
    </div>
  );
}
