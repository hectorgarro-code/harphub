import React, { useMemo, memo } from 'react';
import { Zap } from 'lucide-react';
import { getChordPositions, getFullFretboardState } from '../fretboard';

const UkeleleFretboard = memo(({
    tuning, fretCount, view,
    rootNote, selectedNote, stringModes, showFunction, setShowFunction,
    selectedVoicing, selectedStringSet, stringSets,
    currentScaleNotes, currentTriadNotes, currentChordNotes, currentArpeggioNotes,
    chordType, notes, fretboardMap,
    gameState, gameMode, gameChallenge, gameFeedback, gameAnchorNote,
    onFretClick, onStringClick,
}) => {
    const FRET_MARKERS = [3, 5, 7, 9, 12, 15];

    // 1. Pre-calculamos posiciones de acordes (Usando el mapa memoizado)
    const chordPositions = useMemo(() => 
        view === 'chords' && selectedVoicing ? getChordPositions(rootNote, chordType, selectedVoicing, tuning, fretboardMap) : null
    , [view, rootNote, chordType, selectedVoicing, tuning, fretboardMap]);

    // 2. OPTIMIZACIÓN CLAVE: Calculamos el mapa de estado completo del diapasón
    const fretboardStateMap = useMemo(() => {
        return getFullFretboardState(fretboardMap, {
            view, rootNote, selectedNote,
            stringModes, selectedStringSet, stringSets,
            currentScaleNotes, currentTriadNotes, currentChordNotes, currentArpeggioNotes,
            chordPositions,
            gameMode, gameState, gameChallenge, gameAnchorNote,
            showFunction
        });
    }, [fretboardMap, view, rootNote, selectedNote, stringModes, selectedStringSet, stringSets, 
        currentScaleNotes, currentTriadNotes, currentChordNotes, currentArpeggioNotes, 
        chordPositions, gameMode, gameState, gameChallenge, gameAnchorNote, showFunction]);

    return (
        <div className="relative overflow-x-auto pb-6 bg-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl">
            {(view === 'scales' || view === 'triads') && (
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button
                        onClick={() => setShowFunction(!showFunction)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all border ${
                            showFunction ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                        }`}
                    >
                        <Zap size={12} className={showFunction ? 'animate-pulse' : ''} />
                        {showFunction ? 'Modo Funciones' : 'Modo Notas'}
                    </button>
                </div>
            )}

            {view === 'chords' && chordPositions?.type === 'AI_GENERATED' && (
                <div className="absolute top-4 right-4 z-20">
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                Digitación Generativa IA
                            </span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">
                                CAGED no disponible - Sugerencia automática
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {view === 'chords' && chordPositions?.type === 'NO_SHAPE' && (
                <div className="absolute top-4 right-4 z-20">
                    <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                            Mostrando notas (Sin digitación)
                        </span>
                    </div>
                </div>
            )}

            <div className="relative inline-block min-w-full">
                <div className="flex mb-4">
                    <div className="w-14 shrink-0" />
                    {fretboardStateMap[0] && fretboardStateMap[0].map((_, i) => (
                        <div key={i} className={`flex-1 min-w-[60px] text-center text-[10px] font-black tracking-tighter ${FRET_MARKERS.includes(i) ? 'text-blue-400' : 'text-slate-600'}`}>
                            {i === 0 ? 'CEJILLA' : i}
                        </div>
                    ))}
                </div>

                {fretboardStateMap.map((stringState, sIdx) => (
                    <div key={sIdx} className="flex h-12 items-center relative group">
                        <button
                            onClick={() => onStringClick(sIdx)}
                            className={`w-14 h-full font-black flex flex-col justify-center items-center border-r-2 border-slate-600 transition-all ${
                                view === 'explore' && stringModes[sIdx] === 1 ? 'bg-emerald-900/40 text-emerald-400' :
                                view === 'explore' && stringModes[sIdx] === 2 ? 'bg-blue-900/40 text-blue-400' :
                                'text-slate-500'
                            }`}
                        >
                            <span className="text-lg">{tuning[sIdx]}</span>
                            {view === 'explore' && stringModes[sIdx] !== 0 && (
                                <span className="text-[7px] uppercase tracking-widest">
                                    {stringModes[sIdx] === 1 ? 'Nat' : 'All'}
                                </span>
                            )}
                        </button>

                        {stringState.map((cell, fIdx) => {
                            const { isActive, isFingering, isRoot, isTarget, isFound, isGameRoot, label, note } = cell;

                            const isFeedbackCorrect = gameFeedback?.type === 'correct' && gameFeedback?.pos?.s === sIdx && gameFeedback?.pos?.f === fIdx;
                            const isFeedbackWrong   = gameFeedback?.type === 'wrong'   && gameFeedback?.pos?.s === sIdx && gameFeedback?.pos?.f === fIdx;

                            return (
                                <div
                                    key={fIdx}
                                    className={`flex-1 min-w-[60px] h-full border-r border-slate-800/50 relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
                                        isTarget ? 'bg-blue-500/20' :
                                        isFeedbackCorrect ? 'bg-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.4)]' :
                                        isFeedbackWrong ? 'bg-red-500/40 animate-shake shadow-[inset_0_0_20px_rgba(239,68,68,0.4)]' :
                                        'hover:bg-white/5'
                                    }`}
                                    onClick={() => onFretClick({ sIdx, fIdx, note })}
                                >
                                    <div className="absolute w-full bg-slate-600 z-0" style={{ height: `${1 + sIdx * 0.5}px` }} />

                                    {(isActive || isRoot || isGameRoot || isFound || isFeedbackCorrect || isFeedbackWrong) && (
                                        <div className={`z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-xl transition-all transform hover:scale-125 ${
                                            isFeedbackCorrect ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30' :
                                            isFeedbackWrong   ? 'bg-red-500 text-white animate-bounce' :
                                            (isRoot || isGameRoot) ? 'bg-orange-500 text-white ring-4 ring-orange-500/30 shadow-orange-500/50 shadow-lg' :
                                            isFound ? 'bg-orange-500 text-white scale-110 shadow-orange-500/50 shadow-lg' :
                                            (view === 'chords' && isFingering) ? 'bg-white text-slate-950 ring-4 ring-white/50 scale-125 z-20 shadow-[0_0_20px_rgba(255,255,255,0.6)]' :
                                            view === 'chords'    ? 'bg-orange-600/90 text-white border-2 border-orange-400' :
                                            view === 'arpeggios' ? 'bg-violet-600/90 text-white border-2 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)]' :
                                            'bg-blue-500/90 text-white border-2 border-blue-400'
                                        }`}>
                                            {label || note}
                                        </div>
                                    )}

                                    {isTarget && !isFeedbackCorrect && !isFeedbackWrong && (
                                        <div className="z-20 w-10 h-10 rounded-full border-4 border-blue-500 border-dashed animate-spin-slow" />
                                    )}

                                    {FRET_MARKERS.includes(fIdx) && (sIdx === 2 || (fIdx === 12 && (sIdx === 1 || sIdx === 4))) && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                            <div className="w-8 h-8 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div className="flex mt-2">
                    <div className="w-14 shrink-0" />
                    {fretboardStateMap[0] && fretboardStateMap[0].map((_, i) => (
                        <div key={i} className="flex-1 min-w-[60px] flex justify-center">
                            {FRET_MARKERS.includes(i) && (
                                <div className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{i}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default UkeleleFretboard;
