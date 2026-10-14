import { NOTES } from './constants';

export const calculateHarp = (songKey, position) => {
    const noteIndex = NOTES.indexOf(songKey);
    if (noteIndex === -1) return 'C';
    
    // Cycle of fifths for positions: 1st=0, 2nd=7, 3rd=2, 4th=9, 5th=4, 6th=11
    const shiftMap = { 1: 0, 2: 7, 3: 2, 4: 9, 5: 4, 6: 11 };
    const shift = shiftMap[position] || 0;
    
    // For harp key, we need to go BACKWARDS in the cycle
    // (Song in G, 2nd pos -> Harp in C)
    // Actually simpler: Harp = (Song - (pos_shift))
    const harpIndex = (noteIndex - shift + 12) % 12;
    return NOTES[harpIndex];
};

export const POSITIONS = [
    { id: 2, label: '2da Pos (Cross Harp - Blues)', short: '2da Pos', desc: 'Blues, Rock, Country' },
    { id: 1, label: '1ra Pos (Straight Harp)', short: '1ra Pos', desc: 'Folk, Melodías mayores' },
    { id: 3, label: '3ra Pos (Slant Harp - Menor)', short: '3ra Pos', desc: 'Blues Menor, Funk' },
    { id: 4, label: '4ta Pos (Menor Relativo)', short: '4ta Pos', desc: 'Baladas y Menor' }
];

export const POPULAR_HARP_KEYS = ['C', 'A', 'G', 'D', 'F', 'Bb'];
export const ALL_HARP_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const calculateSongKey = (harpKey, position = 2) => {
    const noteIndex = NOTES.indexOf(harpKey);
    if (noteIndex === -1) return harpKey;
    const shiftMap = { 1: 0, 2: 7, 3: 2, 4: 9, 5: 4, 6: 11 };
    const shift = shiftMap[position] || 7;
    return NOTES[(noteIndex + shift) % 12];
};

export const getNoteFromHole = (hole, layout) => {
    // Logic extracted from App.jsx if needed, or constants
    return hole; // Placeholder for now
};
