import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Settings, 
  Coins, 
  FolderLock, 
  Mail, 
  SlidersHorizontal, 
  LayoutGrid, 
  Cpu, 
  Workflow,
  Sparkles,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  LogOut,
  CheckCircle,
  AlertCircle,
  Trash2,
  BrainCircuit,
  Edit2,
  Lock,
  Unlock,
  Download,
  Check,
  Calendar
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  activeTab = 'general',
  setActiveTab,
  nostalgicMode,
  setNostalgicMode,
  tokenBalance,
  setTokenBalance,
  token,
  onLogout
}) {
  if (!isOpen) return null;

  // Local state for settings preferences
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [emailOnQueue, setEmailOnQueue] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  const [cpuCores, setCpuCores] = useState(4);
  const [ramSize, setRamSize] = useState(8);
  const [storageSize, setStorageSize] = useState(50);

  const [providerStatus, setProviderStatus] = useState({
    openai: false,
    anthropic: false,
    perplexity: false,
    deepseek: false,
    gemini: false,
    grok: false,
    mistral: false,
    qwen: false,
    llama: false,
    gemma: false,
    phi: false,
    openrouter: false
  });

  const [localModelsList, setLocalModelsList] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [availableLocalProviders, setAvailableLocalProviders] = useState([]);

  // Adaptive Learning System state variables
  const [memories, setMemories] = useState([]);
  const [autoLearning, setAutoLearning] = useState(true);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editContent, setEditContent] = useState('');

  // Load provider statuses, local models, global config and memories from backend on open
  useEffect(() => {
    if (isOpen && token) {
      // Fetch status
      fetch('/api/providers/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setProviderStatus(data.status);
          }
        })
        .catch(err => console.error("Error fetching provider statuses:", err));

      // Fetch detected local models
      fetch('/api/providers/detect', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setLocalModelsList(data.localModels || []);
          setIsOfflineMode(data.offlineMode || false);
          setAvailableLocalProviders(data.availableLocalProviders || []);
        })
        .catch(err => console.error("Error fetching local providers:", err));

      // Fetch global config for autoLearning state
      fetch('/api/admin/health', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.globalConfig) {
            setAutoLearning(data.globalConfig.autoLearningEnabled !== false);
          }
        })
        .catch(err => console.error("Error fetching global config:", err));

      // Fetch user memories list
      setMemoriesLoading(true);
      fetch('/api/memories', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setMemories(data || []);
          setMemoriesLoading(false);
        })
        .catch(err => {
          console.error("Error fetching memories:", err);
          setMemoriesLoading(false);
        });
    }
  }, [isOpen, token]);

  const handleToggleAutoLearning = () => {
    const nextVal = !autoLearning;
    setAutoLearning(nextVal);
    
    fetch('/api/admin/health', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const currentConfig = data.globalConfig || { models: {} };
        const updatedConfig = {
          ...currentConfig,
          autoLearningEnabled: nextVal
        };
        
        fetch('/api/admin/config', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedConfig)
        })
          .then(res => res.json())
          .catch(err => console.error("Error saving global config:", err));
      });
  };

  const handleDeleteMemory = (id) => {
    fetch(`/api/memories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMemories(prev => prev.filter(m => m.id !== id));
        }
      })
      .catch(err => console.error("Error deleting memory:", err));
  };

  const handleUpdateMemory = (id, updates) => {
    fetch(`/api/memories/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMemories(prev => prev.map(m => {
            if (m.id === id) {
              return { ...m, ...updates };
            }
            return m;
          }));
        }
      })
      .catch(err => console.error("Error updating memory:", err));
  };

  const handleConfirmMemory = (id) => {
    handleUpdateMemory(id, { status: 'Confirmada' });
  };

  const handleConfirmAsTemporal = (id) => {
    handleUpdateMemory(id, { status: 'Temporal' });
  };

  const handleToggleBlockMemory = (id, isCurrentlyBlocked) => {
    handleUpdateMemory(id, { blocked: !isCurrentlyBlocked });
  };

  const handleStartEdit = (mem) => {
    setEditingMemoryId(mem.id);
    setEditCategory(mem.category || 'user_preference');
    setEditContent(mem.content || '');
  };

  const handleSaveEdit = (id) => {
    handleUpdateMemory(id, { category: editCategory, content: editContent });
    setEditingMemoryId(null);
  };

  const handleExportMemories = () => {
    fetch('/api/memories/export', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gabi_memories_export.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error("Error exporting memories:", err));
  };

  const categories = [
    {
      group: 'Panel de Control',
      items: [
        { id: 'general', label: 'Espacio de Trabajo', icon: SlidersHorizontal },
        { id: 'personalizacion', label: 'Estilo y Efectos', icon: Sparkles },
        { id: 'billing', label: 'NeuroTokens y Facturación', icon: Coins },
        { id: 'cuenta', label: 'Perfil de Usuario', icon: User },
      ]
    },
    {
      group: 'Sistemas de Cómputo',
      items: [
        { id: 'computer', label: 'Servidor y Hardware', icon: Cpu },
        { id: 'plugins', label: 'Habilidades de IA', icon: LayoutGrid },
        { id: 'integraciones', label: 'Proveedores de IA', icon: Workflow },
        { id: 'data', label: 'Memoria y Privacidad', icon: FolderLock },
        { id: 'correo', label: 'Logística de Envío', icon: Mail },
      ]
    }
  ];

  const handleToggle = (state, setState) => {
    setState(!state);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl h-[600px] rounded-3xl border overflow-hidden flex shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${
        nostalgicMode 
          ? 'bg-black border-[#39ff14] text-[#39ff14] font-mono' 
          : 'bg-[#18181b] border-slate-800 text-slate-100'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-slate-800 z-10 ${
            nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <X size={16} />
        </button>

        {/* Sidebar (Left Column) */}
        <div className={`w-64 border-r flex flex-col justify-between ${
          nostalgicMode ? 'border-[#39ff14] bg-black' : 'border-slate-800/80 bg-[#121214]'
        }`}>
          {/* Top Profile Header */}
          <div className="p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-sm">
                U
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold truncate">Usuario Activo</span>
                <span className="text-[10px] text-slate-500 font-medium">Synaptica Gabi AI</span>
              </div>
            </div>
          </div>

          {/* Navigation Categories */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {categories.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2">
                  {group.group}
                </h4>
                <div className="space-y-[2px]">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors font-medium ${
                          isActive
                            ? nostalgicMode
                              ? 'bg-[#39ff14]/15 border border-[#39ff14] text-[#39ff14]'
                              : 'bg-slate-800 text-slate-100 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                      >
                        <Icon size={13} className={isActive && !nostalgicMode ? 'text-indigo-400' : ''} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Help */}
          <div className="p-4 border-t border-slate-800/50 text-[10px] text-slate-500 flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-350">
            <HelpCircle size={12} />
            <span>Obtener ayuda</span>
          </div>
        </div>

        {/* Content Panel (Right Column) */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {/* Tab 1: GENERAL (Espacio de Trabajo) */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Espacio de Trabajo</h2>
                <p className="text-xs text-slate-500 mt-1">Configura las preferencias base y el idioma global para tu entorno de Synaptica.</p>
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-350 block">Apariencia</label>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Idioma del Entorno</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-48 text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 outline-none text-slate-200 focus:border-slate-700"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Theme selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-350 block">Tema Visual</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      theme === 'light'
                        ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Sun size={16} />
                    <span className="text-[10px] font-bold">Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      theme === 'dark'
                        ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Moon size={16} />
                    <span className="text-[10px] font-bold">Oscuro</span>
                  </button>
                  <button
                    onClick={() => setTheme('auto')}
                    className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      theme === 'auto'
                        ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Laptop size={16} />
                    <span className="text-[10px] font-bold">Automático</span>
                  </button>
                </div>
              </div>

              {/* Communication Preferences */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-slate-350 block">Alertas de Actividad</label>
                
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Notificaciones del Sistema</span>
                    <span className="text-[10px] text-slate-500">Recibe alertas en segundo plano cuando finalice una tarea de cómputo o análisis.</span>
                  </div>
                  <button
                    onClick={() => handleToggle(notifications, setNotifications)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      notifications ? 'bg-[#7ED4FD] text-slate-950' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      notifications ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Novedades de Gabi AI</span>
                    <span className="text-[10px] text-slate-500">Obtén avisos sobre nuevos modelos, actualizaciones de seguridad y parches de rendimiento.</span>
                  </div>
                  <button
                    onClick={() => handleToggle(productUpdates, setProductUpdates)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      productUpdates ? 'bg-[#7ED4FD] text-slate-950' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      productUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Avisos de Tareas en Cola por E-mail</span>
                    <span className="text-[10px] text-slate-500">Envíanos un correo electrónico en cuanto tu agente empiece a procesar la tarea en la nube.</span>
                  </div>
                  <button
                    onClick={() => handleToggle(emailOnQueue, setEmailOnQueue)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      emailOnQueue ? 'bg-[#7ED4FD] text-slate-950' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      emailOnQueue ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: CUENTA (Perfil de Usuario) */}
          {activeTab === 'cuenta' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Perfil de Usuario</h2>
                <p className="text-xs text-slate-500 mt-1">Datos de tu identidad digital y llaves de acceso en la red Synaptica.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                  <span className="text-xs text-slate-400">Identificador</span>
                  <span className="text-xs font-semibold">Usuario de Synaptica</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                  <span className="text-xs text-slate-400">Estado de Cuenta</span>
                  <span className="text-xs font-bold text-sky-400">Synaptica Real Platform</span>
                </div>
              </div>

              {/* Log Out Button */}
              <div className="pt-4 border-t border-slate-900/60 flex flex-col gap-3">
                <span className="text-xs font-semibold text-slate-350 block">Acciones de Cuenta</span>
                <button 
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-950/40 hover:bg-red-950/60 border border-red-900/40 text-red-300 text-xs font-bold rounded-xl transition-colors"
                >
                  <LogOut size={14} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: BILLING (NeuroTokens y Facturación) */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">NeuroTokens y Facturación</h2>
                <p className="text-xs text-slate-500 mt-1">Monitorea tu saldo disponible de NeuroTokens (NTK) y el costo de procesamiento multimodelo.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
                  <span className="text-xs text-slate-500">Saldo Disponible</span>
                  <span className="text-2xl font-bold text-indigo-400">{tokenBalance} NTK</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
                  <span className="text-xs text-slate-500">Tarifa por Consulta OmnIA</span>
                  <span className="text-2xl font-bold text-emerald-400">5 NTK</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-slate-350">Bitácora de Transacciones</h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between py-2 border-b border-slate-900/60">
                    <span>Bono de Publicidad Watch-to-Earn</span>
                    <span className="text-emerald-400 font-bold">+10 NTK</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900/60">
                    <span>Recompensa por Feedback de Sistema</span>
                    <span className="text-emerald-400 font-bold">+5 NTK</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Transferencia Mercado P2P</span>
                    <span className="text-emerald-400 font-bold">+100 NTK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: PERSONALIZACION (Estilo y Efectos) */}
          {activeTab === 'personalizacion' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Estilo y Efectos</h2>
                <p className="text-xs text-slate-500 mt-1">Personaliza la estética visual y el comportamiento sonoro de Gabi AI.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Modo Retro Dial-Up V.34</span>
                    <span className="text-[10px] text-slate-500">Reproducir efectos acústicos analógicos al realizar razonamientos profundos.</span>
                  </div>
                  <button
                    onClick={() => setNostalgicMode(!nostalgicMode)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      nostalgicMode ? 'bg-[#39ff14]' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      nostalgicMode ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-350 block">Frecuencia de Animación</span>
                  <div className="flex gap-2">
                    {['lenta', 'normal', 'rápida'].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setAnimationSpeed(speed === 'lenta' ? 'slow' : (speed === 'normal' ? 'normal' : 'fast'))}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          (animationSpeed === 'slow' && speed === 'lenta') || 
                          (animationSpeed === 'normal' && speed === 'normal') || 
                          (animationSpeed === 'fast' && speed === 'rápida')
                            ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                            : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {speed.charAt(0).toUpperCase() + speed.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: CORREO (Logística de Envío) */}
          {activeTab === 'correo' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Logística de Envío</h2>
                <p className="text-xs text-slate-500 mt-1">Seguimiento de envíos, canjes físicos e interacciones con el sandbox de logística de Amazon.</p>
              </div>
              <div className="text-xs text-slate-500 p-8 rounded-2xl border border-dashed border-slate-800 text-center">
                No hay notificaciones de envíos pendientes. Los recibos de canjes de la NeuroStore y alertas de entrega de Amazon se registrarán aquí.
              </div>
            </div>
          )}

          {/* Tab 6: MY COMPUTER (Servidor y Hardware) */}
          {activeTab === 'computer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Servidor y Hardware</h2>
                <p className="text-xs text-slate-500 mt-1">Dimensiona los recursos de hardware virtuales asignados para la ejecución de agentes en segundo plano.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-350 block flex justify-between">
                    <span>Capacidad de vCPU:</span>
                    <span className="text-indigo-400 font-bold">{cpuCores} Cores</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={cpuCores}
                    onChange={(e) => setCpuCores(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-350 block flex justify-between">
                    <span>Memoria RAM Reservada:</span>
                    <span className="text-indigo-400 font-bold">{ramSize} GB</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="64"
                    step="2"
                    value={ramSize}
                    onChange={(e) => setRamSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-350 block flex justify-between">
                    <span>Espacio SSD en la Nube:</span>
                    <span className="text-indigo-400 font-bold">{storageSize} GB</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={storageSize}
                    onChange={(e) => setStorageSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: PLUGINS (Habilidades de IA) */}
          {activeTab === 'plugins' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Habilidades de IA</h2>
                <p className="text-xs text-slate-500 mt-1">Activa o desactiva herramientas y scripts dinámicos con los que Gabi AI interactúa en el sandbox.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={16} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Buscador Integrado Web</span>
                      <span className="text-[10px] text-slate-500">Consultas directas a internet en tiempo real.</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-bold">ACTIVO</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu size={16} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Entorno de Ejecución Python</span>
                      <span className="text-[10px] text-slate-500">Intérprete aislado para análisis numérico y automatización.</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-bold">ACTIVO</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Integración de Envíos</span>
                      <span className="text-[10px] text-slate-500">Módulo de conexión para simulación de entregas y devoluciones.</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-bold">ACTIVO</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: INTEGRACIONES / PROVEEDORES (AI Providers Status) */}
          {activeTab === 'integraciones' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Proveedores de IA</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Estado en tiempo real de los proveedores de inteligencia artificial configurados de forma segura en el servidor privado de Gabi AI.
                </p>
              </div>

              {/* Local Ollama Detection Card */}
              <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                nostalgicMode ? 'border-[#39ff14] bg-black text-[#39ff14]' : 'border-slate-800 bg-slate-900/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${localModelsList.length > 0 ? 'bg-emerald-450 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-xs font-bold font-mono">Servidor Ollama Local:</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                    localModelsList.length > 0 
                      ? nostalgicMode ? 'border-[#39ff14]' : 'bg-emerald-950 text-emerald-450 border-emerald-900/30' 
                      : nostalgicMode ? 'border-red-500 text-red-500' : 'bg-red-950 text-red-400 border-red-900/30'
                  }`}>
                    {localModelsList.length > 0 ? 'CONECTADO (http://localhost:11434)' : 'DESCONECTADO'}
                  </span>
                </div>
                <div className="text-[11px] font-mono">
                  {localModelsList.length > 0 ? (
                    <div>
                      <div className="font-bold mb-1.5 text-slate-300">Modelos Locales Instalados:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {localModelsList.map((model, idx) => (
                          <span key={idx} className="bg-slate-950 text-indigo-400 px-2 py-0.5 rounded border border-slate-850 text-[10px]">
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">Inicia Ollama en tu sistema local para que Gabi AI pueda conectarse automáticamente.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {Object.entries(providerStatus).map(([providerName, isActive]) => (
                  <div 
                    key={providerName}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                      nostalgicMode 
                        ? 'border-[#39ff14] bg-black text-[#39ff14]' 
                        : 'bg-slate-900/45 border-slate-800/80 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        nostalgicMode 
                          ? 'border-[#39ff14]' 
                          : isActive 
                            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-500'
                      }`}>
                        <Workflow size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {providerName === 'openai' ? 'OpenAI (GPT-4o)' :
                           providerName === 'anthropic' ? 'Anthropic (Claude 3.5)' :
                           providerName === 'perplexity' ? 'Perplexity Search' :
                           providerName === 'deepseek' ? 'DeepSeek (Local/API)' :
                           providerName === 'gemini' ? 'Google Gemini 1.5' :
                           providerName === 'grok' ? 'xAI Grok 2' :
                           providerName === 'mistral' ? 'Mistral AI (Local/API)' :
                           providerName === 'qwen' ? 'Qwen (Local/API)' :
                           providerName === 'llama' ? 'Llama (Local/API)' :
                           providerName === 'gemma' ? 'Gemma (Local/API)' :
                           providerName === 'phi' ? 'Phi (Local/API)' :
                           providerName === 'openrouter' ? 'OpenRouter Gateway' :
                           'Custom Model'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          {['llama', 'mistral', 'qwen', 'deepseek', 'gemma', 'phi'].includes(providerName)
                            ? 'Modelo local híbrido con fallback a API oficial'
                            : providerName === 'openrouter'
                              ? 'Pasarela de contingencia global multimodelo'
                              : 'Conector HTTP nativo de Synaptica'}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          nostalgicMode 
                            ? 'border-[#39ff14]' 
                            : 'bg-emerald-950 text-emerald-400 border-emerald-900/30'
                        }`}>
                          <CheckCircle size={10} />
                          <span>Activo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-950 text-slate-500 border border-slate-850">
                          <AlertCircle size={10} />
                          <span>Inactivo</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 9: DATA (Memoria y Privacidad) */}
          {activeTab === 'data' && (
            <div className="space-y-6 flex flex-col h-full">
              <div>
                <h2 className="text-xl font-bold font-display">Memoria y Privacidad</h2>
                <p className="text-xs text-slate-500 mt-1">Controla las políticas de retención de datos, recuerdos autónomos y configuración de aprendizaje.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <BrainCircuit size={14} className="text-indigo-400" />
                      Aprendizaje Autónomo de Gabi
                    </span>
                    <span className="text-[10px] text-slate-500">Permite que Gabi extraiga automáticamente preferencias y proyectos de tus chats (cada 5 turnos).</span>
                  </div>
                  <button
                    onClick={handleToggleAutoLearning}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      autoLearning ? 'bg-[#7ED4FD] text-slate-950' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      autoLearning ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* User Memories List Display */}
              <div className="space-y-3 pt-2 flex-1 flex flex-col min-h-0 select-none">
                {/* Pending memories section */}
                {memories.filter(m => m.status === 'Pendiente de Confirmación' && !m.blocked).length > 0 && (
                  <div className="p-3.5 rounded-2xl border border-indigo-500/25 bg-indigo-950/15 space-y-2.5 shrink-0">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                      <BrainCircuit size={13} className="animate-pulse" />
                      <span>Gabi detectó estas posibles preferencias en tus chats. ¿Deseas guardarlas?</span>
                    </div>
                    <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                      {memories.filter(m => m.status === 'Pendiente de Confirmación' && !m.blocked).map(mem => (
                        <div key={mem.id} className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-xl text-[11px] flex justify-between items-start gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] uppercase font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900/35 px-1.5 py-0.5 rounded">
                                {mem.category === 'user_preference' ? 'Preferencia' : 
                                 mem.category === 'project_details' ? 'Proyecto' : 
                                 mem.category}
                              </span>
                              <span className="text-[8px] text-slate-500 font-mono">
                                Confianza: {Math.round((mem.confidence || 0.8) * 100)}%
                              </span>
                            </div>
                            <p className="text-slate-300 font-medium">{mem.content}</p>
                          </div>
                          <div className="flex gap-1 shrink-0 items-center">
                            <button 
                              onClick={() => handleConfirmMemory(mem.id)}
                              className="px-2 py-0.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded text-[9px] font-bold flex items-center gap-0.5 transition-all"
                            >
                              <Check size={9} /> Guardar
                            </button>
                            <button 
                              onClick={() => handleConfirmAsTemporal(mem.id)}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded text-[9px] font-semibold transition-all"
                            >
                              Temporal
                            </button>
                            <button 
                              onClick={() => handleToggleBlockMemory(mem.id, false)}
                              className="p-1 text-slate-550 hover:text-slate-300 rounded transition-all"
                              title="Bloquear"
                            >
                              <Lock size={10} />
                            </button>
                            <button 
                              onClick={() => handleDeleteMemory(mem.id)}
                              className="p-1 text-slate-550 hover:text-rose-400 rounded transition-all"
                              title="Rechazar"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-xs font-semibold text-slate-350 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span>Recuerdos de Gabi AI sobre ti</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({memories.filter(m => m.status !== 'Pendiente de Confirmación').length} hechos activos)
                    </span>
                  </div>
                  <button
                    onClick={handleExportMemories}
                    className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer border border-indigo-900/30 bg-indigo-950/20 px-2 py-0.5 rounded"
                  >
                    <Download size={10} /> Exportar JSON
                  </button>
                </h3>
                
                {memoriesLoading ? (
                  <div className="text-xs text-slate-500 italic p-6 text-center border border-dashed border-slate-850 rounded-xl">
                    Cargando recuerdos...
                  </div>
                ) : memories.filter(m => m.status !== 'Pendiente de Confirmación').length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic p-6 text-center border border-dashed border-slate-850 rounded-xl leading-relaxed">
                    No hay recuerdos activos registrados aún. Gabi extraerá y guardará información automáticamente mientras converses.
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-56 pr-1.5 scrollbar-thin">
                    {memories.filter(m => m.status !== 'Pendiente de Confirmación').map((mem) => {
                      const isEditing = editingMemoryId === mem.id;
                      const isBlocked = !!mem.blocked;
                      const isTemporal = mem.status === 'Temporal';

                      return (
                        <div 
                          key={mem.id} 
                          className={`p-3 rounded-xl border text-xs flex justify-between items-start gap-4 transition-all ${
                            isBlocked 
                              ? 'border-red-950/20 bg-red-950/5 opacity-60' 
                              : 'border-slate-850 bg-slate-950/30 hover:border-slate-800'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value)}
                                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-indigo-400 outline-none w-1/3"
                                  placeholder="Categoría"
                                  autoFocus
                                />
                                <span className="text-[10px] text-slate-500 self-center">Edición inline</span>
                              </div>
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-200 outline-none h-14 resize-none"
                                placeholder="Contenido"
                              />
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleSaveEdit(mem.id)}
                                  className="px-2 py-0.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded text-[9px] font-bold"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={() => setEditingMemoryId(null)}
                                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded text-[9px] font-semibold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-1 text-[9px]">
                                <span className={`uppercase font-bold border px-1.5 py-0.2 rounded ${
                                  isTemporal 
                                    ? 'text-amber-400 bg-amber-950/40 border-amber-900/20' 
                                    : 'text-indigo-400 bg-indigo-950/40 border-indigo-900/20'
                                }`}>
                                  {mem.category === 'user_preference' ? 'Preferencia' : 
                                   mem.category === 'project_details' ? 'Proyecto' : 
                                   mem.category || 'Hecho'}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded-full font-semibold border ${
                                  isTemporal 
                                    ? 'bg-amber-950/20 text-amber-500 border-amber-900/20' 
                                    : 'bg-indigo-950/20 text-indigo-500 border-indigo-900/20'
                                }`}>
                                  {mem.status}
                                </span>
                                {isBlocked && (
                                  <span className="bg-red-950/45 text-red-400 border border-red-900/25 px-1.5 py-0.2 rounded-full font-bold">
                                    BLOQUEADA
                                  </span>
                                )}
                                <span className="text-slate-550 font-mono text-[8px]">
                                  Confianza: {Math.round((mem.confidence || 1.0) * 100)}%
                                </span>
                                <span className="text-slate-550 font-mono text-[8px] flex items-center gap-0.5">
                                  <Calendar size={8} /> Creado: {new Date(mem.timestamp || mem.created_at).toLocaleDateString()}
                                </span>
                                {mem.last_used_at && (
                                  <span className="text-slate-550 font-mono text-[8px]">
                                    Último uso: {new Date(mem.last_used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                              <p className={`text-slate-300 font-medium leading-relaxed ${isBlocked ? 'line-through text-slate-500' : ''}`}>
                                {mem.content}
                              </p>
                              <p className="text-[9px] text-slate-550 italic">Fuente: {mem.source || 'Manual'}</p>
                            </div>
                          )}
                          
                          {!isEditing && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => handleStartEdit(mem)}
                                className="p-1 text-slate-550 hover:text-indigo-400 hover:bg-slate-900 rounded transition-all"
                                title="Editar"
                              >
                                <Edit2 size={11} />
                              </button>
                              <button
                                onClick={() => handleToggleBlockMemory(mem.id, isBlocked)}
                                className={`p-1 rounded transition-all ${
                                  isBlocked 
                                    ? 'text-red-450 hover:bg-slate-900' 
                                    : 'text-slate-550 hover:text-red-450 hover:bg-slate-900'
                                }`}
                                title={isBlocked ? "Desbloquear" : "Bloquear"}
                              >
                                {isBlocked ? <Unlock size={11} /> : <Lock size={11} />}
                              </button>
                              <button 
                                onClick={() => handleDeleteMemory(mem.id)}
                                className="text-slate-550 hover:text-rose-450 p-1 hover:bg-slate-900 rounded transition-all"
                                title="Borrar"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-900/60 flex flex-col gap-3 shrink-0">
                <span className="text-xs font-semibold text-slate-350 block">Acciones de Limpieza</span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-red-950/40 hover:bg-red-950/60 border border-red-900/40 text-red-300 text-xs font-semibold rounded-lg transition-colors">
                    Borrar Historial de Chat
                  </button>
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
                    Vaciar Caché del Servidor
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
