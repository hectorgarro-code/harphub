/**
 * Professional Audio Recorder utility for HarpHub
 * Handles recording, volume analysis for visualization, and blob generation.
 */
export class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.audioCtx = null;
        this.analyser = null;
        this.dataArray = null;
    }

    async start() {
        try {
            this.audioChunks = [];
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            // Setup visualization context
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioCtx.createMediaStreamSource(this.stream);
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;
            source.connect(this.analyser);
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.mediaRecorder.start();
            return true;
        } catch (err) {
            console.error("Error starting audio recording:", err);
            return false;
        }
    }

    /**
     * Returns the current volume level (0-255) for visualization
     */
    getVolume() {
        if (!this.analyser || !this.dataArray) return 0;
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length;
    }

    stop() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Release hardware resources
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }
                
                if (this.audioCtx) {
                    await this.audioCtx.close();
                }
                
                resolve({ 
                    blob: audioBlob, 
                    url: audioUrl,
                    duration: this.audioChunks.length * 0.1 // rough estimate if needed, better calculated via metadata
                });
                
                this.mediaRecorder = null;
                this.stream = null;
            };

            this.mediaRecorder.stop();
        });
    }
}
