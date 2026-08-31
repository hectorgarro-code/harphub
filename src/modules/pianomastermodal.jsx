import React from 'react';
import * as Tone from 'tone';
import { X, Music, Layers, Zap, Search, Trophy, Piano, Target } from 'lucide-react';
import { usePianoState } from './piano/hooks/usePianoState';
import { usePianoGameEngine } from './piano/hooks/usePianoGameEngine';
import PianoKeyboard from './piano/components/PianoKeyboard';
import PianoGamePanel from './piano/components/PianoGamePanel';
import { getDiatonicChords, resolveProgression, getTheoryNoteName } from '../music/theory';
import { detectChord } from './music/chordDetector';
import { useMidi } from '../hooks/useMidi';

const getChordSymbol = (root, type) => {
    if (type === 'Minor') return root + 'm';
    if (type === 'Dominant 7') return root + '7';
    if (type === 'Diminished') return root + '°';
    if (type === 'Augmented') return root + '+';
    return root;
};

const NAV_ITEMS = [
    { id: 'explore',      icon: <Search size={16} />,  label: 'Explorar' },
    { id: 'scales',       icon: <Layers size={16} />,  label: 'Escalas' },
    { id: 'chords',       icon: <Music size={16} />,   label: 'Acordes' },
    { id: 'progressions', icon: <Music size={16} />,   label: 'Progresiones' },
    { id: 'games',        icon: <Zap size={16} />,     label: 'Minijuegos' },
];

const INTERVAL_NAMES = {
    0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: '#4', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
};

const FUNCTION_MAP = {
    '1': 'T', '2': 'SD', '3': 'T', '4': 'SD', '5': 'D', '6': 'T', '7': 'D',
    'b2': 'SD', 'b3': 'T', 'b5': 'D', '#4': 'D', 'b6': 'SD', 'b7': 'D'
};

