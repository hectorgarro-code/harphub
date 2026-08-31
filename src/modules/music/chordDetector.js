export const detectChord = (activeNotes) => {
    if (!activeNotes || activeNotes.length < 3) return null;
    
    const chromaticMap = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
        'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
        'A#': 10, 'Bb': 10, 'B': 11
    };
    const reverseMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const supportedChords = [
        { type: 'Major', intervals: [0, 4, 7] },
        { type: 'Minor', intervals: [0, 3, 7] },
        { type: 'Dominant 7', intervals: [0, 4, 7, 10] },
        { type: 'Minor 7', intervals: [0, 3, 7, 10] },
        { type: 'Major 7', intervals: [0, 4, 7, 11] },
        { type: 'Diminished', intervals: [0, 3, 6] }
    ];

    // 1. Convert to chromatic indices
    const playedIndices = activeNotes.map(n => chromaticMap[n]).filter(n => n !== undefined);
    
    // 2. Normalize (sort & unique)
    const uniqueIndices = [...new Set(playedIndices)].sort((a, b) => a - b);
    
    if (uniqueIndices.length < 3) return null;

    let bestMatch = null;
    let highestScore = -1;

    // 3. Test every possible chromatic note as the root (0 to 11)
    for (let rootIdx = 0; rootIdx < 12; rootIdx++) {
        const rootNoteName = activeNotes.find(n => chromaticMap[n] === rootIdx) || reverseMap[rootIdx];

        for (const def of supportedChords) {
            // Reconstruct the absolute indices of the defined chord
            const expectedIndices = def.intervals.map(interval => (rootIdx + interval) % 12);
            
            // Calculate how many played notes are in the expected chord
            let matchingNotes = 0;
            for (const idx of uniqueIndices) {
                if (expectedIndices.includes(idx)) matchingNotes++;
            }

            // Calculate extra notes that are played but not in the chord definition
            const extraNotes = uniqueIndices.length - matchingNotes;
            
            // Calculate missing notes
            const missingNotes = expectedIndices.length - matchingNotes;

            // Score calculation:
            // High base score for matching notes.
            // Penalize extra notes heavily.
            // Penalize missing notes.
            let score = (matchingNotes * 10) - (extraNotes * 15) - (missingNotes * 5);

            // A chord is only valid if we matched at least 3 of its notes
            if (matchingNotes >= 3 && score > highestScore) {
                highestScore = score;
                
                // Determine inversion: checking the lowest played note
                const bassIdx = uniqueIndices[0];
                let inversionLabel = '';
                if (bassIdx !== rootIdx) {
                    const bassNoteName = activeNotes.find(n => chromaticMap[n] === bassIdx) || reverseMap[bassIdx];
                    inversionLabel = `/${bassNoteName}`;
                }

                bestMatch = {
                    root: rootNoteName,
                    type: def.type,
                    inversionLabel: inversionLabel,
                    score: score,
                    notes: expectedIndices.map(i => reverseMap[i])
                };
            }
        }
    }
    
    return bestMatch;
};
