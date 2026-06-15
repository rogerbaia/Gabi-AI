import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import NeuroStore from './components/NeuroStore';
import TokenMarket from './components/TokenMarket';
import SynapticMap from './components/SynapticMap';
import AdminPanel from './components/AdminPanel';
import SettingsModal from './components/SettingsModal';
import AIHealthCenter from './components/AIHealthCenter';
import AboutGabi from './components/AboutGabi';
import { Menu } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewChange = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
  };
  // --- Authentication State ---
  const [token, setToken] = useState(() => localStorage.getItem('synaptica_auth_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('synaptica_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Persistent LocalStorage State Initialization ---
  const [tokenBalance, setTokenBalance] = useState(() => {
    const val = localStorage.getItem('synaptica_token_balance');
    return val !== null ? parseInt(val) : 120; // Starts with 120 NTK
  });

  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('synaptica_active_view') || 'chat';
  });

  const [nostalgicMode, setNostalgicMode] = useState(() => {
    return localStorage.getItem('synaptica_nostalgic_mode') === 'true';
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('synaptica_selected_model') || 'omnia';
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const val = localStorage.getItem('synaptica_active_chat_id');
    return val !== null ? parseInt(val) : 1;
  });

  const [chats, setChats] = useState(() => {
    const val = localStorage.getItem('synaptica_chats');
    if (val) return JSON.parse(val);

    return [
      {
        id: 1,
        title: 'Úlcera corneal herpética recurrent...',
        folder: 'clinica',
        favorite: true,
        messages: [
          {
            id: 101,
            sender: 'user',
            text: '¿Cuál es el mejor enfoque terapéutico para una úlcera corneal herpética recurrente?'
          },
          {
            id: 102,
            sender: 'omnia',
            model: 'omnia',
            text: `### Enfoque Terapéutico para Úlcera Corneal Herpética Recurrente

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
   * Se requiere apego estricto y seguimiento clínico para evaluar adelgazamiento estromal.`,
            voted: 'up',
            thoughts: ['[OK] Analizando caso clínico', '[OK] Buscando HEDS study', '[OK] Consolidando respuestas']
          }
        ]
      },
      {
        id: 2,
        title: 'Buscador de Vuelos y Ofertas',
        folder: 'economia',
        favorite: false,
        messages: []
      }
    ];
  });

  const [p2pListings, setP2pListings] = useState(() => {
    const val = localStorage.getItem('synaptica_p2p_listings');
    if (val) return JSON.parse(val);

    return [
      { id: 10, seller: '@carlos99', tokens: 100, price: 1.00, discount: 50 },
      { id: 11, seller: '@maria_ophthal', tokens: 300, price: 2.40, discount: 60 },
      { id: 12, seller: '@dev_gabi', tokens: 500, price: 3.50, discount: 65 }
    ];
  });

  const [userListings, setUserListings] = useState(() => {
    const val = localStorage.getItem('synaptica_user_listings');
    return val ? JSON.parse(val) : [];
  });

  const [redeemedItems, setRedeemedItems] = useState(() => {
    const val = localStorage.getItem('synaptica_redeemed_items');
    return val ? JSON.parse(val) : [];
  });

  const [emails, setEmails] = useState(() => {
    const val = localStorage.getItem('synaptica_emails');
    return val ? JSON.parse(val) : [];
  });

  const [feedbackHistory, setFeedbackHistory] = useState(() => {
    const val = localStorage.getItem('synaptica_feedback_history');
    if (val) return JSON.parse(val);

    return [
      {
        query: '¿Cuál es el mejor enfoque terapéutico para una úlcera corneal herpética recurrente?',
        category: 'clinica',
        bestModel: 'perplexity',
        vote: 'up'
      }
    ];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState('general');

  // --- Synchronization Effects ---

  // Initial Sync from Backend with local fallback
  useEffect(() => {
    if (!token) return;

    async function loadData() {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const tokenRes = await fetch('/api/tokens', { headers });
        if (tokenRes.ok) {
          const { tokenBalance: backendTokens } = await tokenRes.json();
          if (backendTokens !== undefined) {
            setTokenBalance(backendTokens);
          }
        }
        const chatsRes = await fetch('/api/chats', { headers });
        if (chatsRes.ok) {
          const backendChats = await chatsRes.json();
          if (backendChats && backendChats.length > 0) {
            setChats(backendChats);
          }
        }
      } catch (err) {
        console.warn("Backend no disponible. Usando fallback de localStorage:", err);
      }
    }
    loadData();
  }, [token]);

  useEffect(() => {
    localStorage.setItem('synaptica_token_balance', tokenBalance);
    if (!token) return;
    fetch('/api/tokens', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ balance: tokenBalance })
    }).catch(() => {});
  }, [tokenBalance, token]);

  useEffect(() => {
    localStorage.setItem('synaptica_active_view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('synaptica_nostalgic_mode', nostalgicMode);
  }, [nostalgicMode]);

  useEffect(() => {
    localStorage.setItem('synaptica_selected_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('synaptica_active_chat_id', activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem('synaptica_chats', JSON.stringify(chats));
    if (!token) return;
    fetch('/api/chats', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(chats)
    }).catch(() => {});
  }, [chats, token]);

  useEffect(() => {
    localStorage.setItem('synaptica_p2p_listings', JSON.stringify(p2pListings));
  }, [p2pListings]);

  useEffect(() => {
    localStorage.setItem('synaptica_user_listings', JSON.stringify(userListings));
  }, [userListings]);

  useEffect(() => {
    localStorage.setItem('synaptica_redeemed_items', JSON.stringify(redeemedItems));
  }, [redeemedItems]);

  useEffect(() => {
    localStorage.setItem('synaptica_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('synaptica_feedback_history', JSON.stringify(feedbackHistory));
  }, [feedbackHistory]);

  // --- Helper Actions ---
  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('synaptica_auth_token', newToken);
    localStorage.setItem('synaptica_auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser.tokenBalance !== undefined) {
      setTokenBalance(newUser.tokenBalance);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('synaptica_auth_token');
    localStorage.removeItem('synaptica_auth_user');
    setToken(null);
    setUser(null);
    setActiveView('chat');
  };

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const addMessageToChat = (newMsg) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChat.id) {
        if (newMsg.sender === 'omnia_vote_update') {
          return {
            ...chat,
            messages: chat.messages.map(m => {
              if (m.id === newMsg.id) {
                return { ...m, voted: newMsg.vote };
              }
              return m;
            })
          };
        }
        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          title: chat.messages.length === 0 ? newMsg.text.substring(0, 32) + '...' : chat.title
        };
      }
      return chat;
    }));
  };

  const createNewChat = () => {
    const newId = Date.now();
    const folderMapping = {
      omnia: 'otros',
      investia: 'clinica',
      viajia: 'economia',
      nutriia: 'otros',
      econoia: 'economia',
      tubeia: 'otros',
      medica: 'clinica',
      research: 'otros'
    };
    
    const newChat = {
      id: newId,
      title: `Nuevo chat especializado`,
      folder: folderMapping[selectedModel] || 'otros',
      favorite: false,
      messages: []
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setActiveView('chat');
  };

  const addFeedbackToHistory = (item) => {
    setFeedbackHistory(prev => [item, ...prev]);
  };

  // Render Authentication overlay if not logged in
  if (!token) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        nostalgicMode={nostalgicMode} 
        setNostalgicMode={setNostalgicMode} 
      />
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${
      nostalgicMode 
        ? 'bg-black text-[#39ff14] font-mono select-none nostalgic-crt' 
        : 'bg-synaptica-darker text-slate-100 md:p-2 md:gap-2.5 p-0 gap-0'
    }`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Side Control Bar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${nostalgicMode ? 'h-full bg-black' : 'h-full bg-[#0d0f14] md:bg-transparent'}`}>
        <Sidebar
          activeView={activeView}
          setActiveView={handleViewChange}
          tokenBalance={tokenBalance}
          nostalgicMode={nostalgicMode}
          setNostalgicMode={setNostalgicMode}
          chats={chats}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          createNewChat={createNewChat}
          onOpenSettings={(tab) => {
            setIsSettingsOpen(true);
            setSettingsActiveTab(tab);
          }}
        />
      </div>

      {/* Main Panel Routing */}
      <main className={`flex-1 h-full overflow-hidden flex flex-col ${
        nostalgicMode 
          ? '' 
          : 'bg-slate-950/40 border-l border-r md:border border-slate-850/50 md:rounded-2xl shadow-2xl backdrop-blur-sm'
      }`}>
        {/* Mobile Header for Non-Chat views */}
        {activeView !== 'chat' && (
          <div className={`md:hidden flex items-center gap-3 p-4 border-b ${
            nostalgicMode 
              ? 'border-[#39ff14] bg-black text-[#39ff14] font-mono' 
              : 'bg-slate-900/60 border-slate-850 text-slate-100'
          }`}>
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-1.5 rounded-lg border ${
                nostalgicMode ? 'border-[#39ff14] text-[#39ff14]' : 'border-slate-850 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Menu size={16} />
            </button>
            <span className="text-sm font-bold">
              {activeView === 'store' && 'NeuroStore'}
              {activeView === 'market' && 'Mercado de Tokens'}
              {activeView === 'synapses' && 'Sinapsis'}
              {activeView === 'admin' && 'Logística Amazon'}
              {activeView === 'health' && 'AI Health Center'}
              {activeView === 'corazon' && 'El corazón de Gabi'}
            </span>
          </div>
        )}

        {activeView === 'chat' && (
          <ChatArea
            nostalgicMode={nostalgicMode}
            tokenBalance={tokenBalance}
            setTokenBalance={setTokenBalance}
            activeChat={activeChat}
            addMessageToChat={addMessageToChat}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            addFeedbackToHistory={addFeedbackToHistory}
            token={token}
            onOpenSettings={(tab) => {
              setIsSettingsOpen(true);
              setSettingsActiveTab(tab);
            }}
            onOpenMenu={() => setSidebarOpen(true)}
          />
        )}

        {activeView === 'store' && (
          <NeuroStore
            nostalgicMode={nostalgicMode}
            tokenBalance={tokenBalance}
            setTokenBalance={setTokenBalance}
            redeemedItems={redeemedItems}
            setRedeemedItems={setRedeemedItems}
            emails={emails}
            setEmails={setEmails}
          />
        )}

        {activeView === 'market' && (
          <TokenMarket
            nostalgicMode={nostalgicMode}
            tokenBalance={tokenBalance}
            setTokenBalance={setTokenBalance}
            userListings={userListings}
            setUserListings={setUserListings}
            p2pListings={p2pListings}
            setP2pListings={setP2pListings}
          />
        )}

        {activeView === 'synapses' && (
          <SynapticMap
            nostalgicMode={nostalgicMode}
            categoryWeights={feedbackHistory}
            feedbackHistory={feedbackHistory}
          />
        )}

        {activeView === 'admin' && (
          <AdminPanel
            nostalgicMode={nostalgicMode}
            redeemedItems={redeemedItems}
            setRedeemedItems={setRedeemedItems}
            tokenBalance={tokenBalance}
            setTokenBalance={setTokenBalance}
          />
        )}

        {activeView === 'health' && (
          <AIHealthCenter
            nostalgicMode={nostalgicMode}
            token={token}
          />
        )}

        {activeView === 'corazon' && (
          <AboutGabi
            nostalgicMode={nostalgicMode}
          />
        )}
      </main>

      {/* Settings Dashboard Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={settingsActiveTab}
        setActiveTab={setSettingsActiveTab}
        nostalgicMode={nostalgicMode}
        setNostalgicMode={setNostalgicMode}
        tokenBalance={tokenBalance}
        setTokenBalance={setTokenBalance}
        token={token}
        onLogout={handleLogout}
      />
    </div>
  );
}

// --- Glassmorphic Login/Register Sub-Component ---
function LoginScreen({ onLoginSuccess, nostalgicMode, setNostalgicMode }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al autenticar.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-screen h-screen flex items-center justify-center relative overflow-hidden p-4 select-none ${
      nostalgicMode ? 'bg-black text-[#39ff14] font-mono nostalgic-crt' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Dynamic Background Blur Glows */}
      {!nostalgicMode && (
        <>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
        </>
      )}

      {/* Auth Card */}
      <div className={`w-full max-w-md rounded-3xl border p-8 flex flex-col shadow-2xl relative z-10 transition-all duration-300 ${
        nostalgicMode 
          ? 'bg-black border-[#39ff14] text-[#39ff14] shadow-[#39ff14]/10' 
          : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xl'
      }`}>
        {/* Toggle Nostalgic Button */}
        <button
          onClick={() => setNostalgicMode(!nostalgicMode)}
          className={`absolute top-4 right-4 text-[10px] px-2 py-1 rounded border hover:opacity-80 transition-all ${
            nostalgicMode ? 'border-[#39ff14] text-[#39ff14]' : 'border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          {nostalgicMode ? 'MODE: RETRO' : 'MODE: MODERNO'}
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
            nostalgicMode ? 'border-2 border-[#39ff14]' : 'bg-indigo-600/10 border border-indigo-500/30'
          }`}>
            <span className={`text-2xl font-bold font-display ${nostalgicMode ? 'text-[#39ff14]' : 'bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent'}`}>
              G
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Gabi AI</h1>
          <p className={`text-[10px] uppercase font-mono mt-1 ${nostalgicMode ? 'text-[#39ff14]' : 'text-slate-500'}`}>
            Generative Assistance Based on Intelligence
          </p>
        </div>

        {/* Title */}
        <h2 className="text-sm font-semibold mb-4 text-center">
          {isRegister ? 'Crear nueva cuenta de Synaptica' : 'Ingresa a tu cuenta de Synaptica'}
        </h2>

        {/* Error message */}
        {errorMsg && (
          <div className={`p-3 rounded-xl text-xs text-center mb-4 border ${
            nostalgicMode 
              ? 'border-red-500 text-red-500' 
              : 'bg-red-950/20 border-red-900/40 text-red-400'
          }`}>
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Usuario</label>
            <input
              type="text"
              placeholder="Escribe tu usuario..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full text-xs p-3 rounded-xl outline-none border transition-all ${
                nostalgicMode 
                  ? 'bg-black border-[#39ff14] text-[#39ff14] placeholder-[#39ff14]/30 focus:shadow-[0_0_10px_#39ff14]' 
                  : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full text-xs p-3 rounded-xl outline-none border transition-all ${
                nostalgicMode 
                  ? 'bg-black border-[#39ff14] text-[#39ff14] placeholder-[#39ff14]/30 focus:shadow-[0_0_10px_#39ff14]' 
                  : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-xs font-bold text-center mt-2 transition-all flex items-center justify-center gap-2 ${
              nostalgicMode
                ? 'border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                : 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-extrabold shadow-lg shadow-indigo-500/10'
            } disabled:opacity-50`}
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <span>{isRegister ? 'Registrarse y Comenzar' : 'Iniciar Sesión'}</span>
            )}
          </button>
        </form>

        {/* Toggle Tab */}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setErrorMsg('');
          }}
          className={`text-xs mt-6 text-center hover:underline ${
            nostalgicMode ? 'text-[#39ff14]' : 'text-indigo-400'
          }`}
        >
          {isRegister ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
        </button>
      </div>
    </div>
  );
}
