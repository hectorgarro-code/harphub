import { useReducer, useEffect, useCallback, useRef } from 'react';
import { 
    notes, 
    getNoteIndex, 
    triadDefinitions, 
    chordDefinitions, 
    buildChord, 
    progressionTemplates, 
    resolveProgression 
} from '../../../music/theory';

/**
 * Piano Game Engine Hook
 * Manages game state, scoring, timing, and musical validation for multiple training modes.
 */

const PIANO_INTERVALS = [
    { label: 'b2', semitones: 1 },
    { label: '2', semitones: 2 },
    { label: 'b3', semitones: 3 },
    { label: '3', semitones: 4 },
    { label: '4', semitones: 5 },
    { label: '#4', semitones: 6 },
    { label: '5', semitones: 7 },
    { label: 'b6', semitones: 8 },
    { label: '6', semitones: 9 },
    { label: 'b7', semitones: 10 },
    { label: '7', semitones: 11 },
];

const MUSICAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const INITIAL_STATE = {
    gameState: 'idle', // 'idle' | 'countdown' | 'playing' | 'finished'
    gameMode: 'chord_builder',
    gameScore: 0,
    gameTimer: 60,
    gameChallenge: null,
    gameFeedback: null,
    countdown: 3,
    inputBuffer: [], // Notes played in the current challenge attempt
    chordHistory: [], // History of detected chords for detect_mode
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'START_GAME':
            return { 
                ...INITIAL_STATE, 
                gameState: 'countdown', 
                gameMode: action.payload.mode, 
                gameTimer: action.payload.mode === 'progression_player' ? 90 : 60 
            };
        case 'SET_COUNTDOWN':
            return { ...state, countdown: action.payload };
        case 'PLAY_GAME':
            return { ...state, gameState: 'playing' };
        case 'SET_CHALLENGE':
            return { ...state, gameChallenge: action.payload, inputBuffer: [] };
        case 'PUSH_INPUT':
            return { ...state, inputBuffer: [...state.inputBuffer, action.payload] };
        case 'ADD_CHORD_HISTORY':
            return { ...state, chordHistory: [action.payload, ...state.chordHistory].slice(0, 10) };
        case 'CLEAR_INPUT':
            return { ...state, inputBuffer: [] };
        case 'ANSWER_CORRECT':
            return { 
                ...state, 
                gameScore: state.gameScore + (action.payload.points || 0), 
                gameFeedback: { type: 'correct', note: action.payload.note } 
            };
        case 'ANSWER_WRONG':
            return { 
                ...state, 
                gameFeedback: { type: 'wrong', note: action.payload.note },
                inputBuffer: [] // Clear on mistake as per requirements
            };
        case 'CLEAR_FEEDBACK':
            return { ...state, gameFeedback: null };
        case 'TICK_TIMER':
            return { ...state, gameTimer: Math.max(0, state.gameTimer - 1) };
        case 'UPDATE_CHALLENGE':
            return { ...state, gameChallenge: { ...state.gameChallenge, ...action.payload } };
        case 'END_GAME':
            return { ...state, gameState: 'finished' };
        case 'RESET_GAME':
            return INITIAL_STATE;
        default:
            return state;
    }
}

