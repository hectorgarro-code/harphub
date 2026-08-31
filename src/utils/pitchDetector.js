/**
 * YIN Pitch Tracking Algorithm
 * Highly exact sub-cent precision pitch detector.
 */
export class YinPitchDetector {
    constructor(sampleRate) {
        this.sampleRate = sampleRate;
        this.threshold = 0.15; // Unbral ajustable para detectar pitches en entornos ruidosos
    }

    detect(buffer) {
        // RMS check to avoid processing silence
        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / buffer.length);
        if (rms < 0.01) return -1; // Silencio

        const halfBufferSize = Math.floor(buffer.length / 2);
        let yinBuffer = new Float32Array(halfBufferSize);
        yinBuffer[0] = 1;

        let runningSum = 0;
        let foundTau = -1;

        // Step 1 & 2: Difference Function & CMNDF
        for (let tau = 1; tau < halfBufferSize; tau++) {
            let difference = 0;
            for (let i = 0; i < halfBufferSize; i++) {
                let delta = buffer[i] - buffer[i + tau];
                difference += delta * delta;
            }
            runningSum += difference;
            yinBuffer[tau] = difference * tau / runningSum;

            // Step 3: Absolute Threshold
            if (tau > 2 && yinBuffer[tau] < this.threshold) {
                while (tau + 1 < halfBufferSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                foundTau = tau;
                break;
            }
        }

        // Global search fallback strategy if threshold is not met but there is strong harmonic content
        if (foundTau === -1) {
            let minVal = 10000;
            let minTau = -1;
            // Evitar los primeros delays que pueden ser artefactos
            for (let tau = 10; tau < halfBufferSize; tau++) {
                if (yinBuffer[tau] < minVal) {
                    minVal = yinBuffer[tau];
                    minTau = tau;
                }
            }
            if (minTau > -1 && minVal < 0.4) {
                foundTau = minTau;
            }
        }

        // Step 4: Parabolic Interpolation for Sub-sample precision
        if (foundTau > 0) {
            let betterTau = foundTau;
            if (foundTau > 0 && foundTau < halfBufferSize - 1) {
                let s0 = yinBuffer[foundTau - 1];
                let s1 = yinBuffer[foundTau];
                let s2 = yinBuffer[foundTau + 1];
                // Interpola el verdadero mínimo de la parábola
                let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));

                if (Math.abs(adjustment) < 1) {
                    betterTau += adjustment;
                }
            }
            return this.sampleRate / betterTau;
        }

        return -1;
    }
}
