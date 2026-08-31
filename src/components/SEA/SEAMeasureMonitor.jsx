import React from 'react';
import { validateMeasures } from '../../utils/sea';

const SEAMeasureMonitor = ({ text, size = "w-4 h-4" }) => {
    const measures = validateMeasures(text);
    const lastMeasure = measures[measures.length - 1];
    
    return (
        <div className="flex gap-3 items-center bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
            <div className="flex gap-2 items-center">
                {measures.map((m, i) => (
                    <div 
                        key={i} 
                        title={`Compás ${i+1}: ${m.beats.toFixed(2)} / 4.0`}
                        className={`${size} rounded-full transition-all duration-300 border ${
                            m.beats === 0 
                                ? 'bg-slate-800 border-slate-700' 
                                : m.valid 
                                    ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                                    : 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                        }`} 
                    />
                ))}
            </div>
            
            <div className="w-px h-4 bg-slate-800 mx-1" />
            
            <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black tabular-nums transition-colors ${lastMeasure?.valid ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {lastMeasure?.beats.toFixed(1)}
                </span>
                <span className="text-[8px] font-bold text-slate-700 uppercase tracking-tighter">/ 4.0</span>
            </div>
        </div>
    );
};

export default SEAMeasureMonitor;
