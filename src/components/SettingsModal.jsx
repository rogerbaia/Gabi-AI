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
  Workflow
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
      group: 'Cuenta',
      items: [
        { id: 'cuenta', label: 'Cuenta', icon: User },
        { id: 'general', label: 'General', icon: SlidersHorizontal },
        { id: 'billing', label: 'Uso y facturación', icon: Coins },
        { id: 'personalizacion', label: 'Personalización', icon: LayoutGrid },
      ]
    },
    {
      group: 'Características',
      items: [
        { id: 'correo', label: 'Correo Gabi', icon: Mail },
        { id: 'data', label: 'Controles de datos', icon: FolderLock },
        { id: 'computer', label: 'My Computer', icon: Monitor },
        { id: 'plugins', label: 'Mis plugins', icon: LayoutGrid },
        { id: 'integraciones', label: 'Integraciones', icon: Workflow },
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
          
          {/* Tab 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">General</h2>
                <p className="text-xs text-slate-500 mt-1">Configura las preferencias de tu espacio de trabajo de Gabi AI.</p>
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-350 block">Apariencia</label>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Idioma</span>
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
                <label className="text-xs font-semibold text-slate-350 block">Tema</label>
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
                <label className="text-xs font-semibold text-slate-350 block">Preferencias de comunicación</label>
                
                {/* Toggle 1 */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Notificaciones del navegador</span>
                    <span className="text-[10px] text-slate-500">Reciba notificaciones en su navegador cuando haya nuevos avances o se complete una tarea.</span>
                  </div>
                  <button
                    onClick={() => handleToggle(notifications, setNotifications)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      notifications ? 'bg-blue-600' : 'bg-slate-800'
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
                    <span className="text-xs font-semibold">Recibir actualizaciones del producto</span>
                    <span className="text-[10px] text-slate-500">Obtén acceso anticipado a lanzamientos de funciones e historias de éxito para optimizar tu flujo de trabajo.</span>
                  </div>
                  <button
                    onClick={() => handleToggle(productUpdates, setProductUpdates)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      productUpdates ? 'bg-blue-600' : 'bg-slate-800'
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
                    <span className="text-xs font-semibold">Envíame un correo electrónico cuando comience mi tarea en cola</span>
                    <span className="text-[10px] text-slate-500">Cuando esté habilitado, te enviaremos un correo electrónico oportuno una vez que tu tarea termine de hacer cola y comience a procesarse.</span>
                  </div>
                  <button
                    onClick={() => handleToggle(emailOnQueue, setEmailOnQueue)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      emailOnQueue ? 'bg-blue-600' : 'bg-slate-800'
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

          {/* Tab 2: CUENTA */}
          {activeTab === 'cuenta' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Mi Cuenta</h2>
                <p className="text-xs text-slate-500 mt-1">Gestiona tus credenciales y perfil personal.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                  <span className="text-xs text-slate-400">Usuario</span>
                  <span className="text-xs font-semibold">Rogerio Baia</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
                  <span className="text-xs text-slate-400">Email</span>
                  <span className="text-xs font-semibold">rogerio@synaptica.ece</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Tipo de suscripción</span>
                  <span className="text-xs font-bold text-sky-400">Synaptica Enterprise</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-350 block">Credenciales de API</label>
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

          {/* Tab 3: BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Uso y facturación</h2>
                <p className="text-xs text-slate-500 mt-1">Controla tu saldo de NeuroTokens y consumo multimodelo.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
                  <span className="text-xs text-slate-500">Saldo actual</span>
                  <span className="text-2xl font-bold text-indigo-400">{tokenBalance} NTK</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
                  <span className="text-xs text-slate-500">Costo por consulta (OmnIA)</span>
                  <span className="text-2xl font-bold text-emerald-400">5 NTK</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-slate-350">Historial reciente de recargas</h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between py-2 border-b border-slate-900/60">
                    <span>Recarga Watch-to-Earn (Ad)</span>
                    <span className="text-emerald-400 font-bold">+10 NTK</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900/60">
                    <span>Acreditación de Feedback Útil</span>
                    <span className="text-emerald-400 font-bold">+5 NTK</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Canje de Token Market P2P</span>
                    <span className="text-emerald-400 font-bold">+100 NTK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: PERSONALIZACION */}
          {activeTab === 'personalizacion' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Personalización</h2>
                <p className="text-xs text-slate-500 mt-1">Personaliza la velocidad y los efectos sonoros de la plataforma.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Modo Nostálgico V.34 (Sonidos de Módem)</span>
                    <span className="text-[10px] text-slate-500">Reproducir pitidos analógicos de marcado telefónico al procesar.</span>
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
                  <span className="text-xs font-semibold text-slate-350 block">Velocidad de Animación</span>
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

          {/* Tab 5: CORREO */}
          {activeTab === 'correo' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Bandeja de Correo Gabi</h2>
                <p className="text-xs text-slate-500 mt-1">Mensajes y confirmaciones enviados por el sistema de logística.</p>
              </div>
              <div className="text-xs text-slate-500 p-8 rounded-2xl border border-dashed border-slate-800 text-center">
                No tienes correos nuevos. Los correos de logística y canjes de premios aparecerán aquí y en la NeuroStore.
              </div>
            </div>
          )}

          {/* Tab 6: MY COMPUTER */}
          {activeTab === 'computer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">My Computer</h2>
                <p className="text-xs text-slate-500 mt-1">Configuración del sandbox de la computadora virtual de Gabi AI.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-350 block flex justify-between">
                    <span>Núcleos de vCPU asignados:</span>
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
                    <span>Memoria RAM asignada:</span>
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
                    <span>Disco Duro SSD:</span>
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

          {/* Tab 7: PLUGINS */}
          {activeTab === 'plugins' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Mis Plugins</h2>
                <p className="text-xs text-slate-500 mt-1">Habilita o deshabilita las herramientas de interacción de la computadora virtual.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={16} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Google Search API</span>
                      <span className="text-[10px] text-slate-500">Búsquedas en tiempo real en la web.</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-bold">ACTIVO</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu size={16} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Python Sandbox Runtime</span>
                      <span className="text-[10px] text-slate-500">Ejecución segura de scripts python locales.</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-bold">ACTIVO</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Logística API Integration</span>
                      <span className="text-[10px] text-slate-500">Acceso a devoluciones de Amazon.</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-bold">ACTIVO</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: INTEGRACIONES */}
          {activeTab === 'integraciones' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display">Integraciones de Modelos</h2>
                <p className="text-xs text-slate-500 mt-1">Enlaces y estados de conexión con los proveedores de Inteligencia Artificial.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>OpenAI API Status</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>Anthropic (Claude 3) API Status</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>Perplexity AI Search Status</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-850 bg-slate-900/40 flex justify-between items-center text-xs">
                  <span>DeepSeek API Status</span>
                  <span className="text-emerald-400 font-bold">CONECTADO</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
