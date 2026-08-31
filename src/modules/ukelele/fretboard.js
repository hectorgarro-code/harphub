import { 
    notes, notesFlats, getTheoryNoteName, getIntervalLabel, 
    isNatural, buildChord, chordFormulas, getNoteIndex 
} from "../../music/theory";
import { UKELELE_CHORD_SHAPES } from "./data/chordShapes";

/**
 * Genera el mapa completo de notas del diapason (cuerda x traste).
 */
export const getFretboardMap = (tuning, fretCount, useFlats) => {
    return tuning.map(stringNote => {
        const rootIdx = getNoteIndex(stringNote);
        return Array.from({ length: fretCount + 1 }, (_, fIdx) => getTheoryNoteName(rootIdx + fIdx, useFlats));
    });
};

/**
 * Transpone una forma de acorde absoluta a una posicion de traste especifica.
 */
export const transposeShape = (shape, targetRootFret, shapeRootFret) => {
    const diff = targetRootFret - shapeRootFret;
    return {
        ...shape,
        frets: shape.frets.map(f => (f !== null ? f + diff : null))
    };
};

/**
 * Calcula las posiciones exactas (cuerda y traste) para una forma de acorde CAGED.
 */
export const getChordPositions = (rootNote, chordType, shapeKey, tuning, fretboardMap) => {
    const shape = UKELELE_CHORD_SHAPES[chordType]?.[shapeKey];
    
    // Fallback Hibrido (IA)
    if (!shape) {
        const formula = chordFormulas[chordType];
        if (!formula) return [];
        const chordNotes = buildChord(rootNote, formula);
        const suggestions = generateChordVoicing(rootNote, chordNotes, fretboardMap);
        
        if (suggestions && suggestions.length > 0) {
            const first = suggestions[0];
            const positions = [];
            first.frets.forEach((fIdx, sIdx) => {
                if (fIdx !== null) {
                    positions.push({
                        sIdx,
                        fIdx,
                        isRoot: fretboardMap ? (fretboardMap[sIdx][fIdx] === rootNote) : false
                    });
                }
            });
            positions.type = "AI_GENERATED";
            return positions;
        }

        return {
            type: "NO_SHAPE",
            chordNotes: chordNotes
        };
    }

    const rootStringNote = tuning[shape.rootStr];
    const rootStringNoteIdx = getNoteIndex(rootStringNote);
    const rootNoteIdx = getNoteIndex(rootNote);
    const absoluteRootFret = (rootNoteIdx - rootStringNoteIdx + 12) % 12;

    const transposedShape = transposeShape(shape, absoluteRootFret, shape.frets[shape.rootStr]);
    
    const positions = [];
    transposedShape.frets.forEach((fIdx, sIdx) => {
        if (fIdx !== null && fIdx >= 0) {
            positions.push({
                sIdx,
                fIdx,
                isRoot: fretboardMap ? (fretboardMap[sIdx][fIdx] === rootNote) : false
            });
        }
    });

    return positions;
};

/**
 * Determina el estado de una celda para el renderizado.
 */
