import { useState, useEffect, useReducer } from 'react';
import { notes, getTheoryNoteAt, isNatural, getTheoryNoteName } from '../../../music/theory';
import { INTERVALS, SPELLING_LEVELS } from '../data/gameData';
import { useMidiStore } from '../../../store/useMidiStore';

const INITIAL_STATE = {
    gameState: 'idle',       // 'idle'|'countdown'|'playing'|'finished'
    gameMode: 'identifier',  // 'identifier'|'collector'|'spelling'|'intervals'
    gameScore: 0,
    gameTimer: 0,
    gameLevel: 1,
    wordsSpelled: 0,
    gameChallenge: null,
    gameFeedback: null,
    timeFeedback: null, // { value: number, type: 'plus'|'minus' }
    roundSuccess: false,
    countdown: 3,
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'START_GAME':
            return {
                ...INITIAL_STATE,
                gameState: 'countdown',
                gameMode: action.payload.mode,
                gameTimer: 30,
                gameLevel: 1,
                wordsSpelled: 0,
            };
        case 'SET_COUNTDOWN':
            return { ...state, countdown: action.payload };
        case 'PLAY_GAME':
            return { ...state, gameState: 'playing' };
        case 'SET_CHALLENGE':
            return { ...state, gameChallenge: action.payload };
        case 'ANSWER_CORRECT':
            return {
                ...state,
                gameScore: state.gameScore + action.payload.points,
                gameTimer: (state.gameMode === 'identifier' || state.gameMode === 'collector') ? state.gameTimer + 5 : state.gameTimer,
                gameFeedback: { type: 'correct', pos: action.payload.pos },
                timeFeedback: (state.gameMode === 'identifier' || state.gameMode === 'collector') ? { value: 5, type: 'plus' } : state.timeFeedback
            };
        case 'ANSWER_WRONG':
            return {
                ...state,
                gameTimer: Math.max(0, state.gameTimer - 1),
                gameFeedback: { type: 'wrong', pos: action.payload.pos },
                timeFeedback: { value: 1, type: 'minus' }
            };
        case 'ROUND_SUCCESS':
            const isSpelling = state.gameMode === 'spelling';
            const newWordsSpelled = isSpelling ? state.wordsSpelled + 1 : state.wordsSpelled;
            const newLevel = isSpelling ? Math.min(5, Math.floor(newWordsSpelled / 3) + 1) : state.gameLevel;
            return {
                ...state,
                gameTimer: 30,
                roundSuccess: true,
                gameFeedback: { type: 'success' },
                wordsSpelled: newWordsSpelled,
                gameLevel: newLevel
            };
        case 'CLEAR_FEEDBACK':
            return { ...state, gameFeedback: null, timeFeedback: null, roundSuccess: false };
        case 'UPDATE_CHALLENGE':
            return { ...state, gameChallenge: { ...state.gameChallenge, ...action.payload } };
        case 'TICK_TIMER':
            return { ...state, gameTimer: state.gameTimer - 1 };
        case 'END_GAME':
            return { ...state, gameState: 'finished' };
        case 'RESET_GAME':
            return INITIAL_STATE;
        default:
            return state;
    }
}

/**
 * Engine de Minijuegos para Guitarra.
 * Centraliza generación de desafíos, scoring (puntuación) y timing (cronómetro).
 */
