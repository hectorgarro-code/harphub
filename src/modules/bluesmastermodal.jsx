import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Layers, Play, Square, Music, Activity,
    ChevronRight, Gauge, Radio, Zap, Info, Mic2, User, Pause, RotateCcw, Repeat, Lock, ListMusic, Drum, AlertCircle, Fingerprint, Compass, X, Upload, Settings, VolumeX, Target
} from 'lucide-react';
import * as Tone from 'tone';
import { notes } from '../music/theory';
import SharedScalesPanel from '../components/SharedScalesPanel';

// --- CONSTANTES ---
const API_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost/harphub/backend/api_harphub.php' 
    : '/backend/api_harphub.php';

const BLUES_STRUCTURE = ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'];
const NUMERAL_TO_INTERVAL = { 'I': 0, 'IV': 5, 'V': 7 };

// Escalas de Blues según posición
const POSITIONS_DATA = {
    '2nd': {
        name: '2ª Posición (Cross)',
        harpOffset: 5,
        scale: [
            { interval: 0, label: "Tónica", hole: "-2", color: "text-blue-400" },
            { interval: 3, label: "3ra m", hole: "-3'", color: "text-rose-400" },
            { interval: 5, label: "4ta", hole: "4", color: "text-emerald-400" },
            { interval: 6, label: "4ta# / 5b", hole: "-4'", color: "text-purple-400" },
            { interval: 7, label: "5ta", hole: "-4", color: "text-amber-400" },
            { interval: 10, label: "7ma m", hole: "-5", color: "text-orange-400" }
        ]
    },
    '3rd': {
        name: '3ª Posición (Double Cross)',
        harpOffset: 10,
        scale: [
            { interval: 0, label: "Tónica", hole: "-4", color: "text-blue-400" },
            { interval: 3, label: "3ra m", hole: "-5", color: "text-rose-400" },
            { interval: 5, label: "4ta", hole: "6", color: "text-emerald-400" },
            { interval: 6, label: "4ta# / 5b", hole: "-6'", color: "text-purple-400" },
            { interval: 7, label: "5ta", hole: "-6", color: "text-amber-400" },
            { interval: 10, label: "7ma m", hole: "7", color: "text-orange-400" }
        ]
    }
};

const HARP_SCHEMA = [
    { hole: 1, blow: 0, draw: 2, drawBends: [1], blowBends: [] },
    { hole: 2, blow: 4, draw: 7, drawBends: [6, 5], blowBends: [] },
    { hole: 3, blow: 7, draw: 11, drawBends: [10, 9, 8], blowBends: [] },
    { hole: 4, blow: 12, draw: 14, drawBends: [13], blowBends: [] },
    { hole: 5, blow: 16, draw: 17, drawBends: [], blowBends: [] },
    { hole: 6, blow: 19, draw: 21, drawBends: [20], blowBends: [] },
    { hole: 7, blow: 24, draw: 23, drawBends: [], blowBends: [23.5] },
    { hole: 8, blow: 28, draw: 26, drawBends: [], blowBends: [27] },
    { hole: 9, blow: 31, draw: 29, drawBends: [], blowBends: [30] },
    { hole: 10, blow: 36, draw: 33, drawBends: [], blowBends: [35, 34] },
];

const RHYTHMS = {
    shuffle: { name: "Chicago Shuffle", swing: 0.58, defaultBpm: 105, bass: [0, 3, 5, 6, 7, 5, 3, 0], pattern: [
        { time: "0:0:0", vel: 1.0 }, { time: "0:0:2", vel: 0.6 }, 
        { time: "0:1:0", vel: 0.9 }, { time: "0:1:2", vel: 0.6 }, 
        { time: "0:2:0", vel: 1.0 }, { time: "0:2:2", vel: 0.6 }, 
        { time: "0:3:0", vel: 0.9 }, { time: "0:3:2", vel: 0.6 }
    ] },
    slow: { name: "Slow Blues 12/8", swing: 0.0, defaultBpm: 65, bass: [0, 0, 7, 0, 0, 7, 0, 0, 7, 0, 0, 7], pattern: [
        { time: "0:0:0", vel: 1.0 }, { time: "0:0:1.33", vel: 0.4 }, { time: "0:0:2.66", vel: 0.5 }, 
        { time: "0:1:0", vel: 0.7 }, { time: "0:1:1.33", vel: 0.4 }, { time: "0:1:2.66", vel: 0.5 }, 
        { time: "0:2:0", vel: 0.8 }, { time: "0:2:1.33", vel: 0.4 }, { time: "0:2:2.66", vel: 0.5 }, 
        { time: "0:3:0", vel: 0.7 }, { time: "0:3:1.33", vel: 0.4 }, { time: "0:3:2.66", vel: 0.5 }
    ] },
    boogie: { name: "Boogie Woogie", swing: 0.0, defaultBpm: 150, bass: [0, 4, 7, 9, 10, 9, 7, 4], pattern: [
        { time: "0:0:0", vel: 1.0 }, { time: "0:0:2", vel: 0.8 }, 
        { time: "0:1:0", vel: 0.9 }, { time: "0:1:2", vel: 0.8 }, 
        { time: "0:2:0", vel: 1.0 }, { time: "0:2:2", vel: 0.8 }, 
        { time: "0:3:0", vel: 0.9 }, { time: "0:3:2", vel: 0.8 }
    ] },
    texas: { name: "Texas Shuffle", swing: 0.72, defaultBpm: 130, bass: [0, 0, 7, 7, 0, 0, 7, 7], pattern: [{ time: "0:0:0", vel: 1.0 }, { time: "0:0:2", vel: 0.8 }, { time: "0:1:0", vel: 0.6 }, { time: "0:1:2", vel: 0.7 }, { time: "0:2:0", vel: 1.0 }, { time: "0:2:2", vel: 0.8 }, { time: "0:3:0", vel: 0.6 }, { time: "0:3:2", vel: 0.7 }] },
    jump: { name: "Jump Blues", swing: 0.55, defaultBpm: 140, bass: [0, 7, 0, 7], pattern: [{ time: "0:0:0", vel: 0.9 }, { time: "0:1:0", vel: 0.7 }, { time: "0:2:0", vel: 0.9 }, { time: "0:3:0", vel: 0.7 }] },
    rhumba: { name: "Rhumba Blues", swing: 0.5, defaultBpm: 110, pattern: [{ time: "0:0:0", vel: 0.9 }, { time: "0:0:3", vel: 0.7 }, { time: "0:1:2", vel: 0.8 }, { time: "0:2:0", vel: 0.9 }, { time: "0:3:0", vel: 0.8 }] },
    minor: { name: "Minor Blues", swing: 0.75, defaultBpm: 80, pattern: [{ time: "0:0:0", vel: 0.9 }, { time: "0:1:0", vel: 0.6 }, { time: "0:2:0", vel: 0.8 }, { time: "0:3:0", vel: 0.6 }] },
    train: { name: "Train Beat", swing: 0.5, defaultBpm: 135, pattern: [{ time: "0:0:0", vel: 0.8 }, { time: "0:0:1", vel: 0.5 }, { time: "0:0:2", vel: 0.9 }, { time: "0:0:3", vel: 0.5 }, { time: "0:1:0", vel: 0.8 }, { time: "0:1:1", vel: 0.5 }, { time: "0:1:2", vel: 0.9 }, { time: "0:1:3", vel: 0.5 }, { time: "0:2:0", vel: 0.8 }, { time: "0:2:1", vel: 0.5 }, { time: "0:2:2", vel: 0.9 }, { time: "0:2:3", vel: 0.5 }, { time: "0:3:0", vel: 0.8 }, { time: "0:3:1", vel: 0.5 }, { time: "0:3:2", vel: 0.9 }, { time: "0:3:3", vel: 0.5 }] },
    delta: { name: "Delta Blues", swing: 0.6, defaultBpm: 90, pattern: [{ time: "0:0:0", vel: 1.0 }, { time: "0:1:0", vel: 0.5 }, { time: "0:2:0", vel: 0.9 }, { time: "0:3:0", vel: 0.5 }, { time: "0:3:2", vel: 0.6 }] },
    funk: { name: "Funk Blues", swing: 0.5, defaultBpm: 100, pattern: [{ time: "0:0:0", vel: 1.0 }, { time: "0:0:1", vel: 0.6 }, { time: "0:0:3", vel: 0.8 }, { time: "0:1:0", vel: 0.9 }, { time: "0:2:0", vel: 1.0 }, { time: "0:2:2", vel: 0.7 }, { time: "0:3:0", vel: 0.9 }] },
};

