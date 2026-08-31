export const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const notesFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const chordFormulas = {
    'Major': [0, 4, 7],
    'Minor': [0, 3, 7],
    'Dominant 7': [0, 4, 7, 10],
    'Diminished': [0, 3, 6],
    'Augmented': [0, 4, 8]
};

export const DIATONIC_SYSTEM = {
    major: [
        { degree: 'I',   type: 'Major',      function: 'T',  interval: '1' },
        { degree: 'ii',  type: 'Minor',      function: 'SD', interval: '2' },
        { degree: 'iii', type: 'Minor',      function: 'T',  interval: '3' },
        { degree: 'IV',  type: 'Major',      function: 'SD', interval: '4' },
        { degree: 'V',   type: 'Dominant 7', function: 'D',  interval: '5' },
        { degree: 'vi',  type: 'Minor',      function: 'T',  interval: '6' },
        { degree: 'vii°',type: 'Diminished', function: 'D',  interval: '7' }
    ],
    natural_minor: [
        { degree: 'i',   type: 'Minor',      function: 'T',  interval: '1' },
        { degree: 'ii°', type: 'Diminished', function: 'SD', interval: '2' },
        { degree: 'III', type: 'Major',      function: 'T',  interval: 'b3' },
        { degree: 'iv',  type: 'Minor',      function: 'SD', interval: '4' },
        { degree: 'v',   type: 'Minor',      function: 'D',  interval: '5' },
        { degree: 'VI',  type: 'Major',      function: 'T',  interval: 'b6' },
        { degree: 'VII', type: 'Major',      function: 'D',  interval: 'b7' }
    ],
    harmonic_minor: [
        { degree: 'i',   type: 'Minor',      function: 'T',  interval: '1' },
        { degree: 'ii°', type: 'Diminished', function: 'SD', interval: '2' },
        { degree: 'III+',type: 'Augmented',  function: 'T',  interval: 'b3' },
        { degree: 'iv',  type: 'Minor',      function: 'SD', interval: '4' },
        { degree: 'V',   type: 'Major',      function: 'D',  interval: '5' },
        { degree: 'VI',  type: 'Major',      function: 'T',  interval: 'b6' },
        { degree: 'vii°',type: 'Diminished', function: 'D',  interval: '7' }
    ]
};

export const progressionTemplates = {
    'I - IV - V': { 
        degrees: ['I', 'IV', 'V'], 
        example: 'Johnny B. Goode', 
        artist: 'Chuck Berry',
        originalKey: 'Bb Mayor',
        originalScale: 'Mixolidia / Blues'
    },
    'ii - V - I': { 
        degrees: ['ii', 'V', 'I'], 
        example: 'Autumn Leaves', 
        artist: 'Eric Clapton',
        originalKey: 'Si Menor (Bm)',
        originalScale: 'Menor Natural (Eolia)'
    },
    'I - vi - IV - V': { 
        degrees: ['I', 'vi', 'IV', 'V'], 
        example: 'Every Breath You Take', 
        artist: 'The Police',
        originalKey: 'Lab Mayor (Ab)',
        originalScale: 'Escala Mayor'
    },
    'I - V - vi - IV': { 
        degrees: ['I', 'V', 'vi', 'IV'], 
        example: 'With or Without You', 
        artist: 'U2',
        originalKey: 'Re Mayor (D)',
        originalScale: 'Escala Mayor'
    },
    'ii - V - I - vi': { 
        degrees: ['ii', 'V', 'I', 'vi'], 
        example: "Isn't She Lovely", 
        artist: 'Stevie Wonder',
        originalKey: 'Mi Mayor (E)',
        originalScale: 'Escala Mayor / Jazz'
    },
    'Blues 12-Bar': { 
        degrees: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'], 
        example: 'The Thrill Is Gone', 
        artist: 'B.B. King',
        originalKey: 'Si Menor (Bm)',
        originalScale: 'Blues Menor / Pentatónica'
    }
};

