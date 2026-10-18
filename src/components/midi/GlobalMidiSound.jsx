import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useMidi } from '../../hooks/useMidi';
import { getTheoryNoteName } from '../../music/theory';

/**
 * GlobalMidiSound
 * Provides a persistent piano sound engine for MIDI input across the entire application.
 */
const GlobalMidiSound = () => {
    const { lastEvent, synthPreset, isBluesMasterActive } = useMidi();
    const synthRef = useRef(null);
    const fxRef = useRef([]);

    const setupSynth = () => {
        if (synthRef.current) {
            synthRef.current.dispose();
            synthRef.current = null;
        }
        fxRef.current.forEach(fx => fx.dispose());
        fxRef.current = [];

        let activeSynth;
        let activeFX = [];

        // Base Effects
        const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 }).toDestination();
        activeFX.push(reverb);

        // Blues Master FX (EQ & Overdrive)
        if (isBluesMasterActive) {
            const bluesDistortion = new Tone.Distortion({ distortion: 0.2, oversample: '2x' });
            const bluesEq = new Tone.EQ3({ low: 2, mid: 3, high: 1 });
            activeFX.push(bluesDistortion, bluesEq);
        }

        // Instrument Patches
        if (synthPreset === 'blues_organ') {
            const chorus = new Tone.Chorus({ frequency: 4, delayTime: 2.5, depth: 0.5 }).start();
            activeFX.push(chorus);
            activeSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'fatpwm', modulationFrequency: 0.2 },
                envelope: { attack: 0.01, decay: 0.1, sustain: 1, release: 0.1 }
            });
        } else if (synthPreset === 'epiano') {
            const tremolo = new Tone.Tremolo({ frequency: 6, depth: 0.6 }).start();
            activeFX.push(tremolo);
            activeSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: { attack: 0.05, decay: 1, sustain: 0.4, release: 1.5 }
            });
        } else if (synthPreset === 'blues_piano') {
            const eq = new Tone.EQ3({ low: 0, mid: 2, high: 4 });
            activeFX.push(eq);
            activeSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle8' },
                envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 1.0 }
            });
        } else {
            // Default Grand Piano
            const eq = new Tone.EQ3({ low: 1, mid: 0, high: -2 });
            activeFX.push(eq);
            activeSynth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.005, decay: 0.5, sustain: 0.2, release: 1.5 }
            });
        }

        // Chain effects
        if (activeFX.length > 0) {
            activeSynth.chain(...activeFX.reverse());
        } else {
            activeSynth.toDestination();
        }

        synthRef.current = activeSynth;
        fxRef.current = activeFX;
    };

    // Re-initialize Global Synth when preset or FX state changes (only if already instantiated or audio active)
    useEffect(() => {
        if (Tone.getContext().state === 'running' || synthRef.current) {
            setupSynth();
        }
        return () => {
            if (synthRef.current) {
                synthRef.current.dispose();
                synthRef.current = null;
            }
            fxRef.current.forEach(fx => fx.dispose());
            fxRef.current = [];
        };
    }, [synthPreset, isBluesMasterActive]);

    // Listen to MIDI events globally
    useEffect(() => {
        if (!lastEvent) return;

        if (!synthRef.current) {
            setupSynth();
        }

        const freq = Tone.Frequency(lastEvent.note, "midi").toFrequency();

        if (lastEvent.type === 'noteon') {
            if (Tone.getContext().state === 'running') {
                synthRef.current?.triggerAttack(freq, Tone.now(), lastEvent.velocity || 0.8);
            }
        } else if (lastEvent.type === 'noteoff') {
            if (Tone.getContext().state === 'running') {
                synthRef.current?.triggerRelease(freq, Tone.now());
            }
        }
    }, [lastEvent]);

    return null;
};

export default GlobalMidiSound;