export const usePianoGameEngine = ({ addPoints, unlockAchievement, useFlats, playChord }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
    const { gameState, gameMode, gameScore, gameTimer, gameChallenge, gameFeedback, countdown, inputBuffer, chordHistory } = state;
    
    // ── Challenge Generators ────────────────────────────────────────────────

    const generateChordChallenge = useCallback(() => {
        const rootNote = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
        const types = [...Object.keys(triadDefinitions), ...Object.keys(chordDefinitions)];
        const chordType = types[Math.floor(Math.random() * types.length)];
        const formula = triadDefinitions[chordType]?.intervals || chordDefinitions[chordType]?.intervals || [0, 4, 7];
        const chordNotes = buildChord(rootNote, formula);
        
        return { 
            rootNote, 
            chordType, 
            targetNotes: chordNotes, 
            foundNotes: [] // This tracks normalized names for UI
        };
    }, []);

    const generateIntervalChallenge = useCallback(() => {
        const rootNote = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
        const rootOctave = [3, 4][Math.floor(Math.random() * 2)];
        const interval = PIANO_INTERVALS[Math.floor(Math.random() * PIANO_INTERVALS.length)];
        const rootIdx = getNoteIndex(rootNote);
        const targetNote = notes[(rootIdx + interval.semitones) % 12];
        
        return { 
            rootNote, 
            rootOctave, 
            rootNoteStr: `${rootNote}${rootOctave}`, 
            interval, 
            targetNote 
        };
    }, []);

    const generateChallenge = useCallback(() => {
        let challenge = null;

        switch (gameMode) {
            case 'chord_builder':
                challenge = generateChordChallenge();
                break;
            case 'intervals':
                challenge = generateIntervalChallenge();
                break;
            case 'identifier':
                const note = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
                const oct = [3, 4, 5][Math.floor(Math.random() * 3)];
                challenge = { note, octave: oct, noteStr: `${note}${oct}` };
                break;
            case 'collector':
                const cNote = notes[Math.floor(Math.random() * 12)];
                const targets = [3, 4, 5].map(o => `${cNote}${o}`);
                challenge = { note: cNote, total: targets.length, targets, found: [] };
                break;
            case 'ear_training':
                const etRoot = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
                const triads = Object.keys(triadDefinitions);
                const target = triads[Math.floor(Math.random() * triads.length)];
                const etNotes = buildChord(etRoot, triadDefinitions[target].intervals);
                const options = [target, ...triads.filter(t => t !== target).sort(() => 0.5 - Math.random()).slice(0, 2)].sort(() => 0.5 - Math.random());
                challenge = { rootNote: etRoot, targetType: target, chordNotes: etNotes, options };
                if (playChord) setTimeout(() => playChord(etNotes), 600);
                break;
            case 'progression_player':
                const pRoot = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
                const templates = Object.keys(progressionTemplates);
                const template = templates[Math.floor(Math.random() * templates.length)];
                const prog = resolveProgression(pRoot, template, 'major');
                const steps = prog.map(c => ({
                    name: c.fullName,
                    notes: buildChord(c.root, triadDefinitions[c.type]?.intervals || chordDefinitions[c.type]?.intervals || [0, 4, 7])
                }));
                challenge = { steps, currentStep: 0, foundNotes: [] };
                break;
            case 'inversions':
                const invRoot = MUSICAL_NOTES[Math.floor(Math.random() * MUSICAL_NOTES.length)];
                const invType = Object.keys(triadDefinitions)[Math.floor(Math.random() * 4)];
                const invFormula = [...triadDefinitions[invType].intervals];
                const invLevel = Math.floor(Math.random() * 3);
                for (let i = 0; i < invLevel; i++) {
                    const f = invFormula.shift();
                    invFormula.push(f + 12);
                }
                const invNotes = buildChord(invRoot, invFormula);
                challenge = { 
                    rootNote: invRoot, chordType: invType, 
                    invLevel, invLabel: ['Fundamental', '1ra Inversión', '2da Inversión'][invLevel],
                    targetNotes: invNotes, bassNote: invNotes[0], foundNotes: [] 
                };
                break;
            case 'detect_mode':
                challenge = { detectMode: true };
                break;
            default:
                break;
        }

        dispatch({ type: 'SET_CHALLENGE', payload: challenge });
    }, [gameMode, generateChordChallenge, generateIntervalChallenge, playChord]);

    // ── Game Lifecycle ──────────────────────────────────────────────────────

    const startGame = (mode) => dispatch({ type: 'START_GAME', payload: { mode } });
    const resetGame = () => dispatch({ type: 'RESET_GAME' });

    useEffect(() => {
        if (gameState === 'countdown') {
            if (countdown > 0) {
                const t = setTimeout(() => dispatch({ type: 'SET_COUNTDOWN', payload: countdown - 1 }), 1000);
                return () => clearTimeout(t);
            } else {
                dispatch({ type: 'PLAY_GAME' });
                generateChallenge();
            }
        }
    }, [gameState, countdown, generateChallenge]);

    useEffect(() => {
        if (gameState === 'playing' && gameTimer > 0) {
            const t = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
            return () => clearInterval(t);
        } else if (gameTimer === 0 && gameState === 'playing') {
            dispatch({ type: 'END_GAME' });
            if (unlockAchievement && gameScore > 500) unlockAchievement('piano_virtuoso');
        }
    }, [gameState, gameTimer, gameScore, unlockAchievement]);

    // ── Actions & Validation ────────────────────────────────────────────────

    const handleGameAction = useCallback((payload) => {
        if (gameState !== 'playing') return;

        // Payload support for both structured {note, octave} and simple string (for multiple choice)
        const isString = typeof payload === 'string';
        const note = isString ? payload : payload.note;
        const octave = isString ? null : payload.octave;
        const noteStr = isString ? payload : `${note}${octave}`;
        const timestamp = payload.timestamp || Date.now();

        // Special case for detect_mode receiving a detected chord directly
        if (gameMode === 'detect_mode' && payload.type === 'DETECTED_CHORD') {
            const chord = payload.chord;
            if (chord) {
                // Determine complexity points
                const pts = chord.notes.length === 3 ? 5 : chord.notes.length >= 4 ? 10 : 0;
                // Add points and to history if it's a new chord (prevent spamming same chord)
                const lastHistory = chordHistory[0];
                const chordFullName = `${chord.root} ${chord.type}${chord.inversionLabel ? ' ' + chord.inversionLabel : ''}`;
                if (!lastHistory || lastHistory.name !== chordFullName) {
                    dispatch({ type: 'ADD_CHORD_HISTORY', payload: { name: chordFullName, pts } });
                    dispatch({ type: 'ANSWER_CORRECT', payload: { points: pts, note: null } });
                    if (addPoints) addPoints(pts);
                }
            }
            return;
        }

        switch (gameMode) {
            case 'chord_builder': {
                if (gameChallenge.targetNotes.includes(note)) {
                    if (!gameChallenge.foundNotes.includes(note)) {
                        const newFound = [...gameChallenge.foundNotes, note];
                        dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: newFound } });
                        dispatch({ type: 'ANSWER_CORRECT', payload: { points: 0, note: noteStr } });
                        if (newFound.length === gameChallenge.targetNotes.length) {
                            dispatch({ type: 'ANSWER_CORRECT', payload: { points: 50, note: noteStr } });
                            if (addPoints) addPoints(50);
                            setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 600);
                        } else {
                            setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 300);
                        }
                    }
                } else {
                    dispatch({ type: 'ANSWER_WRONG', payload: { note: noteStr } });
                    dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: [] } });
                    setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
                }
                break;
            }

            case 'intervals': {
                const rootIdx = getNoteIndex(gameChallenge.rootNote);
                const playedIdx = getNoteIndex(note);
                const distance = (playedIdx + octave * 12) - (rootIdx + gameChallenge.rootOctave * 12);
                
                if (distance === gameChallenge.interval.semitones) {
                    dispatch({ type: 'ANSWER_CORRECT', payload: { points: 20, note: noteStr } });
                    if (addPoints) addPoints(20);
                    setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 400);
                } else {
                    dispatch({ type: 'ANSWER_WRONG', payload: { note: noteStr } });
                    setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
                }
                break;
            }

            case 'ear_training': {
                if (noteStr === gameChallenge.targetType) {
                    dispatch({ type: 'ANSWER_CORRECT', payload: { points: 40, note: null } });
                    if (addPoints) addPoints(40);
                    setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 1000);
                } else {
                    dispatch({ type: 'ANSWER_WRONG', payload: { note: null } });
                    setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
                }
                break;
            }

            case 'progression_player': {
                const step = gameChallenge.steps[gameChallenge.currentStep];
                if (step.notes.includes(note)) {
                    if (!gameChallenge.foundNotes.includes(note)) {
                        const newFound = [...gameChallenge.foundNotes, note];
                        dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: newFound } });
                        if (newFound.length === step.notes.length) {
                            if (gameChallenge.currentStep + 1 < gameChallenge.steps.length) {
                                dispatch({ type: 'UPDATE_CHALLENGE', payload: { currentStep: gameChallenge.currentStep + 1, foundNotes: [] } });
                                dispatch({ type: 'ANSWER_CORRECT', payload: { points: 10, note: noteStr } });
                            } else {
                                dispatch({ type: 'ANSWER_CORRECT', payload: { points: 100, note: noteStr } });
                                if (addPoints) addPoints(100);
                                setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 800);
                            }
                        }
                    }
                } else {
                    dispatch({ type: 'ANSWER_WRONG', payload: { note: noteStr } });
                    dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: [] } });
                    setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
                }
                break;
            }

            case 'inversions': {
                const isFirst = gameChallenge.foundNotes.length === 0;
                if (isFirst) {
                    if (note === gameChallenge.bassNote) {
                        dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: [note] } });
                        dispatch({ type: 'ANSWER_CORRECT', payload: { points: 5, note: noteStr } });
                    } else {
                        dispatch({ type: 'ANSWER_WRONG', payload: { note: noteStr } });
                        setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
                    }
                } else {
                    if (gameChallenge.targetNotes.includes(note) && !gameChallenge.foundNotes.includes(note)) {
                        const newFound = [...gameChallenge.foundNotes, note];
                        dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: newFound } });
                        if (newFound.length === gameChallenge.targetNotes.length) {
                            dispatch({ type: 'ANSWER_CORRECT', payload: { points: 25, note: noteStr } });
                            if (addPoints) addPoints(30);
                            setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 800);
                        }
                    } else {
                        dispatch({ type: 'ANSWER_WRONG', payload: { note: noteStr } });
                        dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: [] } });
                    }
                }
                break;
            }

            default:
                break;
        }

        // Push to input buffer for history/analysis
        dispatch({ type: 'PUSH_INPUT', payload: { note, octave, timestamp } });

        // Timeout check: reset if > 2 seconds since last input
        const lastInput = inputBuffer[inputBuffer.length - 1];
        if (lastInput && (timestamp - lastInput.timestamp > 2000)) {
            dispatch({ type: 'UPDATE_CHALLENGE', payload: { foundNotes: [] } });
            dispatch({ type: 'CLEAR_INPUT' });
        }
    }, [gameState, gameMode, gameChallenge, addPoints, generateChallenge, inputBuffer]);

    return {
        gameState,
        gameMode,
        gameScore,
        gameTimer,
        gameChallenge,
        gameFeedback,
        countdown,
        inputBuffer,
        chordHistory,
        startGame,
        resetGame,
        handleGameAction
    };
};

export default usePianoGameEngine;
