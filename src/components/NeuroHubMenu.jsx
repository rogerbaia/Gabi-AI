import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Plane, 
  Apple, 
  LineChart, 
  Code2, 
  BrainCircuit
} from 'lucide-react';

export default function NeuroHubMenu({
  selectedModel,
  setSelectedModel,
  isOpen,
  setIsOpen,
  nostalgicMode
}) {
  const models = [
    {
      id: 'omnia',
      name: 'OmnIA',
      icon: BrainCircuit,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20 border-emerald-900/30',
      activeColor: 'bg-emerald-500 text-slate-950 font-bold',
      desc: 'IA Principal consolidada de múltiples cerebros'
    },
    {
      id: 'investia',
      name: 'InvestIA',
      icon: GraduationCap,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/20 border-indigo-900/30',
      activeColor: 'bg-indigo-500 text-slate-950 font-bold',
      desc: 'Análisis científico, papers médicos, citas APA/Vancouver'
    },
    {
      id: 'viajia',
      name: 'ViajIA',
      icon: Plane,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/20 border-sky-900/30',
      activeColor: 'bg-sky-500 text-slate-950 font-bold',
      desc: 'Trivago-style: Vuelos, hoteles, rutas y planes turísticos'
    },
    {
      id: 'nutriia',
      name: 'NutriIA',
      icon: Apple,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/20 border-rose-900/30',
      activeColor: 'bg-rose-500 text-slate-950 font-bold',
      desc: 'Dietas personalizadas, rutinas, bienestar y médicos'
    },
    {
      id: 'econoia',
      name: 'EconoIA',
      icon: LineChart,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/20 border-amber-900/30',
      activeColor: 'bg-amber-500 text-slate-950 font-bold',
      desc: 'Comparación de servicios bancarios, inversiones y cripto'
    }
  ];

  const currentModelInfo = models.find(m => m.id === selectedModel) || models[0];
  const CurrentIcon = currentModelInfo.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
          nostalgicMode
            ? 'bg-black border-[#39ff14] text-[#39ff14]'
            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
        }`}
      >
        <CurrentIcon size={14} className={nostalgicMode ? 'text-[#39ff14]' : currentModelInfo.color} />
        <span>Especialización: <strong className="font-bold">{currentModelInfo.name}</strong></span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute bottom-full left-0 mb-2 w-80 rounded-xl z-50 shadow-2xl p-2 border ${
            nostalgicMode
              ? 'bg-black border-[#39ff14] nostalgic-crt'
              : 'bg-slate-900 border-slate-800 backdrop-blur-xl'
          }`}>
            <div className={`p-2 text-[10px] font-bold uppercase tracking-wider ${nostalgicMode ? 'text-[#39ff14]' : 'text-slate-500'} mb-1 border-b ${nostalgicMode ? 'border-[#39ff14]' : 'border-slate-800'}`}>
              NeuroHub: Cerebros Especializados
            </div>
            
            <div className="space-y-1">
              {models.map(m => {
                const Icon = m.icon;
                const isSelected = selectedModel === m.id;
                
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                      isSelected
                        ? nostalgicMode
                          ? 'bg-black border border-[#39ff14] text-[#39ff14]'
                          : 'bg-slate-800/80 border border-slate-700/50 text-slate-100 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border flex-shrink-0 mt-0.5 ${
                      isSelected 
                        ? nostalgicMode ? 'border-[#39ff14]' : 'bg-slate-900 border-slate-700'
                        : 'bg-slate-950/40 border-slate-900'
                    }`}>
                      <Icon size={14} className={nostalgicMode ? 'text-[#39ff14]' : m.color} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        {m.name}
                        {isSelected && (
                          <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase ${
                            nostalgicMode ? 'border border-[#39ff14] text-[#39ff14]' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                          }`}>
                            Activo
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        {m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
