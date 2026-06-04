import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  RefreshCw, 
  DollarSign, 
  ArrowRight, 
  TrendingUp, 
  Truck,
  CheckSquare,
  Undo2,
  Trash2,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminPanel({
  nostalgicMode,
  redeemedItems,
  setRedeemedItems,
  tokenBalance,
  setTokenBalance
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [returnStep, setReturnStep] = useState(0);
  const [ledger, setLedger] = useState({
    totalInvestedUSD: 37.50, // mock initial values
    totalRevenueNTK: 4500,
    savedShippingUSD: 15.00,
    doubleMarginsGenerated: 2
  });

  const physicalItems = redeemedItems.filter(item => item.type === 'physical');

  const startReturnSimulation = (item) => {
    setSelectedItem(item);
    setReturnStep(1); // Step 1: Customer reports defect
  };

  const advanceReturnSimulation = () => {
    if (returnStep === 1) {
      // Step 2: Synaptica files return with Amazon
      setReturnStep(2);
    } else if (returnStep === 2) {
      // Step 3: Amazon approves return and sends new item
      setReturnStep(3);
    } else if (returnStep === 3) {
      // Step 4: Synaptica restocks replacement as new
      setReturnStep(4);
      
      // Update item status in global state
      setRedeemedItems(prev => prev.map(item => {
        if (item.id === selectedItem.id) {
          return { ...item, status: 'Reemplazado & Re-vendido (Doble Margen)' };
        }
        return item;
      }));

      // Reward tokens as restock bonus or show ledger increase
      setLedger(prev => ({
        ...prev,
        totalRevenueNTK: prev.totalRevenueNTK + selectedItem.cost,
        savedShippingUSD: prev.savedShippingUSD + 7.50, // simulated shipping savings
        doubleMarginsGenerated: prev.doubleMarginsGenerated + 1
      }));

      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#10B981', '#6366F1', '#39ff14'],
        origin: { y: 0.6 }
      });
    }
  };

  const resetReturnSimulation = () => {
    setSelectedItem(null);
    setReturnStep(0);
  };

  return (
    <div className={`p-6 flex flex-col h-full overflow-y-auto ${nostalgicMode ? 'nostalgic-crt text-[#39ff14]' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold font-display flex items-center gap-2 ${
          nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'
        }`}>
          <ShieldAlert />
          Consola Admin: Simulación de Logística Inversa
        </h1>
        <p className={`text-sm mt-1 leading-relaxed ${nostalgicMode ? 'nostalgic-green-text opacity-80' : 'text-slate-400'}`}>
          Simulador de control financiero y operativo de Synaptica. Aquí puedes probar el flujo de devoluciones sin coste de paquetería a través de Amazon, demostrando cómo generas rentabilidad del 100% reteniendo el token del primer canje.
        </p>
      </div>

      {/* Ledger Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Egresos USD (Compras Amazon)', val: `$${ledger.totalInvestedUSD.toFixed(2)} USD`, desc: 'Capital real desembolsado', icon: DollarSign, color: 'text-rose-400 border-rose-900/30 bg-rose-950/10' },
          { label: 'Ingresos Simulados (Tokens)', val: `${ledger.totalRevenueNTK} NTK`, desc: 'Tokens canjeados por usuarios', icon: TrendingUp, color: 'text-emerald-400 border-emerald-900/30 bg-emerald-950/10' },
          { label: 'Logística Ahorrada (Amazon)', val: `$${ledger.savedShippingUSD.toFixed(2)} USD`, desc: 'Guías de retorno pagadas por Amazon', icon: Truck, color: 'text-blue-400 border-blue-900/30 bg-blue-950/10' },
          { label: 'Ciclos de Doble Margen', val: ledger.doubleMarginsGenerated, desc: 'Productos devueltos y re-canjeados', icon: RefreshCw, color: 'text-purple-400 border-purple-900/30 bg-purple-950/10' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                nostalgicMode 
                  ? 'bg-black border-[#39ff14]' 
                  : `border ${stat.color}`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                <Icon size={14} className={nostalgicMode ? 'text-[#39ff14]' : ''} />
              </div>
              <div>
                <div className={`text-xl font-extrabold font-display ${nostalgicMode ? 'nostalgic-green-text font-mono' : 'text-slate-100'}`}>
                  {stat.val}
                </div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">{stat.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Order list */}
        <div className={`lg:col-span-6 rounded-2xl border p-5 space-y-4 ${
          nostalgicMode ? 'bg-black border-[#39ff14]' : 'bg-slate-900/50 border-slate-800/80'
        }`}>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Package size={16} className={nostalgicMode ? 'text-[#39ff14]' : 'text-indigo-400'} />
            Pedidos Físicos Canjeados por Usuarios
          </h2>

          {physicalItems.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-6 text-center">
              No hay pedidos físicos en el sistema. Ve a la **NeuroStore**, canjea tus tokens por un Foco Inteligente o Audífonos, acepta los términos, y aparecerá aquí para simular el proceso de devolución.
            </div>
          ) : (
            <div className="space-y-3">
              {physicalItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    nostalgicMode ? 'border-[#39ff14] bg-black' : 'bg-slate-950/60 border-slate-850'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-200">{item.productName}</h3>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Código: {item.code} | Costo: {item.cost} NTK
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        nostalgicMode
                          ? 'border border-[#39ff14] text-[#39ff14]'
                          : item.status.includes('Reemplazado') 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' 
                            : 'bg-indigo-950 text-indigo-400 border border-indigo-900/40 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {!item.status.includes('Reemplazado') && (
                    <button
                      onClick={() => startReturnSimulation(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        nostalgicMode
                          ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <RefreshCw size={10} /> Devolución
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Interactive Simulation Walkthrough */}
        <div className="lg:col-span-6">
          {selectedItem ? (
            <div className={`p-6 rounded-2xl border space-y-5 h-full flex flex-col justify-between ${
              nostalgicMode 
                ? 'bg-black border-[#39ff14] font-mono' 
                : 'bg-slate-900/50 border-slate-800/80 backdrop-blur-md'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm">Flujo de Garantía: {selectedItem.productName}</h3>
                  <button onClick={resetReturnSimulation} className="text-slate-500 hover:text-slate-300 text-xs">✕ Cerrar</button>
                </div>

                {/* Stepper visualization */}
                <div className="space-y-3 text-xs leading-normal">
                  {/* Step 1: Defect report */}
                  <div className={`p-3 rounded-lg border flex gap-3 ${
                    returnStep >= 1 
                      ? nostalgicMode ? 'border-[#39ff14] bg-[#39ff14]/10' : 'border-indigo-900/50 bg-indigo-950/20'
                      : 'border-slate-800 bg-slate-950 opacity-40'
                  }`}>
                    <div className="font-bold text-sm font-mono">1</div>
                    <div>
                      <h4 className="font-bold text-slate-200">El Cliente Reporta Falla</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        El usuario notifica que el producto llegó roto o defectuoso. No hay reembolso de tokens (blindaje legal). El balance del usuario queda en 0 tokens devueltos.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Synaptica returns to Amazon */}
                  <div className={`p-3 rounded-lg border flex gap-3 ${
                    returnStep >= 2
                      ? nostalgicMode ? 'border-[#39ff14] bg-[#39ff14]/10' : 'border-indigo-900/50 bg-indigo-950/20'
                      : 'border-slate-850 bg-slate-950 opacity-40'
                  }`}>
                    <div className="font-bold text-sm font-mono">2</div>
                    <div>
                      <h4 className="font-bold text-slate-200">Reclamación de Synaptica a Amazon</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Como comprador corporativo, Synaptica solicita el cambio a Amazon. Amazon provee la etiqueta de retorno prepagada. El cliente original deposita el paquete en paquetería sin costo para nosotros.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Amazon approves and replaces */}
                  <div className={`p-3 rounded-lg border flex gap-3 ${
                    returnStep >= 3
                      ? nostalgicMode ? 'border-[#39ff14] bg-[#39ff14]/10' : 'border-indigo-900/50 bg-indigo-950/20'
                      : 'border-slate-850 bg-slate-950 opacity-40'
                  }`}>
                    <div className="font-bold text-sm font-mono">3</div>
                    <div>
                      <h4 className="font-bold text-slate-200">Amazon Envía Producto de Reemplazo</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Amazon recibe el defectuoso y nos envía un producto 100% nuevo de fábrica a costo $0.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Synaptica restocks */}
                  <div className={`p-3 rounded-lg border flex gap-3 ${
                    returnStep >= 4
                      ? nostalgicMode ? 'border-[#39ff14] bg-[#39ff14]/10' : 'border-indigo-900/50 bg-indigo-950/20'
                      : 'border-slate-850 bg-slate-950 opacity-40'
                  }`}>
                    <div className="font-bold text-sm font-mono">4</div>
                    <div>
                      <h4 className="font-bold text-slate-200">Re-venta y Restocking</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                        <CheckSquare size={12} /> ¡Multiplicación del Margen Completada!
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        El producto de reemplazo nuevo se vuelve a listar para canje en el catálogo. Ganamos el doble de tokens (ej: 450 + 450 = 900 tokens) habiendo comprado el producto solo una vez.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className={`p-3 rounded-lg border text-xs bg-slate-950 border-slate-850 font-mono mb-4`}>
                  <div className="flex justify-between">
                    <span>Inversión inicial:</span>
                    <span className="text-rose-400">$12.50 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ingresos del doble canje:</span>
                    <span className="text-emerald-400">+{selectedItem.cost * 2} NTK</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-800 mt-1 pt-1">
                    <span>Rendimiento neto:</span>
                    <span className="text-emerald-400">{(selectedItem.cost * 2)} NTK (~$18.00 USD value)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetReturnSimulation}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      nostalgicMode
                        ? 'retro-button border border-red-500 text-red-500 hover:bg-red-500/10'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Salir
                  </button>
                  {returnStep < 4 ? (
                    <button
                      onClick={advanceReturnSimulation}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                        nostalgicMode
                          ? 'retro-button border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/15'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
                      }`}
                    >
                      Avanzar Paso <ArrowRight size={12} />
                    </button>
                  ) : (
                    <button
                      onClick={resetReturnSimulation}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        nostalgicMode
                          ? 'retro-button border border-[#39ff14] text-[#39ff14]'
                          : 'bg-indigo-600 text-slate-100 hover:bg-indigo-500'
                      }`}
                    >
                      Listo
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-12 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs flex flex-col items-center justify-center gap-2 h-full justify-center ${
              nostalgicMode ? 'border-[#39ff14]' : ''
            }`}>
              <Undo2 size={24} className="opacity-40" />
              Selecciona un pedido físico de la lista de la izquierda para simular el proceso de devolución de Amazon y observar los márgenes de ganancia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
