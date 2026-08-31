export const SPELLING_LEVELS = {
    1: ['BEE', 'ACE', 'ADD', 'BAD', 'BED', 'CAB', 'DAB', 'EGG', 'GAB', 'AGE', 'FAD', 'FEE'],
    2: ['CAFE', 'FADE', 'BEAD', 'FACE', 'DEAF', 'CAGE', 'BEEF', 'EDGE', 'DEAD', 'DEED', 'FEED', 'BABA'],
    3: ['ADAGE', 'BADGE', 'FACED', 'FADED', 'DECAF', 'CAGED', 'ADDED', 'EGGED', 'GAGED', 'BADEA', 'ACECE', 'GACEA'],
    4: ['BAGGED', 'BEDDED', 'DECADE', 'DEFACE', 'EFFACE', 'FACADE', 'GAGGED', 'BEADED'],
    5: ['BAGGAGE', 'CABBAGE', 'DEFACED', 'EFFACED', 'DECADED', 'FEEDBAG']
};

export const INTERVALS = [
    { name: '3ra Menor (m3)', semitones: 3,  label: 'b3' },
    { name: '3ra Mayor (M3)', semitones: 4,  label: '3' },
    { name: '4ta Justa (P4)', semitones: 5,  label: '4' },
    { name: '5ta Justa (P5)', semitones: 7,  label: '5' },
    { name: '7ma Menor (m7)', semitones: 10, label: 'b7' },
    { name: '7ma Mayor (M7)', semitones: 11, label: '7' }
];

export const STRING_SETS = [
    { id: '123', label: 'Cuerdas 1, 2 y 3', indices: [0, 1, 2] },
    { id: '234', label: 'Cuerdas 2, 3 y 4', indices: [1, 2, 3] },
    { id: 'ALL', label: 'Todo el Diapasón', indices: [0, 1, 2, 3] }
];