export const scaleDefinitions = {
    'Major': { intervals: [0, 2, 4, 5, 7, 9, 11] },
    'Natural Minor': { intervals: [0, 2, 3, 5, 7, 8, 10] },
    'Harmonic Minor': { intervals: [0, 2, 3, 5, 7, 8, 11] },
    'Major Pentatonic': { intervals: [0, 2, 4, 7, 9] },
    'Minor Pentatonic': { intervals: [0, 3, 5, 7, 10] },
    'Blues': { intervals: [0, 3, 5, 6, 7, 10] },
    'Enigmatic': { intervals: [0, 1, 4, 6, 8, 10, 11] },
    'Mixolydian': { intervals: [0, 2, 4, 5, 7, 9, 10] },
    'Lydian': { intervals: [0, 2, 4, 6, 7, 9, 11] },
    'Phrygian': { intervals: [0, 1, 3, 5, 7, 8, 10] },
    'Dorian': { intervals: [0, 2, 3, 5, 7, 9, 10] },
    'Locrian': { intervals: [0, 1, 3, 5, 6, 8, 10] },
    'Persian': { intervals: [0, 1, 4, 5, 6, 8, 11] },
    'Hindu': { intervals: [0, 2, 4, 5, 7, 8, 10] },
    'Arabic': { intervals: [0, 1, 4, 5, 7, 8, 11] },
    'Egyptian': { intervals: [0, 2, 5, 7, 10] },
    'Jewish': { intervals: [0, 1, 4, 5, 7, 8, 10] },
    'Chinese': { intervals: [0, 4, 6, 7, 11] },
    'Japanese': { intervals: [0, 1, 5, 7, 8] },
    'Mongol': { intervals: [0, 2, 4, 7, 9] },
    'Gypsy': { intervals: [0, 1, 4, 5, 7, 8, 11] }
};

export const triadDefinitions = {
    'Major':      { intervals: [0, 4, 7] },
    'Minor':      { intervals: [0, 3, 7] },
    'Augmented':  { intervals: [0, 4, 8] },
    'Diminished': { intervals: [0, 3, 6] }
};

export const chordDefinitions = {
    'Dominant 7':  { intervals: [0, 4, 7, 10] },
    'Major 7':     { intervals: [0, 4, 7, 11] },
    'Minor 7':     { intervals: [0, 3, 7, 10] },
    'Diminished 7':{ intervals: [0, 3, 6, 9] },
    'Minor 7b5':   { intervals: [0, 3, 6, 10] },
    'Sus 2':       { intervals: [0, 2, 7] },
    'Sus 4':       { intervals: [0, 5, 7] },
    '6':           { intervals: [0, 4, 7, 9] },
    'Minor 6':     { intervals: [0, 3, 7, 9] },
    '9':           { intervals: [0, 4, 7, 10, 14] },
    'Add 9':       { intervals: [0, 4, 7, 14] },
    'mM7':         { intervals: [0, 3, 7, 11] }
};

export const arpeggioDefinitions = {
    'Major':       { intervals: [0, 4, 7, 12, 16, 19] },
    'Minor':       { intervals: [0, 3, 7, 12, 15, 19] },
    'Augmented':   { intervals: [0, 4, 8, 12, 16, 20] },
    'Diminished':  { intervals: [0, 3, 6, 12, 15, 18] },
    'Dominant 7':  { intervals: [0, 4, 7, 10, 12, 16, 19] },
    'Major 7':     { intervals: [0, 4, 7, 11, 12, 16, 19] },
    'Minor 7':     { intervals: [0, 3, 7, 10, 12, 15, 19] },
    'mM7':         { intervals: [0, 3, 7, 11, 12, 15, 19] },
    'Diminished 7':{ intervals: [0, 3, 6, 9, 12, 15, 18] },
    'Sus 2':       { intervals: [0, 2, 7, 12, 14, 19] },
    'Sus 4':       { intervals: [0, 5, 7, 12, 17, 19] },
    'Minor 7b5':   { intervals: [0, 3, 6, 10, 12, 15, 18, 22] }
};

export const getNoteIndex = (note) => notes.indexOf(note);

export const getTheoryNoteName = (index, useFlats = false) => {
    const noteList = useFlats 
        ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
        : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteList[((index % 12) + 12) % 12];
};

