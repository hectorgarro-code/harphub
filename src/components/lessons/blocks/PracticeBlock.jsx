import React from 'react';
import { Music } from 'lucide-react';

const PracticeBlock = ({ content, onPractice }) => (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] shadow-2xl shadow-blue-900/40 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-4 block">Módulo de Práctica</span>
                <h4 className="text-3xl font-black text-white tracking-tight mb-2">{content.title}</h4>
                <p className="text-indigo-100 font-bold max-w-md">{content.description}</p>
            </div>
            <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 min-w-[160px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Objetivo</span>
                <span className="text-4xl font-black text-white">{content.targetBpm}<span className="text-sm ml-1 opacity-60">BPM</span></span>
                <button 
                    onClick={() => onPractice(content)}
                    className="mt-2 w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl"
                >
                    Iniciar Práctica
                </button>
            </div>
        </div>
        <Music size={120} className="absolute -bottom-6 -right-6 text-white/10 rotate-12" />
    </div>
);

export default PracticeBlock;
