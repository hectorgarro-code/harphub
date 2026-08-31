import React from 'react';
import { SEA_SYMBOLS } from '../../utils/sea';

const SEAVirtualKeyboard = ({ onInsert }) => {
    return (
        <div className="mt-4 p-4 bg-slate-950/60 backdrop-blur-md rounded-[1.5rem] border border-white/5 shadow-2xl space-y-4 shrink-0">
            <div className="flex flex-wrap gap-1.5 justify-center">
                <div className="flex gap-1.5 border-r border-slate-800/50 pr-3 mr-1">
                    {SEA_SYMBOLS.bends.map(s => (
                        <button key={s.value} type="button" onClick={() => onInsert(s.value)} title={s.desc}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 text-sm font-black hover:bg-indigo-500 hover:text-white transition-all active:scale-90 border border-indigo-500/10 hover:border-indigo-500/30">
                            {s.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1.5 border-r border-slate-800/50 pr-3 mr-1">
                    {SEA_SYMBOLS.durations.map(s => (
                        <button key={s.value} type="button" onClick={() => onInsert(s.value)} title={s.desc}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-black hover:bg-emerald-500 hover:text-white transition-all active:scale-90 border border-emerald-500/10 hover:border-emerald-500/30">
                            {s.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1.5">
                    {SEA_SYMBOLS.expressions.map(s => (
                        <button key={s.value} type="button" onClick={() => onInsert(s.value)} title={s.desc}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 text-sm font-black hover:bg-amber-500 hover:text-white transition-all active:scale-90 border border-amber-500/10 hover:border-amber-500/30">
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                {SEA_SYMBOLS.structure.map(s => (
                    <button key={s.value} type="button" onClick={() => onInsert(s.value)} title={s.desc}
                        className="px-4 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-300 text-xs font-black hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-white/5">
                        {s.label}
                    </button>
                ))}
                <button type="button" onClick={() => onInsert(' ')} className="px-8 h-10 rounded-xl bg-slate-800/80 text-slate-400 font-bold hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-white/5 text-[10px] uppercase tracking-[0.2em]">Espacio</button>
            </div>
        </div>
    );
};

export default SEAVirtualKeyboard;
