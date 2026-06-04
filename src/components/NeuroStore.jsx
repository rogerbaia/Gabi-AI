import React, { useState } from 'react';
import { 
  Gift, 
  Tag, 
  ShoppingBag, 
  CheckCircle2, 
  Mail, 
  Lock, 
  AlertTriangle, 
  Info,
  Calendar,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function NeuroStore({
  nostalgicMode,
  tokenBalance,
  setTokenBalance,
  redeemedItems,
  setRedeemedItems,
  emails,
  setEmails
}) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [activeEmail, setActiveEmail] = useState(null);

  // Products available in the store
  const products = [
    {
      id: 'amzn-1000',
      type: 'digital',
      name: 'Tarjeta Amazon $1000 MXN',
      cost: 1200,
      image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&auto=format&fit=crop&q=60',
      tag: 'Entrega Digital Inmediata',
      desc: 'Tarjeta de regalo digital válida para cualquier compra en Amazon México.',
      terms: 'Código digital de un solo uso. No se admiten devoluciones ni reembolsos de tokens tras revelar el código.'
    },
    {
      id: 'netflix-3m',
      type: 'digital',
      name: 'Suscripción Netflix 3 Meses',
      cost: 600,
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8fed85?w=120&auto=format&fit=crop&q=60',
      tag: 'Suscripción Digital',
      desc: 'Código digital para abonar 3 meses de Netflix plan Estándar a tu saldo de cuenta.',
      terms: 'Válido para cuentas nuevas o existentes en México. No reembolsable.'
    },
    {
      id: 'steam-20',
      type: 'digital',
      name: 'Steam Wallet $20 USD',
      cost: 800,
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=120&auto=format&fit=crop&q=60',
      tag: 'Gamer Gift Card',
      desc: 'Añade fondos a tu cartera de Steam para comprar juegos, DLCs y skins.',
      terms: 'Requiere cuenta de Steam activa. Sin devoluciones de tokens tras la entrega del código.'
    },
    {
      id: 'foco-led',
      type: 'physical',
      name: 'Foco Inteligente LED Wi-Fi RGB',
      cost: 250,
      image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=120&auto=format&fit=crop&q=60',
      tag: 'Gadget Amazon Prime',
      desc: 'Foco inteligente compatible con Alexa y Google Home. Control de millones de colores por App.',
      terms: 'El producto se adquiere mediante compra corporativa en Amazon y se envía a tu dirección. No se hacen reembolsos de tokens. En caso de defectos, Synaptica tramita el cambio de producto con Amazon en tu nombre.'
    },
    {
      id: 'headphones',
      type: 'physical',
      name: 'Audífonos Bluetooth Inalámbricos',
      cost: 450,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=60',
      tag: 'Audio Premium',
      desc: 'Audífonos inalámbricos con cancelación de ruido pasiva y batería de 20 horas de duración.',
      terms: 'Adquirido e importado a través de Amazon Logística. En caso de desperfecto, se realiza reposición por garantía del proveedor, nunca reintegro de tokens.'
    },
    {
      id: 'projector',
      type: 'physical',
      name: 'Mini Proyector LED Full HD',
      cost: 1500,
      image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=120&auto=format&fit=crop&q=60',
      tag: 'Entretenimiento Hogar',
      desc: 'Proyector portátil de cine en casa con puertos HDMI, USB y conexión inalámbrica.',
      terms: 'Envío directo de Amazon Prime. Términos de canje finales: Sin cancelaciones ni devoluciones de tokens.'
    }
  ];

  const handleOpenRedeemModal = (product) => {
    if (tokenBalance < product.cost) {
      alert(`Saldo insuficiente. Necesitas ${product.cost} NeuroTokens (tienes ${tokenBalance}).`);
      return;
    }
    setSelectedProduct(product);
    setAcceptTerms(false);
  };

  const handleConfirmRedeem = () => {
    if (!acceptTerms) {
      alert("Debes aceptar los Términos y Condiciones de no reembolso para continuar.");
      return;
    }

    const cost = selectedProduct.cost;
    setTokenBalance(prev => prev - cost);

    // Create a new redeemed item record
    const purchaseCode = `SYN-${Math.floor(100000 + Math.random() * 900000)}`;
    const giftCode = selectedProduct.type === 'digital' 
      ? `${selectedProduct.name.substring(0,3).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}` 
      : null;
    const trackingCode = selectedProduct.type === 'physical'
      ? `AMZN-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
      : null;

    const newItem = {
      id: Date.now(),
      productName: selectedProduct.name,
      cost: cost,
      type: selectedProduct.type,
      date: new Date().toLocaleDateString(),
      code: purchaseCode,
      status: selectedProduct.type === 'digital' ? 'Entregado' : 'Ordenado en Amazon',
      giftCode: giftCode,
      trackingCode: trackingCode
    };

    setRedeemedItems(prev => [newItem, ...prev]);

    // Create a mock email corresponding to this purchase
    const emailSubject = selectedProduct.type === 'digital'
      ? `🔑 Tu código de ${selectedProduct.name} está listo!`
      : `📦 Tu pedido de ${selectedProduct.name} ha sido enviado por Amazon`;

    const emailBody = selectedProduct.type === 'digital'
      ? `¡Hola Rogerio!\n\nGracias por usar tus NeuroTokens en Synaptica.\n\nHas canjeado con éxito la recompensa:\n🎁 ${selectedProduct.name}\n\nTu código de canje digital es:\n✨ ${giftCode} ✨\n\nInstrucciones: Cópialo e ingrésalo en la plataforma correspondiente.\n\n*Nota Legal: De acuerdo con los Términos de Servicio aceptados durante el canje, esta operación es definitiva y no admite cancelaciones ni devoluciones de tokens.*`
      : `¡Hola Rogerio!\n\nTu canje de NeuroTokens por el producto físico se ha procesado con éxito.\n\nDetalles del envío (Fase 2 - Compra en Amazon):\n📦 Producto: ${selectedProduct.name}\n🚛 Transportista oficial: Amazon Prime Logística\n⛓️ Código de rastreo: ${trackingCode}\n\nEn caso de que el producto presente fallas mecánicas o estéticas de fábrica, responde a este correo para que nuestro equipo inicie la devolución corporativa con Amazon y te enviemos un reemplazo nuevo.\n\n*Nota Legal: No se admiten devoluciones ni reembolsos de saldo en NeuroTokens. La garantía gestiona únicamente el reemplazo del producto defectuoso.*`;

    const newEmail = {
      id: Date.now(),
      sender: 'Soporte Synaptica <rewards@synaptica.ai>',
      subject: emailSubject,
      date: new Date().toLocaleString(),
      body: emailBody,
      read: false
    };

    setEmails(prev => [newEmail, ...prev]);

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    setSelectedProduct(null);
    alert(`¡Felicidades! Has canjeado con éxito ${selectedProduct.name}. Revisa tu bandeja de entrada interna de Synaptica para obtener el código o número de rastreo.`);
  };

  return (
    <div className={`p-6 flex flex-col h-full overflow-y-auto ${nostalgicMode ? 'nostalgic-crt text-[#39ff14]' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold font-display flex items-center gap-2 ${
          nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'
        }`}>
          <Gift />
          NeuroStore: Tienda de Canjes
        </h1>
        <p className={`text-sm mt-1 leading-relaxed ${nostalgicMode ? 'nostalgic-green-text opacity-80' : 'text-slate-400'}`}>
          Canjea tus NeuroTokens acumulados por tarjetas de regalo digitales de entrega inmediata o por artículos físicos seleccionados enviados directamente mediante Amazon Prime, libres de costes logísticos y protegidos bajo nuestra póliza de garantía legal.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            activeTab === 'catalog'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'bg-slate-800 border-slate-700 text-slate-100'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <ShoppingBag size={14} />
          Catálogo de Recompensas
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border relative transition-all ${
            activeTab === 'inbox'
              ? nostalgicMode ? 'bg-[#39ff14]/20 border-[#39ff14] text-[#39ff14]' : 'bg-slate-800 border-slate-700 text-slate-100'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          <Mail size={14} />
          Bandeja de Correo Interna
          {emails.filter(e => !e.read).length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" />
          )}
        </button>
      </div>

      {/* View: Catalog */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between ${
                nostalgicMode 
                  ? 'bg-black border-[#39ff14]' 
                  : 'bg-slate-900 border-slate-850 hover:border-slate-800 transition-all hover:shadow-lg'
              }`}
            >
              <div className="p-4 flex gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-20 h-20 rounded-lg object-cover flex-shrink-0 border ${
                    nostalgicMode ? 'border-[#39ff14]' : 'border-slate-800'
                  }`}
                />
                <div className="space-y-1 overflow-hidden">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                    nostalgicMode 
                      ? 'border border-[#39ff14] text-[#39ff14]' 
                      : product.type === 'digital' ? 'bg-emerald-950 text-emerald-400' : 'bg-blue-950 text-blue-400'
                  }`}>
                    {product.tag}
                  </span>
                  <h3 className="font-bold text-sm text-slate-100 truncate mt-1.5">{product.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                    {product.desc}
                  </p>
                </div>
              </div>

              <div className={`p-4 border-t flex items-center justify-between ${
                nostalgicMode ? 'border-[#39ff14] bg-black/60' : 'bg-slate-950/40 border-slate-850'
              }`}>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-black font-display ${nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'}`}>
                    {product.cost}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">NTK</span>
                </div>

                <button
                  onClick={() => handleOpenRedeemModal(product)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    nostalgicMode
                      ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  Canjear Premio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Inbox (Mock Email Delivery of Codes) */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Email list */}
          <div className="md:col-span-5 space-y-2">
            {emails.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-4 text-center">Bandeja vacía. Haz un canje de tokens para recibir tu premio.</div>
            ) : (
              emails.map(email => (
                <button
                  key={email.id}
                  onClick={() => {
                    email.read = true;
                    setActiveEmail(email);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 transition-colors ${
                    activeEmail?.id === email.id
                      ? nostalgicMode
                        ? 'bg-black border-2 border-[#39ff14] text-[#39ff14]'
                        : 'bg-slate-800 border-slate-700 text-slate-200'
                      : email.read
                        ? nostalgicMode
                          ? 'bg-black border border-[#39ff14]/30 text-[#39ff14]/60'
                          : 'bg-slate-900/40 border-slate-850 text-slate-400'
                        : nostalgicMode
                          ? 'bg-black border border-[#39ff14] text-[#39ff14] font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-200 font-semibold'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="truncate">{email.sender}</span>
                    <span className="font-mono text-slate-500 flex-shrink-0">{email.date.split(',')[0]}</span>
                  </div>
                  <h4 className="text-xs font-bold truncate">{email.subject}</h4>
                  <p className="text-[10px] text-slate-500 truncate leading-relaxed">
                    {email.body.substring(0, 80)}...
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Email content view */}
          <div className="md:col-span-7">
            {activeEmail ? (
              <div className={`p-6 rounded-2xl border space-y-4 ${
                nostalgicMode 
                  ? 'bg-black border-[#39ff14] font-mono' 
                  : 'bg-slate-900/60 border-slate-850'
              }`}>
                <div className="border-b border-slate-800 pb-3 space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <div>De: <strong className="text-slate-300">{activeEmail.sender}</strong></div>
                    <span>{activeEmail.date}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">{activeEmail.subject}</h3>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeEmail.body}
                </div>

                {activeEmail.body.includes('AMZN-REWARD') && (
                  <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Saldo prepagado oficial</span>
                    <a
                      href="https://www.amazon.com.mx/gc/redeem"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-500 flex items-center gap-1 hover:underline"
                    >
                      Canjear en Amazon <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs flex flex-col items-center justify-center gap-2 ${
                nostalgicMode ? 'border-[#39ff14]' : ''
              }`}>
                <Mail size={24} className="opacity-40" />
                Selecciona un correo para visualizar los códigos de regalo o de seguimiento de Amazon.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms and conditions verification modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-5 relative ${
            nostalgicMode 
              ? 'bg-black border-[#39ff14]' 
              : 'bg-slate-900 border-slate-800 shadow-2xl'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Lock size={18} className={nostalgicMode ? 'text-[#39ff14]' : 'text-emerald-400'} />
                Confirmación de Canje
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Estás a punto de canjear **{selectedProduct.cost} NeuroTokens** por:
                <br />
                <strong className="text-slate-100">{selectedProduct.name}</strong>
              </p>

              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex items-start gap-2">
                <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-[10px] text-red-300 leading-normal">
                  <strong className="block font-bold mb-0.5 uppercase">TÉRMINOS Y CONDICIONES (LOGÍSTICA INVERSA):</strong>
                  {selectedProduct.terms}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-start gap-2">
                <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-slate-400 leading-normal">
                  Synaptica compra directamente a Amazon (somos el cliente oficial de Amazon). Si el producto llega defectuoso, nosotros gestionamos la reposición ante Amazon, pero **los tokens no se reembolsarán bajo ninguna circunstancia**.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className={`rounded border transition-all ${
                  nostalgicMode ? 'border-[#39ff14] bg-black checked:bg-[#39ff14]' : 'border-slate-800 bg-slate-950 accent-emerald-500'
                }`}
              />
              <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer select-none leading-none">
                Acepto los términos y confirmo el canje definitivo.
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  nostalgicMode
                    ? 'retro-button border border-red-500 text-red-500 hover:bg-red-500/10'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={!acceptTerms}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  !acceptTerms 
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' 
                    : nostalgicMode
                      ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                Confirmar y Recibir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
