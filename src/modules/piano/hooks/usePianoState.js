import { useState, useMemo, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import {
    notes, notesFlats, scaleDefinitions, triadDefinitions,
    chordDefinitions, arpeggioDefinitions,
    shouldUseFlats, progressionTemplates, resolveProgression,
    getTheoryNoteName, getNoteIndex
} from '../../../music/theory';
import { useMidi } from '../../../hooks/useMidi';

const OCTAVE_RANGE = 3; // C3 → C5

export const usePianoState = () => {
    const [view, setView] = useState('explore');

    // Musical State
    const [rootNote, setRootNote] = useState('C');
    const [scaleType, setScaleType] = useState('Major');
    const [triadType, setTriadType] = useState('Major');
    const [chordType, setChordType] = useState('Major');
    const [arpeggioType, setArpeggioType] = useState('Major');
    const [octave, setOctave] = useState(4);

    // Progressions
    const [progressionType, setProgressionType] = useState('I - IV - V');
    const [keyContext, setKeyContext] = useState({ scaleType: 'major' });
    const [activeProgressionIdx, setActiveProgressionIdx] = useState(0);
    const [isPlayingProgression, setIsPlayingProgression] = useState(false);

    // UI
    const [selectedNote, setSelectedNote] = useState(null);
    const [showFunction, setShowFunction] = useState(false);
    const [activeKeys, setActiveKeys] = useState(new Set()); // Currently pressed keys

    // Synth — Grand Piano simulation
    const synthRef = useRef(null);

    // MIDI Integration
    const { lastEvent } = useMidi();

    useEffect(() => {
        if (lastEvent) {
            const noteName = getTheoryNoteName(lastEvent.note, useFlats);
            const oct = Math.floor(lastEvent.note / 12) - 1;
            const noteStr = `${noteName}${oct}`;

            if (lastEvent.type === 'noteon') {
                setActiveKeys(prev => {
                    const next = new Set(prev);
                    next.add(noteStr);
                    return next;
                });
            } else if (lastEvent.type === 'noteoff') {
                setActiveKeys(prev => {
                    const next = new Set(prev);
                    next.delete(noteStr);
                    return next;
                });
            }
        }
    }, [lastEvent, useFlats]);



    useEffect(() => {
        const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).toDestination();
        const eq = new Tone.EQ3({ low: 2, mid: 0, high: -1 }).connect(reverb);

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.005,
                decay: 0.8,
                sustain: 0.3,
                release: 2.5
            }
        }).connect(eq);

        synthRef.current = synth;
        return () => { synth.dispose(); reverb.dispose(); eq.dispose(); };
    }, []);

    const playNote = (note, oct = octave) => {
        if (!synthRef.current || Tone.getContext().state !== 'running') return;
        const noteStr = `${note}${oct}`;
        synthRef.current.triggerAttackRelease(noteStr, '4n');
        setActiveKeys(prev => {
            const next = new Set(prev);
            next.add(noteStr);
            return next;
        });
        setTimeout(() => setActiveKeys(prev => {
            const next = new Set(prev);
            next.delete(noteStr);
            return next;
        }), 600);
    };

    const playChord = (noteNames) => {
        if (!synthRef.current || Tone.getContext().state !== 'running') return;
        const now = Tone.now();
        const noteStrings = noteNames.map((n, i) => {
            const oct = i < 3 ? octave : octave + 1;
            return `${n}${oct}`;
        });
        noteStrings.forEach((n, i) => {
            synthRef.current.triggerAttackRelease(n, '2n', now + i * 0.04);
        });
        setActiveKeys(new Set(noteStrings));
        setTimeout(() => setActiveKeys(new Set()), 1200);
    };

    // Auto-advance progression
    useEffect(() => {
        let interval = null;
        if (isPlayingProgression) {
            interval = setInterval(() => {
                setActiveProgressionIdx(prev => {
                    const prog = resolveProgression(rootNote, progressionType, keyContext.scaleType);
                    const next = prev + 1;
                    return next < prog.length ? next : 0;
                });
            }, 1800);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isPlayingProgression, keyContext, progressionType]);

    // Play chord when progression changes
    useEffect(() => {
        const prog = resolveProgression(rootNote, progressionType, keyContext.scaleType);
        const activeChord = prog[activeProgressionIdx];
        if (activeChord && view === 'progressions') {
            const rootIdx = getNoteIndex(activeChord.root);
            const useFlatsLocal = shouldUseFlats(activeChord.root);
            const intervals = (triadDefinitions[activeChord.type]?.intervals || chordDefinitions[activeChord.type]?.intervals || [0, 4, 7]);
            const chordNotes = intervals.map(i => getTheoryNoteName(rootIdx + i, useFlatsLocal));
            playChord(chordNotes);
        }
    }, [activeProgressionIdx, keyContext, progressionType, view]);

    // Computed
    const useFlats = useMemo(() => shouldUseFlats(rootNote), [rootNote]);
    const rootIdx = useMemo(() => getNoteIndex(rootNote), [rootNote]);

    const activeNotes = useMemo(() => {
        const mapIntervals = (def) => (def?.intervals || []).map(i => getTheoryNoteName(rootIdx + i, useFlats));
        return {
            scales: mapIntervals(scaleDefinitions[scaleType]),
            triads: mapIntervals(triadDefinitions[triadType]),
            chords: mapIntervals(triadDefinitions[chordType] ?? chordDefinitions[chordType]),
            arpeggios: mapIntervals(arpeggioDefinitions[arpeggioType]),
            progression: resolveProgression(rootNote, progressionType, keyContext.scaleType)
        };
    }, [rootIdx, useFlats, scaleType, triadType, chordType, arpeggioType, rootNote, progressionType, keyContext.scaleType]);

    return {
        view, setView,
        rootNote, setRootNote, scaleType, setScaleType, triadType, setTriadType,
        chordType, setChordType, arpeggioType, setArpeggioType,
        octave, setOctave,
        progressionType, setProgressionType,
        keyContext, setKeyContext,
        activeProgressionIdx, setActiveProgressionIdx,
        isPlayingProgression, setIsPlayingProgression,
        selectedNote, setSelectedNote,
        showFunction, setShowFunction,
        activeKeys,
        playNote, playChord,
        activeNotes, useFlats,
        notes, scaleDefinitions, triadDefinitions, chordDefinitions, arpeggioDefinitions,
        progressionTemplates,
    };
};
