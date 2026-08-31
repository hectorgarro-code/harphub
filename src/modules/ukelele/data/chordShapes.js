/**
 * @typedef {Object} ChordShape
 * @property {number} rootStr - Índice de la cuerda donde reside la tónica (0-3). (0=A, 1=E, 2=C, 3=G)
 * @property {(number|null)[]} frets - Trastes relativos para cada cuerda [A, E, C, G]. null para cuerdas muteadas.
 */

// Basic shapes for Ukulele
// A-string is 0, E-string is 1, C-string is 2, G-string is 3
export const UKELELE_CHORD_SHAPES = {
    'Major': {
        'C': { rootStr: 2, frets: [3, 0, 0, 0] },
        'A': { rootStr: 0, frets: [0, 0, 1, 2] },
        'G': { rootStr: 3, frets: [2, 3, 2, 0] },
        'F': { rootStr: 1, frets: [0, 1, 0, 2] },
        'D': { rootStr: 2, frets: [0, 2, 2, 2] }
    },
    'Minor': {
        'Am': { rootStr: 0, frets: [0, 0, 0, 2] },
        'Dm': { rootStr: 2, frets: [0, 1, 2, 2] },
        'Em': { rootStr: 1, frets: [2, 3, 4, 0] }
    }
};
