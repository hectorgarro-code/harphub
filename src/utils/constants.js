import { Clock, Activity, Star, Music, Flame, Zap, Piano, Guitar, Mic2, Drum, BookOpen } from 'lucide-react';

export const CATEGORIES = [
    { id: 'daily', name: 'Práctica Diaria', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'warmup', name: 'Warm Up', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'challenge', name: 'Desafíos', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'jam', name: 'Jams (Temas)', icon: Music, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'riffs', name: 'Riffs & Licks', icon: Flame, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'groove', name: 'Groove', icon: Zap, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
    { id: 'theory', name: 'Teoría', icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
];

export const INSTRUMENTS = [
    { id: 'harmonica', name: 'Armónica', icon: Music },
    { id: 'piano', name: 'Piano', icon: Piano },
    { id: 'guitar', name: 'Guitarra', icon: Guitar },
    { id: 'ukulele', name: 'Ukelele', icon: Mic2 }, // Using Mic2 or similar as filler if Uke icon doesn't exist in basic lucide
    { id: 'drums', name: 'Batería', icon: Drum }
];

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const HARP_FREQS = {
    "1": 261.63, "2": 329.63, "3": 392.00, "4": 523.25, "5": 659.25, "6": 783.99, "7": 1046.50, "8": 1318.51, "9": 1567.98, "10": 2093.00,
    "-1": 293.66, "-2": 392.00, "-3": 493.88, "-4": 587.33, "-5": 698.46, "-6": 880.00, "-7": 987.77, "-8": 1174.66, "-9": 1396.91, "-10": 1760.00,
    "-1'": 277.18, "-4'": 554.37, "-6'": 830.61, "-2'": 369.99, "-2''": 349.23, "-3'": 466.16, "-3''": 440.00, "-3'''": 415.30
};

export const BLUES_STRUCTURE = ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'];

export const CHORD_FREQS = {
    'G7': [196.00, 246.94, 293.66, 349.23],
    'C7': [130.81, 164.81, 196.00, 233.08],
    'D7': [146.83, 185.00, 220.00, 261.63]
};

// Sugerencias de Riffs para el Blues Master
export const BLUES_RIFFS = {
    'I': ["-2", "-2''", "-2", "-3'"],
    'IV': ["4", "-4'", "4", "-3'"],
    'V': ["-4", "-4'", "-4", "4"]
};

export const ROUTINE_STEPS = [
    { id: 'warmup', label: 'Calentamiento (Notas Limpias)', duration: 300, tool: 'video' },
    { id: 'technique', label: 'Técnica de Bending', duration: 600, tool: 'tuner' },
    { id: 'tabs', label: 'Estudio de Riffs (Tabs)', duration: 600, tool: 'tabs' },
    { id: 'jam', label: 'Improvisación Blues', duration: 300, tool: 'blues' }
];

export const isTikTokUrl = (url) => {
    return false; // Todos los enlaces se interpretan como video de YouTube
};

export const getTikTokId = (url) => {
    return getYouTubeId(url);
};

export const getYouTubeId = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    
    // Si ya es un ID de 11 caracteres (sin / ? : .)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }
    
    // 1. YouTube Shorts (ej: youtube.com/shorts/VIDEO_ID o m.youtube.com/shorts/VIDEO_ID)
    const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/|m\.youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (shortsMatch && shortsMatch[1]) {
        return shortsMatch[1];
    }

    // 2. YouTube Standard, Embed, watch o short link (youtu.be)
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
    const match = trimmed.match(regExp);
    if (match && match[1]) {
        return match[1];
    }

    // 3. Extracción vía objeto URL
    try {
        const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const urlObj = new URL(urlStr);
        const v = urlObj.searchParams.get('v');
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        for (let i = pathParts.length - 1; i >= 0; i--) {
            const part = pathParts[i];
            if (/^[a-zA-Z0-9_-]{11}$/.test(part)) {
                return part;
            }
        }
    } catch (e) {}

    // 4. Fallback final: Buscar cualquier secuencia de 11 caracteres alfanuméricos/guiones
    const generic11Match = trimmed.match(/([a-zA-Z0-9_-]{11})/);
    if (generic11Match && generic11Match[1]) {
        return generic11Match[1];
    }

    return '';
};

export const BLUES_DRUM_PATTERNS = [
    { id: 'chicago', name: 'Chicago Shuffle', defaultBpm: 110, kicks: [0, 6], snares: [3, 9], hats: [0, 2, 3, 5, 6, 8, 9, 11] },
    { id: 'slow', name: 'Slow Blues', defaultBpm: 65, kicks: [0, 6], snares: [3, 9], hats: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    { id: 'texas', name: 'Texas Drive', defaultBpm: 130, kicks: [0, 4, 6, 10], snares: [3, 9], hats: [0, 2, 3, 5, 6, 8, 9, 11] },
    { id: 'boogie', name: 'Boogie Woogie', defaultBpm: 140, kicks: [0, 3, 6, 9], snares: [3, 9], hats: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    { id: 'straight', name: 'Straight Blues', defaultBpm: 100, kicks: [0, 6], snares: [3, 9], hats: [0, 3, 6, 9] },
    { id: 'stomp', name: 'Delta Stomp', defaultBpm: 90, kicks: [0, 3, 6, 9], snares: [], hats: [0, 6] },
    { id: 'funk', name: 'Funk Blues', defaultBpm: 95, kicks: [0, 4, 10], snares: [3, 8], hats: [0, 2, 3, 4, 6, 8, 9, 10] },
    { id: 'rumba', name: 'Rumba Blues', defaultBpm: 115, kicks: [0, 3, 6, 8], snares: [3, 9], hats: [0, 1, 3, 4, 6, 7, 9, 10] },
    { id: 'rock', name: 'Rock n Roll', defaultBpm: 160, kicks: [0, 6], snares: [3, 9], hats: [0, 2, 3, 5, 6, 8, 9, 11] },
    { id: 'jazz', name: 'Jazz Swing', defaultBpm: 120, kicks: [0, 6, 9], snares: [3, 9], hats: [0, 2, 3, 5, 6, 8, 9, 11] },
    { id: 'heavy', name: 'Heavy Blues', defaultBpm: 85, kicks: [0, 6], snares: [3, 9], hats: [0, 3, 6, 9] },
    { id: 'turnaround', name: 'Turnaround Beat', defaultBpm: 100, kicks: [0, 3, 6, 9], snares: [9, 10, 11], hats: [0, 3, 6] }
];
