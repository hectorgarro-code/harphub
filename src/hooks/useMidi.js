import { useEffect } from 'react';
import { useMidiStore } from '../store/useMidiStore';
import { midiService } from '../services/midiService';

/**
 * Custom hook to interact with the MIDI system.
 * It provides access to the MIDI state and allows subscribing to real-time events.
 */
export const useMidi = () => {
    const { 
        isSupported, 
        isInitialized, 
        inputs, 
        outputs, 
        selectedInputId, 
        selectedOutputId,
        synthPreset,
        isBluesMasterActive,
        lastEvent,
        activeNotes,
        initialize,
        setInput,
        setOutput,
        setSynthPreset,
        setBluesMasterActive
    } = useMidiStore();

    useEffect(() => {
        if (isSupported && !isInitialized) {
            initialize();
        }
    }, [isSupported, isInitialized, initialize]);

    return {
        isSupported,
        isInitialized,
        inputs,
        outputs,
        selectedInputId,
        selectedOutputId,
        synthPreset,
        isBluesMasterActive,
        lastEvent,
        activeNotes,
        setInput,
        setOutput,
        setSynthPreset,
        setBluesMasterActive,
        
        // Helper to send MIDI notes
        playNote: (note, channel, options) => midiService.playNote(note, channel, options),
        stopNote: (note, channel, options) => midiService.stopNote(note, channel, options),
        
        // Expose a way to refresh devices
        refreshDevices: () => {
            useMidiStore.setState({
                inputs: midiService.getInputs().map(i => ({ id: i.id, name: i.name, manufacturer: i.manufacturer })),
                outputs: midiService.getOutputs().map(o => ({ id: o.id, name: o.name, manufacturer: o.manufacturer }))
            });
        }
    };
};
