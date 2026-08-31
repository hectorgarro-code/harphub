import { create } from 'zustand';
import { midiService } from '../services/midiService';

export const useMidiStore = create((set, get) => ({
    isSupported: !!navigator.requestMIDIAccess,
    isInitialized: false,
    inputs: [],
    outputs: [],
    selectedInputId: localStorage.getItem('midi_input_id') || '',
    selectedOutputId: localStorage.getItem('midi_output_id') || '',
    synthPreset: localStorage.getItem('midi_synth_preset') || 'grand_piano',
    isBluesMasterActive: false,
    lastEvent: null,
    activeNotes: new Set(), // MIDI note numbers currently pressed

    initialize: async () => {
        if (get().isInitialized) return;

        const success = await midiService.initialize();
        if (success) {
            const inputs = midiService.getInputs().map(i => ({ id: i.id, name: i.name, manufacturer: i.manufacturer }));
            const outputs = midiService.getOutputs().map(o => ({ id: o.id, name: o.name, manufacturer: o.manufacturer }));

            set({ 
                isInitialized: true, 
                inputs, 
                outputs 
            });

            // Auto-connect if possible
            const { selectedInputId, selectedOutputId } = get();
            if (selectedInputId) midiService.setInput(selectedInputId);
            if (selectedOutputId) midiService.setOutput(selectedOutputId);

            // Listen for device changes
            midiService.onStateChange(() => {
                set({ 
                    inputs: midiService.getInputs().map(i => ({ id: i.id, name: i.name, manufacturer: i.manufacturer })),
                    outputs: midiService.getOutputs().map(o => ({ id: o.id, name: o.name, manufacturer: o.manufacturer }))
                });
            });

            // Listen for events
            midiService.subscribe((event) => {
                set({ lastEvent: event });

                if (event.type === 'noteon') {
                    set(state => {
                        const next = new Set(state.activeNotes);
                        next.add(event.note);
                        return { activeNotes: next };
                    });
                } else if (event.type === 'noteoff') {
                    set(state => {
                        const next = new Set(state.activeNotes);
                        next.delete(event.note);
                        return { activeNotes: next };
                    });
                }
            });
        }
    },

    setInput: (id) => {
        if (midiService.setInput(id)) {
            localStorage.setItem('midi_input_id', id);
            set({ selectedInputId: id });
        }
    },

    setOutput: (id) => {
        if (midiService.setOutput(id)) {
            localStorage.setItem('midi_output_id', id);
            set({ selectedOutputId: id });
        }
    },

    setSynthPreset: (presetId) => {
        localStorage.setItem('midi_synth_preset', presetId);
        set({ synthPreset: presetId });
    },

    setBluesMasterActive: (isActive) => {
        set({ isBluesMasterActive: isActive });
    }
}));
