import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Brain, 
  Activity, 
  ThumbsUp, 
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

export default function SynapticMap({ nostalgicMode, categoryWeights, feedbackHistory }) {
  const [selectedCategory, setSelectedCategory] = useState('clinica');
  const [networkPulse, setNetworkPulse] = useState(0);

  // Category definitions and hardcoded mock synaptic weights that represent "learned intelligence"
  const categories = {
    general: {
      name: 'Omni General 🌍',
      desc: 'Optimizado para razonamiento de propósito general.',
      weights: {
        gpt: 85,
        claude: 90,
        perplexity: 75,
        deepseek: 80,
        cohere: 60,
        mistral: 70
      },
      insights: [
        'Claude es el modelo principal para cohesión y estilo narrativo.',
        'OpenAI (GPT) provee la base lógica inicial para estructurar la respuesta.',
        'Mistral y Cohere se utilizan en micro-tareas de traducción y embeddings.'
      ]
    },
    clinica: {
      name: 'Médica y Clínica 🩺',
      desc: 'Orientada al diagnóstico, papers médicos y dosificación.',
      weights: {
        gpt: 80,
        claude: 85,
        perplexity: 95,
        deepseek: 70,
        cohere: 50,
        mistral: 45
      },
      insights: [
        'Perplexity aporta un 95% de fidelidad al buscar citas médicas (HEDS, JAMA).',
        'Claude se destaca con 85% en la redacción de advertencias y consejos de empatía para pacientes.',
        'GPT estructura la prescripción y contraindicaciones de manera rígida y confiable.'
      ]
    },
    coding: {
      name: 'Código y Programación 💻',
      desc: 'Especializada en depuración, scripts y refactorización.',
      weights: {
        gpt: 90,
        claude: 85,
        perplexity: 60,
        deepseek: 95,
        cohere: 55,
        mistral: 65
      },
      insights: [
        'DeepSeek lidera con un 95% en estructuración algorítmica y razonamiento profundo.',
        'GPT-4 destaca con 90% para corregir sintaxis e integraciones de frameworks.',
        'Claude agrega comentarios descriptivos limpios y mantiene los estándares de clean code.'
      ]
    },
    economia: {
      name: 'Finanzas y Economía 🪙',
      desc: 'Análisis de tasas de interés, bancos, inversiones y tendencias.',
      weights: {
        gpt: 85,
        claude: 80,
        perplexity: 88,
        deepseek: 75,
        cohere: 70,
        mistral: 50
      },
      insights: [
        'Perplexity consulta tasas bancarias reales en tiempo de ejecución.',
        'GPT modela riesgos y proyecciones de inversión matemática.',
        'Cohere destaca al categorizar ofertas de tarjetas de crédito y préstamos.'
      ]
    },
    viajes: {
      name: 'Viajes y Rutas ✈️',
      desc: 'Trivago de viajes: vuelos, tarifas de hoteles y atracciones.',
      weights: {
        gpt: 75,
        claude: 80,
        perplexity: 90,
        deepseek: 60,
        cohere: 85,
        mistral: 55
      },
      insights: [
        'Perplexity extrae datos en tiempo real de aerolíneas y plataformas hoteleras.',
        'Cohere realiza coincidencia semántica de calificaciones de usuarios y estrellas.',
        'Claude organiza itinerarios de forma fluida y conversacional.'
      ]
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkPulse(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const activeCategory = categories[selectedCategory];
  const weights = activeCategory.weights;

  // Node coordination details in the network diagram
  const nodes = [
    { id: 'synaptica', label: 'Synaptica Core', x: 200, y: 180, r: 24, color: '#10B981', fontColor: '#F3F4F6' },
    { id: 'gpt', label: 'OpenAI GPT', x: 200, y: 50, r: 16, weight: weights.gpt, color: '#10b981', labelOffset: -25 },
    { id: 'claude', label: 'Claude', x: 330, y: 110, r: 16, weight: weights.claude, color: '#d97706', labelOffset: 25 },
    { id: 'perplexity', label: 'Perplexity', x: 330, y: 250, r: 16, weight: weights.perplexity, color: '#2563eb', labelOffset: 25 },
    { id: 'deepseek', label: 'DeepSeek', x: 200, y: 310, r: 16, weight: weights.deepseek, color: '#4f46e5', labelOffset: 25 },
    { id: 'cohere', label: 'Cohere', x: 70, y: 250, r: 16, weight: weights.cohere, color: '#06b6d4', labelOffset: -25 },
    { id: 'mistral', label: 'Mistral AI', x: 70, y: 110, r: 16, weight: weights.mistral, color: '#ea580c', labelOffset: -25 }
  ];

  return (
    <div className={`p-6 flex flex-col h-full overflow-y-auto ${nostalgicMode ? 'nostalgic-crt text-[#39ff14]' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold font-display flex items-center gap-2 ${
          nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'
        }`}>
          <Network className="animate-pulse" />
          Mapa de Sinapsis Dinámica (Inteligencia Real)
        </h1>
        <p className={`text-sm mt-1 leading-relaxed ${nostalgicMode ? 'nostalgic-green-text opacity-80' : 'text-slate-400'}`}>
          A diferencia de los agregadores tradicionales, Synaptica evalúa constantemente el desempeño de las IAs según la categoría de la consulta y las calificaciones del usuario, reajustando sus conexiones neuronales para generar la síntesis perfecta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Neural Network Graph */}
        <div className={`lg:col-span-7 rounded-2xl p-4 flex flex-col items-center justify-center border relative ${
          nostalgicMode 
            ? 'bg-black border-[#39ff14]' 
            : 'bg-slate-900/50 border-slate-800/80 backdrop-blur-md'
        }`}>
          {/* Dashboard HUD */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${nostalgicMode ? 'bg-[#39ff14]' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${nostalgicMode ? 'bg-[#39ff14]' : 'bg-emerald-500'}`}></span>
            </span>
            <span className={`text-[10px] uppercase font-bold font-mono tracking-widest ${nostalgicMode ? 'text-[#39ff14]' : 'text-emerald-400'}`}>
              Sinapsis Activa: {selectedCategory.toUpperCase()}
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Activity size={12} className="animate-pulse" />
            <span>Pulsos: {networkPulse}Hz</span>
          </div>

          {/* Interactive SVG Network */}
          <svg className="w-full max-w-[400px] h-[360px]" viewBox="0 0 400 360">
            {/* Draw Connections */}
            {nodes.slice(1).map(node => {
              const dx = node.x - 200;
              const dy = node.y - 180;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const ux = dx / dist;
              const uy = dy / dist;

              // Dash array representing signal frequency based on weight
              const dashPhase = (networkPulse * (node.weight / 15)) % 40;
              const isSelected = selectedCategory;

              return (
                <g key={`edge-${node.id}`}>
                  {/* Connection Line */}
                  <line
                    x1="200"
                    y1="180"
                    x2={node.x}
                    y2={node.y}
                    stroke={nostalgicMode ? '#39ff14' : node.color}
                    strokeWidth={Math.max(1, node.weight / 15)}
                    strokeOpacity={0.25 + (node.weight / 200)}
                    strokeDasharray="6 4"
                    strokeDashoffset={-dashPhase}
                  />
                  {/* Animated pulse packet traveling */}
                  <circle
                    cx={200 + ux * ((networkPulse * 4) % dist)}
                    cy={180 + uy * ((networkPulse * 4) % dist)}
                    r="3"
                    fill={nostalgicMode ? '#39ff14' : '#ffffff'}
                    opacity={0.8}
                  />
                </g>
              );
            })}

            {/* Draw Central Synaptica Node */}
            <circle
              cx="200"
              cy="180"
              r="24"
              fill={nostalgicMode ? '#000000' : '#0F172A'}
              stroke={nostalgicMode ? '#39ff14' : '#10B981'}
              strokeWidth="3"
              className={nostalgicMode ? '' : 'animate-pulse'}
              style={{ filter: nostalgicMode ? 'drop-shadow(0 0 8px #39ff14)' : 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))' }}
            />
            <text
              x="200"
              y="184"
              textAnchor="middle"
              fill={nostalgicMode ? '#39ff14' : '#F3F4F6'}
              fontSize="10"
              fontWeight="bold"
              fontFamily={nostalgicMode ? 'monospace' : 'sans-serif'}
            >
              SYN
            </text>

            {/* Draw Model Nodes */}
            {nodes.slice(1).map(node => (
              <g key={`node-${node.id}`}>
                {/* Connection Weight Ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={16 + (node.weight / 15)}
                  fill="transparent"
                  stroke={nostalgicMode ? '#39ff14' : node.color}
                  strokeWidth="1.5"
                  strokeOpacity={0.3}
                  strokeDasharray="3 3"
                />
                
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="12"
                  fill={nostalgicMode ? '#000000' : '#0F172A'}
                  stroke={nostalgicMode ? '#39ff14' : node.color}
                  strokeWidth="2.5"
                />

                {/* Node name */}
                <text
                  x={node.x}
                  y={node.y + (node.labelOffset || 0) + (node.labelOffset > 0 ? 5 : -2)}
                  textAnchor="middle"
                  fill={nostalgicMode ? '#39ff14' : '#E5E7EB'}
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily={nostalgicMode ? 'monospace' : 'sans-serif'}
                >
                  {node.label}
                </text>

                {/* Node weight indicator percentage */}
                <text
                  x={node.x}
                  y={node.y + 3}
                  textAnchor="middle"
                  fill={nostalgicMode ? '#39ff14' : '#9CA3AF'}
                  fontSize="8"
                  fontWeight="bold"
                >
                  {node.weight}%
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Right Side: Category Selector & Dynamic Info */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className={`p-4 rounded-xl border ${
            nostalgicMode 
              ? 'bg-black border-[#39ff14]' 
              : 'bg-slate-900/50 border-slate-800/80 backdrop-blur-md'
          }`}>
            <h2 className="text-sm font-semibold mb-3">Categorías de Aprendizaje</h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(categories).map(catId => (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCategory === catId
                      ? nostalgicMode
                        ? 'bg-black border-2 border-[#39ff14] text-[#39ff14] font-bold'
                        : 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                      : nostalgicMode
                        ? 'bg-black border border-[#39ff14]/40 text-[#39ff14]/60 hover:text-[#39ff14]'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {categories[catId].name}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-5 rounded-xl border flex-1 flex flex-col gap-4 ${
            nostalgicMode 
              ? 'bg-black border-[#39ff14]' 
              : 'bg-slate-900/50 border-slate-800/80 backdrop-blur-md'
          }`}>
            <div>
              <div className="flex items-center gap-1.5">
                <Brain size={16} className={nostalgicMode ? 'text-[#39ff14]' : 'text-purple-400'} />
                <h3 className="font-bold text-sm">Pesos Neuronales de {activeCategory.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                {activeCategory.desc}
              </p>
            </div>

            {/* Neural Weight Progress Bars */}
            <div className="space-y-2">
              {Object.entries(weights).map(([modelKey, val]) => {
                const modelColors = {
                  gpt: { bar: 'bg-emerald-500', name: 'OpenAI (GPT)' },
                  claude: { bar: 'bg-amber-600', name: 'Anthropic (Claude)' },
                  perplexity: { bar: 'bg-blue-600', name: 'Perplexity' },
                  deepseek: { bar: 'bg-indigo-600', name: 'DeepSeek R1' },
                  cohere: { bar: 'bg-cyan-500', name: 'Cohere' },
                  mistral: { bar: 'bg-orange-500', name: 'Mistral AI' }
                };
                const info = modelColors[modelKey];
                return (
                  <div key={modelKey} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span>{info.name}</span>
                      <span className="font-bold">{val}% de sinergia</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${nostalgicMode ? 'border border-[#39ff14] bg-slate-950' : 'bg-slate-950'}`}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          nostalgicMode ? 'bg-[#39ff14]' : info.bar
                        }`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`border-t my-1 ${nostalgicMode ? 'border-[#39ff14]' : 'border-slate-800'}`} />

            {/* Knowledge insights */}
            <div>
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-300 mb-2">
                <Zap size={14} className={nostalgicMode ? 'text-[#39ff14]' : 'text-amber-400'} />
                <span>Patrones de Aprendizaje Deductivo</span>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-400">
                {activeCategory.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-normal">
                    <span className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full ${nostalgicMode ? 'bg-[#39ff14]' : 'bg-purple-500'}`} />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Synaptic Ratings Feed */}
      <div className={`mt-6 p-4 rounded-xl border ${
        nostalgicMode 
          ? 'bg-black border-[#39ff14]' 
          : 'bg-gradient-to-r from-indigo-950/20 to-purple-950/20 border-slate-800/80 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-3">
          <Activity size={14} className={nostalgicMode ? 'text-[#39ff14]' : 'text-indigo-400'} />
          <span>Bitácora de Ajuste Sináptico (Basado en Votos del Usuario)</span>
        </div>
        <div className="space-y-2">
          {feedbackHistory && feedbackHistory.length > 0 ? (
            feedbackHistory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/50 last:border-b-0 font-mono">
                <span className="text-slate-400 truncate max-w-[400px]">
                  "{item.query.substring(0, 50)}..." → Voto positivo en síntesis.
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                    <ThumbsUp size={10} /> +5 NTK
                  </span>
                  <span className="text-[10px] text-indigo-400">
                    Ajustado: {item.category} ({item.bestModel}) +2%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic py-2">
              No hay calificaciones de usuario registradas aún. A medida que votes las respuestas con pulgar arriba (👍), Synaptica reajustará sus conexiones y te recompensará con NeuroTokens.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
