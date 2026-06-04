import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Tv, 
  ArrowLeftRight, 
  CreditCard, 
  User, 
  PlusCircle, 
  CheckCircle2, 
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TokenMarket({
  nostalgicMode,
  tokenBalance,
  setTokenBalance,
  userListings,
  setUserListings,
  p2pListings,
  setP2pListings
}) {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedAd, setSelectedAd] = useState(null);
  const [adTimer, setAdTimer] = useState(0);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adMuted, setAdMuted] = useState(true);
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Sell form
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  // Ad simulation templates
  const ads = [
    { id: 1, title: 'CuidaTusOjos® - Salud Visual', sponsor: 'Clínica Oftalmológica', reward: 15, text: 'Visita CuidaTusOjos.com.mx para agendar tu consulta y prevenir el glaucoma.', color: 'from-blue-600 to-indigo-600' },
    { id: 2, title: 'Amazon Prime Gadgets', sponsor: 'Amazon Tech', reward: 15, text: 'Consigue tu Lámpara LED inteligente con 20% de descuento en el próximo canje de Synaptica.', color: 'from-amber-600 to-orange-600' },
    { id: 3, title: 'NeuroStore Premium Gift Cards', sponsor: 'Synaptica Retail', reward: 15, text: 'Compra tarjetas digitales de Steam, Apple y Netflix. 100% garantizado, entrega digital inmediata.', color: 'from-purple-600 to-pink-600' }
  ];

  // Ad Play Timer countdown logic
  useEffect(() => {
    let interval;
    if (isPlayingAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer(t => t - 1);
      }, 1000);
    } else if (isPlayingAd && adTimer === 0) {
      setIsPlayingAd(false);
      
      // Award tokens
      const reward = selectedAd.reward || 15;
      setTokenBalance(prev => prev + reward);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // If P2P purchase pending
      if (selectedAd.p2pItem) {
        // Complete the P2P transaction
        const item = selectedAd.p2pItem;
        setP2pListings(prev => prev.filter(l => l.id !== item.id));
        setTokenBalance(prev => prev + item.tokens);
        alert(`¡Felicidades! Completaste el anuncio y compraste ${item.tokens} tokens a ${item.seller} por $${item.price} USD.`);
      } else {
        alert(`¡Anuncio finalizado! Has ganado +${reward} NeuroTokens.`);
      }
      setSelectedAd(null);
    }
    return () => clearInterval(interval);
  }, [isPlayingAd, adTimer]);

  const handleStartAd = (ad, p2pItem = null) => {
    setSelectedAd({ ...ad, p2pItem });
    setAdTimer(15);
    setIsPlayingAd(true);
  };

  const handleOfficialBuy = (pkg) => {
    setShowCheckout({
      type: 'official',
      tokens: pkg.tokens,
      price: pkg.price,
      title: `${pkg.tokens} NeuroTokens (Oficial)`
    });
  };

  const handleP2PBuy = (item) => {
    setShowCheckout({
      type: 'p2p',
      tokens: item.tokens,
      price: item.price,
      title: `${item.tokens} NeuroTokens (P2P de ${item.seller})`,
      item: item
    });
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      alert("Por favor completa todos los campos del pago simulado.");
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setPaymentSuccess(false);
        const tokensToCredit = showCheckout.tokens;
        
        if (showCheckout.type === 'p2p') {
          // P2P Purchase: Requires watching an ad afterwards (or before, let's trigger it now)
          setShowCheckout(null);
          // Trigger the Ad viewer to unlock
          const adTemplate = {
            id: 99,
            title: `Anuncio obligatorio para desbloquear tokens P2P (${tokensToCredit} NTK)`,
            sponsor: 'Sponsor P2P',
            reward: 0, // No extra reward, it unlocks the tokens already purchased
            text: 'Este comercial financia el descuento que obtienes al comprar tokens directamente a otro usuario.',
            color: 'from-emerald-600 to-blue-600'
          };
          handleStartAd(adTemplate, showCheckout.item);
        } else {
          // Official Direct Purchase: instant credit
          setTokenBalance(prev => prev + tokensToCredit);
          setShowCheckout(null);
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });
          alert(`¡Pago completado! Se han abonado ${tokensToCredit} NeuroTokens a tu cuenta.`);
        }

        // Reset fields
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
      }, 1000);
    }, 2000);
  };

  const handleCreateListing = (e) => {
    e.preventDefault();
    const tokens = parseInt(sellAmount);
    const price = parseFloat(sellPrice);

    if (isNaN(tokens) || tokens <= 0) {
      alert("Introduce una cantidad válida de tokens.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert("Introduce un precio de venta válido.");
      return;
    }
    if (tokens > tokenBalance) {
      alert("No tienes suficientes tokens en tu saldo para vender.");
      return;
    }

    // Deduct tokens from user
    setTokenBalance(prev => prev - tokens);

    const newListing = {
      id: Date.now(),
      seller: '@Yo (Tú)',
      tokens: tokens,
      price: price,
      discount: Math.round((1 - (price / (tokens * 0.0199))) * 100)
    };

    setP2pListings(prev => [newListing, ...prev]);
    setUserListings(prev => [newListing, ...prev]);

    setSellAmount('');
    setSellPrice('');
    alert("¡Felicidades! Tu oferta ha sido listada en el mercado P2P. Cuando un usuario la compre (viendo un anuncio), recibirás el dinero ficticio.");
  };

  const handleCancelListing = (listing) => {
    setP2pListings(prev => prev.filter(l => l.id !== listing.id));
    setUserListings(prev => prev.filter(l => l.id !== listing.id));
    setTokenBalance(prev => prev + listing.tokens);
    alert("Oferta cancelada. Los tokens han sido devueltos a tu saldo.");
  };

  return (
    <div className={`p-6 flex flex-col h-full overflow-y-auto ${nostalgicMode ? 'nostalgic-crt text-[#39ff14]' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold font-display flex items-center gap-2 ${
          nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'
        }`}>
          <Coins className="animate-spin-slow" />
          Mercado de NeuroTokens
        </h1>
        <p className={`text-sm mt-1 leading-relaxed ${nostalgicMode ? 'nostalgic-green-text opacity-80' : 'text-slate-400'}`}>
          El motor de Synaptica requiere tokens para interactuar con múltiples IAs de pago. Puedes comprarlos directamente, ganarlos viendo comerciales, o comerciar con otros usuarios en el mercado libre a precios reducidos viendo publicidad adicional.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            activeTab === 'buy'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'bg-slate-800 border-slate-700 text-slate-100'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <CreditCard size={14} />
          Comprar NeuroTokens
        </button>
        <button
          onClick={() => setActiveTab('earn')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            activeTab === 'earn'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'bg-slate-800 border-slate-700 text-slate-100'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Tv size={14} />
          Ver Publicidad (Watch-to-Earn)
        </button>
        <button
          onClick={() => setActiveTab('p2p')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            activeTab === 'p2p'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'bg-slate-800 border-slate-700 text-slate-100'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <ArrowLeftRight size={14} />
          Mercado P2P (Usuario ↔ Usuario)
        </button>
      </div>

      {/* View: Buy Official */}
      {activeTab === 'buy' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tokens: 100, price: 1.99, tag: 'Básico', save: 0, bg: 'from-slate-900 to-slate-950 border-slate-800' },
            { tokens: 500, price: 7.99, tag: 'Recomendado', save: 20, bg: 'from-emerald-950/20 to-slate-950 border-emerald-900/30' },
            { tokens: 1200, price: 14.99, tag: 'Profesional', save: 38, bg: 'from-purple-950/20 to-slate-950 border-purple-900/30' }
          ].map((pkg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-6 flex flex-col items-center justify-between text-center relative ${
                nostalgicMode 
                  ? 'bg-black border-[#39ff14]' 
                  : `bg-gradient-to-br ${pkg.bg} hover:border-slate-700 transition-colors`
              }`}
            >
              {pkg.save > 0 && (
                <span className={`absolute -top-3 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${
                  nostalgicMode ? 'border-2 border-[#39ff14] text-[#39ff14] bg-black' : 'bg-emerald-500 text-slate-950 shadow-lg animate-pulse'
                }`}>
                  AHORRA {pkg.save}%
                </span>
              )}
              <div className="mb-4">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">{pkg.tag}</span>
                <h3 className="text-3xl font-extrabold font-display my-2 flex items-center justify-center gap-1.5">
                  <Coins className={nostalgicMode ? 'text-[#39ff14]' : 'text-amber-400'} size={24} />
                  {pkg.tokens}
                </h3>
                <span className="text-slate-400 text-xs">NeuroTokens instantáneos</span>
              </div>
              <div className="w-full">
                <div className="text-2xl font-black font-display mb-4 text-slate-200">
                  ${pkg.price} <span className="text-xs text-slate-500">USD</span>
                </div>
                <button
                  onClick={() => handleOfficialBuy(pkg)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    nostalgicMode
                      ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold hover:shadow-lg hover:shadow-emerald-950/20'
                  }`}
                >
                  Comprar Ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Watch to Earn */}
      {activeTab === 'earn' && (
        <div className="space-y-6">
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            nostalgicMode ? 'border-[#39ff14] bg-black' : 'bg-slate-900/40 border-slate-800/80'
          }`}>
            <div className={`p-3 rounded-lg border ${nostalgicMode ? 'border-[#39ff14]' : 'bg-slate-950 border-slate-800 text-emerald-400'}`}>
              <Tv size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm">¿Cómo funciona Watch-to-Earn?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Cada comercial que ves financia el uso de las APIs de las Inteligencias Artificiales. Al terminar de ver el anuncio completo (15 segundos), se acreditarán automáticamente **15 NeuroTokens** gratis a tu balance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ads.map(ad => (
              <div
                key={ad.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between ${
                  nostalgicMode 
                    ? 'bg-black border-[#39ff14]' 
                    : 'bg-slate-900 border-slate-850 hover:border-slate-700 transition-all'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">
                      {ad.sponsor}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Coins size={12} />
                      +{ad.reward} NTK
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mb-2 text-slate-100">{ad.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {ad.text}
                  </p>
                </div>
                <button
                  onClick={() => handleStartAd(ad)}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    nostalgicMode
                      ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                      : 'bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200'
                  }`}
                >
                  <Play size={12} fill="currentColor" />
                  Ver Anuncio (15s)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: P2P Marketplace */}
      {activeTab === 'p2p' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns: P2P Offers */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ArrowLeftRight size={14} className={nostalgicMode ? 'text-[#39ff14]' : 'text-emerald-400'} />
              Ofertas Disponibles en la Comunidad
            </h3>
            
            <div className="space-y-3">
              {p2pListings.map(item => {
                const isOwn = item.seller === '@Yo (Tú)';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      nostalgicMode 
                        ? 'bg-black border-[#39ff14]' 
                        : 'bg-slate-900/60 border-slate-850 hover:bg-slate-900 transition-colors'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                        nostalgicMode 
                          ? 'border-[#39ff14]' 
                          : isOwn ? 'bg-indigo-950/30 border-indigo-900/40 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        <User size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-300">{item.seller}</span>
                          {isOwn && (
                            <span className="text-[8px] bg-indigo-900 text-indigo-300 px-1 py-0.2 rounded font-bold uppercase border border-indigo-800/40">
                              Mía
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/30 px-1.5 py-0.2 rounded">
                            -{item.discount}% Descuento
                          </span>
                        </div>
                        <div className="text-lg font-black font-display text-slate-100 flex items-center gap-1.5 mt-0.5">
                          <Coins size={16} className={nostalgicMode ? 'text-[#39ff14]' : 'text-amber-400'} />
                          {item.tokens} NTK
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-200">${item.price} USD</div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          + 1 Anuncio obligatorio
                        </div>
                      </div>

                      {isOwn ? (
                        <button
                          onClick={() => handleCancelListing(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            nostalgicMode
                              ? 'retro-button border border-red-500 text-red-500 hover:bg-red-500/10'
                              : 'bg-red-950/20 text-red-400 hover:bg-red-900/20 border border-red-900/40'
                          }`}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleP2PBuy(item)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                            nostalgicMode
                              ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold'
                          }`}
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sell Tokens Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <PlusCircle size={14} className={nostalgicMode ? 'text-[#39ff14]' : 'text-indigo-400'} />
              Poner Mis Tokens en Venta
            </h3>
            
            <form onSubmit={handleCreateListing} className={`p-5 rounded-2xl border space-y-4 ${
              nostalgicMode 
                ? 'bg-black border-[#39ff14]' 
                : 'bg-slate-900/40 border-slate-800/80 backdrop-blur-md'
            }`}>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Cantidad de Tokens a vender:</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-3 text-slate-500" size={16} />
                  <input
                    type="number"
                    placeholder="Ej. 100"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className={`w-full text-sm pl-10 pr-3 py-2.5 rounded-xl outline-none transition-all ${
                      nostalgicMode
                        ? 'bg-black border border-[#39ff14] text-[#39ff14] font-mono'
                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:border-slate-700'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                  <span>Mínimo: 50 NTK</span>
                  <span>Disponibles: {tokenBalance} NTK</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Precio solicitado (USD):</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-500 text-sm font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej. 1.00"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className={`w-full text-sm pl-8 pr-3 py-2.5 rounded-xl outline-none transition-all ${
                      nostalgicMode
                        ? 'bg-black border border-[#39ff14] text-[#39ff14] font-mono'
                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:border-slate-700'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  * Precio oficial por esta cantidad: ${(parseFloat(sellAmount || 0) * 0.0199).toFixed(2)} USD
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  nostalgicMode
                    ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                    : 'bg-indigo-600 text-slate-100 hover:bg-indigo-500 font-extrabold shadow-md hover:shadow-indigo-950/20'
                }`}
              >
                Publicar Oferta P2P
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Advertisement Overlay Modal (Watch-to-Earn) */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-2xl border overflow-hidden p-6 flex flex-col items-center text-center relative ${
            nostalgicMode 
              ? 'bg-black border-[#39ff14]' 
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                nostalgicMode ? 'border border-[#39ff14] text-[#39ff14]' : 'bg-red-950 text-red-400'
              }`}>
                PUBLICIDAD
              </span>
            </div>

            <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${selectedAd.color} flex flex-col items-center justify-center p-8 relative overflow-hidden mb-6 border ${
              nostalgicMode ? 'border-[#39ff14]' : 'border-slate-800'
            }`}>
              {/* Spinning background rays */}
              <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                <Sparkles size={64} className="text-white/20 animate-spin-slow" />
              </div>
              <div className="relative z-10 space-y-4">
                <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full text-slate-100">
                  {selectedAd.sponsor}
                </span>
                <h3 className="text-2xl font-black tracking-wide text-white font-display">
                  {selectedAd.title}
                </h3>
                <p className="text-xs text-white/90 max-w-sm mx-auto leading-relaxed">
                  {selectedAd.text}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className={`text-3xl font-black font-display ${nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'}`}>
                {adTimer} <span className="text-sm text-slate-500 font-normal">segundos restantes</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal max-w-sm">
                No cierres esta ventana. El saldo se acreditará inmediatamente después de que el contador llegue a cero.
              </p>
              
              <button
                disabled={adTimer > 0}
                onClick={() => setSelectedAd(null)}
                className={`mt-4 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  adTimer > 0 
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' 
                    : nostalgicMode
                      ? 'retro-button border border-[#39ff14] text-[#39ff14]'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                Cerrar Anuncio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Sim Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleProcessPayment} className={`w-full max-w-md rounded-2xl border p-6 space-y-5 relative ${
            nostalgicMode 
              ? 'bg-black border-[#39ff14]' 
              : 'bg-slate-900 border-slate-800 shadow-2xl'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <CreditCard size={18} className={nostalgicMode ? 'text-[#39ff14]' : 'text-indigo-400'} />
                Simulador de Pago Seguro
              </h3>
              <button
                type="button"
                onClick={() => setShowCheckout(null)}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div className={`p-3 rounded-lg border text-xs ${
              nostalgicMode ? 'border-[#39ff14] bg-black/60' : 'bg-slate-950 border-slate-850'
            }`}>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Producto:</span>
                <span className="font-bold text-slate-200">{showCheckout.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monto a pagar:</span>
                <span className="font-black text-emerald-400">${showCheckout.price} USD</span>
              </div>
            </div>

            {showCheckout.type === 'p2p' && (
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg flex items-start gap-2">
                <AlertTriangle size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-indigo-300 leading-normal">
                  <strong>Condición P2P:</strong> Al completar este pago, se abrirá un comercial obligatorio de 15 segundos. Al finalizar el anuncio, se liberarán los tokens comprados.
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold uppercase">Nombre en la tarjeta (Simulado):</label>
                <input
                  type="text"
                  placeholder="Ej. Rogerio Silva"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg outline-none transition-all ${
                    nostalgicMode
                      ? 'bg-black border border-[#39ff14] text-[#39ff14] font-mono'
                      : 'bg-slate-950 border-slate-850 text-slate-200 focus:border-slate-700'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold uppercase">Número de tarjeta (Simulado):</label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg outline-none transition-all ${
                    nostalgicMode
                      ? 'bg-black border border-[#39ff14] text-[#39ff14] font-mono'
                      : 'bg-slate-950 border-slate-850 text-slate-200 focus:border-slate-700'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold uppercase">Vencimiento:</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-lg outline-none transition-all ${
                      nostalgicMode
                        ? 'bg-black border border-[#39ff14] text-[#39ff14] font-mono'
                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:border-slate-700'
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold uppercase">CVV:</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-lg outline-none transition-all ${
                      nostalgicMode
                        ? 'bg-black border border-[#39ff14] text-[#39ff14] font-mono'
                        : 'bg-slate-950 border-slate-850 text-slate-200 focus:border-slate-700'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingPayment}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isProcessingPayment
                  ? 'opacity-60 cursor-not-allowed bg-slate-800 text-slate-500'
                  : nostalgicMode
                    ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold'
              }`}
            >
              {isProcessingPayment ? (
                <span>Procesando pago ficticio...</span>
              ) : paymentSuccess ? (
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Pago Aprobado</span>
              ) : (
                <span>Confirmar Pago de ${showCheckout.price} USD</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
