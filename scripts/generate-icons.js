const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c;
}

function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePNG(size, outputPath) {
    const width = size;
    const height = size;

    // Header
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8); // 8 bits per channel
    ihdr.writeUInt8(6, 9); // RGBA
    ihdr.writeUInt8(0, 10); // Compression
    ihdr.writeUInt8(0, 11); // Filter
    ihdr.writeUInt8(0, 12); // Interlace
    const ihdrChunk = createChunk('IHDR', ihdr);

    // Image data (raw RGBA with filter byte 0 at start of each scanline)
    const scanlineLength = width * 4 + 1;
    const rawData = Buffer.alloc(scanlineLength * height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = width * 0.44;

    for (let y = 0; y < height; y++) {
        const offset = y * scanlineLength;
        rawData[offset] = 0; // Filter: None

        for (let x = 0; x < width; x++) {
            const pixelOffset = offset + 1 + x * 4;

            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Background: rounded dark blue/indigo slate
            // Rounded rectangle or circle
            const cornerR = width * 0.22;
            const rx = Math.max(0, Math.abs(dx) - (cx - cornerR));
            const ry = Math.max(0, Math.abs(dy) - (cy - cornerR));
            const roundedDist = Math.sqrt(rx * rx + ry * ry);

            if (roundedDist <= cornerR) {
                // Inside app icon background: gradient from Blue-600 to Indigo-900
                const grad = y / height;
                let r = Math.round(37 * (1 - grad) + 15 * grad);
                let g = Math.round(99 * (1 - grad) + 23 * grad);
                let b = Math.round(235 * (1 - grad) + 142 * grad);
                let a = 255;

                // Center motif: Harmonica symbol / microphone & musical waves
                // Harmonica body (silver/amber rectangle with comb holes)
                const hw = width * 0.55;
                const hh = height * 0.22;
                const hx = Math.abs(dx);
                const hy = Math.abs(dy);

                if (hx < hw / 2 && hy < hh / 2) {
                    // Golden/amber harmonica cover plate
                    r = 245;
                    g = 158;
                    b = 11;

                    // Holes in harmonica (10 squares)
                    const holeWidth = hw / 14;
                    const holeHeight = hh * 0.55;
                    const localX = (dx + hw / 2);
                    const holeIndex = Math.floor(localX / (hw / 10));
                    const holeCenterX = (holeIndex + 0.5) * (hw / 10);
                    
                    if (Math.abs(localX - holeCenterX) < holeWidth * 0.6 && hy < holeHeight / 2) {
                        // Dark holes
                        r = 15;
                        g = 23;
                        b = 42;
                    }
                } else if (Math.abs(dy - height * 0.22) < height * 0.04 && Math.abs(dx) < width * 0.28) {
                    // Golden text/accent line
                    r = 251;
                    g = 191;
                    b = 36;
                }

                rawData[pixelOffset] = r;
                rawData[pixelOffset + 1] = g;
                rawData[pixelOffset + 2] = b;
                rawData[pixelOffset + 3] = a;
            } else {
                // Transparent
                rawData[pixelOffset] = 0;
                rawData[pixelOffset + 1] = 0;
                rawData[pixelOffset + 2] = 0;
                rawData[pixelOffset + 3] = 0;
            }
        }
    }

    const compressed = zlib.deflateSync(rawData);
    const idatChunk = createChunk('IDAT', compressed);
    const iendChunk = createChunk('IEND', Buffer.alloc(0));

    const finalPNG = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
    fs.writeFileSync(outputPath, finalPNG);
    console.log(`Generated ${outputPath} (${size}x${size}, ${finalPNG.length} bytes)`);
}

const publicDir = path.join(__dirname, '..', 'public');
generatePNG(192, path.join(publicDir, 'icon-192.png'));
generatePNG(512, path.join(publicDir, 'icon-512.png'));
