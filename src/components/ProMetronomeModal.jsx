import React from 'react';
import { X, Sliders, Drum, Activity, Volume2, FastForward, Target, Check } from 'lucide-react';
import { BLUES_DRUM_PATTERNS } from '../utils/constants';

export default function ProMetronomeModal({ isOpen, onClose, settings, setSettings, setBpm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sliders className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Metrónomo Pro</h2>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Ajustes de Blues</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"><X size={18} /></button>
                </div>

                <div className="space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar pr-4 pb-4">
                    
                    {/* Caja de Ritmos Blues */}
                    <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
                                    <Drum size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Caja de Ritmos Blues</h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSettings({ ...settings, isDrumMode: !settings.isDrumMode })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.isDrumMode ? 'bg-blue-600' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isDrumMode ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">REEMPLAZA EL CLICK POR UNA BATERÍA REAL CON 12 GROOVES CLÁSICOS.</p>
                        
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {BLUES_DRUM_PATTERNS.map(pattern => (
                                <button
                                    key={pattern.id}
                                    disabled={!settings.isDrumMode}
                                    onClick={() => {
                                        setSettings({ ...settings, pattern: pattern.id });
                                        setBpm(pattern.defaultBpm);
                                    }}
                                    className={`p-4 rounded-2xl border text-center transition-all ${
                                        settings.pattern === pattern.id && settings.isDrumMode
                                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 scale-[1.02]' 
                                        : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
                                    } ${!settings.isDrumMode ? 'opacity-40 grayscale' : ''}`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1">{pattern.name}</span>
                                    <span className="text-[8px] font-bold opacity-60">{pattern.defaultBpm} BPM</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Swing / Shuffle Ratio */}
                    <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Activity className="text-blue-500" size={20} />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Swing / Shuffle Ratio</h3>
                            </div>
                            <div className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-lg">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                    {settings.shuffleRatio === 0.5 ? 'Straight (50%)' : settings.shuffleRatio > 0.65 ? 'Heavy Shuffle' : 'Blues Swing'}
                                </span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AJUSTA EL "PESO" DEL SHUFFLE PARA EMULAR EL GROOVE DEL BLUES.</p>
                        
                        <div className="space-y-4">
                            <input 
                                type="range" 
                                min="0.5" 
                                max="0.75" 
                                step="0.01" 
                                value={settings.shuffleRatio} 
                                onChange={(e) => setSettings({ ...settings, shuffleRatio: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                <span>CORCHEAS RECTAS</span>
                                <span>HEAVY SHUFFLE</span>
                            </div>
                        </div>
                    </div>

                    {/* Gap Practice (Silencio) */}
                    <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Volume2 className="text-amber-500" size={20} />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Gap Practice (Silencio)</h3>
                            </div>
                            <button 
                                onClick={() => setSettings({ ...settings, gapPractice: { ...settings.gapPractice, enabled: !settings.gapPractice.enabled } })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.gapPractice.enabled ? 'bg-amber-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.gapPractice.enabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">MUTEA EL METRÓNOMO TEMPORALMENTE PARA ENTRENAR TU RELOJ INTERNO DE TIEMPO.</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Compases de Sonido</label>
                                <div className="bg-slate-900 border border-white/5 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-inner">
                                    {settings.gapPractice.soundBars}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Compases Mudos</label>
                                <div className="bg-slate-900 border border-white/5 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-inner">
                                    {settings.gapPractice.muteBars}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Speed Trainer */}
                    <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FastForward className="text-rose-500" size={20} />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Speed Trainer</h3>
                            </div>
                            <button 
                                onClick={() => setSettings({ ...settings, speedTrainer: { ...settings.speedTrainer, enabled: !settings.speedTrainer.enabled } })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.speedTrainer.enabled ? 'bg-rose-500' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.speedTrainer.enabled ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">INCREMENTA LOS BPM GRADUALMENTE AL TERMINAR UN CICLO DE 12 COMPASES (12-BAR BLUES).</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Incremento (BPM)</label>
                                <div className="bg-slate-900 border border-white/5 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-inner">
                                    {settings.speedTrainer.increment}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Límite Máximo (BPM)</label>
                                <div className="bg-slate-900 border border-white/5 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-inner">
                                    {settings.speedTrainer.maxBpm}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Options */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setSettings({ ...settings, backbeatOnly: !settings.backbeatOnly })}
                            className={`p-6 rounded-[2rem] border text-left transition-all ${settings.backbeatOnly ? 'bg-slate-800 border-white/10' : 'bg-slate-950/40 border-white/5 opacity-60'}`}
                        >
                            <Target size={20} className="text-slate-400 mb-3" />
                            <p className="text-[11px] font-black uppercase tracking-wider text-white">Backbeat Only</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">SOLO TIEMPOS 2 Y 4</p>
                        </button>
                        <button 
                            onClick={() => setSettings({ ...settings, footTapVisual: !settings.footTapVisual })}
                            className={`p-6 rounded-[2rem] border text-left transition-all ${settings.footTapVisual ? 'bg-slate-800 border-white/10' : 'bg-slate-950/40 border-white/5 opacity-60'}`}
                        >
                            <Activity size={20} className="text-slate-400 mb-3" />
                            <p className="text-[11px] font-black uppercase tracking-wider text-white">Foot Tap Visual</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">ANIMACIÓN UI DEL PULSO</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
