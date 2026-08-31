import React, { useState, useEffect, useRef } from 'react';
import { Volume2, RotateCcw, Mic2, AlertCircle } from 'lucide-react';
import { NOTES } from '../../utils/constants';
import { YinPitchDetector } from '../../utils/pitchDetector';
import { playHarpNote, getAudioContext } from '../../utils/audio';

const InteractiveHarmonica = ({ harpKey = 'C', isListening = false, isRecording = false, bpm = 100, onNoteDetected }) => {
    const [activeHole, setActiveHole] = useState(null);
    const [stableNote, setStableNote] = useState(null);
    const [pitchInfo, setPitchInfo] = useState({ freq: 0, cents: 0, note: '--', diff: 0 });
    const [calibrationOffset, setCalibrationOffset] = useState(0);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const [threshold, setThreshold] = useState(0.025); // Umbral de sensibilidad
    
    const confidenceRef = useRef(0);
    const lastDetectedNoteRef = useRef(null);
    const onNoteDetectedRef = useRef(onNoteDetected);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const detectorRef = useRef(null);
    const requestRef = useRef();

    const HARP_SCHEMA = [
        { hole: 1, blow: 0, draw: 2, drawBends: [1], blowBends: [] },
        { hole: 2, blow: 4, draw: 7, drawBends: [6, 5], blowBends: [] },
        { hole: 3, blow: 7, draw: 11, drawBends: [10, 9, 8], blowBends: [] },
        { hole: 4, blow: 12, draw: 14, drawBends: [13], blowBends: [] },
        { hole: 5, blow: 16, draw: 17, drawBends: [], blowBends: [] },
        { hole: 6, blow: 19, draw: 21, drawBends: [20], blowBends: [] },
        { hole: 7, blow: 24, draw: 23, drawBends: [], blowBends: [23] },
        { hole: 8, blow: 28, draw: 26, drawBends: [], blowBends: [27] },
        { hole: 9, blow: 31, draw: 29, drawBends: [], blowBends: [30] },
        { hole: 10, blow: 36, draw: 33, drawBends: [], blowBends: [35, 34] },
    ];

    const getNoteName = (semitones, key) => {
        const rootIdx = Math.max(0, NOTES.indexOf(key?.toUpperCase() || 'C'));
        const noteIdx = (rootIdx + Math.round(semitones)) % 12;
        const safeIdx = noteIdx < 0 ? noteIdx + 12 : noteIdx;
        return NOTES[safeIdx];
    };

    const getHoleFreq = (holeData, type, bendIdx = 0) => {
        const rootFreq = 261.63; // C4
        let semitones = 0;
        if (type === 'blow') semitones = holeData.blow;
        else if (type === 'draw') semitones = holeData.draw;
        else if (type === 'drawBend') semitones = holeData.drawBends[bendIdx];
        else if (type === 'blowBend') semitones = holeData.blowBends[bendIdx];

        const keyOffset = Math.max(0, NOTES.indexOf(harpKey?.toUpperCase() || 'C'));
        return rootFreq * Math.pow(2, (semitones + keyOffset) / 12);
    };

    const playSample = (freq) => {
        if (freq) playHarpNote(freq, getAudioContext().currentTime, 0.5);
    };

    const handleCalibrate = () => {
        if (activeHole && pitchInfo.freq > 0) {
            const [type, holeNum, bendIdx] = activeHole.split('-');
            const hData = HARP_SCHEMA.find(h => h.hole === parseInt(holeNum));
            const refFreq = getHoleFreq(hData, type, parseInt(bendIdx || 0));
            const offset = 1200 * Math.log2(pitchInfo.freq / refFreq);
            setCalibrationOffset(offset);
            setIsCalibrating(false);
        }
    };

    useEffect(() => {
        onNoteDetectedRef.current = onNoteDetected;
    });

    useEffect(() => {
        if (!isListening) {
            cancelAnimationFrame(requestRef.current);
            setPitchInfo({ freq: 0, cents: 0, note: '--', diff: 0 });
            return;
        }

        const startAudio = async () => {
            try {
                const ctx = getAudioContext();
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 2048;
                source.connect(analyser);
                audioCtxRef.current = ctx;
                analyserRef.current = analyser;
                detectorRef.current = new YinPitchDetector(ctx.sampleRate);
                update();
            } catch (err) { console.error(err); }
        };

        const update = () => {
            if (!analyserRef.current) return;
            const buffer = new Float32Array(analyserRef.current.fftSize);
            analyserRef.current.getFloatTimeDomainData(buffer);
            let sum = 0;
            for(let i=0; i<buffer.length; i++) sum += buffer[i]*buffer[i];
            const rms = Math.sqrt(sum/buffer.length);
            
            const freq = detectorRef.current.detect(buffer);
            if (freq !== -1 && rms > threshold) {
                const calibratedFreq = freq * Math.pow(2, -calibrationOffset / 1200);
                let closest = null;
                let minCents = 1000;

                HARP_SCHEMA.forEach(h => {
                    const types = ['blow', 'draw', 'drawBend', 'blowBend'];
                    types.forEach(type => {
                        const bends = type === 'drawBend' ? h.drawBends : (type === 'blowBend' ? h.blowBends : [0]);
                        bends.forEach((_, idx) => {
                            const f = getHoleFreq(h, type, idx);
                            if (f > 0) {
                                const c = Math.abs(1200 * Math.log2(calibratedFreq / f));
                                if (c < minCents) {
                                    minCents = c;
                                    closest = `${type}-${h.hole}${type.includes('Bend') ? `-${idx}` : ''}`;
                                }
                            }
                        });
                    });
                });

                if (closest) {
                    const [type, holeNum, bendIdx] = closest.split('-');
                    const targetHole = HARP_SCHEMA.find(h => h.hole === parseInt(holeNum));
                    const targetFreq = getHoleFreq(targetHole, type, parseInt(bendIdx || 0));
                    const diff = 1200 * Math.log2(calibratedFreq / targetFreq);
                    
                    setPitchInfo({ 
                        freq: freq.toFixed(1), 
                        cents: minCents.toFixed(0), 
                        note: getNoteName(Math.log2(calibratedFreq/261.63)*12, harpKey), 
                        diff 
                    });

                    if (minCents < 50) {
                        setActiveHole(closest);
                        
                        // Lógica de confianza para escritura automática
                        let seaNote = (type === 'draw' || type === 'drawBend') ? `-${holeNum}` : `${holeNum}`;
                        if (type.includes('Bend')) seaNote += "'".repeat(parseInt(bendIdx) + 1);

                        if (seaNote === lastDetectedNoteRef.current) {
                            confidenceRef.current += 1;
                        } else {
                            confidenceRef.current = 0;
                            lastDetectedNoteRef.current = seaNote;
                        }

                        // Umbral más reactivo: aprox 1/8 de pulso
                        const requiredConfidence = Math.max(3, Math.floor((7.5 / bpm) * 60));

                        if (confidenceRef.current === requiredConfidence) {
                            if (isRecording && onNoteDetectedRef.current) onNoteDetectedRef.current(seaNote);
                            setStableNote(seaNote);
                        }
                    }
                }
            } else {
                setActiveHole(null);
                confidenceRef.current = 0;
                lastDetectedNoteRef.current = null;
                // No borramos stableNote inmediatamente para dar feedback visual
                setPitchInfo(p => ({ ...p, cents: 0, diff: 0 }));
            }
            requestRef.current = requestAnimationFrame(update);
        };

        startAudio();
        return () => cancelAnimationFrame(requestRef.current);
    }, [isListening, harpKey, calibrationOffset]);

    const HoleBox = ({ type, holeData, bendIdx = 0, label, color = 'bg-slate-900', activeColor = 'bg-blue-500', isNumber = false }) => {
        const id = isNumber ? null : `${type}-${holeData.hole}${type.includes('Bend') ? `-${bendIdx}` : ''}`;
        const isActive = activeHole === id;
        const freq = isNumber ? null : getHoleFreq(holeData, type, bendIdx);
        const noteName = isNumber ? holeData.hole : getNoteName(type === 'blow' ? holeData.blow : (type === 'draw' ? holeData.draw : (type === 'drawBend' ? holeData.drawBends[bendIdx] : holeData.blowBends[bendIdx])), harpKey);

        if (isNumber) {
            return (
                <div className="flex items-center justify-center py-2 h-full">
                    <div className={`w-full h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all ${activeHole?.includes(`-${holeData.hole}`) ? 'bg-white text-slate-950 scale-105 shadow-xl ring-4 ring-white/20' : 'bg-slate-950/80 text-slate-200 border border-white/10'}`}>
                        {holeData.hole}
                    </div>
                </div>
            );
        }

        return (
            <div className="relative group/hole-container h-full w-full">
                <button
                    onClick={() => {
                        let seaNote = (type === 'draw' || type === 'drawBend') ? `-${holeData.hole}` : `${holeData.hole}`;
                        if (type.includes('Bend')) seaNote += "'".repeat(bendIdx + 1);
                        onNoteDetected && onNoteDetected(seaNote);
                    }}
                    onContextMenu={(e) => { e.preventDefault(); freq && playSample(freq); }}
                    className={`w-full h-12 flex items-center justify-center rounded-xl border transition-all duration-200 ${isActive ? `${activeColor} border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110 z-10` : `${color} border-white/5 hover:border-white/20`}`}
                >
                    <span className={`text-xs font-black uppercase ${isActive ? 'text-white' : (type.includes('Bend') ? 'text-slate-500' : 'text-slate-200')}`}>{noteName}</span>
                </button>
                {freq && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); playSample(freq); }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center opacity-0 group-hover/hole-container:opacity-100 transition-opacity text-slate-500 hover:text-white border border-white/10 z-20"
                    >
                        <Volume2 size={8} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center justify-between px-8 py-4 bg-slate-950/50 rounded-[2rem] border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Frecuencia</span>
                            <span className="text-xl font-black text-blue-400 tabular-nums">{pitchInfo.freq || '---'} <span className="text-[10px] text-slate-600">Hz</span></span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Nota Detectada</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-white">{pitchInfo.note}</span>
                                {isRecording && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-600/20 rounded-full border border-rose-500/30 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                        <span className="text-[8px] font-black text-rose-500 uppercase">REC</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {stableNote && (
                            <>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="flex flex-col animate-in slide-in-from-left">
                                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">Escrito</span>
                                    <span className="text-xl font-black text-emerald-400">{stableNote}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col items-center flex-1 px-10">
                        <div className="w-full h-1 bg-slate-900 rounded-full relative overflow-hidden mb-2">
                            <div 
                                className={`absolute top-0 bottom-0 transition-all duration-100 ${Math.abs(pitchInfo.diff) < 10 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ 
                                    left: '50%', 
                                    width: '2px', 
                                    transform: `translateX(${pitchInfo.diff}%`,
                                    boxShadow: '0 0 10px currentColor'
                                }}
                            />
                        </div>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Tuning Meter (-50 / +50 cents)</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[8px] font-black text-slate-600 uppercase">Sensibilidad Mic</span>
                            <input 
                                type="range" min="0.005" max="0.1" step="0.005"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-24 h-1 bg-slate-900 rounded-full appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {isListening && activeHole && !isCalibrating && (
                                <button onClick={() => setIsCalibrating(true)} className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-900/10">Calibrar {activeHole.split('-')[1]}</button>
                            )}
                            {isCalibrating && (
                                <div className="flex items-center gap-2 animate-in zoom-in">
                                    <button onClick={handleCalibrate} className="px-3 py-1.5 bg-emerald-600 rounded-lg text-[9px] font-black text-white uppercase shadow-lg shadow-emerald-900/20">Confirmar</button>
                                    <button onClick={() => setIsCalibrating(false)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase">X</button>
                                </div>
                            )}
                            <button onClick={() => setCalibrationOffset(0)} className="p-2 text-slate-600 hover:text-white transition-colors" title="Reset Calibración"><RotateCcw size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="grid grid-cols-10 gap-x-2 gap-y-1">
                    {/* Row 1: Overblows (1-6) and Blow Bends (7-10) */}
                    {HARP_SCHEMA.map(h => (
                        <div key={`bb-${h.hole}`} className="h-full">
                            {h.blowBends.length > 0 && <HoleBox type="blowBend" holeData={h} bendIdx={0} color="bg-emerald-950/20" activeColor="bg-emerald-500" />}
                        </div>
                    ))}

                    {/* Row 2: Blow Notes */}
                    {HARP_SCHEMA.map(h => <HoleBox key={`blow-${h.hole}`} type="blow" holeData={h} color="bg-slate-800/40" activeColor="bg-emerald-500" />)}

                    {/* Row 3: Hole Numbers (Central Row) */}
                    {HARP_SCHEMA.map(h => <HoleBox key={`num-${h.hole}`} isNumber holeData={h} />)}

                    {/* Row 4: Draw Notes */}
                    {HARP_SCHEMA.map(h => <HoleBox key={`draw-${h.hole}`} type="draw" holeData={h} color="bg-slate-800/80" activeColor="bg-rose-500" />)}

                    {/* Row 5: Draw Bends 1 */}
                    {HARP_SCHEMA.map(h => (
                        <div key={`db1-${h.hole}`} className="h-full">
                            {h.drawBends.length > 0 && <HoleBox type="drawBend" holeData={h} bendIdx={0} color="bg-blue-900/20" activeColor="bg-blue-500" />}
                        </div>
                    ))}

                    {/* Row 6: Draw Bends 2 */}
                    {HARP_SCHEMA.map(h => (
                        <div key={`db2-${h.hole}`} className="h-full">
                            {h.drawBends.length > 1 && <HoleBox type="drawBend" holeData={h} bendIdx={1} color="bg-blue-950/40" activeColor="bg-blue-500" />}
                        </div>
                    ))}

                    {/* Row 7: Draw Bends 3 */}
                    {HARP_SCHEMA.map(h => (
                        <div key={`db3-${h.hole}`} className="h-full">
                            {h.drawBends.length > 2 && <HoleBox type="drawBend" holeData={h} bendIdx={2} color="bg-blue-950/60" activeColor="bg-blue-500" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InteractiveHarmonica;
