import React from 'react';
import * as Tone from 'tone';
import { Settings, Music, Layers, Zap, Info, RotateCcw, Hash, X, Smartphone, Search, Trophy, Type, Target } from 'lucide-react';

import { useGuitarState }  from './guitar/hooks/useGuitarState';
import { useGameEngine }   from './guitar/hooks/useGameEngine';
import GuitarFretboard     from './guitar/components/GuitarFretboard';
import GuitarControls      from './guitar/components/GuitarControls';
import GuitarGamePanel     from './guitar/components/GuitarGamePanel';
import { getNoteIndex, getDiatonicChords } from '../music/theory';

const INTERVAL_NAMES = {
    0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: '#4', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
};

const FUNCTION_MAP = {
    '1': 'T', '2': 'SD', '3': 'T', '4': 'SD', '5': 'D', '6': 'T', '7': 'D',
    'b2': 'SD', 'b3': 'T', 'b5': 'D', '#4': 'D', 'b6': 'SD', 'b7': 'D'
};

/**
 * GuitarMasterModal — Orquestador principal.
 * Ensambla hooks y componentes sin contener lógica propia.
 */
const GuitarMasterModal = ({ isOpen, onClose, addPoints, unlockAchievement }) => {
    if (!isOpen) return null;

    const guitarState = useGuitarState();
    const {
        view, setView, tuning, fretCount, isPortrait,
        rootNote, setRootNote, scaleType, setScaleType, triadType, setTriadType, 
        chordType, setChordType, arpeggioType, setArpeggioType, selectedVoicing, setSelectedVoicing,
        selectedStringSet, setSelectedStringSet,
        selectedNote, setSelectedNote, stringModes, toggleStringMode, showFunction, setShowFunction,
        activeNotes, fretboardMap, useFlats,
        dynamicVoicings, generateSuggestions,
        notes, stringSets, scaleDefinitions, triadDefinitions, chordDefinitions, arpeggioDefinitions,
        progressionTemplates, setProgressionType, progressionType, activeProgressionIdx, setActiveProgressionIdx,
        keyContext, setKeyContext,
        isPlayingProgression, setIsPlayingProgression
    } = guitarState;

    const getChordSymbol = (root, type) => {
        if (type === 'Major') return root;
        if (type === 'Minor') return root + 'm';
        if (type === 'Dominant 7') return root + '7';
        if (type === 'Diminished') return root + '°';
        if (type === 'Augmented') return root + '+';
        return root;
    };

    // ── Lógica del motor de juego (Engine) ──────────────────
    const game = useGameEngine({ tuning, fretCount, addPoints, unlockAchievement, useFlats });
    const {
        gameState,
        gameMode, gameTimer, gameScore, gameLevel,
        gameChallenge, gameFeedback, timeFeedback, roundSuccess, gameAnchorNote,
        countdown,
        startGame, resetGame, handleGameAction,
    } = game;

    // ── Handlers del diapasón ───────────────────────────────
    const handleFretClick = ({ sIdx, fIdx, note }) => {
        if (view === 'explore') setSelectedNote(note);
        if (view === 'games' && (gameMode === 'collector' || gameMode === 'spelling' || gameMode === 'intervals')) {
            handleGameAction({ sIdx, fIdx });
        }
    };

    const handleStringClick = (sIdx) => toggleStringMode(sIdx);

    const NAV_ITEMS = [
        { id: 'explore',   icon: <Search size={18} />,   label: 'Explorar' },
        { id: 'scales',    icon: <Layers size={18} />,   label: 'Escalas' },
        { id: 'chords',    icon: <Smartphone size={18} />, label: 'Acordes' },
        { id: 'arpeggios', icon: <Music size={18} />,    label: 'Arpegios' },
        { id: 'triads',    icon: <Layers size={18} />,   label: 'Tríadas' },
        { id: 'progressions', icon: <Music size={18} />, label: 'Progresiones' },
        { id: 'games',     icon: <Zap size={18} />,      label: 'Minijuegos' },
    ];

    const getAnalysisData = () => {
        const currentRoot = view === 'progressions' ? (activeNotes.progression[activeProgressionIdx]?.root || rootNote) : rootNote;
        let currentFormula = [];
        
        if (view === 'scales') {
            currentFormula = scaleDefinitions[scaleType]?.intervals || [];
        } else if (view === 'chords') {
            currentFormula = chordDefinitions[chordType]?.intervals || [];
        } else if (view === 'triads') {
            currentFormula = triadDefinitions[triadType]?.intervals || [];
        } else if (view === 'progressions') {
            const activeChord = activeNotes.progression[activeProgressionIdx];
            if (activeChord) {
                currentFormula = triadDefinitions[activeChord.type]?.intervals || chordDefinitions[activeChord.type]?.intervals || [];
            }
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
            {/* Aviso de orientación */}
            {isPortrait && (
                <div className="fixed inset-0 z-[600] bg-slate-950 flex flex-col items-center justify-center p-10 text-center lg:hidden">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Smartphone size={40} className="text-blue-400 rotate-90" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Gira tu pantalla</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[250px]">
                        Para una experiencia óptima con el diapasón, utiliza tu dispositivo en posición horizontal.
                    </p>
                </div>
            )}

            <div className="max-w-7xl w-full mx-auto space-y-6 relative">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute -top-4 right-0 lg:-right-4 w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-700 hover:text-white z-50 shadow-xl border border-slate-700"
                >
                    <X size={20} />
                </button>

                {/* Header + Nav */}
                <header className="max-w-7xl mx-auto mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                                GUITAR MASTER <span className="text-blue-500">PRO</span>
                            </h1>
                            <p className="text-slate-500 font-medium">Explorador de Armonía & Diapasón</p>
                        </div>
                        <nav className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-xl">
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setView(item.id); resetGame(); }}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                                        view === item.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto space-y-8">
                    {/* Selector de Progresiones */}
                    {view === 'progressions' && (
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] animate-in slide-in-from-bottom duration-500 space-y-10">
                            {/* 0. Header de Tonalidad */}
                            <div className="flex items-center justify-between bg-blue-600/5 border border-blue-600/10 p-6 rounded-3xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                                        <Music size={24} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Contexto Activo</p>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                            Tonalidad: <span className="text-blue-500">{keyContext.root}</span> {
                                                keyContext.scaleType === 'major' ? 'Mayor' :
                                                keyContext.scaleType === 'natural_minor' ? 'Menor Natural' : 'Menor Armónica'
                                            }
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            {/* 1. Header de Controles Compacto */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 pb-8 border-b border-slate-800/50">
                                <div className="space-y-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
                                        {/* Selector de Tono */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Tono Principal</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {notes.map(n => {
                                                    const diatonicChords = getDiatonicChords(keyContext.root, keyContext.scaleType);
                                                    const chord = diatonicChords.find(d => d.root === n);
                                                    const isSelected = keyContext.root === n;

                                                    return (
                                                        <button key={n} onClick={() => setKeyContext({ ...keyContext, root: n })}
                                                            className={`w-14 h-24 rounded-xl flex flex-col items-center justify-center transition-all ${
                                                                isSelected 
                                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105 border-2 border-blue-400 z-10' 
                                                                    : chord 
                                                                        ? 'bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:scale-105'
                                                                        : 'bg-slate-900/30 text-slate-600 border border-slate-900/50 opacity-40 scale-95 grayscale'
                                                            }`}
                                                        >
                                                            <span className={`text-lg font-black ${isSelected ? 'text-white' : chord ? 'text-slate-100' : 'text-slate-600'}`}>{n}</span>
                                                            
                                                            {chord ? (
                                                                <>
                                                                    <span className={`text-[10px] font-black mt-1.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                                                                        {chord.degree}
                                                                    </span>
                                                                    <div className={`mt-2 px-2 py-1 rounded-md text-[9px] font-black tracking-widest ${
                                                                        chord.function === 'T' ? (isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-400') :
                                                                        chord.function === 'SD' ? (isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400') :
                                                                        (isSelected ? 'bg-white/20 text-white' : 'bg-orange-500/10 text-orange-400')
                                                                    }`}>
                                                                        {chord.function}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="h-10" /> // Espacio vacío para mantener altura
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Selector de Tipo de Escala (Nueva Ubicación) */}
                                            <div className="mt-8 pt-6 border-t border-slate-800/50">
                                                <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Tipo de Escala / Contexto</p>
                                                <div className="flex gap-2">
                                                    {[
                                                        { id: 'major', label: 'Escala Mayor', desc: 'Alegre, brillante' },
                                                        { id: 'natural_minor', label: 'Menor Natural', desc: 'Triste, melancólica' },
                                                        { id: 'harmonic_minor', label: 'Menor Armónica', desc: 'Exótica, dramática' }
                                                    ].map(s => (
                                                        <button 
                                                            key={s.id}
                                                            onClick={() => setKeyContext({ ...keyContext, scaleType: s.id })}
                                                            className={`flex-1 p-3 rounded-2xl border-2 transition-all text-left ${
                                                                keyContext.scaleType === s.id 
                                                                    ? 'bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-500/5' 
                                                                    : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                                                            }`}
                                                        >
                                                            <p className={`text-[11px] font-black uppercase tracking-wider ${keyContext.scaleType === s.id ? 'text-blue-400' : 'text-slate-200'}`}>
                                                                {s.label}
                                                            </p>
                                                            <p className="text-[9px] text-slate-500 font-bold mt-0.5">{s.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selector de Calidad y Modelo */}
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Modelo de Progresión</p>
                                                <select 
                                                    value={progressionType}
                                                    onChange={(e) => { setProgressionType(e.target.value); setActiveProgressionIdx(0); }}
                                                    className="w-full bg-slate-800 border-2 border-slate-700 text-white text-sm font-bold p-3 rounded-2xl focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    {Object.keys(progressionTemplates).map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                {progressionTemplates[progressionType]?.example && (
                                                    <div className="mt-4 bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                                                                <Trophy size={18} className="text-blue-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Canción de Ejemplo</p>
                                                                <div className="flex flex-wrap items-baseline gap-x-3 mb-2">
                                                                    <span className="text-sm font-black text-blue-400">{progressionTemplates[progressionType].example}</span>
                                                                    <span className="text-[11px] text-slate-400 font-bold italic">{progressionTemplates[progressionType].artist}</span>
                                                                </div>
                                                                
                                                                {/* Metadata Row */}
                                                                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <Music size={12} className="text-slate-600" />
                                                                        <span className="text-[10px] font-bold text-slate-400">Tono Original: <span className="text-slate-200">{progressionTemplates[progressionType].originalKey}</span></span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Layers size={12} className="text-slate-600" />
                                                                        <span className="text-[10px] font-bold text-slate-400">Escala: <span className="text-slate-200">{progressionTemplates[progressionType].originalScale}</span></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>

                            {/* 2. Timeline Armónica (Ancho Completo) */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
                                                <Music size={16} />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Línea de Tiempo Armónica</h3>
                                        </div>
                                        
                                        {/* Botón Play/Pause */}
                                        <button 
                                            onClick={async () => {
                                                await Tone.start();
                                                setIsPlayingProgression(!isPlayingProgression);
                                            }}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                isPlayingProgression 
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse' 
                                                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105'
                                            }`}
                                        >
                                            {isPlayingProgression ? (
                                                <><div className="w-2 h-2 bg-white rounded-full animate-ping" /> Pausar</>
                                            ) : (
                                                <><div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-white" /> Reproducir</>
                                            )}
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                                        COMPÁS {activeProgressionIdx + 1} / {activeNotes.progression.length}
                                    </span>
                                </div>

                                <div className="relative overflow-hidden rounded-[2rem]">
                                    {/* Timeline Scrollable Container */}
                                    <div className="flex items-center gap-6 overflow-x-auto py-8 px-8 scrollbar-hide snap-x">
                                        {activeNotes.progression.map((chord, idx) => (
                                            <div key={idx} className="flex items-center shrink-0 snap-center">
                                                <button
                                                    onClick={() => setActiveProgressionIdx(idx)}
                                                    className={`relative w-36 h-52 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 border-2 overflow-hidden ${
                                                        activeProgressionIdx === idx 
                                                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_50px_rgba(37,99,235,0.4)] scale-110 z-20' 
                                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50 scale-95 opacity-80'
                                                    }`}
                                                >
                                                    {/* Símbolo Musical (C, Cm, etc) */}
                                                    <span className="text-5xl font-black tracking-tighter mb-4">
                                                        {getChordSymbol(chord.root, chord.type)}
                                                    </span>
                                                    
                                                    {/* Grado Romano */}
                                                    <div className="flex flex-col items-center mb-6">
                                                        <span className={`text-sm font-black tracking-[0.2em] ${activeProgressionIdx === idx ? 'text-blue-100' : 'text-slate-500'}`}>
                                                            {chord.degree}
                                                        </span>
                                                    </div>

                                                    {/* Function Label */}
                                                    <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] mb-2.5 ${
                                                        chord.function === 'T' ? (activeProgressionIdx === idx ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400') :
                                                        chord.function === 'SD' ? (activeProgressionIdx === idx ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400') :
                                                        (activeProgressionIdx === idx ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-400')
                                                    }`}>
                                                        {chord.function === 'T' ? 'TÓNICA' : chord.function === 'SD' ? 'SUBDOM' : 'DOMIN'}
                                                    </div>

                                                    {/* Degree (Roman) */}
                                                    <div className={`text-sm font-black tracking-[0.2em] ${activeProgressionIdx === idx ? 'text-blue-200' : 'text-slate-600'}`}>
                                                        {chord.degree}
                                                    </div>

                                                    {activeProgressionIdx === idx && (
                                                        <div className="absolute bottom-0 w-full h-1.5 bg-white/40 animate-pulse" />
                                                    )}
                                                </button>

                                                {idx < activeNotes.progression.length - 1 && (
                                                    <div className={`flex flex-col items-center mx-2 transition-all duration-500 ${activeProgressionIdx === idx ? 'opacity-100 scale-125' : 'opacity-30'}`}>
                                                        <div className="w-10 h-[2px] bg-gradient-to-r from-blue-500/50 to-transparent rounded-full" />
                                                        <span className="text-xs font-black text-blue-500 mt-1">→</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress Bar (Visual track) */}
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                                        <div 
                                            className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                                            style={{ width: `${((activeProgressionIdx + 1) / activeNotes.progression.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Panel de controles dinámico */}
                    {view !== 'games' && (
                        <GuitarControls
                            view={view}
                            notes={notes}
                            rootNote={rootNote}       setRootNote={setRootNote}
                            scaleType={scaleType}     setScaleType={setScaleType}
                            triadType={triadType}     setTriadType={setTriadType}
                            chordType={chordType}     setChordType={setChordType}
                            arpeggioType={arpeggioType} setArpeggioType={setArpeggioType}
                            selectedVoicing={selectedVoicing}     setSelectedVoicing={setSelectedVoicing}
                            selectedStringSet={selectedStringSet} setSelectedStringSet={setSelectedStringSet}
                            selectedNote={selectedNote}           setSelectedNote={setSelectedNote}
                            dynamicVoicings={dynamicVoicings}     generateSuggestions={generateSuggestions}
                            activeNotes={activeNotes}
                            scaleDefinitions={scaleDefinitions}
                            triadDefinitions={triadDefinitions}
                            chordDefinitions={chordDefinitions}
                            arpeggioDefinitions={arpeggioDefinitions}
                            stringSets={stringSets}
                        />
                    )}

                    {/* Panel de juegos (Selección) */}
                    {view === 'games' && gameState === 'idle' && (
                        <GuitarGamePanel startGame={startGame} />
                    )}

                    {/* Overlay de Cuenta Atrás */}
                    {view === 'games' && gameState === 'countdown' && (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <div className="text-8xl font-black text-blue-500 mb-4">{countdown}</div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest">¡Prepárate!</h2>
                        </div>
                    )}

                    {/* HUD del Juego (Activo) */}
                    {view === 'games' && gameState === 'playing' && (
                        <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 animate-in slide-in-from-top duration-500">
                            {/* Overlay de Éxito de Ronda */}
                            {roundSuccess && (
                                <div className="absolute inset-0 z-[100] bg-blue-600/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center animate-in zoom-in duration-300">
                                    <div className="bg-white/20 p-4 rounded-full mb-4 animate-bounce">
                                        <Trophy size={48} className="text-white fill-amber-400" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">¡Ronda Completada!</h2>
                                    <p className="text-blue-100 font-bold uppercase tracking-widest mt-2">+25 Puntos Bonus / Tiempo Reset</p>
                                </div>
                            )}

                            <div className="flex items-center gap-6">
                                <div className="relative bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[120px] text-center">
                                    {timeFeedback && (
                                        <div className={`absolute -top-8 left-1/2 -translate-x-1/2 font-black text-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                                            timeFeedback.type === 'plus' ? 'text-emerald-400' : 'text-red-500'
                                        }`}>
                                            {timeFeedback.type === 'plus' ? '+' : '-'}{timeFeedback.value}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tiempo</div>
                                    <div className={`text-3xl font-black ${gameTimer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                        {gameTimer}s
                                    </div>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[120px] text-center">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Puntos</div>
                                    <div className="text-3xl font-black text-blue-400">{gameScore}</div>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left px-6">
                                <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Desafío Actual</h2>
                                <div className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {gameMode === 'identifier' && (
                                        <div className="flex flex-col gap-4">
                                            <span className="text-xl font-bold text-white uppercase tracking-widest">¿Qué nota es la marcada?</span>
                                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                                {notes.map(note => (
                                                    <button
                                                        key={note}
                                                        onClick={() => handleGameAction(note)}
                                                        className="w-12 h-12 bg-slate-800 hover:bg-blue-600 text-white font-black rounded-xl border border-slate-700 transition-all transform active:scale-95 shadow-lg"
                                                    >
                                                        {note}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {gameMode === 'collector' && (
                                        <span>Encuentra todos los: <span className="text-orange-500 text-4xl ml-2">{gameChallenge?.note}</span> ({gameChallenge?.found.length}/{gameChallenge?.total})</span>
                                    )}
                                    {gameMode === 'spelling' && (
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1">
                                                Nivel {gameChallenge?.level}
                                            </div>
                                            <div className="flex items-baseline gap-4">
                                                <span>Deletrea: </span>
                                                <span className="text-emerald-400 text-4xl">
                                                    {gameChallenge?.word.map((char, i) => (
                                                        <span key={i} className={i < gameChallenge.currentIdx ? 'opacity-30' : i === gameChallenge.currentIdx ? 'underline' : ''}>
                                                            {char}
                                                        </span>
                                                    ))}
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                                Zona: Trastes {gameChallenge?.fretRange[0]} a {gameChallenge?.fretRange[1]}
                                            </div>
                                        </div>
                                    )}
                                    {gameMode === 'intervals' && (
                                        <span>Toca la <span className="text-amber-400">{gameChallenge?.interval?.label}</span> de <span className="text-orange-500">{gameChallenge?.root?.note}</span></span>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                onClick={resetGame}
                                className="px-6 py-3 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded-xl font-bold transition-all border border-slate-700"
                            >
                                Salir
                            </button>
                        </div>
                    )}

                    {/* Pantalla Final */}
                    {view === 'games' && gameState === 'finished' && (
                        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] text-center max-w-2xl mx-auto animate-in zoom-in duration-500 shadow-2xl">
                            <Trophy size={80} className="text-amber-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]" />
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">¡Juego Terminado!</h2>
                            <p className="text-slate-500 mb-8 font-medium">Has completado tu entrenamiento diario.</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Puntos Totales</div>
                                    <div className="text-4xl font-black text-white">{gameScore}</div>
                                </div>
                                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Dificultad</div>
                                    <div className="text-4xl font-black text-white">PRO</div>
                                </div>
                            </div>

                            <button 
                                onClick={resetGame}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest"
                            >
                                Volver al Menú
                            </button>
                        </div>
                    )}

                    {/* Panel de Análisis Teórico */}
                    {view !== 'games' && analysis.length > 0 && (
                        <div className="bg-slate-900/50 border border-slate-800/50 p-6 rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                {analysis.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center group">
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 group-hover:text-blue-400 transition-colors">Nota {idx + 1}</div>
                                        <div className="w-14 h-20 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-xl group-hover:border-blue-500/50 transition-all transform group-hover:scale-105">
                                            <span className="text-white font-black text-lg">{item.note}</span>
                                            <div className="w-10 h-[2px] bg-slate-700/50 rounded-full" />
                                            <span className="text-blue-500 font-black text-sm">{item.label}</span>
                                        </div>
                                        <div className={`mt-3 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${
                                            item.func === 'T' ? 'text-blue-400 bg-blue-400/10' : 
                                            item.func === 'SD' ? 'text-emerald-400 bg-emerald-400/10' : 
                                            'text-orange-400 bg-orange-400/10'
                                        }`}>
                                            {item.func}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Diapasón */}
                    <GuitarFretboard
                        tuning={tuning}
                        fretCount={fretCount}
                        view={view === 'progressions' ? 'chords' : view}
                        notes={notes}
                        fretboardMap={fretboardMap}
                        rootNote={view === 'progressions' ? activeNotes.progression[activeProgressionIdx]?.root : rootNote}
                        selectedNote={selectedNote}
                        stringModes={stringModes}
                        showFunction={showFunction}       setShowFunction={setShowFunction}
                        selectedVoicing={selectedVoicing}
                        selectedStringSet={selectedStringSet}
                        stringSets={stringSets}
                        chordType={view === 'progressions' ? activeNotes.progression[activeProgressionIdx]?.type : chordType}
                        currentScaleNotes={activeNotes.scales}
                        currentTriadNotes={activeNotes.triads}
                        currentChordNotes={activeNotes.chords}
                        currentArpeggioNotes={activeNotes.arpeggios}
                        gameState={gameState}
                        gameMode={gameMode}
                        gameChallenge={gameChallenge}
                        gameFeedback={gameFeedback}
                        gameAnchorNote={gameAnchorNote}
                        onFretClick={handleFretClick}
                        onStringClick={handleStringClick}
                    />

                    {/* Leyenda inferior */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
                            <div className="bg-orange-500/20 p-3 rounded-xl"><Zap className="text-orange-500" /></div>
                            <div>
                                <h4 className="font-bold text-white mb-1 uppercase text-xs">Puntos Clave</h4>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Los marcadores azules (3, 5, 7, 9, 12, 15) son tus anclas visuales.
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
                            <div className="bg-blue-500/20 p-3 rounded-xl"><Hash className="text-blue-500" /></div>
                            <div>
                                <h4 className="font-bold text-white mb-1 uppercase text-xs">Pensamiento Intervalar</h4>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    No memorices solo notas, memoriza la <strong>distancia</strong> entre ellas.
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
                            <div className="bg-emerald-500/20 p-3 rounded-xl"><RotateCcw className="text-emerald-500" /></div>
                            <div>
                                <h4 className="font-bold text-white mb-1 uppercase text-xs">Práctica Diaria</h4>
                                <p className="text-slate-400 text-xs leading-relaxed">
                                    Selecciona una escala y búscala en una sola cuerda, luego en una posición.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-900 flex justify-between items-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span>Teoría Aplicada v3.0</span>
                    <span className="text-blue-900">Training System</span>
                </footer>
            </div>
        </div>
    );
};

export default GuitarMasterModal;