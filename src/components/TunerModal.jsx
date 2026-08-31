import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Activity, Target, Wind, Settings2, BarChart2, X } from 'lucide-react';
import { NOTES, HARP_FREQS } from '../utils/constants';
import { YinPitchDetector } from '../utils/pitchDetector';

const TunerModal = ({ onClose }) => {
    // Pitch States
    const [pitch, setPitch] = useState({ note: '--', detune: 0, freq: 0, rawNote: '' });
    const [volume, setVolume] = useState(0);
    const [bendScore, setBendScore] = useState({ active: false, score: 0, history: [] });

    // Audio Refs
    const audioCtxRef = useRef(null);
    const tunerAnalyserRef = useRef(null);
    const waveAnalyserRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const yinDetectorRef = useRef(null);

    // Initializer
    useEffect(() => {
        let isActive = true;

        const startAudioProcessing = async () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioContext();
                
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }
                
                audioCtxRef.current = ctx;
                yinDetectorRef.current = new YinPitchDetector(ctx.sampleRate);

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (!isActive) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                const source = ctx.createMediaStreamSource(stream);
                tunerAnalyserRef.current = ctx.createAnalyser();
                tunerAnalyserRef.current.fftSize = 2048; // Alta resolución para YIN
                waveAnalyserRef.current = ctx.createAnalyser();
                waveAnalyserRef.current.fftSize = 1024; // Para osciloscopio

                source.connect(tunerAnalyserRef.current);
                source.connect(waveAnalyserRef.current);

                updateTuner();
            } catch (err) {
                console.error("Error al acceder al micrófono:", err);
                alert("Por favor habilita el micrófono para usar el afinador.");
            }
        };

        const drawOscilloscope = () => {
            if (!canvasRef.current || !waveAnalyserRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const bufferLength = waveAnalyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            waveAnalyserRef.current.getByteTimeDomainData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Grid background
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i += 20) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
            for (let i = 0; i < canvas.height; i += 20) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
            ctx.stroke();

            // Waveform
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#3b82f6';
            ctx.beginPath();
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // Glow Effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#3b82f6';
            ctx.stroke();
            ctx.shadowBlur = 0;
        };

        const updateTuner = () => {
            if (!tunerAnalyserRef.current || !yinDetectorRef.current) return;
            const buffer = new Float32Array(tunerAnalyserRef.current.fftSize);
            tunerAnalyserRef.current.getFloatTimeDomainData(buffer);

            drawOscilloscope();

            let sum = 0;
            for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
            const vol = Math.min(100, Math.floor(Math.sqrt(sum / buffer.length) * 400));
            setVolume(vol);

            const pitchFreq = yinDetectorRef.current.detect(buffer);

            if (pitchFreq !== -1 && vol > 5) { // 5% noise gate minimal threshold 
                let noteNum = Math.round(12 * (Math.log(pitchFreq / 440) / Math.log(2))) + 69;

                if (noteNum >= 0 && noteNum < 128) {
                    let noteStr = NOTES[noteNum % 12];
                    let exactFreq = 440 * Math.pow(2, (noteNum - 69) / 12);
                    let cents = Math.floor(1200 * Math.log(pitchFreq / exactFreq) / Math.log(2));

                    // Buscar correspondencia de celda de armónica
                    let harpHole = '--';
                    let minDiff = 1000;
                    for (const [hole, freq] of Object.entries(HARP_FREQS)) {
                        let diff = Math.abs(pitchFreq - freq);
                        if (diff < minDiff) {
                            minDiff = diff;
                            harpHole = hole;
                        }
                    }
                    if (minDiff > 50) harpHole = '--';

                    setPitch({ note: noteStr, detune: cents, freq: pitchFreq.toFixed(1), rawNote: harpHole !== '--' ? `${harpHole}` : '' });

                    // Cálculo del Score de Estabilidad
                    if (vol > 15) {
                        setBendScore(prev => {
                            const absCents = Math.abs(cents);
                            const instantScore = Math.max(0, 100 - (absCents * 2));
                            const newHistory = [...prev.history, instantScore].slice(-60); // 1 sec at 60fps
                            const avgScore = newHistory.reduce((a, b) => a + b, 0) / (newHistory.length || 1);
                            return { active: true, score: Math.round(avgScore), history: newHistory };
                        });
                    }
                }
            } else {
                setPitch(p => ({ ...p, detune: 0 }));
                setBendScore(prev => ({ ...prev, active: false }));
            }

            requestRef.current = requestAnimationFrame(updateTuner);
        };

        startAudioProcessing();

        return () => {
            isActive = false;
            cancelAnimationFrame(requestRef.current);
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, []);

    // Determinar nivel de Bend Tracking para la barra visual interactiva
    const getBendVisuals = () => {
        let detune = pitch.detune;

        // Si no estamos doblando, se queda en 0.
        // Asumiendo que doblamos ABAJO (bends en celdas aspiradas)
        let visualTop = 0; // % from top of the container
        let color = 'bg-slate-500';
        let glow = '';
        let label = 'Natural';

        // Targets: Half (-50c) | Whole (-100c) | Minor 3rd (-150c)
        if (detune > -15 && detune <= 15) {
            visualTop = 5;
            color = 'bg-emerald-400';
            glow = 'shadow-[0_0_20px_#34d399]';
            label = 'Pitch Perfecto';
        } else if (detune <= -15 && detune > -80) {
            // Evaluando el medio tono
            // mapped between 20% and 50% visually
            visualTop = 20 + Math.min(30, Math.abs(detune - (-15)) * (30 / 35));
            if (detune > -60 && detune < -40) {
                color = 'bg-blue-500';
                glow = 'shadow-[0_0_20px_#3b82f6]';
                label = "1/2 STEP BEND";
            } else {
                color = 'bg-amber-500';
                label = "Deslizándose...";
            }
        } else if (detune <= -80 && detune > -120) {
            visualTop = 50 + Math.min(25, Math.abs(detune - (-80)) * (25 / 40));
            if (detune > -110 && detune < -90) {
                color = 'bg-purple-500';
                glow = 'shadow-[0_0_20px_#a855f7]';
                label = "WHOLE STEP BEND";
            } else {
                color = 'bg-amber-600';
                label = "Deslizándose...";
            }
        } else if (detune <= -120 && detune >= -180) {
            visualTop = 75 + Math.min(20, Math.abs(detune - (-120)) * (20 / 60));
            if (detune > -160 && detune < -140) {
                color = 'bg-rose-500';
                glow = 'shadow-[0_0_20px_#f43f5e]';
                label = "1.5 STEP BEND (Blue Note)";
            } else {
                color = 'bg-red-500';
                label = "Bend Profundo";
            }
        } else if (detune < -180) {
            visualTop = 95;
            color = 'bg-rose-800';
            label = "Desafinado Grave";
        } else if (detune > 15) {
            visualTop = 0;
            color = 'bg-rose-500';
            label = "Sobreagudo (+)";
        }

        return { visualTop, color, glow, label };
    };

    const bendVisuals = getBendVisuals();

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center z-[500] p-0 lg:p-4">
            <div className="bg-slate-900 border-x lg:border border-slate-700/50 rounded-none lg:rounded-[3rem] p-6 lg:p-12 max-w-5xl w-full h-full lg:h-auto text-center shadow-2xl relative overflow-y-auto custom-scrollbar flex flex-col xl:flex-row gap-4 xl:gap-0 my-auto lg:my-auto shrink-0 transition-all duration-500">

                {/* Ribbon top */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-emerald-400 to-rose-600"></div>

                {/* LEFT COL: Standard Tuner & Synth */}
                <div className="flex-1 xl:border-r border-slate-800/80 xl:pr-12 flex flex-col relative z-10 w-full">
                    <div className="flex justify-between items-center mb-6 lg:mb-10">
                        <div className="flex items-center gap-3 lg:gap-4 text-left">
                            <div className="bg-blue-500/20 p-2.5 lg:p-4 rounded-2xl lg:rounded-3xl shadow-lg shadow-blue-500/10"><Gauge className="text-blue-400 w-6 h-6 lg:w-7 lg:h-7" /></div>
                            <div>
                                <h2 className="text-xl lg:text-3xl font-black text-white tracking-tight leading-none">Bend Analyzer</h2>
                                <p className="text-[9px] lg:text-xs font-bold text-blue-400 uppercase tracking-widest mt-1.5">Precision Pitch Tracking</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-[5rem] lg:text-[8rem] leading-none font-black mb-4 tabular-nums text-white relative inline-block drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] self-center h-24 lg:h-36 flex items-center justify-center transition-all">
                        {pitch.note}
                        {Math.abs(pitch.detune) > 5 && pitch.note !== '--' && (
                            <span className={`absolute -top-1 -right-6 lg:-right-12 text-sm lg:text-2xl font-black px-2 lg:px-3 py-0.5 lg:py-1 bg-slate-900 rounded-lg lg:rounded-2xl border ${pitch.detune > 0 ? 'text-rose-500 border-rose-500/30' : 'text-amber-500 border-amber-500/30'}`}>
                                {pitch.detune > 0 ? 'ALTO' : 'BAJO'}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-center gap-4 lg:gap-8 items-center mt-2 mb-4 w-full">
                        <div className="bg-slate-950 flex-1 px-4 lg:px-6 py-3 lg:py-4 rounded-3xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Desviación (Cents)</p>
                            <p className={`text-2xl lg:text-3xl font-black tabular-nums ${Math.abs(pitch.detune) < 10 ? 'text-emerald-500' : pitch.detune < -20 ? 'text-blue-400' : 'text-white'}`}>{pitch.detune}</p>
                        </div>
                        <div className="bg-slate-950 flex-1 px-4 lg:px-6 py-3 lg:py-4 rounded-3xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Frecuencia Hz</p>
                            <p className="text-2xl lg:text-3xl font-black tabular-nums text-indigo-400">{pitch.freq}</p>
                        </div>
                    </div>

                    {/* Standard Horizontal Tuner Bar */}
                    <div className="w-full h-6 lg:h-12 bg-slate-950 rounded-full relative overflow-hidden mb-6 lg:mb-8 border border-slate-800 shadow-inner px-1">
                        <div className="absolute inset-0 flex justify-between px-2 items-center opacity-20 pointer-events-none">
                            {[...Array(21)].map((_, i) => (
                                <div key={i} className={`w-[2px] ${i === 10 ? 'h-full bg-emerald-500 opacity-100' : 'h-3 bg-white'}`}></div>
                            ))}
                        </div>
                        <div className={`absolute top-1 bottom-1 w-4 rounded-full transition-all duration-75 ease-out ${Math.abs(pitch.detune) < 10 ? 'bg-emerald-400 shadow-[0_0_20px_#34d399]' : pitch.detune > 0 ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e]' : 'bg-amber-400 shadow-[0_0_20px_#fbbf24]'}`} style={{ left: `calc(50% + ${Math.max(-45, Math.min(45, pitch.detune))}%)`, transform: 'translateX(-50%)' }}></div>
                    </div>

                    {/* Oscilloscope & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-auto">
                        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-4 overflow-hidden relative shadow-inner h-24 lg:h-32 flex items-center justify-center">
                            <div className="absolute top-3 left-4 flex items-center gap-2">
                                <Activity size={12} className="text-blue-500" />
                                <span className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Waveform Live</span>
                            </div>
                            <canvas ref={canvasRef} width={400} height={100} className="w-full h-full opacity-80 mix-blend-screen"></canvas>
                        </div>
                        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-3xl p-4 lg:p-6 flex flex-col items-center justify-center relative overflow-hidden group h-24 lg:h-32">
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1 lg:mb-2 z-10 flex items-center gap-2">
                                <Target size={12} /> Estabilidad
                            </p>
                            <div className={`text-3xl lg:text-4xl font-black tabular-nums z-10 transition-colors duration-200 ${bendScore.score > 85 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' : bendScore.score > 50 ? 'text-amber-400' : 'text-slate-600'}`}>
                                {bendScore.active ? bendScore.score : '--'}
                            </div>
                            <div className="w-full h-1 bg-slate-900 absolute bottom-0 left-0">
                                <div className="h-full bg-emerald-500 transition-all duration-200 ease-out" style={{ width: `${bendScore.score}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Celda de Armónica (Moved from Right Col) */}
                    {pitch.rawNote && (
                        <div className="mt-6 flex flex-col items-center animate-in zoom-in duration-300">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Nota detectada en celda:</span>
                            <span className="text-5xl lg:text-6xl font-black text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">{pitch.rawNote}</span>
                        </div>
                    )}
                </div>


                <button onClick={onClose} className="absolute top-4 lg:top-6 right-4 lg:right-6 w-10 lg:w-12 h-10 lg:h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition z-50">
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};

export default TunerModal;
