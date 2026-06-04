import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import NeuroStore from './components/NeuroStore';
import TokenMarket from './components/TokenMarket';
import SynapticMap from './components/SynapticMap';
import AdminPanel from './components/AdminPanel';
import SettingsModal from './components/SettingsModal';

export default function App() {
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

    // Initial pre-configured chat detailing the user's herpetic ulcer example
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
            voted: 'up', // pre-voted up
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

    // Initial pre-populated item matching the pre-voted chat
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

  useEffect(() => {
    localStorage.setItem('synaptica_token_balance', tokenBalance);
  }, [tokenBalance]);

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
  }, [chats]);

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


  // --- Helper State Actions ---

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const addMessageToChat = (newMsg) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChat.id) {
        // Vote operations modify existing AI messages
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
        // General text operations append to message logs
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
      tubeia: 'otros'
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

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${
      nostalgicMode 
        ? 'bg-black text-[#39ff14] font-mono select-none nostalgic-crt' 
        : 'bg-synaptica-darker text-slate-100 p-2 gap-2.5'
    }`}>
      {/* Side Control Bar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
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

      {/* Main Panel Routing */}
      <main className={`flex-1 h-full overflow-hidden flex flex-col ${
        nostalgicMode 
          ? '' 
          : 'bg-slate-950/40 border border-slate-850/50 rounded-2xl shadow-2xl backdrop-blur-sm'
      }`}>
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
      />
    </div>
  );
}
