import React, { useState } from 'react';
import { 
  MessageSquare, 
  Gift, 
  Coins, 
  Network, 
  Settings, 
  Folder, 
  FolderPlus, 
  Search, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Sparkles, 
  Heart,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  tokenBalance,
  nostalgicMode,
  setNostalgicMode,
  chats,
  activeChatId,
  setActiveChatId,
  createNewChat
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFolders, setOpenFolders] = useState({
    clinica: true,
    economia: false,
    otros: true
  });

  const toggleFolder = (folder) => {
    setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatList = (folderName) => {
    const folderChats = filteredChats.filter(chat => chat.folder === folderName);
    if (folderChats.length === 0) return <div className="text-xs text-slate-500 pl-8 py-1 italic">Sin chats</div>;

    return folderChats.map(chat => (
      <button
        key={chat.id}
        onClick={() => {
          setActiveChatId(chat.id);
          setActiveView('chat');
        }}
        className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-md text-sm text-left transition-colors ${
          activeChatId === chat.id && activeView === 'chat'
            ? nostalgicMode
              ? 'bg-black text-[#39ff14] border border-[#39ff14] nostalgic-green-text'
              : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
        }`}
      >
        <MessageSquare size={14} className="flex-shrink-0" />
        <span className="truncate">{chat.title}</span>
        {chat.favorite && <Heart size={10} className="ml-auto text-pink-500 fill-pink-500" />}
      </button>
    ));
  };

  return (
    <aside className={`w-80 flex flex-col h-full border-r ${
      nostalgicMode 
        ? 'bg-black border-[#39ff14] nostalgic-crt' 
        : 'bg-synaptica-darker border-slate-800'
    }`}>
      {/* Brand & Pulsing Logo */}
      <div className={`h-[68px] px-5 border-b flex items-center ${
        nostalgicMode ? 'border-[#39ff14]' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setActiveView('chat'); }}>
          <img
            src="/synaptica_logo.png"
            alt="Synaptica Logo"
            className={`h-6 object-contain shrink-0 ${nostalgicMode ? 'brightness-[2] hue-rotate-[90deg]' : ''}`}
          />
          <div className="flex flex-col">
            <span className={`text-lg font-bold font-display tracking-tight leading-none ${
              nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'
            }`}>
              Gabi AI
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-wide mt-0.5">
              By Synaptica
            </span>
          </div>
        </div>
      </div>

      {/* User Token Wallet */}
      <div className="p-4">
        <div className={`p-4 rounded-xl relative overflow-hidden ${
          nostalgicMode 
            ? 'border-2 border-[#39ff14] bg-black text-[#39ff14]' 
            : 'bg-gradient-to-br from-emerald-950/20 to-slate-900/50 border border-emerald-900/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Coins size={12} className={nostalgicMode ? 'text-[#39ff14]' : 'text-amber-400'} />
              Saldo NeuroTokens
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
              nostalgicMode ? 'border border-[#39ff14] text-[#39ff14]' : 'bg-emerald-900/40 text-emerald-400'
            }`}>
              ACTIVO
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-display ${nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'}`}>
              {tokenBalance.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">NTK</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setActiveView('market')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                nostalgicMode
                  ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/10'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-950/20'
              }`}
            >
              Cargar Tokens
            </button>
            <button
              onClick={() => setActiveView('store')}
              className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                nostalgicMode
                  ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/10'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/50'
              }`}
              title="Ir a Tienda de Canjes"
            >
              <Gift size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => setActiveView('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeView === 'chat'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14]' : 'bg-slate-800/80 text-slate-100 border border-slate-700/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <MessageSquare size={16} />
          <span>Chat de OmnIA</span>
        </button>

        <button
          onClick={() => setActiveView('store')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeView === 'store'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14]' : 'bg-slate-800/80 text-slate-100 border border-slate-700/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Gift size={16} />
          <span>NeuroStore (Premios)</span>
        </button>

        <button
          onClick={() => setActiveView('market')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeView === 'market'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14]' : 'bg-slate-800/80 text-slate-100 border border-slate-700/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Coins size={16} />
          <span>Mercado de Tokens</span>
        </button>

        <button
          onClick={() => setActiveView('synapses')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeView === 'synapses'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14]' : 'bg-slate-800/80 text-slate-100 border border-slate-700/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Network size={16} />
          <span className="flex items-center gap-1.5">
            Sinapsis
            <span className="text-[9px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-1 py-0.2 rounded uppercase font-bold tracking-wider animate-pulse">
              Real IA
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveView('admin')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            activeView === 'admin'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14]' : 'bg-red-950/20 text-red-400 border border-red-900/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          <ShieldAlert size={16} />
          <span>Admin Amazon Logística</span>
        </button>
      </div>

      <div className={`mx-3 my-2 border-t ${nostalgicMode ? 'border-[#39ff14]' : 'border-slate-800'}`} />

      {/* Folders & History Chats */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4">
        {/* Header and Search */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
            <span>Historial de Chats</span>
            <button 
              onClick={createNewChat}
              className="text-slate-400 hover:text-slate-200" 
              title="Nuevo Chat"
            >
              <FolderPlus size={14} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Buscar chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs pl-8 pr-3 py-2 rounded-lg outline-none transition-all ${
                nostalgicMode
                  ? 'bg-black border border-[#39ff14] text-[#39ff14] focus:ring-1 focus:ring-[#39ff14] font-mono'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-300 focus:border-slate-700 focus:bg-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Folders */}
        <div className="space-y-1">
          {/* Clinica Folder */}
          <div>
            <button
              onClick={() => toggleFolder('clinica')}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              {openFolders.clinica ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Folder size={12} className="text-amber-500 fill-amber-500/20" />
              <span className="truncate">Clínica 🩺</span>
            </button>
            {openFolders.clinica && (
              <div className="mt-0.5 space-y-0.5">
                {renderChatList('clinica')}
              </div>
            )}
          </div>

          {/* Economia Folder */}
          <div>
            <button
              onClick={() => toggleFolder('economia')}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              {openFolders.economia ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Folder size={12} className="text-blue-500 fill-blue-500/20" />
              <span className="truncate">Economía y Finanzas 🪙</span>
            </button>
            {openFolders.economia && (
              <div className="mt-0.5 space-y-0.5">
                {renderChatList('economia')}
              </div>
            )}
          </div>

          {/* Otros Folder */}
          <div>
            <button
              onClick={() => toggleFolder('otros')}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              {openFolders.otros ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Folder size={12} className="text-purple-500 fill-purple-500/20" />
              <span className="truncate">Consultas Generales 🌍</span>
            </button>
            {openFolders.otros && (
              <div className="mt-0.5 space-y-0.5">
                {renderChatList('otros')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer controls: Nostalgic dial-up settings */}
      <div className={`p-4 border-t ${
        nostalgicMode ? 'border-[#39ff14] bg-black/80' : 'border-slate-800 bg-slate-950/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {nostalgicMode ? (
              <Volume2 className="text-[#39ff14] animate-pulse" size={16} />
            ) : (
              <VolumeX className="text-slate-500" size={16} />
            )}
            <span className={`text-xs ${
              nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-400 font-medium'
            }`}>
              Modo Nostálgico V.34
            </span>
          </div>
          <button
            onClick={() => setNostalgicMode(!nostalgicMode)}
            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              nostalgicMode 
                ? 'bg-[#39ff14]' 
                : 'bg-slate-800'
            }`}
            role="switch"
            aria-checked={nostalgicMode}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                nostalgicMode 
                  ? 'translate-x-5 bg-black' 
                  : 'translate-x-0 bg-slate-400'
              }`}
            />
          </button>
        </div>
        {nostalgicMode && (
          <p className="text-[9px] text-[#39ff14] opacity-80 mt-1 font-mono leading-tight">
            * Se reproducirán sonidos de módem al razonar.
          </p>
        )}
      </div>
    </aside>
  );
}
