import React, { useState, useRef, useEffect } from 'react';
import { 
    Play, Square, Music, Keyboard, Settings, Mic2, StopCircle, 
    PlayCircle, Target, AlertCircle, Layers, X 
} from 'lucide-react';
import { playTabSequence } from '../../../utils/audio';
import { NOTES } from '../../../utils/constants';
import InteractiveHarmonica from '../../harmonica/InteractiveHarmonica';
import SharedScalesPanel from '../../SharedScalesPanel';

const SeaInstructionModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-white/10 rounded-[3rem] max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <AlertCircle className="text-blue-500" /> Sintaxis SEA (Armónica)
                </h3>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                    <X size={20} />
                </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                    <span className="font-bold text-white block mb-1">Notas Sopladas:</span>
                    <p className="text-slate-400">Números positivos como <code className="text-blue-400 font-mono">4</code>, <code className="text-blue-400 font-mono">5</code>, <code className="text-blue-400 font-mono">6</code> o <code className="text-blue-400 font-mono">+4</code>.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                    <span className="font-bold text-white block mb-1">Notas Aspiradas:</span>
                    <p className="text-slate-400">Números negativos como <code className="text-blue-400 font-mono">-2</code>, <code className="text-blue-400 font-mono">-3</code>, <code className="text-blue-400 font-mono">-4</code>.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                    <span className="font-bold text-white block mb-1">Bending:</span>
                    <p className="text-slate-400">Comillas simples para semitonos: <code className="text-blue-400 font-mono">-3'</code> (medio tono), <code className="text-blue-400 font-mono">-3''</code> (tono completo), <code className="text-blue-400 font-mono">-3'''</code> (tono y medio).</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                    <span className="font-bold text-white block mb-1">Expresiones:</span>
                    <p className="text-slate-400"><code className="text-blue-400 font-mono">~</code> vibrato, <code className="text-blue-400 font-mono">/</code> slide ascendente, <code className="text-blue-400 font-mono">\</code> slide descendente, <code className="text-blue-400 font-mono">-</code> silencio.</p>
                </div>
            </div>
        </div>
    </div>
);

