import React, { useState } from 'react';
import { 
  X, 
  User, 
  Settings, 
  Coins, 
  FolderLock, 
  Mail, 
  SlidersHorizontal, 
  LayoutGrid, 
  Monitor, 
  HelpCircle, 
  Volume2, 
  Moon, 
  Sun, 
  Laptop, 
  Bell, 
  Key, 
  Cpu, 
  Database, 
  Workflow,
  Sparkles
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  activeTab = 'general',
  setActiveTab,
  nostalgicMode,
  setNostalgicMode,
  tokenBalance,
  setTokenBalance
}) {
  if (!isOpen) return null;

  // Local state for settings preferences
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('dark'); // claro, oscuro, automatico
  const [notifications, setNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [emailOnQueue, setEmailOnQueue] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState('normal'); // slow, normal, fast
  const [cpuCores, setCpuCores] = useState(4);
  const [ramSize, setRamSize] = useState(8);
  const [storageSize, setStorageSize] = useState(50);
  const [apiKey, setApiKey] = useState('sk-synaptica-••••••••••••••••');

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
        { id: 'integraciones', label: 'Conectores de API', icon: Workflow },
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
      {/* Modal Card */}
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
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                R
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold truncate">Rogerio Baia</span>
                <span className="text-[10px] text-slate-500 font-medium">Personal</span>
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
                
                {/* Toggle 1 */}
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

                {/* Toggle 2 */}
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

                {/* Toggle 3 */}
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
                  <span className="text-xs font-semibold">Rogerio Baia</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                  <span className="text-xs text-slate-400">Correo Registrado</span>
                  <span className="text-xs font-semibold">rogerio@synaptica.ece</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Categoría de Cuenta</span>
                  <span className="text-xs font-bold text-sky-400">Synaptica Enterprise</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-350 block">Llave de API Synaptica</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    readOnly
                    value={apiKey}
                    className="flex-1 text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 outline-none text-slate-400"
                  />
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg">
                    Copiar
                  </button>
                </div>
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
                    <Database size={16} className="text-indigo-400" />
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

          {/* Tab 8: INTEGRACIONES (Conectores de API) */}
          {activeTab === 'integraciones' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Conectores de API</h2>
                <p className="text-xs text-slate-500 mt-1">Estado de los puentes de comunicación y endpoints con redes de Modelos de Lenguaje.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>Canal OpenAI API</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>Canal Anthropic Claude</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>Canal Perplexity Search</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>Canal DeepSeek API</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 9: DATA (Memoria y Privacidad) */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Memoria y Privacidad</h2>
                <p className="text-xs text-slate-500 mt-1">Controla las políticas de retención de datos, historial y vaciado de caché local de tus conversaciones.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Historial del Chat & Entrenamiento</span>
                    <span className="text-[10px] text-slate-500">Permitir guardar nuevos chats en este dispositivo para mejorar las respuestas de Gabi.</span>
                  </div>
                  <button
                    onClick={() => {}}
                    className="w-10 h-5 rounded-full p-0.5 transition-colors bg-[#7ED4FD]"
                  >
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Cifrado de Extremo a Extremo</span>
                    <span className="text-[10px] text-slate-500">Proteger las credenciales de API locales con llave de seguridad criptográfica.</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-bold">ACTIVO</span>
                </div>

                <div className="pt-4 border-t border-slate-900/60">
                  <span className="text-xs font-semibold text-slate-350 block mb-2">Acciones de Limpieza</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-red-950/40 hover:bg-red-950/60 border border-red-900/40 text-red-300 text-xs font-semibold rounded-lg transition-colors">
                      Borrar Historial Local
                    </button>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
                      Vaciar Caché del Servidor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