export const getCellStatus = ({
    sIdx, fIdx, note,
    view, rootNote, selectedNote,
    stringModes, selectedStringSet, stringSets,
    currentScaleNotes, currentTriadNotes, currentChordNotes, currentArpeggioNotes,
    chordPositions,
    gameMode, gameState, gameChallenge, gameAnchorNote
}) => {
    let isActive = false;
    let isFingering = false;
    let isTarget = false;
    let isFound = false;
    let isGameRoot = false;

    if (view === "explore") {
        const mode = stringModes[sIdx];
        if (mode === 1) isActive = isNatural(note);
        else if (mode === 2) isActive = true;
        else isActive = selectedNote === note;
    } else if (view === "scales") {
        isActive = currentScaleNotes.includes(note);
    } else if (view === "triads") {
        const set = stringSets.find(s => s.id === selectedStringSet);
        if (set && set.indices.includes(sIdx)) isActive = currentTriadNotes.includes(note);
    } else if (view === "chords") {
        if (Array.isArray(chordPositions)) {
            const pos = chordPositions.find(p => p.sIdx === sIdx && p.fIdx === fIdx);
            if (pos) {
                isActive = true;
                isFingering = true;
            }
        } else if (chordPositions?.type === "NO_SHAPE") {
            isActive = chordPositions.chordNotes.includes(note);
        } else {
            isActive = currentChordNotes.includes(note);
        }
    } else if (view === "arpeggios") {
        isActive = currentArpeggioNotes.includes(note);
    } else if (view === "games") {
        if (gameState === "playing") {
            if (gameMode === "identifier") isTarget = gameChallenge?.string === sIdx && gameChallenge?.fret === fIdx;
            else if (gameMode === "collector") isFound = gameChallenge?.found.some(p => p.sIdx === sIdx && p.fIdx === fIdx);
            else if (gameMode === "intervals") isGameRoot = gameChallenge?.root.sIdx === sIdx && gameChallenge?.root.fret === fIdx;
            else if (gameMode === "spelling") {
                const range = gameChallenge?.fretRange;
                if (range && fIdx >= range[0] && fIdx <= range[1]) isTarget = true;
            }
        }
        if (gameAnchorNote !== "NONE" && note === gameAnchorNote && !isTarget && !isFound && !isGameRoot) {
            isActive = true;
        }
    }

    const isRoot = (
        (view === "explore"  && note === selectedNote) ||
        (view === "scales"   && note === rootNote) ||
        (view === "triads"   && note === rootNote && stringSets.find(s => s.id === selectedStringSet)?.indices.includes(sIdx)) ||
        (view === "chords"   && note === rootNote)
    );

    return { isActive, isFingering, isRoot, isTarget, isFound, isGameRoot };
};

export const getFullFretboardState = (matrix, options) => {
    const { rootNote, showFunction } = options;
    return matrix.map((stringNotes, sIdx) => {
        return stringNotes.map((note, fIdx) => {
            const status = getCellStatus({ ...options, sIdx, fIdx, note });
            let label = "";
            if (status.isActive || status.isRoot || status.isGameRoot || status.isFound) {
                if ((options.view === "scales" || options.view === "triads") && showFunction) {
                    label = getIntervalLabel(note, rootNote);
                } else {
                    label = note;
                }
            }
            return { ...status, label, note };
        });
    });
};

/**
 * Algoritmo de generacion de digitaciones dinamicas.
 */
export const generateChordVoicing = (rootNote, chordNotes, fretboardMap) => {
    const voicings = [];
    const stringsCount = fretboardMap.length;
    const notePositions = [];
    fretboardMap.forEach((string, sIdx) => {
        string.forEach((note, fIdx) => {
            if (chordNotes.includes(note) && fIdx <= 15) {
                notePositions.push({ note, sIdx, fIdx });
            }
        });
    });

    for (let startFret = 0; startFret <= 12; startFret++) {
        const endFret = startFret + 4;
        const candidates = notePositions.filter(p => p.fIdx >= startFret && p.fIdx <= endFret);
        const byString = Array.from({ length: stringsCount }, () => []);
        candidates.forEach(p => byString[p.sIdx].push(p));

        for (let s = 0; s <= stringsCount - 4; s++) {
            const set = [byString[s], byString[s+1], byString[s+2], byString[s+3]];
            if (set.every(options => options.length > 0)) {
                const fingering = [null, null, null, null];
                let containsRoot = false;
                let notesFound = new Set();
                set.forEach((options, i) => {
                    const best = options[0];
                    fingering[s + i] = best.fIdx;
                    if (best.note === rootNote) containsRoot = true;
                    notesFound.add(best.note);
                });
                if (containsRoot && notesFound.size >= 3) {
                    voicings.push({
                        frets: fingering,
                        rootStr: s + set.findIndex(opt => opt[0].note === rootNote),
                        notes: Array.from(notesFound)
                    });
                }
            }
        }
    }
    return voicings.slice(0, 5);
};
