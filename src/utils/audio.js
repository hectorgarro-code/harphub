import { HARP_FREQS, NOTES } from './constants';
import { parseSEAToken, getDurationValue } from './sea';

let audioCtx = null;

/**
 * Gets or creates a singleton AudioContext
 */
export const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

const RELATIVE_MAP = {
    // Blows
    "1": 0, "2": 4, "3": 7, "4": 12, "5": 16, "6": 19, "7": 24, "8": 28, "9": 31, "10": 36,
    // Draws
    "-1": 2, "-2": 7, "-3": 11, "-4": 14, "-5": 17, "-6": 21, "-7": 23, "-8": 26, "-9": 29, "-10": 33,
    // Bends (Simplified mapping for common symbols)
    "-1'": 1, "-2'": 6, "-2''": 5, "-3'": 10, "-3''": 9, "-3'''": 8, "-4'": 13, "-6'": 20,
    "7'": 23, "8'": 27, "9'": 30, "10'": 35, "10''": 34
};

export const getFreqFromNote = (note, harpKey = 'C') => {
    const rootFreq = 261.63; // C4
    const keyOffset = NOTES.indexOf(harpKey?.toUpperCase() || 'C');
    const semitones = RELATIVE_MAP[note];
    if (semitones === undefined) return null;
    return rootFreq * Math.pow(2, (semitones + keyOffset) / 12);
};

export const parseHarpChord = (token) => {
    // Handles tokens like "123", "-123", or just "4"
    if (token === 'R') return [];
    const isDraw = token.startsWith('-');
    const notesStr = isDraw ? token.slice(1) : token;
    const matches = notesStr.match(/(10|[1-9])('*)/g);
    if (!matches) return [];
    return matches.map(m => (isDraw ? '-' : '') + m);
};

/**
 * Plays a single harp note frequency
 */
export const playHarpNote = (noteFreq, time, duration, ctx = getAudioContext(), destination = null, activeOscillators = null, hasVibrato = false) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(noteFreq, time);

    if (hasVibrato) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 6; // 6Hz vibrato
        lfoGain.gain.value = noteFreq * 0.02; // 2% modulation
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(time);
        lfo.stop(time + duration);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(noteFreq * 2.5, time);
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
    gain.gain.setValueAtTime(0.15, time + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination || ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
    if (activeOscillators) activeOscillators.push(osc);
};

/**
 * Plays a sequence of tokens as a harp composition respecting SEA durations and BPM
 * @param {string} content - Tab content string
 * @param {object} options - { onStep: (index) => void, onComplete: () => void, bpm: number }
 */
export const playTabSequence = (content, { onStep, onComplete, bpm = 100, harpKey = 'C' } = {}) => {
    const ctx = getAudioContext();
    // Use a more robust split to handle parentheses and other symbols
    const tokens = content.match(/3\[[^\]]+\]|\([^\)]+\)|\{[^\}]+\}|[^\s,]+/g) || [];
    let currentTime = ctx.currentTime + 0.1;

    const beatDuration = 60 / bpm;
    const timeouts = [];
    const activeOscillators = [];

    tokens.forEach((token, index) => {
        const p = parseSEAToken(token.replace(/[\(\)\{\}]/g, ''));
        if (token === '|') return;

        let beats = getDurationValue(p.duration) || 1;
        if (token.includes('3[')) beats *= (2/3);
        const durationSecs = beats * beatDuration;

        const isTrill = token.includes('{');
        const hasVibrato = token.includes('~');
        const subNotes = parseHarpChord(p.body);
        
        if (p.body === 'R') {
            currentTime += durationSecs;
        } else if (isTrill && subNotes.length >= 2) {
            const trillSpeed = 0.12;
            let t = 0;
            while (t < durationSecs - 0.05) {
                const note = subNotes[Math.floor((t / trillSpeed) % 2)];
                const freq = getFreqFromNote(note, harpKey);
                if (freq) {
                    playHarpNote(freq, currentTime + t, trillSpeed * 0.9, ctx, null, activeOscillators, hasVibrato);
                }
                t += trillSpeed;
            }
            currentTime += durationSecs;
        } else {
            subNotes.forEach(note => {
                const freq = getFreqFromNote(note, harpKey);
                if (freq) {
                    playHarpNote(freq, currentTime, durationSecs, ctx, null, activeOscillators, hasVibrato);
                }
            });
            currentTime += durationSecs;
        }

        if (onStep) {
            const delayMs = (currentTime - durationSecs - ctx.currentTime) * 1000;
            timeouts.push(setTimeout(() => onStep(index), Math.max(0, delayMs)));
        }
    });

    if (onComplete) {
        const totalDuration = (currentTime - ctx.currentTime) * 1000;
        timeouts.push(setTimeout(onComplete, Math.max(0, totalDuration)));
    }

    return { 
        stop: () => {
            timeouts.forEach(clearTimeout);
            activeOscillators.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch (e) {}
            });
        }
    };
};
