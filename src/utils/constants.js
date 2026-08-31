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
    if (!url) return false;
    return url.includes('tiktok.com');
};

export const getTikTokId = (url) => {
    if (!url) return '';
    // Handle standard tiktok url: https://www.tiktok.com/@username/video/7182...
    const match = url.match(/video\/(\d+)/);
    return match ? match[1] : url;
};


export const getYouTubeId = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.length === 11) return trimmed; // Ya es un ID
    
    // Regex mejorada para soportar shorts, embeds, watch?v=, etc.
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    
    if (match && match[2].length === 11) {
        return match[2];
    }
    
    // Intento secundario para URLs limpias sin parámetros extras
    try {
        const urlObj = new URL(trimmed);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const v = urlObj.searchParams.get('v');
            if (v && v.length === 11) return v;
            const pathParts = urlObj.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.length === 11) return lastPart;
        }
    } catch (e) {}

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
