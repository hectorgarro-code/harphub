import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { BLUES_DRUM_PATTERNS } from '../utils/constants';

const MusicContext = createContext();

export function MusicProvider({ children }) {
    const [bpm, setBpm] = useState(100);
    const [isMetroOn, setIsMetroOn] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0);
    const [currentBar, setCurrentBar] = useState(0);
    
    // Metronome Advanced Settings
    const [metroSettings, setMetroSettings] = useState({
        volume: 0.8,
        pattern: 'straight',
        isDrumMode: false,
        shuffleRatio: 0.5,
        gapPractice: {
            enabled: false,
            soundBars: 3,
            muteBars: 1
        },
        speedTrainer: {
            enabled: false,
            increment: 2,
            maxBpm: 140
        },
        backbeatOnly: false,
        footTapVisual: true,
        accentFirstBeat: true
    });
    
    const clickSynth = useRef(null);
    const drumKicks = useRef(null);
    const drumSnares = useRef(null);
    const drumHats = useRef(null);

    useEffect(() => {
        clickSynth.current = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
        }).toDestination();

        drumKicks.current = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination();

        drumSnares.current = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
        }).toDestination();

        drumHats.current = new Tone.MetalSynth({
            frequency: 200,
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination();

        return () => {
            [clickSynth, drumKicks, drumSnares, drumHats].forEach(ref => ref.current?.dispose());
        };
    }, []);

    useEffect(() => {
        Tone.Transport.bpm.value = bpm;
    }, [bpm]);

    useEffect(() => {
        if (isMetroOn) {
            Tone.start();
            Tone.Transport.cancel();
            
            // Loop for the metronome click or drum pattern
            const loop = new Tone.Loop((time) => {
                const position = Tone.Transport.position.split(':');
                const bar = parseInt(position[0]);
                const beat = parseInt(position[1]);
                const subdivision = parseInt(position[2]); // For 12-subdivision shuffle

                // 1. Gap Practice Logic
                if (metroSettings.gapPractice.enabled) {
                    const totalCycle = metroSettings.gapPractice.soundBars + metroSettings.gapPractice.muteBars;
                    const barInCycle = bar % totalCycle;
                    if (barInCycle >= metroSettings.gapPractice.soundBars) return; // Mute
                }

                // 2. Speed Trainer Logic (Every 12 bars)
                if (metroSettings.speedTrainer.enabled && bar > 0 && bar % 12 === 0 && beat === 0) {
                    setBpm(prev => Math.min(prev + metroSettings.speedTrainer.increment, metroSettings.speedTrainer.maxBpm));
                }

                // UI Update
                Tone.Draw.schedule(() => {
                    setCurrentBeat(beat);
                    setCurrentBar(bar);
                }, time);

                // 3. Play Sound (Drum Mode vs Click Mode)
                if (metroSettings.isDrumMode) {
                    const pattern = BLUES_DRUM_PATTERNS.find(p => p.id === metroSettings.pattern) || BLUES_DRUM_PATTERNS[0];
                    const sixteenth = beat * 3 + subdivision; // Simplified for 12/8 or shuffle
                    
                    if (pattern.kicks.includes(sixteenth)) drumKicks.current.triggerAttackRelease("C1", "8n", time, 1);
                    if (pattern.snares.includes(sixteenth)) drumSnares.current.triggerAttackRelease("8n", time, 0.7);
                    if (pattern.hats.includes(sixteenth)) drumHats.current.triggerAttackRelease("C4", "32n", time, 0.3);
                } else {
                    // Standard Click Mode
                    if (subdivision === 0) { // Only on main beats
                        if (metroSettings.backbeatOnly && (beat === 0 || beat === 2)) return;
                        
                        const isFirstBeat = beat === 0;
                        clickSynth.current.triggerAttackRelease(
                            isFirstBeat && metroSettings.accentFirstBeat ? "C3" : "C2", 
                            "16n", time, isFirstBeat ? 1 : 0.4
                        );
                    }
                }
            }, "12n").start(0); // Use 12n for shuffle support (12 subdivisions per bar)

            Tone.Transport.start();
            return () => {
                loop.dispose();
                Tone.Transport.stop();
            };
        } else {
            Tone.Transport.stop();
            setCurrentBeat(0);
            setCurrentBar(0);
        }
    }, [isMetroOn, metroSettings]);

    return (
        <MusicContext.Provider value={{ 
            bpm, setBpm, 
            isMetroOn, setIsMetroOn, 
            currentBeat, currentBar,
            metroSettings, setMetroSettings
        }}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    return useContext(MusicContext);
}
