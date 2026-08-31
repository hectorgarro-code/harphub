import { WebMidi } from 'webmidi';

/**
 * @typedef {Object} MidiEvent
 * @property {number} note - Midi note number (0-127)
 * @property {string} name - Note name (e.g., "C4")
 * @property {number} velocity - Velocity (0-1)
 * @property {number} channel - Channel number (1-16)
 * @property {string} type - Event type ("noteon", "noteoff", "cc", "pitchbend")
 */

class MidiService {
    constructor() {
        this.isInitialized = false;
        this.onEventCallbacks = new Set();
        this.onStateChangeCallbacks = new Set();
        this.selectedInput = null;
        this.selectedOutput = null;
    }

    /**
     * Initializes WebMidi and requests permissions
     * @returns {Promise<boolean>}
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            await WebMidi.enable({ sysex: true });
            console.log("WebMidi enabled!");
            this.isInitialized = true;

            // Setup listeners for device connection/disconnection
            WebMidi.addListener("connected", (e) => this._handleStateChange(e));
            WebMidi.addListener("disconnected", (e) => this._handleStateChange(e));

            return true;
        } catch (err) {
            console.error("WebMidi could not be enabled.", err);
            return false;
        }
    }

    /**
     * Returns list of available input devices
     */
    getInputs() {
        return WebMidi.inputs;
    }

    /**
     * Returns list of available output devices
     */
    getOutputs() {
        return WebMidi.outputs;
    }

    /**
     * Selects an input device and sets up listeners
     * @param {string} id 
     */
    setInput(id) {
        if (this.selectedInput) {
            this.selectedInput.removeListener();
        }

        const input = WebMidi.getInputById(id);
        if (input) {
            this.selectedInput = input;
            this._setupInputListeners(input);
            return true;
        }
        return false;
    }

    /**
     * Selects an output device
     * @param {string} id 
     */
    setOutput(id) {
        const output = WebMidi.getOutputById(id);
        if (output) {
            this.selectedOutput = output;
            return true;
        }
        return false;
    }

    /**
     * Private: Setup listeners for a specific input
     */
    _setupInputListeners(input) {
        input.addListener("noteon", (e) => {
            this._broadcastEvent({
                type: "noteon",
                note: e.note.number,
                name: e.note.name + e.note.octave,
                velocity: e.velocity,
                channel: e.message.channel,
                raw: e
            });
        });

        input.addListener("noteoff", (e) => {
            this._broadcastEvent({
                type: "noteoff",
                note: e.note.number,
                name: e.note.name + e.note.octave,
                velocity: 0,
                channel: e.message.channel,
                raw: e
            });
        });

        input.addListener("controlchange", (e) => {
            this._broadcastEvent({
                type: "cc",
                controller: e.controller.number,
                value: e.value,
                channel: e.message.channel,
                raw: e
            });
        });

        input.addListener("pitchbend", (e) => {
            this._broadcastEvent({
                type: "pitchbend",
                value: e.value,
                channel: e.message.channel,
                raw: e
            });
        });
    }

    /**
     * Sends a note to the selected output
     */
    playNote(note, channel = 1, options = {}) {
        if (this.selectedOutput) {
            this.selectedOutput.playNote(note, { channels: channel, ...options });
        }
    }

    stopNote(note, channel = 1, options = {}) {
        if (this.selectedOutput) {
            this.selectedOutput.stopNote(note, { channels: channel, ...options });
        }
    }

    /**
     * Subscription for MIDI events
     */
    subscribe(callback) {
        this.onEventCallbacks.add(callback);
        return () => this.onEventCallbacks.delete(callback);
    }

    /**
     * Subscription for state changes (connected/disconnected)
     */
    onStateChange(callback) {
        this.onStateChangeCallbacks.add(callback);
        return () => this.onStateChangeCallbacks.delete(callback);
    }

    _broadcastEvent(event) {
        this.onEventCallbacks.forEach(cb => cb(event));
    }

    _handleStateChange(e) {
        this.onStateChangeCallbacks.forEach(cb => cb(e));
    }
}

export const midiService = new MidiService();
