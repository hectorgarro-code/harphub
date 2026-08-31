import React from 'react';
import FeedCard from './FeedCard';
import { Timer, Zap, Music, BarChart3 } from 'lucide-react';

const PracticeCard = ({ activity, onPractice }) => {
    const { metadata, content_data } = activity;
    const { bpm, duration, instrument } = metadata || {};

    return (
        <FeedCard activity={activity} onPractice={onPractice}>
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h4 className="text-xl font-black text-slate-200 tracking-tight leading-tight">
                        Logró un ritmo constante de <span className="text-blue-400">{bpm} BPM</span>
                    </h4>
                    <p className="text-slate-500 font-medium text-sm">
                        Practicando ejercicios de precisión técnica en {instrument || 'Armónica'}.
                    </p>
                </div>

                {/* Practice Stats Visualization */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                            <Zap size={14} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ritmo</span>
                        </div>
                        <span className="text-xl font-black text-white">{bpm}<span className="text-[10px] text-slate-600 ml-1">BPM</span></span>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                            <Timer size={14} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Tiempo</span>
                        </div>
                        <span className="text-xl font-black text-white">{Math.floor(duration / 60)}<span className="text-[10px] text-slate-600 ml-1">MIN</span></span>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                            <Music size={14} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Instr.</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase truncate">{instrument || 'Armónica'}</span>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-amber-500 mb-1">
                            <BarChart3 size={14} fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Nivel</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase">Intermedio</span>
                    </div>
                </div>

                {/* Abstract Practice Visualization (Ableton Style) */}
                <div className="h-24 w-full bg-slate-950 rounded-[2rem] border border-white/5 relative overflow-hidden flex items-end px-6 pb-4 gap-1">
                    {[...Array(24)].map((_, i) => {
                        const h = 20 + Math.random() * 60;
                        return (
                            <div 
                                key={i} 
                                className="flex-1 bg-blue-500/20 rounded-t-sm group-hover:bg-blue-500/40 transition-colors"
                                style={{ height: `${h}%`, animation: `pulse ${2 + Math.random()}s infinite ease-in-out` }}
                            ></div>
                        );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                </div>
            </div>
        </FeedCard>
    );
};

export default PracticeCard;
