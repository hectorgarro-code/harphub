import React from 'react';
import { Info } from 'lucide-react';

const SharedScalesPanel = ({ className = '', titleSize = 'text-xs', iconSize = 16, titleMargin = 'mb-4', titlePadding = 'pb-3' }) => {
    return (
        <div className={`bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col ${className}`}>
            <h3 className={`${titleSize} font-black text-white uppercase tracking-[0.2em] ${titleMargin} flex items-center gap-2 border-b border-slate-800 ${titlePadding}`}>
                <Info className="text-blue-500" size={iconSize} /> Escalas de Referencia
            </h3>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <h4 className="text-blue-400 font-black tracking-widest text-[10px] uppercase mb-1.5">1. Blues Menor (The Queen)</h4>
                    <p className="text-slate-400 text-[9px] mb-2 font-medium leading-relaxed">El alma del blues está en el -3' y el -4'.</p>
                    <div className="bg-slate-900 py-2 px-3 rounded-xl border border-slate-800 font-black text-xs text-emerald-400 tracking-[0.3em] overflow-x-auto custom-scrollbar">
                        -2  -3'  4  -4'  -4  -5  6
                    </div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <h4 className="text-blue-400 font-black tracking-widest text-[10px] uppercase mb-1.5">2. Pentatónica Menor</h4>
                    <p className="text-slate-400 text-[9px] mb-2 font-medium leading-relaxed">Más "limpia", ideal para riffs rápidos de rock-blues.</p>
                    <div className="bg-slate-900 py-2 px-3 rounded-xl border border-slate-800 font-black text-xs text-emerald-400 tracking-[0.3em] overflow-x-auto custom-scrollbar">
                        -2  -3'  4  -4  -5  6
                    </div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <h4 className="text-blue-400 font-black tracking-widest text-[10px] uppercase mb-1.5">3. Blues Mayor</h4>
                    <p className="text-slate-400 text-[9px] mb-2 font-medium leading-relaxed">Sonido dulce y melódico. El control del -3'' es vital.</p>
                    <div className="bg-slate-900 py-2 px-3 rounded-xl border border-slate-800 font-black text-xs text-emerald-400 tracking-[0.3em] overflow-x-auto custom-scrollbar">
                        -2  -3''  -3'  -3  -4  5  6
                    </div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <h4 className="text-blue-400 font-black tracking-widest text-[10px] uppercase mb-1.5">4. Modo Mixolidio</h4>
                    <p className="text-slate-400 text-[9px] mb-2 font-medium leading-relaxed">Para seguir la progresión sin sonar triste (7ma bemol).</p>
                    <div className="bg-slate-900 py-2 px-3 rounded-xl border border-slate-800 font-black text-xs text-emerald-400 tracking-[0.3em] overflow-x-auto custom-scrollbar">
                        -2  -3''  -3  4  -4  5  -5  6
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedScalesPanel;