const PianoMasterModal = ({ isOpen, onClose, addPoints, unlockAchievement }) => {
    if (!isOpen) return null;

    const [activePressedNotes, setActivePressedNotes] = React.useState([]);
    const { activeNotes: midiActiveNotes, lastEvent } = useMidi();
    const piano = usePianoState();
    const {
        view, setView,
        rootNote, setRootNote, scaleType, setScaleType,
        triadType, setTriadType, chordType, setChordType,
        arpeggioType, setArpeggioType,
        octave, setOctave,
        progressionType, setProgressionType,
        keyContext, setKeyContext,
        activeProgressionIdx, setActiveProgressionIdx,
        isPlayingProgression, setIsPlayingProgression,
        selectedNote, setSelectedNote,
        showFunction, setShowFunction,
        activeKeys, playNote, playChord,
        activeNotes, useFlats,
        notes, scaleDefinitions, triadDefinitions, chordDefinitions, arpeggioDefinitions,
        progressionTemplates,
    } = piano;

    const userActiveNotes = React.useMemo(() => {
        const midiNames = Array.from(midiActiveNotes).map(num => getTheoryNoteName(num, useFlats));
        return Array.from(new Set([...activePressedNotes, ...midiNames]));
    }, [activePressedNotes, midiActiveNotes, useFlats]);

    const detectedChord = React.useMemo(() => detectChord(userActiveNotes), [userActiveNotes]);



    const game = usePianoGameEngine({ 
        addPoints, 
        unlockAchievement, 
        useFlats,
        playChord: (chordNotes) => playChord(chordNotes)
    });
    const { gameState, gameMode, gameScore, gameTimer, gameChallenge, gameFeedback, countdown, startGame, resetGame, handleGameAction, playChord: replayChord } = game;

    React.useEffect(() => {
        if (gameState === 'playing' && gameMode === 'detect_mode' && detectedChord) {
            handleGameAction({ type: 'DETECTED_CHORD', chord: detectedChord });
        }
    }, [detectedChord, gameState, gameMode, handleGameAction]);

    // Handle MIDI Game Actions
    React.useEffect(() => {
        if (lastEvent && lastEvent.type === 'noteon') {
            const noteName = getTheoryNoteName(lastEvent.note, useFlats);
            const oct = Math.floor(lastEvent.note / 12) - 1;
            
            if (view === 'explore') setSelectedNote(noteName);
            if (view === 'games' && gameState === 'playing') {
                handleGameAction({
                    note: noteName,
                    octave: oct,
                    timestamp: Date.now()
                });
            }
        }
    }, [lastEvent, view, gameState, useFlats, handleGameAction, setSelectedNote]);


    const handleKeyClick = async (noteStr, oct) => {
        await Tone.start();
        const note = noteStr.replace(/[0-9]/, '');
        playNote(note, oct);
        
        if (view === 'explore') setSelectedNote(note);
        if (view === 'games' && gameState === 'playing') {
            handleGameAction({
                note,
                octave: oct,
                timestamp: Date.now()
            });
        }
    };

    const effectiveView = view === 'progressions' ? 'chords' : view;
    const progressionChord = activeNotes.progression[activeProgressionIdx];

    const getAnalysisData = () => {
        const currentRoot = view === 'progressions' ? progressionChord?.root : rootNote;
        let currentFormula = [];
        
        if (view === 'scales') {
            currentFormula = scaleDefinitions[scaleType]?.intervals || [];
        } else if (view === 'chords') {
            currentFormula = triadDefinitions[chordType]?.intervals || chordDefinitions[chordType]?.intervals || [];
        } else if (view === 'progressions' && progressionChord) {
            currentFormula = triadDefinitions[progressionChord.type]?.intervals || chordDefinitions[progressionChord.type]?.intervals || [];
        }
        
        if (!currentFormula || currentFormula.length === 0) return [];

        return currentFormula.map(semitones => {
            const numeric = INTERVAL_NAMES[semitones % 12];
            return {
                label: numeric,
                func: FUNCTION_MAP[numeric] || '-',
                note: notes[(notes.indexOf(currentRoot) + semitones) % 12]
            };
        });
    };

    const analysis = getAnalysisData();

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-xl overflow-y-auto font-sans text-slate-200 flex flex-col p-4 md:p-8">
            <div className="max-w-7xl w-full mx-auto space-y-6 relative">

                {/* Close */}
                <button onClick={onClose} className="absolute -top-4 right-0 lg:-right-4 w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-700 hover:text-white z-50 shadow-xl border border-slate-700">
                    <X size={20} />
                </button>

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                            PIANO MASTER <span className="text-purple-500">PRO</span>
                        </h1>
                        <p className="text-slate-500 font-medium">Explorador de Armonía & Teclado Interactivo</p>
                    </div>
                    <nav className="flex flex-wrap bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-xl gap-1">
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setView(item.id); resetGame(); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${view === item.id ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                            >
                                {item.icon}<span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </header>

                <main className="space-y-8">

                    {/* ── Controls ─────────────────────────────────── */}
                    {view !== 'games' && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end gap-8">
                                {/* Root Note */}
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Nota Raíz</p>
                                    <div className="flex flex-wrap gap-2">
                                        {notes.map(n => (
                                            <button key={n} onClick={() => setRootNote(n)}
                                                className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${rootNote === n ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Scale Selector */}
                                {view === 'scales' && (
                                    <div className="w-full md:w-80">
                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Escala</p>
                                        <select value={scaleType} onChange={e => setScaleType(e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-slate-700 text-white text-sm font-bold p-2.5 rounded-xl focus:border-purple-500 outline-none">
                                            {Object.keys(scaleDefinitions).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {view === 'chords' && (
                                    <div className="md:col-span-4">
                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Acorde</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(triadDefinitions).concat(Object.keys(chordDefinitions)).filter((v,i,a) => a.indexOf(v)===i).map(c => (
                                                <button key={c} onClick={() => setChordType(c)}
                                                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${chordType === c ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Progressions ──────────────────────────────── */}
                    {view === 'progressions' && (
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Progresión Activa</p>
                                    <h2 className="text-2xl font-black text-white">{progressionType}</h2>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <select value={progressionType} onChange={e => { setProgressionType(e.target.value); setActiveProgressionIdx(0); }}
                                        className="bg-slate-800 border-2 border-slate-700 text-white text-sm font-bold p-2.5 rounded-xl outline-none">
                                        {Object.keys(progressionTemplates).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <button onClick={async () => { await Tone.start(); setIsPlayingProgression(!isPlayingProgression); }}
                                        className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${isPlayingProgression ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>
                                        {isPlayingProgression ? 'Pausar' : 'Reproducir'}
                                    </button>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="flex gap-6 overflow-x-auto px-6 py-6 -mx-6">
                                {activeNotes.progression.map((chord, idx) => (
                                    <button key={idx} onClick={() => setActiveProgressionIdx(idx)}
                                        className={`shrink-0 w-28 h-40 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${activeProgressionIdx === idx ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_40px_rgba(147,51,234,0.4)] scale-110' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 opacity-80'}`}>
                                        <span className="text-3xl font-black">{getChordSymbol(chord.root, chord.type)}</span>
                                        <span className={`text-xs font-black mt-2 ${activeProgressionIdx === idx ? 'text-purple-200' : 'text-slate-500'}`}>{chord.degree}</span>
                                        <div className={`mt-3 px-3 py-1 rounded-lg text-[9px] font-black ${chord.function === 'T' ? 'bg-blue-500/20 text-blue-400' : chord.function === 'SD' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {chord.function === 'T' ? 'TÓNICA' : chord.function === 'SD' ? 'SUBDOM' : 'DOMIN'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${((activeProgressionIdx + 1) / activeNotes.progression.length) * 100}%` }} />
                            </div>
                        </div>
                    )}

                    {/* ── Game Panel ───────────────────────────────── */}
                    {view === 'games' && gameState === 'idle' && <PianoGamePanel startGame={startGame} />}

                    {/* Countdown */}
                    {view === 'games' && gameState === 'countdown' && (
                        <div className="flex flex-col items-center justify-center py-24 animate-pulse">
                            <div className="text-9xl font-black text-purple-500 mb-4">{countdown}</div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest">¡Prepárate!</h2>
                        </div>
                    )}

                    {/* Game HUD */}
                    {view === 'games' && gameState === 'playing' && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                {gameMode !== 'detect_mode' && (
                                    <div className="bg-slate-800 p-4 rounded-2xl text-center min-w-[100px]">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tiempo</div>
                                        <div className={`text-3xl font-black ${gameTimer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{gameTimer}s</div>
                                    </div>
                                )}
                                <div className="bg-slate-800 p-4 rounded-2xl text-center min-w-[100px]">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Puntos</div>
                                    <div className="text-3xl font-black text-purple-400">{gameScore}</div>
                                </div>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-2">Desafío</p>
                                {gameMode === 'identifier' && (
                                    <div className="text-4xl font-black text-white animate-pulse">{gameChallenge?.noteStr}</div>
                                )}
                                {gameMode === 'collector' && (
                                    <div className="text-2xl font-black text-white">Nota: <span className="text-orange-400 text-4xl">{gameChallenge?.note}</span> <span className="text-slate-500 text-lg">({gameChallenge?.found.length}/{gameChallenge?.total})</span></div>
                                )}
                                {gameMode === 'intervals' && (
                                    <div className="flex flex-col items-center">
                                        <div className="text-sm text-slate-500 font-bold uppercase tracking-tighter mb-1">Entrenamiento Teórico</div>
                                        <div className="text-xl font-black text-white">
                                            Toca una <span className="text-amber-400">{gameChallenge?.interval.label}</span> desde <span className="text-orange-400 text-3xl ml-2">{gameChallenge?.rootNote}</span>
                                        </div>
                                    </div>
                                )}
                                {gameMode === 'chord_builder' && (
                                    <div className="space-y-2">
                                        <div className="text-sm text-slate-500 font-bold uppercase tracking-tighter mb-1">Construí:</div>
                                        <div className="text-4xl font-black text-white">
                                            {gameChallenge?.rootNote}<span className="text-orange-400">{gameChallenge?.chordType}</span>
                                        </div>
                                        <div className="flex justify-center gap-2">
                                            {gameChallenge?.targetNotes.map((note, idx) => (
                                                <div key={idx} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${gameChallenge.foundNotes.includes(note) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    {gameChallenge.foundNotes.includes(note) ? note : '?'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {gameMode === 'ear_training' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => replayChord(gameChallenge.chordNotes)}
                                                className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 group"
                                            >
                                                <div className="group-hover:scale-110 transition-transform">
                                                    <Music size={32} />
                                                </div>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {gameChallenge?.options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleGameAction(opt)}
                                                    className="px-6 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white font-black hover:bg-purple-600 hover:border-purple-400 transition-all uppercase tracking-widest text-xs"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">¿Qué tipo de acorde escuchaste?</p>
                                    </div>
                                )}
                                {gameMode === 'progression_player' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-center flex-wrap gap-2">
                                            {gameChallenge?.steps.map((step, idx) => (
                                                <div key={idx} className={`px-4 py-2 rounded-xl border-2 transition-all ${idx === gameChallenge.currentStep ? 'bg-pink-600/20 border-pink-500 text-white scale-110 shadow-lg' : idx < gameChallenge.currentStep ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 opacity-50' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Paso {idx + 1}</div>
                                                    <div className="font-black text-sm">{step.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-center gap-2">
                                            {gameChallenge?.steps[gameChallenge.currentStep].notes.map((note, idx) => (
                                                <div key={idx} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${gameChallenge.foundNotes.includes(note) ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    {gameChallenge.foundNotes.includes(note) ? note : '?'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {gameMode === 'inversions' && (
                                    <div className="space-y-4">
                                        <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Toca el acorde</div>
                                        <div className="text-4xl font-black text-white">
                                            {gameChallenge?.rootNote} <span className="text-indigo-400">{gameChallenge?.chordType}</span>
                                        </div>
                                        <div className="inline-block px-4 py-2 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase tracking-widest animate-bounce">
                                            {gameChallenge?.invLabel}
                                        </div>
                                        <div className="flex justify-center gap-2 mt-4">
                                            {gameChallenge?.targetNotes.map((note, idx) => (
                                                <div key={idx} className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border transition-all ${gameChallenge.foundNotes.includes(note) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    <span className="text-[10px] font-black">{gameChallenge.foundNotes.includes(note) ? note : '?'}</span>
                                                    {idx === 0 && <span className="text-[7px] font-bold uppercase opacity-60">Bajo</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {gameMode === 'detect_mode' && (
                                    <div className="space-y-4">
                                        <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Historial de Acordes</div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {game.chordHistory?.length > 0 ? game.chordHistory.map((item, idx) => (
                                                <div key={idx} className="bg-slate-800 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                    <span className="text-sm font-black text-white">{item.name}</span>
                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+{item.pts}</span>
                                                </div>
                                            )) : (
                                                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Toca un acorde válido</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={resetGame} className="px-6 py-3 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded-xl font-bold transition-all border border-slate-700">Salir</button>
                        </div>
                    )}

                    {/* Game Finished */}
                    {view === 'games' && gameState === 'finished' && (
                        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] text-center max-w-xl mx-auto animate-in zoom-in duration-500">
                            <Trophy size={80} className="text-amber-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">¡Juego Terminado!</h2>
                            <p className="text-slate-500 mb-8">Puntuación final: <span className="text-purple-400 font-black text-2xl ml-2">{gameScore}</span></p>
                            <button onClick={resetGame} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-600/20 uppercase tracking-widest">
                                Volver al Menú
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                        {/* ── Theory Analysis Panel ──────────────────── */}
                        {view !== 'games' && analysis.length > 0 && (
                            <div className="flex-1 bg-slate-900/50 border border-slate-800/50 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center justify-center">
                                <div className="flex flex-wrap items-center justify-center gap-6">
                                    {analysis.map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center group">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">Nota {idx + 1}</div>
                                            <div className="w-12 h-16 bg-slate-800 border border-slate-700 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg group-hover:border-purple-500/50 transition-all">
                                                <span className="text-white font-black text-sm">{item.note}</span>
                                                <div className="w-full h-[1px] bg-slate-700 mx-2" />
                                                <span className="text-purple-400 font-black text-xs">{item.label}</span>
                                            </div>
                                            <div className={`mt-2 px-2 py-0.5 rounded text-[10px] font-black ${item.func === 'T' ? 'text-blue-400 bg-blue-400/10' : item.func === 'SD' ? 'text-emerald-400 bg-emerald-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                                                {item.func}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Detected Chord Banner ───────────────────── */}
                        <div className={`bg-slate-900 border border-slate-800 px-8 py-4 rounded-2xl flex flex-col items-center justify-center shadow-xl ${view !== 'games' && analysis.length > 0 ? 'w-full lg:w-72' : 'w-full max-w-md mx-auto mb-4'}`}>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 text-center">Acorde Detectado</span>
                            <div className="text-3xl font-black text-white tracking-tighter text-center">
                                {detectedChord ? (
                                    <>
                                        {detectedChord.root} <span className="text-purple-500">{detectedChord.type}</span>
                                        {detectedChord.inversionLabel && <span className="text-emerald-400 ml-1 text-lg">{detectedChord.inversionLabel}</span>}
                                    </>
                                ) : (
                                    <span className="text-slate-600">—</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Piano Keyboard ───────────────────────────── */}
                    <PianoKeyboard
                        view={effectiveView}
                        rootNote={view === 'progressions' ? progressionChord?.root : rootNote}
                        activeNotes={activeNotes}
                        activeKeys={activeKeys}
                        selectedNote={selectedNote}
                        gameState={gameState}
                        gameMode={gameMode}
                        gameChallenge={gameChallenge}
                        gameFeedback={gameFeedback}
                        onKeyClick={handleKeyClick}
                        useFlats={useFlats}
                        onActiveNotesChange={setActivePressedNotes}
                        detectedChordNotes={detectedChord ? detectedChord.notes : []}
                    />

                    {/* Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { color: 'bg-orange-400', label: 'Nota Raíz' },
                            { color: 'bg-blue-400', label: 'Escala' },
                            { color: 'bg-emerald-400', label: 'Acorde / Tríada' },
                            { color: 'bg-purple-400', label: 'Arpegio' },
                        ].map(item => (
                            <div key={item.label} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-md ${item.color} shrink-0`} />
                                <span className="text-slate-400 text-xs font-bold">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </main>

                <footer className="mt-20 pt-8 border-t border-slate-900 flex justify-between items-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span>Piano Master Pro v1.0</span>
                    <span className="text-purple-900">HarpHub Training System</span>
                </footer>
            </div>
        </div>
    );
};

export default PianoMasterModal;
