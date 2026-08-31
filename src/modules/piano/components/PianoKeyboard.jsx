import React from 'react';

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTES = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];
const KEY_OCTAVES = [3, 4, 5];

const FLAT_TO_SHARP = { 'Db':'C#', 'Eb':'D#', 'Fb':'E', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#', 'Cb':'B' };
const normalize = (note) => {
    if (!note) return '';
    const n = note.trim();
    return FLAT_TO_SHARP[n] || n;
};

const normalizeSet = (arr) => {
    if (!arr || !Array.isArray(arr)) return new Set();
    return new Set(arr.map(normalize));
};

export const PianoKeyboard = ({
    view,
    rootNote,
    activeNotes,
    activeKeys,
    selectedNote,
    gameState,
    gameMode,
    gameChallenge,
    gameFeedback,
    onKeyClick,
    useFlats,
    onActiveNotesChange,
    detectedChordNotes = []
}) => {
    const [activePressedNotes, setActivePressedNotes] = React.useState(new Set());
    // Pre-normalize all note sets for fast lookup
    const scaleSet    = normalizeSet(activeNotes?.scales);
    const chordSet    = normalizeSet(activeNotes?.chords);
    const triadSet    = normalizeSet(activeNotes?.triads);
    const arpSet      = normalizeSet(activeNotes?.arpeggios);
    const rootNorm    = normalize(rootNote);
    const selectedNorm = normalize(selectedNote);

    const getKeyStatus = (note, octave) => {
        const noteStr  = `${note}${octave}`;
        const noteNorm = normalize(note);

        // ── Game Logic ───────────────────────────────────────────────────────
        if (gameState === 'playing') {
            if (gameMode === 'identifier' && gameChallenge?.noteStr === noteStr) return 'challenge';
            if (gameMode === 'collector' && gameChallenge?.targets?.includes(noteStr)) {
                return gameChallenge?.found?.includes(noteStr) ? 'found' : 'target';
            }
            if (gameMode === 'intervals' && gameChallenge?.rootNoteStr === noteStr) return 'anchor';
            if (gameFeedback?.note === noteStr) return gameFeedback.type === 'correct' ? 'correct' : 'wrong';
        }

        // ── Active Playback ──────────────────────────────────────────────────
        if (activeKeys?.has(noteStr)) return 'playing';

        // ── Music Theory Highlighting ────────────────────────────────────────
        const isRoot = noteNorm === rootNorm;
        const isSelected = noteNorm === selectedNorm;

        // ── Ghost Notes for Chord Builder ────────────────────────────────────
        if (gameState === 'playing' && gameMode === 'chord_builder') {
            if (chordSet.has(noteNorm) && !gameChallenge?.foundNotes?.includes(noteNorm)) return 'target';
        }

        // ── Detected Chord Highlight ─────────────────────────────────────────
        if (detectedChordNotes.length > 0) {
            const detectedNorms = detectedChordNotes.map(normalize);
            if (detectedNorms[0] === noteNorm) return 'root'; // Root of detected chord
            if (detectedNorms.includes(noteNorm)) return 'chord'; // Other notes
        }

        if (view === 'scales' && scaleSet.has(noteNorm)) return isRoot ? 'root' : 'scale';
        if (view === 'chords' && chordSet.has(noteNorm)) return isRoot ? 'root' : 'chord';
        if (view === 'triads' && triadSet.has(noteNorm)) return isRoot ? 'root' : 'chord';
        if (view === 'arpeggios' && arpSet.has(noteNorm)) return isRoot ? 'root' : 'arp';

        // ── Explore / Progressions ──────────────────────────────────────────
        if (view === 'explore' || view === 'progressions' || view === 'chords') {
            if (isRoot) return 'root';
            if (isSelected) return 'scale'; // Highlight clicked note in explore mode
        }

        return 'default';
    };

    const getWhiteKeyClass = (status) => {
        const base = 'relative w-10 h-36 rounded-b-xl border border-slate-700 cursor-pointer transition-all duration-100 flex items-end justify-center pb-2 select-none';
        const map = {
            default:   'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-500',
            playing:   'bg-blue-200 scale-y-[0.97] text-blue-700',
            root:      'bg-orange-400 hover:bg-orange-300 text-white font-black shadow-lg shadow-orange-400/30',
            scale:     'bg-blue-400 hover:bg-blue-300 text-white shadow-md',
            chord:     'bg-emerald-400 hover:bg-emerald-300 text-white shadow-md',
            arp:       'bg-purple-400 hover:bg-purple-300 text-white shadow-md',
            challenge: 'bg-amber-300 animate-pulse text-amber-900 font-black',
            target:    'bg-rose-300 text-rose-900',
            found:     'bg-emerald-300 text-emerald-900',
            anchor:    'bg-orange-400 text-white font-black',
            correct:   'bg-emerald-400 scale-y-[0.97]',
            wrong:     'bg-red-400 scale-y-[0.97]',
        };
        return `${base} ${map[status] || map.default}`;
    };

    const getBlackKeyClass = (status) => {
        const base = 'absolute top-0 w-7 h-20 rounded-b-lg z-10 cursor-pointer transition-all duration-100 flex items-end justify-center pb-1 select-none text-[8px] font-black';
        const map = {
            default:   'bg-slate-900 hover:bg-slate-700 active:bg-slate-600 text-slate-500',
            playing:   'bg-blue-700 scale-y-[0.97] text-white',
            root:      'bg-orange-500 text-white shadow-lg shadow-orange-500/40',
            scale:     'bg-blue-600 text-white',
            chord:     'bg-emerald-600 text-white',
            arp:       'bg-purple-600 text-white',
            challenge: 'bg-amber-400 animate-pulse text-black',
            target:    'bg-rose-500 text-white',
            found:     'bg-emerald-500 text-white',
            anchor:    'bg-orange-500 text-white',
            correct:   'bg-emerald-500 scale-y-[0.97]',
            wrong:     'bg-red-500 scale-y-[0.97]',
        };
        return `${base} ${map[status] || map.default}`;
    };

    const handlePressStart = (noteStr, oct, noteName, e) => {
        if (e && e.cancelable) e.preventDefault();
        onKeyClick(noteStr, oct);
        setActivePressedNotes(prev => {
            const next = new Set(prev);
            next.add(noteName);
            if (onActiveNotesChange) onActiveNotesChange(Array.from(next));
            return next;
        });
    };

    const handlePressEnd = (noteName) => {
        setActivePressedNotes(prev => {
            const next = new Set(prev);
            next.delete(noteName);
            if (onActiveNotesChange) onActiveNotesChange(Array.from(next));
            return next;
        });
    };

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
                {KEY_OCTAVES.map(oct => (
                    <div key={oct} className="relative flex">
                        {WHITE_NOTES.map((note, wIdx) => {
                            const status      = getKeyStatus(note, oct);
                            const blackNote   = BLACK_NOTES[wIdx];
                            const blackStatus = blackNote ? getKeyStatus(blackNote, oct) : null;
                            return (
                                <div key={note + oct} className="relative">
                                    <div
                                        className={getWhiteKeyClass(status)}
                                        onMouseDown={(e) => handlePressStart(`${note}${oct}`, oct, note, e)}
                                        onMouseUp={() => handlePressEnd(note)}
                                        onMouseLeave={() => handlePressEnd(note)}
                                        onTouchStart={(e) => handlePressStart(`${note}${oct}`, oct, note, e)}
                                        onTouchEnd={() => handlePressEnd(note)}
                                    >
                                        <span className="text-[9px] font-bold opacity-60">{note}{oct}</span>
                                    </div>
                                    {blackNote && (
                                        <div
                                            className={getBlackKeyClass(blackStatus)}
                                            style={{ left: '28px', transform: 'translateX(-50%)', position: 'absolute', top: 0 }}
                                            onMouseDown={(e) => { e.stopPropagation(); handlePressStart(`${blackNote}${oct}`, oct, blackNote, e); }}
                                            onMouseUp={(e) => { e.stopPropagation(); handlePressEnd(blackNote); }}
                                            onMouseLeave={(e) => { e.stopPropagation(); handlePressEnd(blackNote); }}
                                            onTouchStart={(e) => { e.stopPropagation(); handlePressStart(`${blackNote}${oct}`, oct, blackNote, e); }}
                                            onTouchEnd={(e) => { e.stopPropagation(); handlePressEnd(blackNote); }}
                                        >
                                            {blackNote}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="w-px bg-slate-700 self-stretch mx-1 opacity-50" />
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            oct {oct}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PianoKeyboard;
