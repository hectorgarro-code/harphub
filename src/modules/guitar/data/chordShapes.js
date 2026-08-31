/**
 * @typedef {Object} ChordShape
 * @property {number} rootStr - Índice de la cuerda donde reside la tónica (0-5).
 * @property {(number|null)[]} frets - Trastes relativos para cada cuerda [E_high, B, G, D, A, E_low]. null para cuerdas muteadas.
 */

/** @type {Record<string, ChordShape>} */
const MAJOR_SHAPES = {
    'E': { rootStr: 5, frets: [0, 0, 1, 2, 2, 0] },   // E
    'A': { rootStr: 4, frets: [0, 2, 2, 2, 0, null] }, // A
    'D': { rootStr: 3, frets: [2, 3, 2, 0, null, null] },// D
    'G': { rootStr: 5, frets: [3, 0, 0, 0, 2, 3] },    // G
    'C': { rootStr: 4, frets: [0, 1, 0, 2, 3, null] }  // C
};

const MINOR_SHAPES = {
    'E': { rootStr: 5, frets: [0, 0, 0, 2, 2, 0] },    // Em
    'A': { rootStr: 4, frets: [0, 1, 2, 2, 0, null] },  // Am
    'D': { rootStr: 3, frets: [1, 3, 2, 0, null, null] },// Dm
    'G': { rootStr: 5, frets: [3, 3, 3, 5, 5, 3] },     // Gm (Barre)
    'C': { rootStr: 4, frets: [3, 4, 5, 5, 3, null] }   // Cm (Barre)
};

const DOMINANT_7_SHAPES = {
    'E': { rootStr: 5, frets: [0, 0, 1, 0, 2, 0] },    // E7
    'A': { rootStr: 4, frets: [0, 2, 0, 2, 0, null] },  // A7
    'D': { rootStr: 3, frets: [2, 1, 2, 0, null, null] },// D7
    'G': { rootStr: 5, frets: [1, 0, 0, 0, 2, 3] },     // G7
    'C': { rootStr: 4, frets: [0, 1, 3, 2, 3, null] }   // C7
};

const MAJOR_7_SHAPES = {
    'E': { rootStr: 5, frets: [0, 0, 1, 1, 2, 0] },    // Emaj7
    'A': { rootStr: 4, frets: [0, 2, 1, 2, 0, null] },  // Amaj7
    'D': { rootStr: 3, frets: [2, 2, 2, 0, null, null] },// Dmaj7
    'G': { rootStr: 5, frets: [2, 0, 0, 0, 2, 3] },     // Gmaj7
    'C': { rootStr: 4, frets: [0, 0, 0, 2, 3, null] }   // Cmaj7
};

const MINOR_7_SHAPES = {
    'E': { rootStr: 5, frets: [0, 0, 0, 0, 2, 0] },    // Em7
    'A': { rootStr: 4, frets: [0, 1, 0, 2, 0, null] },  // Am7
    'D': { rootStr: 3, frets: [1, 1, 2, 0, null, null] },// Dm7
    'G': { rootStr: 5, frets: [3, 3, 3, 3, 5, 3] },     // Gm7
    'C': { rootStr: 4, frets: [3, 4, 3, 5, 3, null] }   // Cm7
};

export const GUITAR_CHORD_SHAPES = {
    'Major':      MAJOR_SHAPES,
    'Minor':      MINOR_SHAPES,
    'Dominant 7': DOMINANT_7_SHAPES,
    'Major 7':    MAJOR_7_SHAPES,
    'Minor 7':    MINOR_7_SHAPES,
    'Sus 2': {
        'E': { rootStr: 5, frets: [0, 0, 4, 2, 2, 0] },
        'A': { rootStr: 4, frets: [0, 0, 2, 2, 0, null] },
        'D': { rootStr: 3, frets: [0, 3, 2, 0, null, null] }
    },
    'Sus 4': {
        'E': { rootStr: 5, frets: [0, 0, 2, 2, 2, 0] },
        'A': { rootStr: 4, frets: [0, 3, 2, 2, 0, null] },
        'D': { rootStr: 3, frets: [3, 3, 2, 0, null, null] }
    },
    '6': {
        'E': { rootStr: 5, frets: [0, 2, 1, 2, 2, 0] },
        'A': { rootStr: 4, frets: [2, 2, 2, 2, 0, null] },
        'D': { rootStr: 3, frets: [2, 0, 2, 0, null, null] }
    },
    'Minor 6': {
        'E': { rootStr: 5, frets: [0, 2, 0, 2, 2, 0] },
        'A': { rootStr: 4, frets: [2, 1, 2, 2, 0, null] },
        'D': { rootStr: 3, frets: [1, 0, 2, 0, null, null] }
    },
    '9': {
        'E': { rootStr: 5, frets: [2, 0, 1, 0, 2, 0] },   // E9
        'A': { rootStr: 4, frets: [3, 2, 4, 2, 0, null] }, // A9 (X02423)
        'D': { rootStr: 3, frets: [0, 1, 2, 4, 5, null] }  // D9 (X5455X)
    },
    'Add 9': {
        'E': { rootStr: 5, frets: [2, 0, 1, 2, 2, 0] },   // Eadd9
        'A': { rootStr: 4, frets: [0, 0, 2, 2, 0, null] }, // Aadd9 (Sus2 fallback? No, X02200 is Asus2. Aadd9 is X07600)
        'D': { rootStr: 3, frets: [0, 5, 2, 0, null, null] } // Dadd9 (XX0252)
    },
    'Diminished 7': {
        'E': { rootStr: 5, frets: [0, 2, 0, 2, 1, 0] },
        'A': { rootStr: 4, frets: [2, 1, 2, 1, 0, null] },
        'D': { rootStr: 3, frets: [1, 0, 1, 0, null, null] }
    }
};
