import React, { useState, useRef, useEffect } from 'react';
import { X, Guitar, Gauge, Activity, Target, Volume2 } from 'lucide-react';
import * as Tone from 'tone';
import { YinPitchDetector } from '../utils/pitchDetector';

const STRINGS = [
    { note: 'E2', label: 'E', string: '6ta', freq: 82.41, color: 'text-rose-500', border: 'border-rose-500/30' },
    { note: 'A2', label: 'A', string: '5ta', freq: 110.00, color: 'text-orange-500', border: 'border-orange-500/30' },
    { note: 'D3', label: 'D', string: '4ta', freq: 146.83, color: 'text-amber-500', border: 'border-amber-500/30' },
    { note: 'G3', label: 'G', string: '3ra', freq: 196.00, color: 'text-emerald-500', border: 'border-emerald-500/30' },
    { note: 'B3', label: 'B', string: '2da', freq: 246.94, color: 'text-blue-500', border: 'border-blue-500/30' },
    { note: 'E4', label: 'e', string: '1ra', freq: 329.63, color: 'text-indigo-500', border: 'border-indigo-500/30' }
];

const GuitarTunerModal = ({ isOpen, onClose }) => {
    // Pitch States
    const [pitch, setPitch] = useState({ note: '--', detune: 0, freq: 0, closestString: null });
    const [volume, setVolume] = useState(0);
    const [activeTuningNote, setActiveTuningNote] = useState(null);

    // Audio & Processing Refs
    const audioCtxRef = useRef(null);
    const tunerAnalyserRef = useRef(null);
    const yinDetectorRef = useRef(null);
    const requestRef = useRef();
    const synthRef = useRef(null);

    // Setup Synth for reference tones
    useEffect(() => {
        if (!synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: "triangle" },
                envelope: { attack: 0.05, decay: 0.5, sustain: 0.8, release: 2 }
            }).toDestination();
            synthRef.current.volume.value = -12;
        }
    }, []);

    // Main Audio Detection Loop
    useEffect(() => {
        if (!isOpen) return;

        let isActive = true;

        const startTuner = async () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioContext();
                
                // Ensure context is resumed if created in a suspended state
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }
                
                audioCtxRef.current = ctx;
                yinDetectorRef.current = new YinPitchDetector(ctx.sampleRate);

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (!isActive) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                const source = ctx.createMediaStreamSource(stream);
                tunerAnalyserRef.current = ctx.createAnalyser();
                tunerAnalyserRef.current.fftSize = 2048;
                source.connect(tunerAnalyserRef.current);

                const update = () => {
                    if (!tunerAnalyserRef.current || !yinDetectorRef.current) return;

                    const buffer = new Float32Array(tunerAnalyserRef.current.fftSize);
                    tunerAnalyserRef.current.getFloatTimeDomainData(buffer);

                    // Volume check
                    let sum = 0;
                    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
                    const vol = Math.min(100, Math.floor(Math.sqrt(sum / buffer.length) * 400));
                    setVolume(vol);

                    const freq = yinDetectorRef.current.detect(buffer);

                    if (freq !== -1 && vol > 5) {
                        // Find closest guitar string
                        let closestIdx = 0;
                        let minDiff = Infinity;
                        STRINGS.forEach((s, idx) => {
                            const diff = Math.abs(freq - s.freq);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closestIdx = idx;
                            }
                        });

                        const closest = STRINGS[closestIdx];

                        // Calculate detune in cents relative to the closest string
                        const cents = Math.floor(1200 * Math.log(freq / closest.freq) / Math.log(2));

                        setPitch({
                            note: closest.label,
                            detune: cents,
                            freq: freq.toFixed(1),
                            closestString: closestIdx
                        });
                    } else if (vol < 3) {
                        setPitch(p => ({ ...p, detune: 0 }));
                    }

                    requestRef.current = requestAnimationFrame(update);
                };

                update();
            } catch (err) {
                console.error("Mic error:", err);
            }
        };

        startTuner();

        return () => {
            isActive = false;
            cancelAnimationFrame(requestRef.current);
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, [isOpen]);

    const playTuningNote = (note, label) => {
        if (Tone.context.state !== 'running') Tone.start();
        setActiveTuningNote(label);
        setTimeout(() => setActiveTuningNote(null), 1000);
        synthRef.current.triggerAttackRelease(note, "2n");
    };

    if (!isOpen) return null;

    // UI Helper for Gauge Rotate
    const gaugeRotation = Math.max(-50, Math.min(50, pitch.detune)) * 0.9; // Map to roughly -45 to 45 deg

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center z-[150] px-4 py-8 overflow-y-auto">
            <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition z-[160] shadow-md border border-slate-700">
                <X size={24} />
            </button>

            <div className="w-full max-w-4xl space-y-6 flex flex-col items-center">
                <header className="w-full max-w-xl flex items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
                        <Guitar className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white italic leading-none uppercase tracking-tight">Guitar Tuner</h1>
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Instrumental Precision Profiler</p>
                    </div>
                </header>

                <div className="w-full grid md:grid-cols-2 gap-8 items-stretch">

                    {/* Visual Tuner Core */}
                    <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>

                        {/* Tuning Gauge Visual */}
                        <div className="relative w-64 h-32 mb-8 mt-4">
                            <div className="absolute inset-0 border-t-4 border-slate-800 rounded-t-full"></div>
                            {/* Cents markers */}
                            <div className="absolute left-0 top-full -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">-50</div>
                            <div className="absolute right-0 top-full -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">+50</div>
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500 uppercase">Afinado</div>

                            {/* Needle */}
                            <div
                                className={`absolute left-1/2 bottom-0 w-1 bg-gradient-to-t transition-all duration-100 ease-out origin-bottom ${Math.abs(pitch.detune) < 5 ? 'from-emerald-600 to-emerald-400 h-28 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'from-rose-600 to-rose-400 h-24'}`}
                                style={{ transform: `rotate(${gaugeRotation}deg)` }}
                            >
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-inherit"></div>
                            </div>
                        </div>

                        {/* Note Display */}
                        <div className="text-center">
                            <div className="text-8xl font-black text-white tabular-nums drop-shadow-2xl">
                                {pitch.note}
                            </div>
                            <div className={`text-xl font-bold uppercase tracking-[0.3em] mb-4 ${Math.abs(pitch.detune) < 5 ? 'text-emerald-400' : pitch.detune > 0 ? 'text-rose-500' : 'text-amber-500'}`}>
                                {Math.abs(pitch.detune) < 5 ? 'PERFECTO' : pitch.detune > 0 ? 'ALTO (+)' : 'BAJO (-)'}
                            </div>
                        </div>

                        {/* Detail Stats */}
                        <div className="grid grid-cols-2 gap-4 w-full mt-6">
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Frecuencia</span>
                                <span className="text-lg font-black text-white">{pitch.freq} Hz</span>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Precisión</span>
                                <span className={`text-lg font-black ${Math.abs(pitch.detune) < 5 ? 'text-emerald-500' : 'text-slate-300'}`}>{pitch.detune} c</span>
                            </div>
                        </div>
                    </div>

                    {/* Strings & Reference Tones */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <Volume2 size={18} className="text-rose-500" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Cuerdas y Tonos</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            {STRINGS.map((s, idx) => {
                                const isClosest = pitch.closestString === idx && volume > 10;
                                return (
                                    <button
                                        key={s.string}
                                        onClick={() => playTuningNote(s.note, s.label)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${isClosest ? `bg-slate-800 ${s.border} shadow-lg scale-[1.02] ring-1 ring-white/5` : 'bg-slate-950 border-transparent hover:bg-slate-800/50 hover:border-slate-800'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-2xl font-black ${isClosest ? s.color : 'text-slate-400'}`}>
                                            {s.label}
                                        </div>
                                        <div className="flex flex-col items-start leading-tight">
                                            <span className="text-xs font-black text-white uppercase">{s.string} Cuerda</span>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{s.note} {s.freq}Hz</span>
                                        </div>
                                        {activeTuningNote === s.label && (
                                            <div className="ml-auto w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity size={14} className="text-blue-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sugerencia</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                Deja que la nota suene con claridad. El detector marcará automáticamente la cuerda más cercana para ayudarte a ajustar la tensión.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuitarTunerModal;
