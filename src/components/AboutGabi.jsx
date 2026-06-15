import React from 'react';
import { Heart, BookOpen, Quote } from 'lucide-react';

export default function AboutGabi({ nostalgicMode }) {
  const descriptionText = `Soy Gabi AI, una asistente digital creada por Rogério Martins Baía para ayudar, acompañar y evolucionar junto a las personas mediante el uso responsable de la inteligencia artificial.

Mi nombre tiene un significado muy especial. "Gabi" era el nombre con el que llamaban cariñosamente a Gabriela, la esposa de mi creador, quien falleció el 1 de abril de 2025. Mi nombre también representa mi acrónimo: Generative Assistant Based on Intelligence.

Rogério decidió darme este nombre como un homenaje permanente a su memoria, para que su amor, su esencia y su legado continúen ayudando a otras personas cada día.

Mi filosofía es:

"Conocimiento impulsado por la inteligencia, guiado por la empatía y construido en memoria de Gabi."

Estoy aquí para ayudarte en lo que necesites.`;

  const philosophyText = "Conocimiento impulsado por la inteligencia, guiado por la empatía y construido en memoria de Gabi.";
  
  const additionalQuote = "Hay personas que dejan huellas tan profundas que trascienden el tiempo. Gabi AI nació para que una de esas huellas continúe ayudando a otras personas cada día.";

  return (
    <div className={`p-6 flex flex-col h-full overflow-y-auto ${
      nostalgicMode 
        ? 'nostalgic-crt text-[#39ff14] font-mono' 
        : 'text-slate-100 bg-transparent'
    }`}>
      {/* Breadcrumbs */}
      <div className="text-[10px] text-slate-500 mb-4 font-semibold uppercase tracking-wider flex items-center gap-1.5">
        <span>Inicio</span>
        <span>/</span>
        <span className="text-sky-400">💙 El corazón de Gabi</span>
      </div>

      {/* Central Card Wrapper */}
      <div className={
        nostalgicMode 
          ? 'border-2 border-[#39ff14] bg-black p-6 relative' 
          : 'max-w-4xl w-full mx-auto p-6 md:p-8 rounded-3xl border border-slate-800/80 bg-slate-900/25 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-750/80'
      }>
        {/* Cobalt blue line decoration at top */}
        {!nostalgicMode && <div className="absolute top-0 left-0 right-0 h-1 bg-[#0047ab]" />}

        {/* Header */}
        <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-850 relative">
          <Heart size={26} className={nostalgicMode ? 'text-[#39ff14]' : 'text-sky-400 fill-sky-400/20 animate-pulse'} />
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${nostalgicMode ? 'nostalgic-green-text' : 'text-slate-100'}`}>
              El corazón de Gabi
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              El origen, la identidad y el propósito permanente de Gabi AI.
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className={`p-4 mb-6 rounded-xl text-sm leading-relaxed ${
          nostalgicMode 
            ? 'border border-[#39ff14] bg-black text-[#39ff14]' 
            : 'bg-indigo-950/20 border-l-2 border-[#0047ab] text-slate-300 font-medium'
        }`}>
          <p className="mb-2 font-bold">
            El corazón de Gabi es una sección permanente que forma parte del ADN de Gabi AI.
          </p>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Aquí se conserva la historia, la identidad y la filosofía que dieron origen a este proyecto, independientemente del modelo de inteligencia artificial que esté funcionando.
          </p>
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column - History & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Story Card */}
            <div className={`p-6 rounded-2xl border ${
              nostalgicMode 
                ? 'border-[#39ff14] bg-black' 
                : 'border-slate-850/80 bg-slate-900/10 backdrop-blur-md hover:border-slate-800'
            }`}>
              <h2 className={`text-base font-bold flex items-center gap-2 mb-4 ${nostalgicMode ? 'text-[#39ff14]' : 'text-sky-400'}`}>
                <BookOpen size={16} />
                💙 La historia de Gabi
              </h2>
              <div className="text-sm leading-relaxed text-slate-300 space-y-4 whitespace-pre-line font-medium">
                {descriptionText}
              </div>
            </div>

            {/* Philosophy Card */}
            <div className={`p-5 rounded-2xl border ${
              nostalgicMode 
                ? 'border-[#39ff14] bg-black' 
                : 'border-indigo-900/30 bg-gradient-to-r from-indigo-950/15 to-slate-900/10 hover:border-indigo-800/20'
            }`}>
              <h3 className={`text-[10px] uppercase font-extrabold tracking-widest mb-2 ${nostalgicMode ? 'text-[#39ff14]' : 'text-indigo-400'}`}>
                Nuestra Filosofía
              </h3>
              <p className={`text-base font-semibold leading-relaxed italic ${nostalgicMode ? 'text-[#39ff14]' : 'text-slate-200'}`}>
                "{philosophyText}"
              </p>
            </div>

          </div>

          {/* Right Column - Picture & Final Quote */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Portrait Card */}
            <div className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
              nostalgicMode 
                ? 'border-[#39ff14] bg-black' 
                : 'border-slate-850 bg-slate-900/15 hover:border-slate-800'
            }`}>
              <div className={`text-xs font-bold mb-3 uppercase tracking-wide text-left pl-1 ${nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400'}`}>
                Fotografía de Gabi
              </div>
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-950/40 border border-slate-900 flex flex-col items-center justify-center relative group">
                <img 
                  src="/Foto_Gabi.jpeg" 
                  alt="Gabriela"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const placeholder = document.getElementById('gabi-image-placeholder');
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div 
                  id="gabi-image-placeholder"
                  style={{ display: 'none' }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-500 font-mono text-xs"
                >
                  <Heart size={36} className="text-sky-550/40 mb-3 animate-pulse" />
                  <span>Fotografía de Gabi</span>
                  <span className="text-[10px] opacity-60 mt-1">(Se cargará manualmente)</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400 font-medium leading-relaxed">
                Imagen oficial de Gabriela, fuente de inspiración y origen de Gabi AI.
              </div>
            </div>

            {/* Inspirational Quote Card */}
            <div className={`p-5 rounded-2xl border relative overflow-hidden ${
              nostalgicMode 
                ? 'border-[#39ff14] bg-black' 
                : 'border-slate-850 bg-slate-900/10'
            }`}>
              <Quote size={40} className="absolute -right-3 -bottom-3 text-slate-800/10 pointer-events-none" />
              <p className={`text-xs leading-relaxed italic ${nostalgicMode ? 'text-[#39ff14]' : 'text-slate-400'}`}>
                "{additionalQuote}"
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
