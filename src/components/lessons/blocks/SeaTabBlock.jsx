import React, { useState } from 'react';
import { Play, Square, Music, Keyboard, Settings, Mic2 } from 'lucide-react';
import { playTabSequence } from '../../../utils/audio';
import SEAMeasureMonitor from '../../SEA/SEAMeasureMonitor';
import SEAVirtualKeyboard from '../../SEA/SEAVirtualKeyboard';
import InteractiveHarmonica from '../../harmonica/InteractiveHarmonica';

const SeaTabBlock = ({ content, lesson }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackController, setPlaybackController] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(-1);
    const [bpm, setBpm] = useState(content.bpm || 100);
    const [isListening, setIsListening] = useState(false);

    const handlePlay = () => {
        if (isPlaying && playbackController) {
            playbackController.stop();
            setIsPlaying(false);
            setActiveTabIndex(-1);
            setPlaybackController(null);
            return;
        }

        if (!content.tab && !content.code) return;
        const tabCode = content.tab || content.code;
        setIsPlaying(true);
        setActiveTabIndex(0);
        
        const controller = playTabSequence(tabCode, {
            bpm: bpm,
            onStep: (index) => setActiveTabIndex(index),
            onComplete: () => {
                setIsPlaying(false);
                setActiveTabIndex(-1);
                setPlaybackController(null);
            }
        });
        setPlaybackController(controller);
    };

    const tokens = (content.tab || content.code || "").trim().split(/\s+/);

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 overflow-hidden relative group shadow-2xl">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-900/40">
                            <Music size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white tracking-tight">{content.title || 'Tablatura SEA'}</h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sintaxis Estructural Armónica</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-white/5">
                        <div className="flex flex-col items-center px-4 border-r border-white/10">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">BPM</span>
                            <input 
                                type="number" 
                                value={bpm}
                                onChange={(e) => setBpm(parseInt(e.target.value))}
                                className="w-12 bg-transparent text-sm font-black text-white outline-none text-center"
                            />
                        </div>
                        <button 
                            onClick={() => setIsListening(!isListening)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                            title="Verificar mi ejecución (Micro)"
                        >
                            <Mic2 size={20} />
                        </button>
                        <button 
                            onClick={handlePlay}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
                        >
                            {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                        </button>
                    </div>
                </div>

                {/* Tab Visualization */}
                <div className="flex flex-wrap gap-3 bg-slate-950/50 p-8 rounded-[2.5rem] border border-white/5 min-h-[120px]">
                    {tokens.length > 0 && tokens[0] !== "" ? tokens.map((token, idx) => (
                        <div 
                            key={idx}
                            id={`viewer-tab-token-${idx}`}
                            className={`px-4 py-3 rounded-xl text-lg font-black tracking-tighter transition-all duration-300 ${
                                activeTabIndex === idx 
                                ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-900/40 z-10' 
                                : 'bg-slate-800 text-slate-400 opacity-60'
                            }`}
                        >
                            {token}
                        </div>
                    )) : (
                        <div className="w-full flex items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-[10px]">Sin datos de tablatura</div>
                    )}
                </div>

                {/* Interactive Harmonica Tool */}
                <div className="bg-slate-950/40 p-1 rounded-[2.5rem] border border-white/5">
                    <InteractiveHarmonica 
                        harpKey={lesson?.harmonica_key || 'C'}
                        isListening={isListening}
                    />
                </div>

                {/* Monitors & Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950/30 p-6 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-3 mb-4 text-slate-500">
                            <Settings size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Monitor de Compás</span>
                        </div>
                        <SEAMeasureMonitor currentToken={tokens[activeTabIndex] || ''} />
                    </div>
                    <div className="bg-slate-950/30 p-6 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-3 mb-4 text-slate-500">
                            <Keyboard size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Guía Visual</span>
                        </div>
                        <SEAVirtualKeyboard activeNote={tokens[activeTabIndex] || ''} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeaTabBlock;
