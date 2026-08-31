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

export const getNoteFromHole = (hole, layout) => {
    // Logic extracted from App.jsx if needed, or constants
    return hole; // Placeholder for now
};