export const useGameEngine = ({ tuning, fretCount, addPoints, unlockAchievement, useFlats = false }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
    const { gameState, gameMode, gameScore, gameTimer, gameLevel, wordsSpelled, gameChallenge, gameFeedback, countdown } = state;

    const [challengeStartTime, setChallengeStartTime] = useState(0);
    const [gameAnchorNote, setGameAnchorNote]     = useState('NONE');
    const [stats, setStats]                       = useState(() => {
        const saved = localStorage.getItem('guitar_master_stats');
        return saved ? JSON.parse(saved) : {};
    });

    // ── Generación de desafíos ──────────────────────────────

    const generateChallenge = (forceLevel) => {
        let challenge = null;
        if (gameMode === 'identifier') {
            const sIdx = Math.floor(Math.random() * tuning.length);
            const fIdx = Math.floor(Math.random() * fretCount);
            const note = getTheoryNoteAt(tuning[sIdx], fIdx, useFlats);
            if (!isNatural(note) && Math.random() > 0.3) return generateChallenge();
            challenge = { string: sIdx, fret: fIdx, note };
        } else if (gameMode === 'collector') {
            const naturalNotes = notes.filter(isNatural);
            const note = naturalNotes[Math.floor(Math.random() * naturalNotes.length)];
            const positions = [];
            tuning.forEach((root, sIdx) => {
                for (let fIdx = 0; fIdx < fretCount; fIdx++) {
                    if (getTheoryNoteAt(root, fIdx, useFlats) === note) positions.push({ sIdx, fIdx });
                }
            });
            challenge = { note, total: positions.length, found: [] };
        } else if (gameMode === 'spelling') {
            const currentLevel = forceLevel || gameLevel;
            const levelWords = SPELLING_LEVELS[currentLevel] || SPELLING_LEVELS[1];
            const word = levelWords[Math.floor(Math.random() * levelWords.length)];
            const rangeSize = 5;
            const startFret = Math.floor(Math.random() * (fretCount - rangeSize));
            challenge = { 
                word: word.split(''), 
                currentIdx: 0, 
                fretRange: [startFret, startFret + rangeSize],
                level: currentLevel
            };
        } else if (gameMode === 'intervals') {
            const sIdx = Math.floor(Math.random() * tuning.length);
            const fIdx = Math.floor(Math.random() * (fretCount - 4));
            const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
            const rootNote = getTheoryNoteAt(tuning[sIdx], fIdx, useFlats);
            challenge = { root: { sIdx, fIdx, note: rootNote }, interval };
        }
        
        dispatch({ type: 'SET_CHALLENGE', payload: challenge });
        setChallengeStartTime(Date.now());
    };

    const startGame = (mode) => dispatch({ type: 'START_GAME', payload: { mode } });
    const resetGame = () => dispatch({ type: 'RESET_GAME' });

    // ── Efectos de countdown y timer ────────────────────────

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
    }, [gameState, countdown]);

    useEffect(() => {
        if (gameState === 'playing' && gameTimer > 0) {
            const t = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
            return () => clearInterval(t);
        } else if (gameTimer === 0 && gameState === 'playing') {
            dispatch({ type: 'END_GAME' });
            const sessions = parseInt(localStorage.getItem('guitar_master_sessions') || '0') + 1;
            localStorage.setItem('guitar_master_sessions', sessions.toString());
            if (sessions >= 10 && unlockAchievement) unlockAchievement('guitar_master');
        }
    }, [gameState, gameTimer]);

    // ── MIDI Integration ────────────────────────────────────
    const lastEvent = useMidiStore(state => state.lastEvent);

    useEffect(() => {
        if (gameState === 'playing' && lastEvent && lastEvent.type === 'noteon') {
            const noteName = getTheoryNoteName(lastEvent.note, useFlats);
            handleMidiAction(noteName);
        }
    }, [lastEvent, gameState]);

    const handleMidiAction = (noteName) => {
        if (gameState !== 'playing') return;

        if (gameMode === 'identifier') {
            handleGameAction(noteName);
        } else if (gameMode === 'collector') {
            if (noteName === gameChallenge.note) {
                // Find first uncollected position of this note
                let foundAny = false;
                tuning.forEach((root, sIdx) => {
                    if (foundAny) return;
                    for (let fIdx = 0; fIdx < fretCount; fIdx++) {
                        if (getTheoryNoteAt(root, fIdx, useFlats) === noteName) {
                            if (!gameChallenge.found.some(p => p.sIdx === sIdx && p.fIdx === fIdx)) {
                                handleGameAction({ sIdx, fIdx });
                                foundAny = true;
                                return;
                            }
                        }
                    }
                });
            } else {
                // Trigger a wrong answer feedback (no pos)
                dispatch({ type: 'ANSWER_WRONG', payload: { pos: null } });
                setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
            }
        } else if (gameMode === 'spelling') {
            const targetNote = gameChallenge.word[gameChallenge.currentIdx];
            if (noteName === targetNote) {
                // Find any position of this note in range
                let foundAny = false;
                tuning.forEach((root, sIdx) => {
                    if (foundAny) return;
                    for (let fIdx = gameChallenge.fretRange[0]; fIdx <= gameChallenge.fretRange[1]; fIdx++) {
                        if (getTheoryNoteAt(root, fIdx, useFlats) === noteName) {
                            handleGameAction({ sIdx, fIdx });
                            foundAny = true;
                            return;
                        }
                    }
                });
            } else {
                dispatch({ type: 'ANSWER_WRONG', payload: { pos: null } });
                setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
            }
        } else if (gameMode === 'intervals') {
            const rootNoteIdx = notes.indexOf(gameChallenge.root.note);
            const clickedNoteIdx = notes.indexOf(noteName);
            const semitones = (clickedNoteIdx - rootNoteIdx + 12) % 12;
            
            if (semitones === gameChallenge.interval.semitones) {
                // Find any position
                let foundAny = false;
                tuning.forEach((root, sIdx) => {
                    if (foundAny) return;
                    for (let fIdx = 0; fIdx < fretCount; fIdx++) {
                        if (getTheoryNoteAt(root, fIdx, useFlats) === noteName) {
                            handleGameAction({ sIdx, fIdx });
                            foundAny = true;
                            return;
                        }
                    }
                });
            } else {
                dispatch({ type: 'ANSWER_WRONG', payload: { pos: null } });
                setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
            }
        }
    };


    // ── Manejo de acciones del jugador ──────────────────────

    const handleGameAction = (input) => {
        if (gameState !== 'playing') return;
        const responseTime = (Date.now() - challengeStartTime) / 1000;

        if (gameMode === 'identifier') {
            if (input === gameChallenge.note) {
                dispatch({ type: 'ANSWER_CORRECT', payload: { points: 10, pos: { s: gameChallenge.string, f: gameChallenge.fret } } });
                if (addPoints) addPoints(10);
                
                const newStats = { ...stats };
                if (!newStats[input]) newStats[input] = [];
                newStats[input].push(responseTime);
                setStats(newStats);
                localStorage.setItem('guitar_master_stats', JSON.stringify(newStats));
                
                setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 400);
            } else {
                dispatch({ type: 'ANSWER_WRONG', payload: { pos: { s: gameChallenge.string, f: gameChallenge.fret } } });
                setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
            }
        } else if (gameMode === 'collector') {
            const { sIdx, fIdx } = input;
            const clickedNote = getTheoryNoteAt(tuning[sIdx], fIdx, useFlats);
            if (clickedNote === gameChallenge.note) {
                if (!gameChallenge.found.some(p => p.sIdx === sIdx && p.fIdx === fIdx)) {
                    const newFound = [...gameChallenge.found, { sIdx, fIdx }];
                    dispatch({ type: 'UPDATE_CHALLENGE', payload: { found: newFound } });
                    if (newFound.length === gameChallenge.total) {
                        dispatch({ type: 'ROUND_SUCCESS' });
                        if (addPoints) addPoints(25); // Bonus extra por terminar ronda
                        setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 1200);
                    } else {
                        dispatch({ type: 'ANSWER_CORRECT', payload: { points: 5, pos: { s: sIdx, f: fIdx } } });
                        if (addPoints) addPoints(5);
                        setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 200);
                    }
                }
            } else {
                dispatch({ type: 'ANSWER_WRONG', payload: { pos: { s: sIdx, f: fIdx } } });
                setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
            }
        } else if (gameMode === 'spelling') {
            const { sIdx, fIdx } = input;
            const clickedNote = getTheoryNoteAt(tuning[sIdx], fIdx, useFlats);
            const targetNote = gameChallenge.word[gameChallenge.currentIdx];
            const inRange = fIdx >= gameChallenge.fretRange[0] && fIdx <= gameChallenge.fretRange[1];

            if (inRange && clickedNote === targetNote) {
                const nextIdx = gameChallenge.currentIdx + 1;
                dispatch({ type: 'ANSWER_CORRECT', payload: { points: 5, pos: { s: sIdx, f: fIdx } } });
                if (addPoints) addPoints(5);
                if (nextIdx === gameChallenge.word.length) {
                    dispatch({ type: 'ROUND_SUCCESS' });
                    if (addPoints) addPoints(25);
                    const newWordsSpelled = wordsSpelled + 1;
                    const nextLevel = Math.min(5, Math.floor(newWordsSpelled / 3) + 1);
                    setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(nextLevel); }, 1200);
                } else {
                    dispatch({ type: 'UPDATE_CHALLENGE', payload: { currentIdx: nextIdx } });
                    setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 300);
                }
            } else {
                dispatch({ type: 'ANSWER_WRONG', payload: { pos: { s: sIdx, f: fIdx } } });
                setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
            }
        } else if (gameMode === 'intervals') {
            const { sIdx, fIdx } = input;
            const clickedNote = getTheoryNoteAt(tuning[sIdx], fIdx, useFlats);
            const rootNoteIdx = notes.indexOf(gameChallenge.root.note);
            const clickedNoteIdx = notes.indexOf(clickedNote);
            const semitones = (clickedNoteIdx - rootNoteIdx + 12) % 12;
            if (semitones === gameChallenge.interval.semitones) {
                dispatch({ type: 'ANSWER_CORRECT', payload: { points: 20, pos: { s: sIdx, f: fIdx } } });
                if (addPoints) addPoints(20);
                setTimeout(() => { dispatch({ type: 'CLEAR_FEEDBACK' }); generateChallenge(); }, 600);
            } else {
                dispatch({ type: 'ANSWER_WRONG', payload: { pos: { s: sIdx, f: fIdx } } });
                setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 400);
            }
        }
    };

    return {
        gameState, gameMode, gameTimer, gameScore, gameLevel, wordsSpelled, gameChallenge, gameFeedback, timeFeedback: state.timeFeedback, roundSuccess: state.roundSuccess, countdown,
        gameAnchorNote, setGameAnchorNote, stats,
        startGame, resetGame, handleGameAction, generateChallenge,
    };
};
