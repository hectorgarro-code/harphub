import { useState, useMemo, useEffect } from 'react';
import * as Tone from 'tone';
import {
    notes, notesFlats, scaleDefinitions, triadDefinitions,
    chordDefinitions, arpeggioDefinitions,
    shouldUseFlats, progressionTemplates, resolveProgression,
    getTheoryNoteName, getNoteIndex
} from '../../../music/theory';
import { getFretboardMap, generateChordVoicing, getChordPositions } from '../fretboard';
import { STRING_SETS } from '../data/gameData';

/**
 * Hook que encapsula todo el estado de UI y lógica musical del GuitarMasterModal.
 */
export const useGuitarState = () => {
    const [view, setView] = useState('explore');
    const [tuning] = useState(['E', 'A', 'D', 'G', 'B', 'E'].reverse());
    const [fretCount] = useState(16);

    // Estado musical
    const [rootNote, setRootNote] = useState('C');
    const [scaleType, setScaleType] = useState('Minor Pentatonic');
    const [triadType, setTriadType] = useState('Major');
    const [chordType, setChordType] = useState('Major');
    const [arpeggioType, setArpeggioType]     = useState('Major');
    
    // Progresiones
    const [progressionType, setProgressionType] = useState('I - IV - V');
    const [keyContext, setKeyContext] = useState({ root: 'C', scaleType: 'major' }); 
    const [activeProgressionIdx, setActiveProgressionIdx] = useState(0);
    const [isPlayingProgression, setIsPlayingProgression] = useState(false);

    // Voicings & UI
    const [selectedVoicing, setSelectedVoicing] = useState('E'); 
    const [selectedStringSet, setSelectedStringSet] = useState('123');
    const [dynamicVoicings, setDynamicVoicings] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [stringModes, setStringModes] = useState([0, 0, 0, 0, 0, 0]);
    const [showFunction, setShowFunction] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);
    const [lastFretPos, setLastFretPos] = useState(null); // Para voice leading

    // Referencia para el sintetizador (Simulación Guitarra Eléctrica Clean)
    const synthRef = useMemo(() => {
        if (typeof window === 'undefined') return null;
        
        // Creamos un sintetizador con un timbre más "punteado"
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { 
                attack: 0.005,  // Ataque instantáneo como una púa
                decay: 0.3,    // Decaimiento natural
                sustain: 0.2, 
                release: 1.2   // Resonancia de cuerda
            }
        });

        // Filtro para suavizar y dar calidez de guitarra eléctrica
        const filter = new Tone.Filter(1200, "lowpass").toDestination();
        return synth.connect(filter);
    }, []);

    const playChord = (positions) => {
        if (!synthRef || Tone.getContext().state !== 'running' || !positions) return;
        
        const now = Tone.now();
        // Ordenar por cuerda para el rasgueo (de graves a agudas)
        const sortedPos = [...positions].sort((a, b) => b.sIdx - a.sIdx);

        sortedPos.forEach((pos, i) => {
            // Calcular la nota exacta basada en la afinación de la cuerda + traste
            const baseNote = tuning[pos.sIdx];
            const baseIdx = getNoteIndex(baseNote);
            const finalNoteName = getTheoryNoteName(baseIdx + pos.fIdx, false);
            
            // Determinar octava basada en la cuerda y el traste
            // E2 (grave) es el estándar. Cuerdas: E2, A2, D3, G3, B3, E4
            let octave = 2;
            if (pos.sIdx <= 1) octave = 4; // Cuerdas 1 y 2
            else if (pos.sIdx <= 3) octave = 3; // Cuerdas 3 y 4
            else octave = 2; // Cuerdas 5 y 6 (E y A graves)
            
            // Ajuste fino de octava si el traste es muy alto
            if (pos.fIdx >= 12) octave += 1;

            const strumDelay = i * 0.035; 
            synthRef.triggerAttackRelease(`${finalNoteName}${octave}`, "2n", now + strumDelay);
        });
    };

    // ────────────────────────────────────────────────────────
    // CÁLCULOS (Memoizados)
    // ────────────────────────────────────────────────────────

    const useFlats = useMemo(() => shouldUseFlats(rootNote), [rootNote]);
    const rootIdx  = useMemo(() => getNoteIndex(rootNote), [rootNote]);
    const fretboardMap = useMemo(() => getFretboardMap(tuning, fretCount, useFlats), [tuning, fretCount, useFlats]);

    const activeNotes = useMemo(() => {
        const mapIntervals = (def) => (def?.intervals || []).map(i => getTheoryNoteName(rootIdx + i, useFlats));
        return {
            scales:    mapIntervals(scaleDefinitions[scaleType]),
            triads:    mapIntervals(triadDefinitions[triadType]),
            chords:    mapIntervals(triadDefinitions[chordType] ?? chordDefinitions[chordType]),
            arpeggios: mapIntervals(arpeggioDefinitions[arpeggioType]),
            progression: resolveProgression(keyContext.root, progressionType, keyContext.scaleType)
        };
    }, [rootIdx, useFlats, rootNote, scaleType, triadType, chordType, arpeggioType, keyContext, progressionType]);

    // ────────────────────────────────────────────────────────
    // EFECTOS (Lógica Reactiva)
    // ────────────────────────────────────────────────────────

    // 1. Sincronizar Progresión con Diapasón (Con Voice Leading y Sonido)
    useEffect(() => {
        const prog = resolveProgression(keyContext.root, progressionType, keyContext.scaleType);
        const activeChord = prog[activeProgressionIdx];
        
        if (activeChord && view === 'progressions') {
            const newRoot = activeChord.root;
            const newType = activeChord.type;
            
            // Lógica de Voice Leading: Buscar el shape más cercano
            const shapes = ['E', 'A', 'D', 'G', 'C'];
            let bestShape = selectedVoicing;
            let minDiff = Infinity;

            if (lastFretPos !== null) {
                shapes.forEach(shapeKey => {
                    const positions = getChordPositions(newRoot, newType, shapeKey, tuning, fretboardMap);
                    if (positions && positions.length > 0) {
                        const avgFret = positions.reduce((acc, p) => acc + p.fIdx, 0) / positions.length;
                        const diff = Math.abs(avgFret - lastFretPos);
                        if (diff < minDiff) {
                            minDiff = diff;
                            bestShape = shapeKey;
                        }
                    }
                });
            }

            setRootNote(newRoot);
            setChordType(newType);
            setSelectedVoicing(bestShape);

            // Sonido basado en la posición real de la digitación
            const finalPos = getChordPositions(newRoot, newType, bestShape, tuning, fretboardMap);
            playChord(finalPos);

            // Actualizar posición de referencia para el siguiente salto
            if (finalPos && finalPos.length > 0) {
                const finalAvg = finalPos.reduce((acc, p) => acc + p.fIdx, 0) / finalPos.length;
                setLastFretPos(finalAvg);
            } else if (lastFretPos === null) {
                setLastFretPos(0);
            }
        }
    }, [activeProgressionIdx, keyContext, progressionType, view, tuning, fretboardMap]);

    useEffect(() => {
        let interval = null;
        if (isPlayingProgression) {
            interval = setInterval(() => {
                setActiveProgressionIdx(prev => {
                    const prog = resolveProgression(keyContext.root, progressionType, keyContext.scaleType);
                    const next = prev + 1;
                    return next < prog.length ? next : 0;
                });
            }, 1500);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isPlayingProgression, keyContext, progressionType]);

    // 3. Limpiar sugerencias al cambiar de acorde
    useEffect(() => {
        setDynamicVoicings([]);
    }, [rootNote, chordType]);

    // 4. Orientación
    useEffect(() => {
        const check = () => setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ────────────────────────────────────────────────────────
    // FUNCIONES (Acciones)
    // ────────────────────────────────────────────────────────

    const generateSuggestions = () => {
        const suggestions = generateChordVoicing(rootNote, activeNotes.chords, fretboardMap);
        setDynamicVoicings(suggestions);
    };

    const toggleStringMode = (idx) => {
        if (view !== 'explore') return;
        const newModes = [...stringModes];
        newModes[idx] = (newModes[idx] + 1) % 3;
        setStringModes(newModes);
    };

    return {
        // Config & UI
        view, setView, tuning, fretCount, isPortrait,
        // Musical State
        rootNote, setRootNote, scaleType, setScaleType, triadType, setTriadType, 
        chordType, setChordType, arpeggioType, setArpeggioType, selectedVoicing, setSelectedVoicing,
        selectedStringSet, setSelectedStringSet,
        // Exploration
        selectedNote, setSelectedNote, stringModes, toggleStringMode, showFunction, setShowFunction,
        // Calculated Data
        activeNotes, fretboardMap, useFlats,
        // Dynamic Voicings (AI)
        dynamicVoicings, generateSuggestions,
        // Definitions & Templates
        notes, stringSets: STRING_SETS, scaleDefinitions, triadDefinitions, chordDefinitions, arpeggioDefinitions,
        progressionTemplates,
        // Progression Setters
        setProgressionType, progressionType, activeProgressionIdx, setActiveProgressionIdx,
        keyContext, setKeyContext,
        isPlayingProgression, setIsPlayingProgression
    };
};