export const shouldUseFlats = (root) => {
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
    return flatKeys.includes(root);
};

export const intervalToSemitone = (degree) => {
    const map = {
        '1': 0, 'b2': 1, '2': 2, 'b3': 3, '3': 4, '4': 5, '#4': 6, 'b5': 6, '5': 7, '#5': 8, 'b6': 8, '6': 9, 'b7': 10, '7': 11
    };
    return map[degree] || 0;
};

/**
 * Retorna los acordes diatónicos con sus notas reales para una tonalidad.
 */
export const getDiatonicChords = (rootNote, scaleType = 'major') => {
    const system = DIATONIC_SYSTEM[scaleType] || DIATONIC_SYSTEM['major'];
    const rootIdx = getNoteIndex(rootNote);
    const useFlats = shouldUseFlats(rootNote);

    return system.map(chord => {
        const st = intervalToSemitone(chord.interval);
        const chordRoot = getTheoryNoteName(rootIdx + st, useFlats);
        
        return {
            degree: chord.degree,
            root: chordRoot,
            type: chord.type,
            function: chord.function,
            interval: chord.interval // mantenemos el intervalo para cálculos internos
        };
    });
};

/**
 * Retorna la función armónica (T, SD, D) de un grado según el tipo de escala.
 */
export const getChordFunction = (degree, scaleType = 'major') => {
    const d = degree.replace('°','').replace('+','').toUpperCase();
    
    if (scaleType === 'major') {
        if (['I', 'III', 'VI'].includes(d)) return 'T';
        if (['II', 'IV'].includes(d)) return 'SD';
        if (['V', 'VII'].includes(d)) return 'D';
    } else if (scaleType === 'natural_minor' || scaleType === 'harmonic_minor') {
        if (['I', 'III', 'VI'].includes(d)) return 'T';
        if (['II', 'IV'].includes(d)) return 'SD';
        if (['V', 'VII'].includes(d)) return 'D';
    }
    return '?';
};

export const resolveProgression = (root, templateName, scaleType = 'major') => {
    const templateData = progressionTemplates[templateName];
    if (!templateData) return [];
    
    const template = Array.isArray(templateData) ? templateData : templateData.degrees;
    const diatonicChords = getDiatonicChords(root, scaleType);

    // Mapeo simple de grados comunes a índices (1-7)
    const degreeMap = {
        'I': 0, 'i': 0,
        'II': 1, 'ii': 1, 'ii°': 1,
        'III': 2, 'iii': 2, 'bIII': 2, 'III+': 2,
        'IV': 3, 'iv': 3,
        'V': 4, 'v': 4,
        'VI': 5, 'vi': 5, 'bVI': 5,
        'VII': 6, 'vii': 6, 'bVII': 6, 'vii°': 6
    };

    return template.map(roman => {
        const idx = degreeMap[roman] ?? 0;
        const chordInfo = diatonicChords[idx] || diatonicChords[0];
        
        return {
            degree: chordInfo.degree,
            root: chordInfo.root,
            type: chordInfo.type,
            function: chordInfo.function,
            fullName: `${chordInfo.root} ${chordInfo.type}`
        };
    });
};

export const getTheoryNoteAt = (stringRoot, fret, useFlats = false) => {
    const rootIndex = getNoteIndex(stringRoot);
    if (rootIndex === -1) return 'C';
    return getTheoryNoteName(rootIndex + fret, useFlats);
};

export const isNatural = (note) => !note.includes('#') && !note.includes('b');

/**
 * Construye una lista de notas para un acorde dada una raíz y su fórmula de intervalos.
 */
export const buildChord = (root, formula) => {
    const rootIdx = getNoteIndex(root);
    const useFlats = shouldUseFlats(root);
    return formula.map(semitones => getTheoryNoteName(rootIdx + semitones, useFlats));
};

export const getIntervalLabel = (note, root) => {
    const rootIdx = getNoteIndex(root);
    const noteIdx = getNoteIndex(note);
    if (rootIdx === -1 || noteIdx === -1) return '1';
    const semitones = (noteIdx - rootIdx + 12) % 12;
    const labels = {
        0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: 'b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
    };
    return labels[semitones];
};