const DEFAULT_AUDIO_SETTINGS = {
    drums: { low: 2, mid: -1, high: 3, vol: 0 },
    bass: { low: 4, mid: -2, high: -4, vol: 0, chorus: 0.1 },
    guitar: { low: -2, mid: 2, high: 1, vol: 0, dist: 0.15, chorus: 0.1, delay: 0.1 },
    master: { reverb: 0.3 }
};

const BluesMasterModal = ({ user, onClose }) => {
    const [playbackState, setPlaybackState] = useState('stopped');
    const [isCallResponse, setIsCallResponse] = useState(false);
    const [scaleType, setScaleType] = useState('Major');
    const [position, setPosition] = useState('2nd');
    const [rhythmType, setRhythmType] = useState('shuffle');
    const [turn, setTurn] = useState('call');
    const [isPlaying, setIsPlaying] = useState(false);
    const [useExternalTrack, setUseExternalTrack] = useState(false);
    const [availableTracks, setAvailableTracks] = useState([]);
    const [isManagingTracks, setIsManagingTracks] = useState(false);
    const [bluesKey, setBluesKey] = useState('G');
    const [bpm, setBpm] = useState(105);
    const [isDrumsMuted, setIsDrumsMuted] = useState(false);
    const [isChordsMuted, setIsChordsMuted] = useState(false);
    const [showEQ, setShowEQ] = useState(false);
    const [eq, setEq] = useState(DEFAULT_AUDIO_SETTINGS);
    const [activeTab, setActiveTab] = useState('eq'); // 'eq' or 'fx'
    const [currentBar, setCurrentBar] = useState(0);
    const [selectedBars, setSelectedBars] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [isTapping, setIsTapping] = useState(false);

    const engine = useRef({ loop: null, sequenceIdx: 0, synth: null, bass: null, lead: null, kick: null, hihat: null, snare: null, externalTrack: null });
    const tapTimes = useRef([]);
    const muteStateRef = useRef({ drums: false, chords: false });

    useEffect(() => { muteStateRef.current = { drums: isDrumsMuted, chords: isChordsMuted }; }, [isDrumsMuted, isChordsMuted]);

    const getChordName = (numeral) => {
        const rootIdx = notes.indexOf(bluesKey);
        const chordRootIdx = (rootIdx + NUMERAL_TO_INTERVAL[numeral]) % 12;
        const noteName = notes[chordRootIdx];
        return scaleType === 'Major' ? `${noteName}7` : `${noteName}m7`;
    };

    const harpKey = useMemo(() => {
        const songIdx = notes.indexOf(bluesKey);
        const offset = POSITIONS_DATA[position].harpOffset;
        return notes[(songIdx + offset) % 12];
    }, [bluesKey, position]);

    useEffect(() => { Tone.Transport.bpm.value = bpm; }, [bpm]);
    
    useEffect(() => {
        if (useExternalTrack && !getTrackStatus(rhythmType, bluesKey)) {
            setUseExternalTrack(false);
        }
    }, [rhythmType, bluesKey, availableTracks]);

    const fullBluesScale = useMemo(() => {
        const rootIdx = notes.indexOf(bluesKey);
        return POSITIONS_DATA[position].scale.map(info => ({ ...info, note: notes[(rootIdx + info.interval) % 12] }));
    }, [bluesKey, position]);

    const currentHarpLayout = useMemo(() => {
        const rootIdx = notes.indexOf(harpKey);
        return HARP_SCHEMA.map(h => ({
            ...h,
            blowNote: notes[(rootIdx + h.blow) % 12],
            drawNote: notes[(rootIdx + h.draw) % 12],
            drawBendsNotes: h.drawBends.map(b => notes[(rootIdx + b) % 12]),
            blowBendsNotes: h.blowBends.map(b => notes[(rootIdx + Math.floor(b)) % 12]),
        }));
    }, [harpKey]);

    const getNoteFromHole = (holeStr) => {
        if (!holeStr) return "";
        const isDraw = holeStr.startsWith('-');
        const baseHole = holeStr.replace('-', '');
        const holeNum = parseInt(baseHole);
        const bendCount = (baseHole.match(/'/g) || []).length;
        
        const h = currentHarpLayout.find(x => x.hole === holeNum);
        if (!h) return "";
        
        if (isDraw) {
            if (bendCount === 0) return h.drawNote;
            return h.drawBendsNotes[bendCount - 1] || "";
        } else {
            if (bendCount === 0) return h.blowNote;
            return h.blowBendsNotes[bendCount - 1] || "";
        }
    };

    const currentTriad = useMemo(() => {
        const numeral = BLUES_STRUCTURE[currentBar];
        const rootIdx = notes.indexOf(bluesKey);
        const chordRootIdx = (rootIdx + NUMERAL_TO_INTERVAL[numeral]) % 12;
        const isMinor = scaleType === 'Minor';
        
        const intervals = [0, isMinor ? 3 : 4, 7];
        const labels = ["RAÍZ", "3RA", "5TA"];
        
        return {
            name: getChordName(numeral),
            notes: intervals.map((interval, i) => {
                const note = notes[(chordRootIdx + interval) % 12];
                let foundHole = "?";
                for (const h of currentHarpLayout) {
                    if (h.blowNote === note) { foundHole = h.hole.toString(); break; }
                    if (h.drawNote === note) { foundHole = `-${h.hole}`; break; }
                    const dbIdx = h.drawBendsNotes.indexOf(note);
                    if (dbIdx !== -1) { foundHole = `-${h.hole}${"'".repeat(dbIdx + 1)}`; break; }
                    const bbIdx = h.blowBendsNotes.indexOf(note);
                    if (bbIdx !== -1) { foundHole = `${h.hole}${"'".repeat(bbIdx + 1)}`; break; }
                }
                return { note, label: labels[i], hole: foundHole };
            })
        };
    }, [currentBar, bluesKey, scaleType, currentHarpLayout]);

    const advice = useMemo(() => {
        const numeral = BLUES_STRUCTURE[currentBar];
        const isMinor = scaleType === 'Minor';

        if (position === '3rd') {
            if (numeral === 'I') return { prim: ["-4", "-8", "-1"], sec: ["-5", "-6'"] };
            if (numeral === 'IV') return { prim: ["6", "3", "9"], sec: ["-5", "7"] };
            if (numeral === 'V') return { prim: ["-6", "-3"], sec: ["-5", "-4"] };
        } else {
            if (numeral === 'I') return { prim: isMinor ? ["-3''", "-2"] : ["-2", "3"], sec: isMinor ? ["-4'", "-5"] : ["-3'", "-4'"] };
            if (numeral === 'IV') return { prim: ["4", "1"], sec: ["-5", "-2"] };
            if (numeral === 'V') return { prim: ["-4", "1"], sec: ["6", "-5"] };
        }
        return { prim: [], sec: [] };
    }, [currentBar, scaleType, position]);

    // --- Musical Intelligence Helpers ---
    const getIntensityForBar = (bar) => {
        // 12-bar blues energy curve
        if (bar < 4) return 0.85;  // Introduction / Exposition
        if (bar < 8) return 1.15;  // Development / Rising Energy
        if (bar < 10) return 1.05; // Climax
        return 0.95;               // Resolution / Turnaround
    };

    const RHYTHM_CONFIGS = {
        shuffle: { swing: 0.6, guitarStaccato: 0.8, bassIntensity: 0.6, drumGhostDensity: 0.7 },
        boogie: { swing: 0, guitarStaccato: 0.4, bassIntensity: 1.0, drumGhostDensity: 0.4 },
        funk: { swing: 0, guitarStaccato: 0.9, bassIntensity: 0.8, drumGhostDensity: 0.9 },
        slow: { swing: 0, guitarStaccato: 0.2, bassIntensity: 0.4, drumGhostDensity: 0.2 },
        default: { swing: 0, guitarStaccato: 0.5, bassIntensity: 0.5, drumGhostDensity: 0.5 }
    };

    useEffect(() => {
        const setup = async () => {
            // --- Refined Effect Chain ---
            if (!engine.current.masterReverb) {
                const reverb = new Tone.Reverb({ decay: 2.5, wet: eq.master.reverb }).toDestination();
                reverb.generate();
                engine.current.masterReverb = reverb;
            }

            // Instrument Specific EQ & Compression & Channel & FX
            if (!engine.current.drumsChannel) {
                const drumChan = new Tone.Channel({ volume: eq.drums.vol }).connect(engine.current.masterReverb);
                const drumComp = new Tone.Compressor({ threshold: -15, ratio: 3.5 }).connect(drumChan);
                const drumEqNode = new Tone.EQ3(eq.drums).connect(drumComp);
                engine.current.drumsChannel = drumChan;
                engine.current.drumsBus = drumComp;
                engine.current.drumsEq = drumEqNode;
            }

            if (!engine.current.bassChannel) {
                const bassChan = new Tone.Channel({ volume: eq.bass.vol }).connect(engine.current.masterReverb);
                const bassCho = new Tone.Chorus(4, 2.5, 0.5).connect(bassChan);
                bassCho.wet.value = eq.bass.chorus;
                const bassComp = new Tone.Compressor({ threshold: -12, ratio: 4 }).connect(bassCho);
                const bassEqNode = new Tone.EQ3(eq.bass).connect(bassComp);
                engine.current.bassChannel = bassChan;
                engine.current.bassChorus = bassCho;
                engine.current.bassBus = bassComp;
                engine.current.bassEq = bassEqNode;
            }

            if (!engine.current.guitarChannel) {
                const guitarChan = new Tone.Channel({ volume: eq.guitar.vol }).connect(engine.current.masterReverb);
                const guitarDel = new Tone.FeedbackDelay("8n", 0.5).connect(guitarChan);
                guitarDel.wet.value = eq.guitar.delay;
                const guitarCho = new Tone.Chorus(2, 1.5, 0.5).connect(guitarDel);
                guitarCho.wet.value = eq.guitar.chorus;
                const guitarEqNode = new Tone.EQ3(eq.guitar).connect(guitarCho);
                const guitarDistNode = new Tone.Distortion(eq.guitar.dist).connect(guitarEqNode);
                engine.current.guitarChannel = guitarChan;
                engine.current.guitarDelay = guitarDel;
                engine.current.guitarChorus = guitarCho;
                engine.current.guitarEq = guitarEqNode;
                engine.current.dist = guitarDistNode;
            }

            // Expanded Samplers
            if (!engine.current.synth) {
                engine.current.synth = new Tone.Sampler({
                    urls: { 
                        "E2": "E2.mp3", "G2": "G2.mp3", "A2": "A2.mp3", 
                        "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3", "A3": "A3.mp3",
                        "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3"
                    },
                    baseUrl: "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/electric_guitar_clean-mp3/",
                    release: 0.8
                }).connect(engine.current.dist);
            }

            if (!engine.current.bass) {
                engine.current.bass = new Tone.Sampler({
                    urls: { 
                        "E1": "E1.mp3", "G1": "G1.mp3", "A1": "A1.mp3", 
                        "C2": "C2.mp3", "E2": "E2.mp3", "G2": "G2.mp3", "A2": "A2.mp3"
                    },
                    baseUrl: "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_bass-mp3/",
                    release: 0.4
                }).connect(engine.current.bassEq);
            }

            if (!engine.current.drums) {
                engine.current.drums = new Tone.Sampler({
                    urls: { 
                        "C1": "https://cdn.jsdelivr.net/gh/wesbos/JavaScript30@master/01%20-%20JavaScript%20Drum%20Kit/sounds/kick.wav",
                        "D1": "https://cdn.jsdelivr.net/gh/wesbos/JavaScript30@master/01%20-%20JavaScript%20Drum%20Kit/sounds/snare.wav",
                        "F#1": "https://cdn.jsdelivr.net/gh/wesbos/JavaScript30@master/01%20-%20JavaScript%20Drum%20Kit/sounds/hihat.wav"
                    },
                    onload: () => console.log("Drums Loaded")
                }).connect(engine.current.drumsEq);
            }

            if (!engine.current.lead) engine.current.lead = new Tone.MonoSynth({ oscillator: { type: "square" } }).toDestination();
            
            refreshAvailableTracks();
        };
        setup();
    }, [user]);

    // --- Groove & Pocket System ---
    const GROOVE_PRESETS = {
        shuffle: { drums: -0.01, bass: 0.005, guitar: 0.015 },
        boogie: { drums: -0.005, bass: 0.01, guitar: 0.01 },
        texas: { drums: -0.012, bass: 0.008, guitar: 0.02 },
        slow: { drums: -0.02, bass: 0.015, guitar: 0.025 },
        default: { drums: 0, bass: 0, guitar: 0 }
    };

    const getGrooveOffset = (instrument) => {
        const preset = GROOVE_PRESETS[rhythmType] || GROOVE_PRESETS.default;
        return preset[instrument] || 0;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HUMAN_FEEL — Control centralizado de humanización (0 = máquina, 1 = humano)
    // No modifica nada cuando amount = 0. Escala suavemente hasta 1.
    // ─────────────────────────────────────────────────────────────────────────
    const HUMAN_FEEL = useRef({ amount: 0.35 }); // 0.35 = default sutil

    // --- Humanization Engine (ahora escalado por HUMAN_FEEL) ---
    const humanizeTime = (baseTime, intensity = 1.0, instrument = null) => {
        const grooveOffset = instrument ? getGrooveOffset(instrument) : 0;
        // Cuando HUMAN_FEEL.amount = 0 → maxOffset = 0 → sin jitter
        const humanAmount = HUMAN_FEEL.current.amount;
        const maxOffset = 0.05 * intensity * humanAmount;
        return baseTime + grooveOffset + (Math.random() - 0.5) * maxOffset;
    };

    const triggerRealistic = (sampler, note, time, velocity = 0.8, type = 'melodic', intensity = 1.0) => {
        if (!sampler || !sampler.loaded) return;

        const humanAmount = HUMAN_FEEL.current.amount;

        // Velocity: HUMAN_FEEL escala la variación. Con amount=0 → velVar=1 (sin cambio)
        const velVar = 1 + (Math.random() - 0.5) * 0.2 * intensity * humanAmount;
        const vLayer = velocity < 0.4 ? 0.7 : (velocity < 0.8 ? 1.0 : 1.2);
        const finalVel = Math.max(0.05, Math.min(1.0, velocity * vLayer * velVar));

        // Duration: escala variación de duración con HUMAN_FEEL
        const durVar = 1 + (Math.random() - 0.5) * 0.3 * intensity * humanAmount;
        const duration = type === 'percussive' ? "16n" : (0.2 * Math.max(0.5, durVar));
        
        // Humanization
        const detune = (Math.random() - 0.5) * 12 * intensity; // Up to +/- 6 cents
        
        sampler.triggerAttackRelease(note, duration, time, finalVel);
        
        if (sampler.detune) {
            const oldDetune = sampler.detune.value;
            sampler.detune.setValueAtTime(detune, time);
            sampler.detune.setValueAtTime(oldDetune, time + 0.1);
        }
    };

    const fetchEqSettings = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}?action=get_audio_settings&user_id=${user.id}`);
            const data = await res.json();
            if (data) {
                // Merge deep to ensure all fields exist
                const mergedEq = {
                    drums: { ...DEFAULT_AUDIO_SETTINGS.drums, ...data.drums },
                    bass: { ...DEFAULT_AUDIO_SETTINGS.bass, ...data.bass },
                    guitar: { ...DEFAULT_AUDIO_SETTINGS.guitar, ...data.guitar },
                    master: { ...DEFAULT_AUDIO_SETTINGS.master, ...data.master }
                };
                setEq(mergedEq);
                
                if (engine.current.drumsEq) engine.current.drumsEq.set(mergedEq.drums);
                if (engine.current.bassEq) engine.current.bassEq.set(mergedEq.bass);
                if (engine.current.guitarEq) engine.current.guitarEq.set(mergedEq.guitar);
                
                if (engine.current.drumsChannel) engine.current.drumsChannel.volume.value = mergedEq.drums.vol;
                if (engine.current.bassChannel) engine.current.bassChannel.volume.value = mergedEq.bass.vol;
                if (engine.current.guitarChannel) engine.current.guitarChannel.volume.value = mergedEq.guitar.vol;

                if (engine.current.dist) engine.current.dist.distortion = mergedEq.guitar.dist;
                if (engine.current.guitarChorus) engine.current.guitarChorus.wet.value = mergedEq.guitar.chorus;
                if (engine.current.guitarDelay) engine.current.guitarDelay.wet.value = mergedEq.guitar.delay;
                if (engine.current.bassChorus) engine.current.bassChorus.wet.value = mergedEq.bass.chorus;
                if (engine.current.masterReverb) engine.current.masterReverb.wet.value = mergedEq.master.reverb;
            }
        } catch (e) { console.error(e); }
    };

    const saveEqSettings = async (newEq) => {
        if (!user) return;
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_audio_settings', user_id: user.id, eq_settings: newEq })
            });
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchEqSettings(); }, [user]);

    const handleEqChange = (inst, band, val) => {
        const next = { ...eq, [inst]: { ...eq[inst], [band]: val } };
        setEq(next);
        
        if (inst === 'master' && band === 'reverb') {
            if (engine.current.masterReverb) engine.current.masterReverb.wet.value = val;
        } else if (band === 'vol') {
            if (engine.current[`${inst}Channel`]) engine.current[`${inst}Channel`].volume.value = val;
        } else if (band === 'dist') {
            if (engine.current.dist) engine.current.dist.distortion = val;
        } else if (band === 'chorus') {
            if (engine.current[`${inst}Chorus`]) engine.current[`${inst}Chorus`].wet.value = val;
        } else if (band === 'delay') {
            if (engine.current.guitarDelay) engine.current.guitarDelay.wet.value = val;
        } else {
            if (engine.current[`${inst}Eq`]) engine.current[`${inst}Eq`][band].value = val;
        }
        saveEqSettings(next);
    };

    const refreshAvailableTracks = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}?action=get_backing_tracks&user_id=${user.id}`);
            const data = await res.json();
            if (data.success) {
                // Organizar por rhythm_key y note_key para búsqueda rápida
                const tracksMap = {};
                data.global.forEach(t => {
                    if (!tracksMap[t.rhythm_key]) tracksMap[t.rhythm_key] = {};
                    tracksMap[t.rhythm_key][t.note_key] = { type: 'global', path: t.file_path };
                });
                data.user.forEach(t => {
                    if (!tracksMap[t.rhythm_key]) tracksMap[t.rhythm_key] = {};
                    tracksMap[t.rhythm_key][t.note_key] = { type: 'user', path: t.file_path };
                });
                setAvailableTracks(tracksMap);
            }
        } catch (e) { console.error(e); }
    };

    const handleUploadTrack = async (rhythm, key, file) => {
        if (!file || !user) return;

        const formData = new FormData();
        formData.append('action', 'upload_backing_track');
        formData.append('rhythm', rhythm);
        formData.append('key', key);
        formData.append('audio_file', file);
        formData.append('user_id', user.id);
        if (user.id == 1) formData.append('is_global', '1');

        try {
            const res = await fetch(API_URL, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                refreshAvailableTracks();
            } else {
                alert(data.error || "Error al subir");
            }
        } catch (e) { 
            console.error(e); 
            alert("Error de conexión al subir la pista. Revisa la consola.");
        }
    };

    const getTrackStatus = (rhythm, key) => {
        return availableTracks[rhythm]?.[key] || null;
    };

    const selectedBarsRef = useRef([]);
    useEffect(() => { selectedBarsRef.current = [...selectedBars].sort((a, b) => a - b); }, [selectedBars]);

    const handleTap = () => {
        const now = Date.now();
        setIsTapping(true); setTimeout(() => setIsTapping(false), 100);
        if (tapTimes.current.length > 0 && now - tapTimes.current[tapTimes.current.length - 1] > 2000) tapTimes.current = [];
        tapTimes.current.push(now);
        if (tapTimes.current.length > 1) {
            const intervals = tapTimes.current.slice(1).map((t, i) => t - tapTimes.current[i]);
            const avg = intervals.reduce((a, b) => a + b) / intervals.length;
            const nBpm = Math.round(60000 / avg);
            if (nBpm >= 40 && nBpm <= 160) setBpm(nBpm);
        }
        if (tapTimes.current.length > 4) tapTimes.current.shift();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SISTEMA DE VARIACIONES MUSICALES — Unificado bajo HUMAN_FEEL
    // variationSettings actúa como proxy del control centralizado
    // ─────────────────────────────────────────────────────────────────────────
    const variationSettings = useRef({
        get bassVariation() { return HUMAN_FEEL.current.amount > 0; },
        get guitarStaccato() { return HUMAN_FEEL.current.amount > 0; },
        get intensity() { return HUMAN_FEEL.current.amount; }
    });

    /**
     * Genera una variación de velocity ±10-15% de forma aleatoria.
     * Escala con el parámetro intensity global.
     */
    const varyVelocity = (baseVel, intensity = 1.0) => {
        const range = 0.15 * intensity;
        return Math.max(0.05, Math.min(1.0, baseVel * (1 + (Math.random() - 0.5) * range * 2)));
    };

    /**
     * Con baja probabilidad (escalada por intensity), devuelve un intervalo
     * de nota de paso: 2ª (2), 3ª (3/4) ó 6ª (9) sobre la raíz del acorde.
     * Devuelve null si no se activa la variación.
     */
    const getPassingInterval = (beat, sub, intensity) => {
        if (!variationSettings.current.bassVariation) return null;
        const isOffbeat = sub !== 0 || beat === 3;
        if (!isOffbeat) return null;
        // PROTECCIÓN: silencios desactivados si HUMAN_FEEL < 0.2
        if (HUMAN_FEEL.current.amount < 0.2) return null;
        const prob = 0.4 * intensity;
        if (Math.random() > prob) return null;
        const passingIntervals = [2, 3, 4, 9];
        return passingIntervals[Math.floor(Math.random() * passingIntervals.length)];
    };

    /**
     * Ocasionalmente reemplaza el intervalo calculado por otro del mismo acorde.
     * Máx 1 vez por compás, solo en beats intermedios.
     */
    const getChordSubstitute = (currentInterval, chordIntervals, beat, intensity) => {
        if (!variationSettings.current.bassVariation) return currentInterval;
        if (beat === 0) return currentInterval; // Nunca en downbeat
        const prob = 0.20 * intensity;
        if (Math.random() > prob) return currentInterval;
        const alternatives = chordIntervals.filter(i => i !== currentInterval);
        if (alternatives.length === 0) return currentInterval;
        return alternatives[Math.floor(Math.random() * alternatives.length)];
    };

    // ─────────────────────────────────────────────────────────────────────────
    // --- Audio Engine Refactored ---
    const playDrums = (time, context) => {
        const { engine, rhythmType, hit, hitTime, barIntensity, config } = context;
        if (muteStateRef.current.drums || !engine.drums) return;

        const timeParts = hit.time.split(':');
        const beat = parseInt(timeParts[1]);
        const sub = Math.floor(parseFloat(timeParts[2] || "0"));
        
        const intensity = 0.3 * barIntensity;
        const hTime = humanizeTime(hitTime, intensity, 'drums');

        const isBackbeat = beat === 1 || beat === 3;
        const isDownbeat = beat === 0 || beat === 2;

        // Hi-hat logic based on rhythm
        let hihatNote = "F#1";
        let hihatVel = hit.vel * (isDownbeat ? 0.5 : 0.3) * barIntensity;
        if (rhythmType === 'slow' && Math.random() > 0.7) hihatNote = "G#1"; // Simular semi-abierto

        triggerRealistic(engine.drums, hihatNote, hTime, hihatVel, 'percussive', intensity);

        // Snare & Ghost Notes
        if (isBackbeat && sub === 0) {
            triggerRealistic(engine.drums, "D1", hTime, hit.vel * 1.1 * barIntensity, 'percussive', intensity);
        } else if (Math.random() < (config.drumGhostDensity * barIntensity)) {
            const ghostVel = hit.vel * 0.12 * barIntensity;
            triggerRealistic(engine.drums, "D1", hTime + 0.1, ghostVel, 'percussive', intensity);
        }

        // Kick
        if (isDownbeat && sub === 0) {
            triggerRealistic(engine.drums, "C1", hTime, hit.vel * 0.9 * barIntensity, 'percussive', intensity);
        }
    };

    const playBass = (time, context) => {
        const { engine, hit, hitTime, chordRoot, isMinor, beat, sub, barIntensity, config } = context;
        if (muteStateRef.current.chords || !engine.bass) return;
        if (sub !== 0) return;

        const intensity = 0.5 * barIntensity;
        const hTime = humanizeTime(hitTime, intensity, 'bass');

        // Intervals
        const intervals = [0, isMinor ? 3 : 4, 7, 9, 10];
        let interval = 0;

        if (rhythmType === 'boogie') {
            // Pattern fijo boogie
            const boogiePattern = [0, 4, 7, 9, 10, 9, 7, 4];
            interval = boogiePattern[beat % boogiePattern.length];
        } else {
            // Walking bass logic
            if (beat === 0) interval = 0;
            else if (beat === 1) interval = Math.random() > 0.4 ? intervals[1] : intervals[2];
            else if (beat === 2) interval = Math.random() > 0.4 ? intervals[2] : intervals[3];
            else interval = intervals[Math.floor(Math.random() * intervals.length)];
        }

        // ── VARIACIONES DE BAJO (no destructivas) ───────────────────────────
        const vInt = variationSettings.current.intensity;
        const effectiveIntensity = vInt * barIntensity;

        // 1. Nota de paso en offbeats (NO modifica raíz en beat 0)
        const passingInterval = getPassingInterval(beat, sub, effectiveIntensity);
        if (passingInterval !== null && beat !== 0) {
            interval = passingInterval;
        } else if (beat !== 0) {
            // 2. Sustitución suave por otra nota del acorde
            interval = getChordSubstitute(interval, intervals, beat, effectiveIntensity);
        }

        // 3. Velocity variada ±10-15%
        const baseVel = hit.vel * 0.8 * barIntensity;
        const finalVel = variationSettings.current.bassVariation
            ? varyVelocity(baseVel, effectiveIntensity)
            : baseVel;
        // ────────────────────────────────────────────────────────────────────

        const note = notes[(chordRoot + interval) % 12] + "2";
        triggerRealistic(engine.bass, note, hTime, finalVel, 'melodic', intensity);
    };

    const playGuitar = (time, context) => {
        const { engine, hit, hitTime, guitarNotes, barIntensity, config, beat, sub } = context;
        if (muteStateRef.current.chords || !engine.synth) return;

        const intensity = 0.8 * barIntensity;
        const hTime = humanizeTime(hitTime, intensity, 'guitar');

        const vInt = variationSettings.current.intensity;
        const effectiveIntensity = vInt * barIntensity;
        const isOffbeat = sub !== 0 || beat % 2 !== 0;

        guitarNotes.forEach(note => {
            // ── VARIACIONES DE GUITARRA (no destructivas) ─────────────────
            // 1. Silencio probabilístico — SOLO en offbeats, nunca en downbeat
            if (variationSettings.current.guitarStaccato && isOffbeat && beat !== 0) {
                const silenceProb = 0.15 * effectiveIntensity;
                if (Math.random() < silenceProb) return; // Omitir esta nota
            }

            // 2. Staccato: reducir duración al 40-60% del valor original (30% prob)
            const durationMultiplier = (() => {
                const baseMult = rhythmType === 'slow' ? 1.5 : (1 - config.guitarStaccato);
                if (variationSettings.current.guitarStaccato && Math.random() < 0.30 * effectiveIntensity) {
                    return baseMult * (0.4 + Math.random() * 0.2); // 40-60%
                }
                return baseMult;
            })();

            // 3. Velocity alternada fuerte/suave
            const baseVel = hit.vel * 0.6 * barIntensity;
            const finalVel = variationSettings.current.guitarStaccato
                ? varyVelocity(baseVel, effectiveIntensity)
                : baseVel;
            // ─────────────────────────────────────────────────────────────

            triggerRealistic(engine.synth, note, hTime, finalVel, 'melodic', intensity);
        });
    };

    const initLoop = () => {
        if (engine.current.loop) engine.current.loop.dispose();
        
        // --- Optimización: Cache de datos musicales ---
        engine.current.loop = new Tone.Loop((time) => {
            if (!engine.current.synth) return;

            const selection = selectedBarsRef.current;
            const bar = selection.length > 0 ? selection[engine.current.sequenceIdx % selection.length] : engine.current.sequenceIdx % 12;
            
            // Pre-cálculos por compás
            const numeral = BLUES_STRUCTURE[bar];
            const chordRoot = (notes.indexOf(bluesKey) + NUMERAL_TO_INTERVAL[numeral]) % 12;
            const isMinor = scaleType === 'Minor';
            const barIntensity = getIntensityForBar(bar);
            const config = RHYTHM_CONFIGS[rhythmType] || RHYTHM_CONFIGS.default;
            
            const chordNotes = [0, isMinor ? 3 : 4, 7, 10].map(i => `${notes[(chordRoot + i) % 12]}3`);

            Tone.Draw.schedule(() => setCurrentBar(bar), time);
            
            if (!useExternalTrack) {
                const activeRhythm = RHYTHMS[rhythmType];
                activeRhythm.pattern.forEach((hit, i) => {
                    const hitTime = time + Tone.Time(hit.time).toSeconds();
                    const beat = parseInt(hit.time.split(':')[1]);
                    const sub = Math.floor(parseFloat(hit.time.split(':')[2] || "0"));

                    // Lógica de guitarra por ritmo
                    let guitarNotes;
                    if (['shuffle', 'boogie', 'texas'].includes(rhythmType)) {
                        const fifth = notes[(chordRoot + 7) % 12];
                        const sixth = notes[(chordRoot + 9) % 12];
                        const isOffBeat = i % 2 !== 0;
                        guitarNotes = isOffBeat ? [notes[chordRoot] + "3", sixth + "3"] : [notes[chordRoot] + "3", fifth + "3"];
                    } else {
                        guitarNotes = chordNotes;
                    }

                    const audioContext = { 
                        engine: engine.current, 
                        rhythmType, 
                        hit, 
                        hitTime, 
                        chordRoot, 
                        isMinor, 
                        beat, 
                        sub, 
                        barIntensity, 
                        config,
                        guitarNotes
                    };

                    playGuitar(hitTime, audioContext);
                    playBass(hitTime, audioContext);
                    playDrums(hitTime, audioContext);
                });
            }

            if (isCallResponse && (Math.floor(engine.current.sequenceIdx / 2) % 2 === 1)) {
                const phrase = position === '3rd' ? ['D4', 'E4', 'G4'] : ['A4', 'C4', 'D4'];
                phrase.forEach((n, i) => {
                    const t = time + i * 0.4;
                    engine.current.lead.triggerAttackRelease(n, "8n", t);
                    Tone.Draw.schedule(() => setActiveNote(n), t);
                    Tone.Draw.schedule(() => setActiveNote(null), t + 0.3);
                });
            }

            Tone.Draw.schedule(() => setTurn((Math.floor(engine.current.sequenceIdx / 2) % 2 === 0) ? 'call' : 'response'), time);
            engine.current.sequenceIdx++;
        }, "1m").start(0);
    };

    const getCellStatus = (note, type, hole) => {
        const hStr = type === 'blow' ? `${hole}` : `-${hole}`;
        const hAlt = type === 'drawBend' ? `-${hole}'` : type === 'blowBend' ? `${hole}'` : hStr;
        if (activeNote === note) return type.includes('blow') ? 'bg-emerald-500 text-white animate-pulse' : 'bg-rose-500 text-white animate-pulse';
        if (!isCallResponse || turn === 'response') {
            if (advice.prim.includes(hAlt) || advice.prim.includes(hStr)) return type.includes('blow') ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-black' : 'border-rose-500 bg-rose-500/20 text-rose-400 font-black';
            if (advice.sec.includes(hAlt) || advice.sec.includes(hStr)) return 'border-blue-500 bg-blue-500/10 text-blue-400';
        }
        return 'bg-slate-950 border-slate-800 text-slate-700 opacity-60';
    };

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-xl overflow-y-auto font-sans text-slate-200 flex flex-col p-4 md:p-8">
            <div className="max-w-6xl w-full mx-auto space-y-6 relative">
                <button onClick={onClose} className="absolute -top-4 right-0 lg:-right-4 w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-700 hover:text-white z-50 shadow-xl border border-slate-700">
                    <X size={20} />
                </button>

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg"><Layers className="text-white" size={24} /></div>
                        <div>
                            <h1 className="text-xl font-black text-white italic leading-none uppercase">Blues Master <span className="text-blue-500">Pro</span></h1>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Harmony Insight System</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center relative z-10">
                        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
                            <button onClick={() => setPosition('2nd')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${position === '2nd' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>2nd</button>
                            <button onClick={() => setPosition('3rd')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${position === '3rd' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>3rd</button>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-2xl">
                            <button 
                                onClick={() => setUseExternalTrack(!useExternalTrack)}
                                disabled={!getTrackStatus(rhythmType, bluesKey) && !useExternalTrack}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${
                                    useExternalTrack 
                                        ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                                        : getTrackStatus(rhythmType, bluesKey)
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse'
                                            : 'bg-slate-900 text-slate-400 border border-transparent opacity-50 cursor-not-allowed'
                                }`}
                            >
                                {useExternalTrack ? 'MP3 REAL' : 'SAMPLER'}
                            </button>
                            <button 
                                onClick={() => setIsManagingTracks(true)}
                                className="w-8 h-8 rounded-lg bg-slate-900 text-slate-500 flex items-center justify-center hover:text-white transition-colors"
                            >
                                <Settings size={14} />
                            </button>
                            <button 
                                onClick={() => setShowEQ(!showEQ)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showEQ ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                            >
                                <Gauge size={14} />
                            </button>
                            <input type="range" min="60" max="160" value={bpm} disabled={useExternalTrack} onChange={e => setBpm(parseInt(e.target.value))} className="w-24 accent-blue-500 cursor-pointer h-1.5" />
                            <span className="text-[10px] font-black text-blue-400 w-8 text-center">{bpm}</span>
                        </div>

                        <div className="flex gap-2">
                            <select 
                                value={rhythmType} 
                                onChange={e => {
                                    const next = e.target.value;
                                    setRhythmType(next);
                                    if (RHYTHMS[next].defaultBpm) setBpm(RHYTHMS[next].defaultBpm);
                                }} 
                                className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-[10px] font-black outline-none w-24 md:w-32 truncate">
                                {Object.entries(RHYTHMS).map(([key, data]) => (
                                    <option key={key} value={key}>
                                        {getTrackStatus(key, bluesKey) ? '🎵 ' : ''}{data.name}
                                    </option>
                                ))}
                            </select>
                            <button 
                                onClick={() => setIsDrumsMuted(!isDrumsMuted)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDrumsMuted ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                                title="Mute Drums"
                            >
                                {isDrumsMuted ? <VolumeX size={16} /> : <Drum size={16} />}
                            </button>
                            <button 
                                onClick={() => setIsChordsMuted(!isChordsMuted)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isChordsMuted ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-900 text-slate-500 hover:text-white'}`}
                                title="Mute Harmony"
                            >
                                {isChordsMuted ? <VolumeX size={16} /> : <Music size={16} />}
                            </button>
                            <select value={bluesKey} onChange={e => setBluesKey(e.target.value)} className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-[10px] font-black outline-none">{notes.map(n => <option key={n} value={n}>TONO: {n}</option>)}</select>
                        </div>

                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                            <button onClick={handlePlayPause} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-black text-[10px] uppercase flex items-center gap-2">{isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'PAUSA' : 'START'}</button>
                            <button onClick={handleReset} className="px-2 py-1.5 text-slate-500 hover:text-white transition-colors"><RotateCcw size={14} /></button>
                        </div>
                    </div>
                </header>

                {showEQ && (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setActiveTab('eq')}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'eq' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}
                                >
                                    EQUALIZER
                                </button>
                                <button 
                                    onClick={() => setActiveTab('fx')}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fx' ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}
                                >
                                    EFFECTS (FX)
                                </button>
                            </div>
                            <button onClick={() => setShowEQ(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                        </div>

                        {activeTab === 'eq' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {['drums', 'bass', 'guitar'].map(inst => (
                                    <div key={inst} className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-800 pb-2 mb-4">{inst}</h4>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-[8px] font-bold text-blue-400 uppercase tracking-tighter"><span>Volume</span><span>{eq[inst].vol}dB</span></div>
                                            <input type="range" min="-48" max="6" step="1" value={eq[inst].vol} onChange={e => handleEqChange(inst, 'vol', parseFloat(e.target.value))} className="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                        </div>
                                        {['low', 'mid', 'high'].map(band => (
                                            <div key={band} className="space-y-2">
                                                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-tighter"><span>{band}</span><span className={eq[inst][band] > 0 ? 'text-blue-400' : 'text-slate-400'}>{eq[inst][band]}dB</span></div>
                                                <input type="range" min="-12" max="12" step="0.5" value={eq[inst][band]} onChange={e => handleEqChange(inst, band, parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-800 pb-2">Master FX</h4>
                                    
                                    {/* HUMAN FEEL — Control Central de Humanización */}
                                    <div className="space-y-3 bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Human Feel</span>
                                                <p className="text-[8px] text-slate-500 font-bold mt-0.5">
                                                    {HUMAN_FEEL.current.amount === 0 ? 'Máquina exacta' :
                                                     HUMAN_FEEL.current.amount < 0.3 ? 'Apenas perceptible' :
                                                     HUMAN_FEEL.current.amount < 0.6 ? 'Groove humano' : 'Máxima expresión'}
                                                </p>
                                            </div>
                                            <span className="text-sm font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
                                                {Math.round(HUMAN_FEEL.current.amount * 100)}%
                                            </span>
                                        </div>
                                        <input
                                            type="range" min="0" max="1" step="0.01"
                                            defaultValue={HUMAN_FEEL.current.amount}
                                            onChange={e => {
                                                HUMAN_FEEL.current.amount = parseFloat(e.target.value);
                                                // Forzar re-render para actualizar el label
                                                e.target.closest('.space-y-3').querySelectorAll('span').forEach(el => {
                                                    if (el.textContent.includes('%')) el.textContent = Math.round(HUMAN_FEEL.current.amount * 100) + '%';
                                                });
                                            }}
                                            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                        <div className="flex justify-between text-[7px] font-black text-slate-700 uppercase tracking-wider">
                                            <span>0 · Máquina</span>
                                            <span>0.3 · Sutil</span>
                                            <span>0.6 · Humano</span>
                                            <span>1 · Full</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase"><span>Reverb Wet</span><span>{Math.round(eq.master.reverb * 100)}%</span></div>
                                        <input type="range" min="0" max="1" step="0.01" value={eq.master.reverb} onChange={e => handleEqChange('master', 'reverb', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-800 pb-2">Bass FX</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase"><span>Chorus Wet</span><span>{Math.round(eq.bass.chorus * 100)}%</span></div>
                                        <input type="range" min="0" max="1" step="0.01" value={eq.bass.chorus} onChange={e => handleEqChange('bass', 'chorus', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-800 pb-2">Guitar FX</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase"><span>Distortion</span><span>{Math.round(eq.guitar.dist * 100)}%</span></div>
                                            <input type="range" min="0" max="1" step="0.01" value={eq.guitar.dist} onChange={e => handleEqChange('guitar', 'dist', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase"><span>Chorus</span><span>{Math.round(eq.guitar.chorus * 100)}%</span></div>
                                            <input type="range" min="0" max="1" step="0.01" value={eq.guitar.chorus} onChange={e => handleEqChange('guitar', 'chorus', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase"><span>Delay Wet</span><span>{Math.round(eq.guitar.delay * 100)}%</span></div>
                                            <input type="range" min="0" max="1" step="0.01" value={eq.guitar.delay} onChange={e => handleEqChange('guitar', 'delay', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-600/10 border border-indigo-500/30 p-6 rounded-[2.5rem] flex items-center gap-4 shadow-xl">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Compass size={24} /></div>
                        <div>
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Armónica Sugerida</h2>
                            <p className="text-2xl font-black text-white">{harpKey} <span className="text-xs text-indigo-400 font-bold">({POSITIONS_DATA[position].name})</span></p>
                        </div>
                    </div>
                    <div className="bg-emerald-600/10 border border-emerald-500/30 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Activity size={24} /></div>
                            <div>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Backing Track</h2>
                                <p className="text-3xl font-black text-white tracking-tighter">{getChordName(BLUES_STRUCTURE[currentBar])}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Grado {BLUES_STRUCTURE[currentBar]}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
                            {isManagingTracks && (
                                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                                    <div className="bg-slate-900 border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                                            <div>
                                                <h2 className="text-2xl font-black text-white tracking-tighter">Matriz de Backing Tracks</h2>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gestión Centralizada de Audio Real</p>
                                            </div>
                                            <button onClick={() => setIsManagingTracks(false)} className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center hover:bg-rose-500 transition-all"><X size={24} /></button>
                                        </div>
                                        
                                        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                                            <div className="grid grid-cols-[150px_1fr] gap-4">
                                                <div className="pt-10">
                                                    {Object.entries(RHYTHMS).map(([rKey, rData]) => (
                                                        <div key={rKey} className="h-14 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b border-white/5">{rData.name}</div>
                                                    ))}
                                                </div>
                                                <div className="overflow-x-auto pb-4">
                                                    <div className="flex gap-2 mb-2">
                                                        {notes.map(note => <div key={note} className="w-14 text-center text-[10px] font-black text-blue-500">{note}</div>)}
                                                    </div>
                                                    {Object.entries(RHYTHMS).map(([rKey, rData]) => (
                                                        <div key={rKey} className="flex gap-2 mb-2">
                                                            {notes.map(note => {
                                                                const status = getTrackStatus(rKey, note);
                                                                return (
                                                                    <label key={note} className={`w-14 h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                                                                        status?.type === 'user' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                                                                        status?.type === 'global' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 
                                                                        'bg-slate-950 border-slate-800 text-slate-700 hover:border-slate-700'
                                                                    }`}>
                                                                        <input type="file" accept="audio/mp3" className="hidden" onChange={(e) => handleUploadTrack(rKey, note, e.target.files[0])} />
                                                                        {status ? (
                                                                            <Music size={14} className={status.type === 'user' ? 'animate-pulse' : ''} />
                                                                        ) : (
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-slate-600 transition-colors" />
                                                                        )}
                                                                        <span className="text-[7px] mt-1 font-black">{status ? (status.type === 'user' ? 'USER' : 'SYS') : 'EMPTY'}</span>
                                                                        
                                                                        {/* Tooltip informativo al hover */}
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-slate-950 text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                                            {rData.name} en {note}
                                                                        </div>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex gap-6">
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[10px] font-black text-slate-400 uppercase">Tus Audios</span></div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-[10px] font-black text-slate-400 uppercase">Audios de Sistema</span></div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-800" /><span className="text-[10px] font-black text-slate-400 uppercase">Sin Audio</span></div>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-600 italic max-w-xs text-right">Las pistas de sistema son las que tú subes como administrador. Si un usuario sube la suya propia, esa tendrá prioridad.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-4 gap-2">
                                {BLUES_STRUCTURE.map((chord, i) => {
                                    const realName = getChordName(chord);
                                    return (
                                        <button key={i} onClick={() => toggleBarSelection(i)} className={`h-16 rounded-xl flex flex-col items-center justify-center transition-all border-2 relative group ${currentBar === i && isPlaying && !useExternalTrack ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : selectedBars.includes(i) ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-700'}`}>
                                            <span className="text-sm font-black">{realName}</span>
                                            <span className="text-[8px] font-bold opacity-40 uppercase">{chord}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* ── Blues Scale ──────────────── */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap size={14} className="text-indigo-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escala Blues ({bluesKey})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {fullBluesScale.map((item, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center min-w-[70px] p-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner gap-1">
                                            <span className={`text-lg font-black ${item.color}`}>{item.note}</span>
                                            <span className="text-xs font-black text-white bg-slate-800 px-3 py-0.5 rounded-md">{item.hole}</span>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter text-center leading-none mt-1">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        {/* Harmonica Layout */}
                        <div className="bg-slate-900/80 rounded-[2.5rem] p-8 border border-slate-800 shadow-xl overflow-x-auto custom-scrollbar">
                            <div className="grid grid-cols-10 gap-1 min-w-[700px]">
                                {currentHarpLayout.map(h => <div key={h.hole} className={`h-8 rounded-lg flex items-center justify-center font-bold text-[10px] border transition-all ${getCellStatus(h.blowBendsNotes[0], 'blowBend', h.hole)}`}>{h.blowBendsNotes[0] || ''}</div>)}
                                {currentHarpLayout.map(h => <div key={h.hole} className={`h-12 rounded-lg flex items-center justify-center font-black text-sm border-2 transition-all ${getCellStatus(h.blowNote, 'blow', h.hole)}`}>{h.blowNote}</div>)}
                                {currentHarpLayout.map(h => <div key={h.hole} className="h-10 bg-slate-800 rounded-md flex items-center justify-center font-black text-white shadow-inner border border-slate-700">{h.hole}</div>)}
                                {currentHarpLayout.map(h => <div key={h.hole} className={`h-12 rounded-lg flex items-center justify-center font-black text-sm border-2 transition-all ${getCellStatus(h.drawNote, 'draw', h.hole)}`}>{h.drawNote}</div>)}
                                {currentHarpLayout.map(h => (
                                    <div key={h.hole} className="flex flex-col gap-1">
                                        {h.drawBendsNotes.map((n, idx) => <div key={idx} className={`h-8 rounded-lg flex items-center justify-center font-bold text-[9px] border transition-all ${getCellStatus(n, 'drawBend', h.hole)}`}>{n}</div>)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (3rd Column) */}
                    <div className="space-y-6">
                        {/* Triad */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Music size={12} className="text-blue-500" />
                                Tríada de {currentTriad.name}
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {currentTriad.notes.map((n, idx) => (
                                    <div key={idx} className="flex flex-col items-center p-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner gap-1">
                                        <span className="text-xl font-black text-white">{n.note}</span>
                                        <span className="text-xs font-black text-blue-400">{n.hole}</span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{n.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Targets Advice */}
                        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <Target size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Targets Recomendados</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {advice.prim.map(n => (
                                    <div key={n} className="flex flex-col items-center gap-1">
                                        <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-base font-black text-emerald-400">{n}</span>
                                        <span className="text-[10px] font-black text-emerald-500/60 mt-1 uppercase tracking-tighter">{getNoteFromHole(n)}</span>
                                    </div>
                                ))}
                                {advice.sec.map(n => (
                                    <div key={n} className="flex flex-col items-center gap-1">
                                        <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-base font-black text-indigo-400">{n}</span>
                                        <span className="text-[10px] font-black text-indigo-500/60 mt-1 uppercase tracking-tighter">{getNoteFromHole(n)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Escalas de Referencia */}
                        <SharedScalesPanel />
                    </div>

                </div>
            </div>
        </div>
    );

    function toggleBarSelection(idx) { setSelectedBars(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx]); }
    async function handlePlayPause() {
        if (!isPlaying) {
            await Tone.start();
            Tone.Transport.seconds = 0;
            engine.current.sequenceIdx = 0;
            
            // Siempre iniciamos el loop para que avance la UI
            initLoop();

            if (useExternalTrack) {
                const track = availableTracks[rhythmType]?.[bluesKey];
                const trackUrl = track ? track.path : null;
                
                if (trackUrl) {
                    if (!engine.current.externalTrack || engine.current.externalTrack.url !== trackUrl) {
                        if (engine.current.externalTrack) engine.current.externalTrack.dispose();
                        engine.current.externalTrack = new Tone.Player({
                            url: trackUrl,
                            loop: true,
                            onload: () => {
                                engine.current.externalTrack.start();
                                // No iniciamos el transport para el timeline si es external track
                            }
                        }).toDestination();
                    } else {
                        engine.current.externalTrack.start();
                    }
                } else {
                    setUseExternalTrack(false);
                    initLoop();
                    Tone.Transport.start();
                }
            } else {
                initLoop();
                Tone.Transport.start();
            }
            setIsPlaying(true);
            setPlaybackState('started');
        } else {
            Tone.Transport.stop();
            if (engine.current.externalTrack) engine.current.externalTrack.stop();
            setIsPlaying(false);
            setPlaybackState('stopped');
        }
    }
    function handleReset() {
        Tone.Transport.stop(); engine.current.sequenceIdx = 0;
        if (engine.current.externalTrack) engine.current.externalTrack.stop();
        setCurrentBar(selectedBars.length > 0 ? Math.min(...selectedBars) : 0);
        setIsPlaying(false);
        setPlaybackState('stopped'); setActiveNote(null);
    }
};

export default BluesMasterModal;