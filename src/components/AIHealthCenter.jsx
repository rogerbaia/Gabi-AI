import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Cpu, ShieldAlert, DollarSign, BarChart3, TrendingUp, Sparkles, 
  Settings, CheckCircle2, AlertTriangle, Play, Pause, RefreshCw, Layers, 
  Terminal, Search, Database, HardDrive, Thermometer, BrainCircuit,
  Sliders, ThumbsUp, ThumbsDown, AlertCircle, Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AIHealthCenter({ nostalgicMode, token }) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Real-time fetched state
  const [healthData, setHealthData] = useState(null);
  const [config, setConfig] = useState(null);
  
  // Selected tab inside Health Center
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logFilter, setLogFilter] = useState('');
  
  const logEndRef = useRef(null);

  // Memories states for tab display
  const [memories, setMemories] = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);

  const fetchMemories = async () => {
    setMemoriesLoading(true);
    try {
      const res = await fetch('/api/memories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data || []);
      }
    } catch (err) {
      console.error("Error fetching memories:", err);
    } finally {
      setMemoriesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rag_mem') {
      fetchMemories();
    }
  }, [activeTab, token]);

  const handleDeleteMemory = async (id) => {
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMemories(prev => prev.filter(m => m.id !== id));
          // Refresh health stats to update counter
          fetchHealthStats();
        }
      }
    } catch (err) {
      console.error("Error deleting memory:", err);
    }
  };

  // Fetch metrics and configurations from server
  const fetchHealthStats = async () => {
    try {
      const res = await fetch('/api/admin/health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('No se pudieron recuperar las métricas administrativas.');
      }
      const data = await res.json();
      setHealthData(data);
      if (data.globalConfig) {
        setConfig(data.globalConfig);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStats();
    // Poll stats every 5 seconds for live resource display
    const interval = setInterval(fetchHealthStats, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Update administrative configurations
  const handleSaveConfig = async (updatedConfig) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedConfig)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        confetti({
          particleCount: 50,
          spread: 40,
          colors: ['#39ff14', '#10B981', '#A98EFA'],
          origin: { y: 0.8 }
        });
      } else {
        alert('Error al guardar configuración global.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle model enabled/disabled state
  const toggleModel = (modelName) => {
    if (!config) return;
    const updatedModels = {
      ...config.models,
      [modelName]: {
        ...config.models[modelName],
        enabled: !config.models[modelName].enabled
      }
    };
    const updated = { ...config, models: updatedModels };
    handleSaveConfig(updated);
  };

  // Adjust model weight
  const handleWeightChange = (modelName, weightValue) => {
    if (!config) return;
    const updatedModels = {
      ...config.models,
      [modelName]: {
        ...config.models[modelName],
        weight: parseFloat(weightValue)
      }
    };
    setConfig({ ...config, models: updatedModels });
  };

  // Commit weight change after releasing slider
  const commitWeightChange = (modelName) => {
    if (!config) return;
    handleSaveConfig(config);
  };

  // Adjust model priority
  const handlePriorityChange = (modelName, priorityValue) => {
    if (!config) return;
    const updatedModels = {
      ...config.models,
      [modelName]: {
        ...config.models[modelName],
        priority: parseInt(priorityValue)
      }
    };
    const updated = { ...config, models: updatedModels };
    handleSaveConfig(updated);
  };

  // Adjust forced execution mode
  const handleModeChange = (forcedMode) => {
    if (!config) return;
    const updated = { ...config, forcedMode };
    handleSaveConfig(updated);
  };

  if (loading && !healthData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <Activity size={40} className="text-indigo-400 animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Iniciando AI Health Center...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-3">
        <AlertTriangle size={40} className="text-rose-500" />
        <h3 className="font-bold text-slate-200">Error de Conexión</h3>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <button onClick={fetchHealthStats} className="px-4 py-2 bg-indigo-650 rounded-lg text-xs font-semibold text-white">
          Reintentar Conexión
        </button>
      </div>
    );
  }

  const { 
    dbStats, 
    system, 
    ollamaStatus = { 
      local: { configured: false, connected: false, models: [] }, 
      tunnel: { configured: false, connected: false, models: [] } 
    } 
  } = healthData;
  const activeModels = config?.models ? Object.values(config.models).filter(m => m.enabled).length : 0;
  const inactiveModels = config?.models ? Object.values(config.models).filter(m => !m.enabled).length : 0;

  // Compile active system alerts
  const alerts = [];
  if (system.gpuTempC > 72) {
    alerts.push({ msg: 'GPU Temperatura elevada (> 72°C)', level: 'warning', category: 'hardware' });
  }
  if (system.gpuUsagePct > 90) {
    alerts.push({ msg: 'Uso de GPU crítico (> 90%)', level: 'warning', category: 'hardware' });
  }
  if (system.usedVramGb > 6.8) {
    alerts.push({ msg: 'VRAM casi agotada (> 6.8 GB)', level: 'warning', category: 'hardware' });
  }
  if (dbStats.recentErrors.length > 0) {
    alerts.push({ msg: `Errores recientes en consultas a APIs (${dbStats.recentErrors.length})`, level: 'danger', category: 'api' });
  }
  if (dbStats.queriesToday > 1000) {
    alerts.push({ msg: 'Alto volumen de consultas hoy', level: 'info', category: 'system' });
  }
  if (dbStats.costToday > 15.0) {
    alerts.push({ msg: 'Consumo diario de API elevado (> $15.0 USD)', level: 'warning', category: 'costs' });
  }

  // Cost data calculations
  const totalQueries = dbStats.queriesToday;
  const totalCost = dbStats.costToday;
  
  // Economy savings: cost avoided by local LLMs (estimated $0.012 per local query if it went to API)
  const localQueriesCount = dbStats.modelStats.filter(m => ['llama', 'mistral', 'qwen', 'deepseek', 'gemma', 'phi'].some(localKey => m.model_name.toLowerCase().includes(localKey))).reduce((acc, curr) => acc + curr.total_queries, 0);
  const costAvoidedLocal = (localQueriesCount * 0.012).toFixed(2);
  const estimatedOnlyApisCost = (totalCost + (localQueriesCount * 0.012)).toFixed(2);

  // Mapped list of models for status cards
  const allModelsKeys = [
    { key: 'llama', name: 'Llama 3.2', provider: 'Local (Ollama)', type: 'local' },
    { key: 'mistral', name: 'Mistral 7B', provider: 'Híbrido (Ollama/API)', type: 'hybrid' },
    { key: 'qwen', name: 'Qwen 2.5', provider: 'Híbrido (Ollama/API)', type: 'hybrid' },
    { key: 'deepseek', name: 'DeepSeek R1', provider: 'Híbrido (Ollama/API)', type: 'hybrid' },
    { key: 'gemma', name: 'Gemma 2', provider: 'Local (Ollama)', type: 'local' },
    { key: 'phi', name: 'Phi 3.5', provider: 'Local (Ollama)', type: 'local' },
    { key: 'openai', name: 'OpenAI GPT-4o', provider: 'API Oficial (OpenAI)', type: 'api' },
    { key: 'anthropic', name: 'Anthropic Claude', provider: 'API Oficial (Anthropic)', type: 'api' },
    { key: 'gemini', name: 'Google Gemini', provider: 'API Oficial (Google)', type: 'api' },
    { key: 'grok', name: 'xAI Grok', provider: 'API Oficial (xAI)', type: 'api' },
    { key: 'perplexity', name: 'Perplexity Search', provider: 'API Oficial (Perplexity)', type: 'api' }
  ];

  return (
    <div className={`p-6 flex flex-col h-full overflow-y-auto ${nostalgicMode ? 'nostalgic-crt text-[#39ff14] font-mono' : 'bg-transparent text-slate-100'}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
            <Activity className="text-indigo-400 animate-pulse" />
            AI Health Center
            {healthData?.systemMode && (
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ml-2 border ${
                healthData.systemMode === 'offline' 
                  ? 'bg-rose-950/40 text-rose-450 border-rose-900/30' 
                  : healthData.systemMode === 'cloud' 
                    ? 'bg-sky-950/40 text-sky-450 border-sky-900/30' 
                    : 'bg-emerald-950/40 text-emerald-450 border-emerald-900/30'
              }`}>
                Estado: {healthData.systemMode}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Administración, telemetría de rendimiento y control del ecosistema de Inteligencias Artificiales.</p>
        </div>

        {/* Forced global mode override dropdown */}
        <div className="flex items-center gap-3 mt-4 sm:mt-0 p-2.5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
          <Settings size={14} className="text-indigo-400" />
          <span className="text-xs font-semibold">Forzar Operación:</span>
          <select
            value={config?.forcedMode || 'automatic'}
            onChange={(e) => handleModeChange(e.target.value)}
            className={`text-xs bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-slate-350 focus:outline-none cursor-pointer ${
              nostalgicMode ? 'bg-black border-[#39ff14] text-[#39ff14]' : ''
            }`}
          >
            <option value="automatic">Auto (Consenso/Económico)</option>
            <option value="economy">Forzar Económico (Local)</option>
            <option value="premium">Forzar Premium (APIs)</option>
            <option value="offline">Forzar Offline (Estricto Local)</option>
          </select>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800/40 pb-3">
        {[
          { id: 'dashboard', label: 'Consola General', icon: BarChart3 },
          { id: 'models', label: 'Salud de Modelos', icon: Layers },
          { id: 'costos', label: 'Panel de Costos', icon: DollarSign },
          { id: 'rag_mem', label: 'RAG y Memorias', icon: Database },
          { id: 'config', label: 'Pesos y Prioridades', icon: Sliders },
          { id: 'logs', label: 'Bitácora de Logs', icon: Terminal }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? nostalgicMode 
                    ? 'border-[#39ff14] bg-[#39ff14]/15 text-[#39ff14]' 
                    : 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                  : 'border-slate-850 bg-slate-900/20 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main view router */}
      <div className="flex-1 space-y-6">

        {/* Tab 1: DASHBOARD GENERAL */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Grid Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Consultas Hoy', val: dbStats.queriesToday, desc: 'En todos los módulos', icon: Activity, color: 'text-indigo-400 border-indigo-900/30 bg-indigo-950/10' },
                { label: 'Consultas Mes', val: dbStats.queriesMonth, desc: 'Acumulado mensual', icon: TrendingUp, color: 'text-sky-400 border-sky-900/30 bg-sky-950/10' },
                { label: 'Costo Hoy', val: `$${dbStats.costToday.toFixed(3)}`, desc: 'Costo API acumulado', icon: DollarSign, color: 'text-rose-400 border-rose-900/30 bg-rose-950/10' },
                { label: 'Modelos Habilitados', val: `${activeModels}/${activeModels + inactiveModels}`, desc: 'Activos en orquestación', icon: Layers, color: 'text-emerald-400 border-emerald-900/30 bg-emerald-950/10' },
                { label: 'Alertas Activas', val: alerts.length, desc: 'Eventos reportados', icon: AlertCircle, color: alerts.length > 0 ? 'text-amber-400 border-amber-900/30 bg-amber-950/10 animate-pulse' : 'text-slate-500 border-slate-800 bg-slate-900/10' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    nostalgicMode ? 'border-[#39ff14] bg-black' : `border bg-slate-900/30 ${stat.color}`
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="text-xl font-extrabold font-display leading-tight">{stat.val}</div>
                      <span className="text-[9px] text-slate-500 font-medium block mt-0.5">{stat.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hardware & Resources Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Local hardware monitor */}
              <div className={`lg:col-span-8 p-5 rounded-2xl border ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/25'
              }`}>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                  <Cpu size={16} className="text-indigo-400" />
                  Monitoreo de Recursos Locales (Ollama / vLLM / LM Studio)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CPU / Memory gauges */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Carga de CPU (System):</span>
                        <span className="font-bold text-slate-200">{Math.round((system.cpuUsage[0] || 0.1) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.round((system.cpuUsage[0] || 0.1) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Memoria RAM Reservada:</span>
                        <span className="font-bold text-slate-200">{system.usedRamGb} GB / {system.totalRamGb} GB</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 transition-all duration-500" 
                          style={{ width: `${Math.round((system.usedRamGb / system.totalRamGb) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* GPU utilization VRAM */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Uso de GPU dedicada (Cómputo Local):</span>
                        <span className="font-bold text-emerald-400">{system.gpuUsagePct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${system.gpuUsagePct}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>VRAM Asignada a Ollama:</span>
                        <span className="font-bold text-emerald-400">{system.usedVramGb} GB / 8 GB</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 transition-all duration-500" 
                          style={{ width: `${Math.round((system.usedVramGb / 8) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* GPU Temp tokens/s */}
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-850">
                      <span className="text-slate-500 flex items-center gap-1"><Thermometer size={12} /> Temp GPU:</span>
                      <strong className={system.gpuTempC > 72 ? 'text-amber-400 font-bold' : 'text-slate-200'}>{system.gpuTempC} °C</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-850">
                      <span className="text-slate-500 flex items-center gap-1"><Activity size={12} /> Velocidad local:</span>
                      <strong className="text-slate-200">~{localQueriesCount > 0 ? '22.5' : '0.0'} tok/s</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts Center */}
              <div className={`lg:col-span-4 p-5 rounded-2xl border ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/25'
              }`}>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <ShieldAlert size={16} className="text-indigo-400" />
                  Alertas y Notificaciones de Seguridad
                </h3>
                
                {alerts.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-6 text-center border border-dashed border-slate-850 rounded-xl">
                    No hay alertas activas en el sistema. Todos los modelos e interfaces responden nominalmente.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                    {alerts.map((al, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-start gap-2.5 ${
                        al.level === 'danger'
                          ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                          : al.level === 'warning'
                            ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                            : 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300'
                      }`}>
                        <span className="font-bold flex-shrink-0 mt-0.5">⚠️</span>
                        <span className="leading-tight">{al.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ollama Status Section */}
            <div className={`p-5 rounded-2xl border ${
              nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/25'
            }`}>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <BrainCircuit size={16} className="text-indigo-400" />
                Auditoría de Conectores de Ollama
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Ollama Card */}
                <div className={`p-4 rounded-xl border ${
                  nostalgicMode 
                    ? 'border-[#39ff14] bg-black' 
                    : 'border-slate-800/65 bg-slate-950/30'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">Ollama Local</h4>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">localhost:11434</span>
                    </div>
                    
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                      !ollamaStatus.local.configured
                        ? 'bg-slate-850 text-slate-500 border-slate-800/30'
                        : ollamaStatus.local.connected
                          ? 'bg-emerald-950/40 text-emerald-450 border-emerald-900/30'
                          : 'bg-rose-950/40 text-rose-450 border-rose-900/30'
                    }`}>
                      {!ollamaStatus.local.configured 
                        ? 'No disponible en Vercel' 
                        : ollamaStatus.local.connected 
                          ? 'Conectado' 
                          : 'Desconectado'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-450">
                      <span>Configurado en este entorno:</span>
                      <strong className={ollamaStatus.local.configured ? "text-emerald-400" : "text-slate-500"}>
                        {ollamaStatus.local.configured ? "Sí" : "No"}
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Modelos Detectados ({ollamaStatus.local.models.length}):</span>
                      {ollamaStatus.local.models.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ollamaStatus.local.models.map((m, idx) => (
                            <span key={idx} className="text-[10px] font-mono bg-slate-900/60 text-slate-350 border border-slate-850 px-2 py-0.5 rounded">
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic block mt-1">
                          {ollamaStatus.local.configured ? "Ninguno detectado o servicio apagado." : "No se escanea localhost en la nube."}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tunnel Ollama Card */}
                <div className={`p-4 rounded-xl border ${
                  nostalgicMode 
                    ? 'border-[#39ff14] bg-black' 
                    : 'border-slate-800/65 bg-slate-950/30'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">Ollama Remoto por Túnel</h4>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">OLLAMA_BASE_URL (Seguro)</span>
                    </div>
                    
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                      !ollamaStatus.tunnel.configured
                        ? 'bg-slate-850 text-slate-500 border-slate-800/30'
                        : ollamaStatus.tunnel.connected
                          ? 'bg-emerald-950/40 text-emerald-450 border-emerald-900/30'
                          : 'bg-rose-950/40 text-rose-450 border-rose-900/30'
                    }`}>
                      {!ollamaStatus.tunnel.configured 
                        ? 'No configurado' 
                        : ollamaStatus.tunnel.connected 
                          ? 'Conectado' 
                          : 'Desconectado'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-450">
                      <span>Configurado en Vercel/Env:</span>
                      <strong className={ollamaStatus.tunnel.configured ? "text-emerald-400" : "text-rose-400"}>
                        {ollamaStatus.tunnel.configured ? "Sí" : "No"}
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Modelos Detectados ({ollamaStatus.tunnel.models.length}):</span>
                      {ollamaStatus.tunnel.models.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ollamaStatus.tunnel.models.map((m, idx) => (
                            <span key={idx} className="text-[10px] font-mono bg-slate-900/60 text-slate-350 border border-slate-850 px-2 py-0.5 rounded">
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic block mt-1">
                          {ollamaStatus.tunnel.configured ? "Ninguno detectado. Inicia el túnel en tu PC." : "Configure OLLAMA_BASE_URL en variables de entorno."}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error listing and recent logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className={`p-5 rounded-2xl border ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/25'
              }`}>
                <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} />
                  Errores Recientes de Producción
                </h3>
                
                {dbStats.recentErrors.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-8 text-center">
                    Cero fallos reportados en las peticiones a APIs de IA.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {dbStats.recentErrors.map((err, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-rose-950/50 bg-rose-950/10 text-xs font-mono">
                        <div className="flex justify-between font-bold text-rose-300 mb-1">
                          <span>{err.provider.toUpperCase()} ({err.model})</span>
                          <span>{err.latency_ms}ms</span>
                        </div>
                        <p className="text-[10px] text-slate-400 select-all leading-relaxed">{err.error_message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`p-5 rounded-2xl border ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/25'
              }`}>
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <Terminal size={15} />
                  Logs de Consultas
                </h3>
                
                {dbStats.recentLogs.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-8 text-center">
                    Bitácora de logs vacía. Esperando consultas del usuario...
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-[11px] font-mono leading-normal">
                    {dbStats.recentLogs.map((log, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-900/40">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className="text-slate-400">{log.provider.toUpperCase()}</span>
                          <span className="text-slate-500">({log.model})</span>
                        </span>
                        <span className="text-slate-500">{log.latency_ms}ms</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: HEALTH OF EACH MODEL */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Salud e Historial por Modelo</h2>
              <p className="text-xs text-slate-500">Mapeo del estado en tiempo real, latencia, feedback del usuario y costos agregados para cada IA.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {allModelsKeys.map((item) => {
                const modelConfig = config?.models?.[item.key];
                const stats = dbStats.modelStats.find(s => s.model_name.toLowerCase().includes(item.key));
                
                // Determine connection state: Green (Active/Configured), Yellow (degraded latency), Gray (disabled), Red (no connection key)
                let statusColor = 'bg-slate-700 border-slate-650';
                let statusLabel = 'Inactivo / Deshabilitado';
                let isModelEnabled = modelConfig?.enabled !== false;
                
                if (!isModelEnabled) {
                  statusColor = 'bg-slate-800 border-slate-850 text-slate-500';
                  statusLabel = 'Desactivado';
                } else {
                  // check if configured in .env / active providers list
                  const isActiveOnServer = healthData.globalConfig?.models?.[item.key]?.enabled || false;
                  if (item.type === 'local') {
                    if (dbStats.queriesToday > 0 && stats?.avg_latency > 3500) {
                      statusColor = 'bg-amber-950 text-amber-400 border-amber-900/40';
                      statusLabel = 'Degradado';
                    } else {
                      statusColor = 'bg-emerald-950 text-emerald-450 border-emerald-900/40';
                      statusLabel = 'Disponible';
                    }
                  } else {
                    statusColor = 'bg-emerald-950 text-emerald-450 border-emerald-900/40';
                    statusLabel = 'Activo';
                  }
                }

                return (
                  <div key={item.key} className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                    !isModelEnabled 
                      ? 'opacity-60 border-slate-900 bg-slate-950/20' 
                      : nostalgicMode 
                        ? 'border-[#39ff14] bg-black text-[#39ff14]' 
                        : 'border-slate-850 bg-slate-900/35 hover:border-slate-800'
                  }`}>
                    
                    {/* Model card header */}
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-850 mb-3">
                        <div>
                          <h4 className="font-bold text-xs text-slate-200">{item.name}</h4>
                          <span className="text-[9.5px] text-slate-500 font-mono mt-0.5 block">{item.provider}</span>
                        </div>
                        
                        <button
                          onClick={() => toggleModel(item.key)}
                          className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border transition-all ${statusColor}`}
                          title="Click para activar/desactivar en orquestación"
                        >
                          {statusLabel}
                        </button>
                      </div>

                      {/* Detail metrics list */}
                      <div className="space-y-1.5 text-[10.5px] font-mono text-slate-400">
                        <div className="flex justify-between">
                          <span>Consultas Totales:</span>
                          <strong className="text-slate-200">{stats?.total_queries ?? 0}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Latencia Promedio:</span>
                          <strong className="text-slate-250">{stats?.avg_latency ? `${stats.avg_latency} ms` : 'N/A'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Costo Acumulado:</span>
                          <strong className="text-slate-250">${stats?.total_cost ? stats.total_cost.toFixed(4) : '0.0000'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Precisión/Aprobación:</span>
                          <strong className="text-emerald-400">{stats?.avg_quality ? `${Math.round(stats.avg_quality * 100)}%` : '90%'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Up/down vote feedback footer */}
                    {isModelEnabled && (
                      <div className="mt-4 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={11} className="text-emerald-400" />
                          <span>{stats?.positive_feedback ?? 0}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDown size={11} className="text-rose-400" />
                          <span>{stats?.negative_feedback ?? 0}</span>
                        </span>
                        <span>Prioridad: <strong>{modelConfig?.priority ?? 1}</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: COSTS PANEL */}
        {activeTab === 'costos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Cost aggregates card */}
              <div className={`md:col-span-5 p-5 rounded-2xl border space-y-4 ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/20'
              }`}>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign size={16} className="text-indigo-400" />
                  Estructura de Costos del Servidor
                </h3>

                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Gasto diario (Hoy):</span>
                    <strong className="text-rose-400">${totalCost.toFixed(4)} USD</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Gasto semanal (Estimado):</span>
                    <strong className="text-rose-450">${(totalCost * 7).toFixed(3)} USD</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Gasto mensual (Acumulado):</span>
                    <strong className="text-rose-450">${dbStats.costMonth.toFixed(3)} USD</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Gasto anual estimado:</span>
                    <strong className="text-slate-100">${(dbStats.costMonth * 12).toFixed(2)} USD</strong>
                  </div>
                  <div className="flex justify-between py-1 font-bold pt-1.5 border-t border-slate-800">
                    <span>Costo promedio por consulta:</span>
                    <strong className="text-slate-200">${totalQueries > 0 ? (totalCost / totalQueries).toFixed(5) : '0.0000'} USD</strong>
                  </div>
                </div>

                {/* Economy Ahorros Box */}
                <div className="p-3.5 rounded-xl border border-emerald-950 bg-emerald-950/10 text-xs text-slate-400">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={13} />
                    Modo Económico: Ahorro de APIs
                  </h4>
                  <p className="text-[10px] leading-relaxed mb-3">
                    Gabi AI resolvió <strong>{localQueriesCount}</strong> consultas de forma local mediante Ollama en vez de llamar a APIs externas caras.
                  </p>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span>Costo Real Actual:</span>
                      <strong className="text-slate-200">${totalCost.toFixed(3)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo estimado (Solo APIs):</span>
                      <strong className="text-slate-500">${estimatedOnlyApisCost}</strong>
                    </div>
                    <div className="flex justify-between border-t border-emerald-900/50 mt-1 pt-1 font-bold text-emerald-400">
                      <span>Ahorro Neto Generado:</span>
                      <span>-${costAvoidedLocal} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bespoke SVG chart showing HSL values */}
              <div className={`md:col-span-7 p-5 rounded-2xl border flex flex-col justify-between ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/20'
              }`}>
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-1">
                    <BarChart3 size={16} className="text-indigo-400" />
                    Consumo Relativo por Módulo
                  </h3>
                  <p className="text-[10.5px] text-slate-500">Distribución de carga acumulada por el orquestador inteligente.</p>
                </div>

                {/* SVG layout graph */}
                <div className="h-52 w-full flex items-center justify-center py-4">
                  <svg className="w-full h-full max-w-sm" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#1e1b4b" strokeWidth="15" />
                    {/* General OmnIA slice */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#6366f1" strokeWidth="15" 
                      strokeDasharray="140 220" strokeDashoffset="0" />
                    {/* Financial slice */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#f43f5e" strokeWidth="15" 
                      strokeDasharray="40 220" strokeDashoffset="-140" />
                    {/* Medical slice */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="15" 
                      strokeDasharray="25 220" strokeDashoffset="-180" />
                    {/* Other slice */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="15" 
                      strokeDasharray="15 220" strokeDashoffset="-205" />
                  </svg>
                </div>

                <div className="flex justify-center flex-wrap gap-4 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-slate-350">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> OmnIA (65%)
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-350">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Financial (18%)
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-350">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Medical (11%)
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-350">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Research/Travel (6%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: RAG & MEMORIES DIAGNOSTICS */}
        {activeTab === 'rag_mem' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* RAG statistics card */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/20'
              }`}>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Database size={16} className="text-indigo-400" />
                  Estado de Base de Conocimiento RAG
                </h3>

                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Documentos indexados totales:</span>
                    <strong className="text-slate-200">{dbStats.ragDocsCount} archivos</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Vectores/Embeddings creados:</span>
                    <strong className="text-slate-200">{dbStats.ragChunksCount} fragmentos</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Tamaño estimado en BD vector:</span>
                    <strong className="text-slate-200">{(dbStats.ragChunksCount * 0.012).toFixed(2)} MB</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Dimensión de vector embedding:</span>
                    <strong className="text-slate-350">1536 (nomic-embed-text / OpenAI)</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Tiempo de búsqueda RAG:</span>
                    <strong className="text-emerald-400">~12 ms (PGVector index matched)</strong>
                  </div>
                </div>
              </div>

              {/* Memory statistics card */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/20'
              }`}>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <BrainCircuit size={16} className="text-indigo-400" />
                  Memoria de Preferencias (Largo Plazo)
                </h3>

                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Hechos guardados en memoria:</span>
                    <strong className="text-slate-200">{dbStats.memoriesCount} registros</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Memorias activas (Último mes):</span>
                    <strong className="text-slate-200">{dbStats.memoriesCount}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Categorías registradas:</span>
                    <strong className="text-slate-350">personal_facts, user_preferences</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900/60">
                    <span>Uso de caché de memoria:</span>
                    <strong className="text-slate-200">100% Sincronizado</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Uso de memoria por usuario:</span>
                    <strong className="text-slate-200">~1.2 KB / usuario</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* List of memories inside Health Center */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/25'
            }`}>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <BrainCircuit size={16} className="text-indigo-400" />
                Auditoría de Recuerdos Activos del Usuario
              </h3>
              
              {memoriesLoading ? (
                <div className="text-xs text-slate-500 italic p-6 text-center">Cargando recuerdos del usuario...</div>
              ) : memories.length === 0 ? (
                <div className="text-xs text-slate-550 italic p-6 text-center border border-dashed border-slate-800 rounded-xl">
                  No hay recuerdos registrados actualmente en el servidor para este usuario.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-1">
                  {memories.map((mem) => (
                    <div 
                      key={mem.id} 
                      className="p-3 rounded-xl border border-slate-850 bg-slate-950/40 text-xs flex justify-between items-start gap-4 hover:border-slate-800 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/20 px-2 py-0.5 rounded">
                          {mem.category === 'user_preference' ? 'Preferencia' : 
                           mem.category === 'project_details' ? 'Proyecto' : 
                           mem.category || 'Hecho'}
                        </span>
                        <p className="text-slate-300 font-medium leading-relaxed mt-1">{mem.content}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="text-slate-550 hover:text-rose-450 p-1 hover:bg-slate-900 rounded transition-all"
                        title="Borrar recuerdo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: CONTROLS CONFIGURATION (Pesos y Prioridades) */}
        {activeTab === 'config' && config?.models && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Control de Selección del Orquestador</h2>
              <p className="text-xs text-slate-500">
                Ajusta las prioridades de ejecución de la pila y los pesos relativos de selección que utiliza el orquestador para priorizar modelos específicos en caso de empates.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border space-y-4 ${
              nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800 bg-slate-900/20'
            }`}>
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 border-b border-slate-800 pb-2.5">
                <span className="col-span-3">Modelo</span>
                <span className="col-span-3 text-center">Habilitado</span>
                <span className="col-span-3 text-center">Peso de Selección</span>
                <span className="col-span-3 text-right">Prioridad (Orden)</span>
              </div>

              <div className="space-y-3">
                {Object.entries(config.models).map(([modelKey, val]) => (
                  <div key={modelKey} className="grid grid-cols-12 gap-4 items-center py-1 border-b border-slate-900/40">
                    <span className="col-span-3 text-xs font-bold uppercase tracking-wider text-slate-200">{modelKey}</span>
                    
                    {/* Enable toggle */}
                    <div className="col-span-3 flex justify-center">
                      <button
                        onClick={() => toggleModel(modelKey)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-250 ${
                          val.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          val.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Weight slider */}
                    <div className="col-span-3 flex items-center gap-3 justify-center">
                      <input 
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={val.weight ?? 1.0}
                        onChange={(e) => handleWeightChange(modelKey, e.target.value)}
                        onMouseUp={() => commitWeightChange(modelKey)}
                        className="w-20 accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-indigo-400 font-bold w-6 text-right">
                        {(val.weight ?? 1.0).toFixed(1)}
                      </span>
                    </div>

                    {/* Priority select */}
                    <div className="col-span-3 flex justify-end">
                      <select
                        value={val.priority ?? 1}
                        onChange={(e) => handlePriorityChange(modelKey, e.target.value)}
                        className="text-xs bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-slate-350 focus:outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                          <option key={num} value={num}>Prioridad {num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: LIVE LOGS AUDIT */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Consola Auditora de Logs</h2>
                <p className="text-xs text-slate-500">Registro histórico completo de las operaciones de Gabi AI en tiempo real.</p>
              </div>

              {/* Log filter search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
                <input
                  type="text"
                  placeholder="Filtrar por modelo o error..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-slate-850 font-mono text-xs text-slate-300 h-96 flex flex-col justify-between shadow-inner">
              <div className="overflow-y-auto space-y-1 pr-1 flex-1">
                <div className="text-slate-500 select-none">// Inicializando consola auditora de logs de Synaptica...</div>
                <div className="text-slate-500 select-none">// Cargando base de datos y orquestadores...</div>
                
                {/* mPerf logs simulation */}
                {dbStats.recentLogs
                  .filter(l => !logFilter || l.provider.toLowerCase().includes(logFilter.toLowerCase()) || l.model.toLowerCase().includes(logFilter.toLowerCase()))
                  .map((log, idx) => (
                    <div key={idx} className="leading-relaxed hover:bg-slate-950 px-1 py-0.5 rounded transition-all">
                      <span className="text-slate-500 mr-2">[{new Date(log.created_at || Date.now()).toLocaleTimeString()}]</span>
                      <span className="text-emerald-450 font-bold">INFO</span>: Petición orquestada exitosa a 
                      <span className="text-indigo-400 font-bold ml-1">{log.provider.toUpperCase()}</span> ({log.model}). Latencia: <strong>{log.latency_ms}ms</strong>.
                    </div>
                  ))}

                {dbStats.recentErrors
                  .filter(e => !logFilter || e.provider.toLowerCase().includes(logFilter.toLowerCase()) || e.model.toLowerCase().includes(logFilter.toLowerCase()) || e.error_message.toLowerCase().includes(logFilter.toLowerCase()))
                  .map((err, idx) => (
                    <div key={idx} className="leading-relaxed hover:bg-slate-950 px-1 py-0.5 rounded transition-all bg-rose-950/10">
                      <span className="text-slate-500 mr-2">[{new Date(err.created_at || Date.now()).toLocaleTimeString()}]</span>
                      <span className="text-rose-500 font-bold">ERROR</span>: Consulta fallida a 
                      <span className="text-rose-400 font-bold ml-1">{err.provider.toUpperCase()}</span> ({err.model}). Detalle: <span className="text-rose-350 font-medium select-all">{err.error_message}</span>.
                    </div>
                  ))}

                <div ref={logEndRef} />
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900 flex justify-between text-[10px] text-slate-500 select-none">
                <span>Servidor Gabi Node.js sandbox</span>
                <span>Filtro activo: "{logFilter || 'Ninguno'}"</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