const ReferenceScalesModal = ({ onClose }) => {
    const scales = [
        { name: "Escala de Blues Menor (The Queen)", tab: "-2 -3' 4 -4' -4 -5 6", desc: "La escala definitiva. El alma del blues está en el -3' y el -4'." },
        { name: "Escala Pentatónica Menor", tab: "-2 -3' 4 -4 -5 6", desc: "Más 'limpia' que la anterior, ideal para riffs rápidos de rock-blues." },
        { name: "Escala de Blues Mayor", tab: "-2 -3'' -3' -3 -4 5 6", desc: "Para ese sonido dulce y melódico estilo Sonny Boy Williamson II. El control del -3'' es vital." },
        { name: "Modo Mixolidio", tab: "-2 -3'' -3 4 -4 5 -5 6", desc: "Fundamental para seguir la progresión de acordes sin sonar 'demasiado' triste." }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[3rem] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Target className="text-blue-500" /> Escalas de Referencia
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                    {scales.map((s, idx) => (
                        <div key={idx} className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
                            <h4 className="text-sm font-black text-blue-400 uppercase mb-2 tracking-widest group-hover:text-blue-300">{s.name}</h4>
                            <div className="text-2xl font-black text-white tracking-[0.2em] mb-3 font-mono">{s.tab}</div>
                            <p className="text-[11px] text-slate-500 italic">{s.desc}</p>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-white/5">
                        <SharedScalesPanel className="!bg-transparent !border-0 !p-2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SeaTabBlock = ({ content = {}, lesson = {} }) => {
    const initialCode = content.tab || content.code || lesson.practiceTab || '';
    const [code, setCode] = useState(initialCode);
    const [bpm, setBpm] = useState(content.bpm || 100);
    const [harpKey, setHarpKey] = useState(lesson.harmonica_key || 'C');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showScales, setShowScales] = useState(false);
    const playbackRef = useRef(null);

    // Sync if content changes externally
    useEffect(() => {
        const nextCode = content.tab || content.code || lesson.practiceTab || '';
        if (nextCode && nextCode !== code) {
            setCode(nextCode);
        }
    }, [content.tab, content.code, lesson.practiceTab]);

    const symbols = ["'", "''", "'''", "~", "(", ")", "/", "\\", "v", "h", "p", "-", " "];

    const insertSymbol = (s) => {
        setCode(prev => (prev || '') + s);
    };

    const handleTogglePlay = () => {
        if (isPlaying) {
            playbackRef.current?.stop();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            const sequence = playTabSequence(code || "", {
                bpm: bpm,
                harpKey: harpKey,
                onComplete: () => setIsPlaying(false)
            });
            playbackRef.current = sequence;
        }
    };

    useEffect(() => {
        return () => {
            playbackRef.current?.stop();
        };
    }, []);

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-6 md:p-12 overflow-hidden relative group shadow-2xl text-white">
            <div className="space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-900/40">
                            <Layers size={22} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white tracking-tight">{content.title || 'Tablatura SEA'}</h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sintaxis Estructural Armónica</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex gap-2">
                            <button 
                                onClick={handleTogglePlay}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
                                title={isPlaying ? "Detener" : "Reproducir secuencia"}
                            >
                                {isPlaying ? <StopCircle size={18} /> : <PlayCircle size={18} />}
                            </button>
                            <button 
                                onClick={() => setShowScales(true)}
                                className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
                                title="Escalas de Referencia"
                            >
                                <Target size={18} />
                            </button>
                            <button 
                                onClick={() => setShowInfo(true)}
                                className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
                                title="Guía de Sintaxis SEA"
                            >
                                <AlertCircle size={18} />
                            </button>
                            <button 
                                onClick={() => setIsListening(!isListening)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                title="Detección Automática por Micrófono"
                            >
                                <Mic2 size={18} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">BPM</span>
                                <input 
                                    type="number"
                                    value={bpm}
                                    onChange={(e) => setBpm(parseInt(e.target.value) || 100)}
                                    className="w-12 bg-transparent text-sm font-black text-blue-400 outline-none text-center"
                                />
                            </div>
                            <select 
                                value={harpKey}
                                onChange={(e) => setHarpKey(e.target.value)}
                                className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-blue-400 outline-none cursor-pointer"
                            >
                                {NOTES.map(n => <option key={n} value={n}>Key: {n}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SEA Textarea Display */}
                <div className="relative group/editor">
                    <textarea
                        className={`w-full bg-slate-950/80 border border-blue-500/10 rounded-[3rem] p-10 md:p-12 text-2xl md:text-3xl font-black text-blue-100 tracking-[0.3em] uppercase text-center outline-none resize-none transition-all duration-500 min-h-[140px] ${isPlaying ? 'ring-4 ring-emerald-500/20 text-emerald-400' : 'focus:ring-4 focus:ring-blue-500/10'}`}
                        placeholder="-3' -4 -5 6 ~"
                        rows={Math.max(2, (code || '').split('\n').length)}
                        value={code}
                        onChange={e => setCode(e.target.value)}
                    />
                    {isPlaying && (
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-[3rem] pointer-events-none" />
                    )}

                    {/* SEA Symbol Keyboard */}
                    <div className="flex flex-wrap justify-center gap-1.5 p-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl mt-4 max-w-xl mx-auto">
                        {symbols.map(s => (
                            <button 
                                key={s}
                                onClick={() => insertSymbol(s)}
                                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-slate-950 border border-white/5 text-sm font-black text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all"
                            >
                                {s === " " ? "␣" : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interactive Harmonica Component */}
                <div className="py-2">
                    <InteractiveHarmonica 
                        harpKey={harpKey}
                        isListening={isListening}
                        isRecording={isListening}
                        bpm={bpm}
                        onNoteDetected={(note) => {
                            setCode(prev => {
                                const current = prev || "";
                                const lastNote = current.trim().split(' ').pop();
                                if (lastNote !== note) {
                                    return current + (current.endsWith(' ') || current === '' ? '' : ' ') + note + ' ';
                                }
                                return current;
                            });
                        }}
                    />
                </div>

                {/* Modales */}
                {showInfo && <SeaInstructionModal onClose={() => setShowInfo(false)} />}
                {showScales && <ReferenceScalesModal onClose={() => setShowScales(false)} />}
            </div>
        </div>
    );
};

export default SeaTabBlock;
