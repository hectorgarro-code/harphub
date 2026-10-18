import React, { useState, useEffect, useRef, useMemo } from 'react';
import YouTube from 'react-youtube';
import { 
    Headphones, Play, Pause, SkipForward, SkipBack, Plus, Trash2, 
    Edit3, ExternalLink, Star, Car, Music, Disc3, Volume2, 
    RotateCcw, Shuffle, Sparkles, Folder, Check, X, Search, Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getYouTubeId } from '../utils/constants';
import { POSITIONS, POPULAR_HARP_KEYS, ALL_HARP_KEYS, calculateSongKey } from '../utils/harmonica';

const DEFAULT_PLAYLISTS = ['Para el Auto', 'Blues Clásico', 'Shuffle Rápido', 'Slow Blues', 'Rock & Funk'];

const STARTER_TRACKS = [
    {
        id: 'starter-1',
        title: 'Chicago Blues Shuffle in G (Backing Track)',
        youtubeUrl: 'https://www.youtube.com/watch?v=0kFhPVA888U',
        youtubeId: '0kFhPVA888U',
        harpKey: 'C',
        position: 2,
        songKey: 'G',
        playlist: 'Para el Auto',
        bpm: '110',
        style: 'Chicago Blues Shuffle',
        notes: 'Clásico shuffle de 12 compases. Ideal para licks en celdas -2, -3\', 4.',
        isFavorite: true,
        createdAt: Date.now() - 500000
    },
    {
        id: 'starter-2',
        title: 'Slow Blues in E (Cross Harp Armónica A)',
        youtubeUrl: 'https://www.youtube.com/watch?v=tAGnKpE4NCI',
        youtubeId: 'tAGnKpE4NCI',
        harpKey: 'A',
        position: 2,
        songKey: 'E',
        playlist: 'Slow Blues',
        bpm: '65',
        style: 'Slow Blues 12/8',
        notes: 'Excelente para bends profundos en -2 y -3.',
        isFavorite: true,
        createdAt: Date.now() - 400000
    },
    {
        id: 'starter-3',
        title: 'Upbeat Texas Blues in D (Armónica en G)',
        youtubeUrl: 'https://www.youtube.com/watch?v=5qm8PH4xAss',
        youtubeId: '5qm8PH4xAss',
        harpKey: 'G',
        position: 2,
        songKey: 'D',
        playlist: 'Shuffle Rápido',
        bpm: '125',
        style: 'Texas Drive',
        notes: 'Ritmo rápido estilo Stevie Ray Vaughan.',
        isFavorite: false,
        createdAt: Date.now() - 300000
    },
    {
        id: 'starter-4',
        title: 'Groovy Funk Blues in A (Armónica en D)',
        youtubeUrl: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
        youtubeId: 'lTRiuFIWV54',
        harpKey: 'D',
        position: 2,
        songKey: 'A',
        playlist: 'Rock & Funk',
        bpm: '100',
        style: 'Funk Blues',
        notes: 'Excelente para rítmica y articulación con lengua.',
        isFavorite: false,
        createdAt: Date.now() - 200000
    },
    {
        id: 'starter-5',
        title: 'Soulful Blues in F (Armónica en Bb)',
        youtubeUrl: 'https://www.youtube.com/watch?v=bM7SZ5SBzyY',
        youtubeId: 'bM7SZ5SBzyY',
        harpKey: 'Bb',
        position: 2,
        songKey: 'F',
        playlist: 'Para el Auto',
        bpm: '90',
        style: 'Soul Blues',
        notes: 'Tonalidad muy usada con vientos y metales.',
        isFavorite: true,
        createdAt: Date.now() - 100000
    },
    {
        id: 'starter-6',
        title: 'Sweet Folk Rock in C (1ra Posición Straight Harp)',
        youtubeUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
        youtubeId: 'kXYiU_JCYtU',
        harpKey: 'C',
        position: 1,
        songKey: 'C',
        playlist: 'Blues Clásico',
        bpm: '95',
        style: 'Folk / Rock',
        notes: 'Para tocar notas sopladas limpias y melodías abiertas.',
        isFavorite: false,
        createdAt: Date.now() - 50000
    }
];

export default function HarmonicaTracksCatalog() {
    const { user } = useAuth();
    const storageKey = `harphub_harp_catalog_${user?.id || 'guest'}`;
    const playlistsKey = `harphub_harp_playlists_${user?.id || 'guest'}`;

    // Tracks & Playlists state
    const [tracks, setTracks] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading tracks:', e);
        }
        return STARTER_TRACKS;
    });

    const [playlists, setPlaylists] = useState(() => {
        try {
            const saved = localStorage.getItem(playlistsKey);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading playlists:', e);
        }
        return DEFAULT_PLAYLISTS;
    });

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(tracks));
        } catch (e) {
            console.error('Error saving tracks:', e);
        }
    }, [tracks, storageKey]);

    useEffect(() => {
        try {
            localStorage.setItem(playlistsKey, JSON.stringify(playlists));
        } catch (e) {
            console.error('Error saving playlists:', e);
        }
    }, [playlists, playlistsKey]);

    // Filters
    const [selectedHarpKey, setSelectedHarpKey] = useState('ALL');
    const [selectedPlaylist, setSelectedPlaylist] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyFavorites, setOnlyFavorites] = useState(false);

    // Modes & UI
    const [isCarMode, setIsCarMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTrack, setEditingTrack] = useState(null);
    const [isNewPlaylistOpen, setIsNewPlaylistOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    // Player state
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const playerRef = useRef(null);

    // Filtered track list
    const filteredTracks = useMemo(() => {
        return tracks.filter(track => {
            if (selectedHarpKey !== 'ALL' && track.harpKey !== selectedHarpKey) return false;
            if (selectedPlaylist !== 'ALL' && track.playlist !== selectedPlaylist) return false;
            if (onlyFavorites && !track.isFavorite) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = track.title?.toLowerCase().includes(q);
                const matchStyle = track.style?.toLowerCase().includes(q);
                const matchHarp = track.harpKey?.toLowerCase().includes(q);
                const matchSong = track.songKey?.toLowerCase().includes(q);
                const matchNotes = track.notes?.toLowerCase().includes(q);
                if (!matchTitle && !matchStyle && !matchHarp && !matchSong && !matchNotes) return false;
            }
            return true;
        });
    }, [tracks, selectedHarpKey, selectedPlaylist, onlyFavorites, searchQuery]);

    // Active track
    const activeTrack = useMemo(() => {
        if (!filteredTracks.length) return null;
        if (currentTrackIndex >= filteredTracks.length) return filteredTracks[0];
        return filteredTracks[currentTrackIndex];
    }, [filteredTracks, currentTrackIndex]);

    // Form state for adding/editing
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        harpKey: 'C',
        position: 2,
        songKey: 'G',
        playlist: 'Para el Auto',
        bpm: '',
        style: '',
        notes: ''
    });

    const openAddModal = (initialKey = null) => {
        const key = initialKey || (selectedHarpKey !== 'ALL' ? selectedHarpKey : 'C');
        const pos = 2;
        setFormData({
            title: '',
            url: '',
            harpKey: key,
            position: pos,
            songKey: calculateSongKey(key, pos),
            playlist: selectedPlaylist !== 'ALL' ? selectedPlaylist : (playlists[0] || 'Para el Auto'),
            bpm: '',
            style: '',
            notes: ''
        });
        setEditingTrack(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (track) => {
        setFormData({
            title: track.title,
            url: track.youtubeUrl,
            harpKey: track.harpKey,
            position: track.position || 2,
            songKey: track.songKey || calculateSongKey(track.harpKey, track.position || 2),
            playlist: track.playlist || playlists[0] || 'Para el Auto',
            bpm: track.bpm || '',
            style: track.style || '',
            notes: track.notes || ''
        });
        setEditingTrack(track);
        setIsAddModalOpen(true);
    };

    // Auto update song key when harp key or position changes in form
    const handleHarpKeyChange = (newHarpKey) => {
        setFormData(prev => ({
            ...prev,
            harpKey: newHarpKey,
            songKey: calculateSongKey(newHarpKey, prev.position)
        }));
    };

    const handlePositionChange = (newPos) => {
        setFormData(prev => ({
            ...prev,
            position: Number(newPos),
            songKey: calculateSongKey(prev.harpKey, Number(newPos))
        }));
    };

    const handleSaveTrack = (e) => {
        e.preventDefault();
        const ytId = getYouTubeId(formData.url);
        if (!ytId) {
            alert('Por favor ingresa un enlace o ID de YouTube válido.');
            return;
        }

        const trackTitle = formData.title.trim() || `Jam en ${formData.songKey} (Armónica ${formData.harpKey})`;

        if (editingTrack) {
            setTracks(prev => prev.map(t => t.id === editingTrack.id ? {
                ...t,
                title: trackTitle,
                youtubeUrl: formData.url,
                youtubeId: ytId,
                harpKey: formData.harpKey,
                position: formData.position,
                songKey: formData.songKey,
                playlist: formData.playlist,
                bpm: formData.bpm,
                style: formData.style,
                notes: formData.notes
            } : t));
        } else {
            const newTrack = {
                id: `track-${Date.now()}`,
                title: trackTitle,
                youtubeUrl: formData.url,
                youtubeId: ytId,
                harpKey: formData.harpKey,
                position: formData.position,
                songKey: formData.songKey,
                playlist: formData.playlist,
                bpm: formData.bpm,
                style: formData.style,
                notes: formData.notes,
                isFavorite: false,
                createdAt: Date.now()
            };
            setTracks(prev => [newTrack, ...prev]);
            setCurrentTrackIndex(0);
        }

        setIsAddModalOpen(false);
    };

    const handleDeleteTrack = (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este tema?')) {
            setTracks(prev => prev.filter(t => t.id !== id));
            if (currentTrackIndex >= filteredTracks.length - 1) {
                setCurrentTrackIndex(0);
            }
        }
    };

    const toggleFavorite = (id) => {
        setTracks(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
    };

    // Navigation in Playlist
    const handlePlayTrack = (track) => {
        const idx = filteredTracks.findIndex(t => t.id === track.id);
        if (idx !== -1) {
            setCurrentTrackIndex(idx);
            setIsPlaying(true);
            if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
            }
        }
    };

    const handleNextTrack = () => {
        if (!filteredTracks.length) return;
        if (isShuffle) {
            const nextIdx = Math.floor(Math.random() * filteredTracks.length);
            setCurrentTrackIndex(nextIdx);
        } else {
            setCurrentTrackIndex((prev) => (prev + 1) % filteredTracks.length);
        }
        setIsPlaying(true);
    };

    const handlePrevTrack = () => {
        if (!filteredTracks.length) return;
        setCurrentTrackIndex((prev) => (prev - 1 + filteredTracks.length) % filteredTracks.length);
        setIsPlaying(true);
    };

    const togglePlayPause = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    const handleCreatePlaylist = (e) => {
        e.preventDefault();
        const trimmed = newPlaylistName.trim();
        if (trimmed && !playlists.includes(trimmed)) {
            setPlaylists(prev => [...prev, trimmed]);
            setSelectedPlaylist(trimmed);
            setNewPlaylistName('');
            setIsNewPlaylistOpen(false);
        }
    };

    const restoreStarters = () => {
        if (window.confirm('¿Deseas recargar la colección recomendada de backing tracks?')) {
            setTracks(STARTER_TRACKS);
            setSelectedHarpKey('ALL');
            setSelectedPlaylist('ALL');
        }
    };

    return (
        <div className={`min-h-full pb-28 text-white transition-colors duration-300 ${isCarMode ? 'bg-black' : 'bg-slate-950'}`}>
            {/* TOP HEADER */}
            <div className={`border-b ${isCarMode ? 'border-amber-500/30 bg-slate-900/90' : 'border-white/5 bg-slate-900/60'} backdrop-blur-xl px-4 lg:px-8 py-5 sticky top-0 z-30 transition-all shadow-xl`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isCarMode ? 'bg-amber-500 text-black shadow-amber-500/20' : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-amber-900/30'}`}>
                            {isCarMode ? <Car size={26} strokeWidth={2.5} /> : <Headphones size={24} strokeWidth={2.5} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                    Temas por Tonalidad
                                </h1>
                                {isCarMode && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider animate-pulse">
                                        Modo Auto
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                Agarra tu armónica, dale play y toca encima en el auto o en tu estudio
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2.5">
                        {/* Car Mode Toggle Button */}
                        <button
                            onClick={() => setIsCarMode(!isCarMode)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                                isCarMode 
                                    ? 'bg-amber-500 text-black ring-2 ring-amber-400 shadow-amber-500/30' 
                                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                            }`}
                            title="Modo simplificado con botones gigantes ideal para conducir o tocar de pie"
                        >
                            <Car size={16} />
                            <span>{isCarMode ? 'Salir Modo Auto' : 'Modo Auto'}</span>
                        </button>

                        {/* Add Track Button */}
                        <button
                            onClick={() => openAddModal()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} />
                            <span>Agregar Tema</span>
                        </button>

                        {/* Presets reload */}
                        <button
                            onClick={restoreStarters}
                            className="p-2.5 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            title="Recargar temas de muestra iniciales"
                        >
                            <Sparkles size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
                
                {/* HARMONICA KEY SELECTOR (THE MAIN ATTRACTION) */}
                <div className={`p-4 lg:p-6 rounded-3xl border transition-all ${isCarMode ? 'bg-slate-900 border-amber-500/40 shadow-2xl' : 'bg-slate-900/60 border-white/5 backdrop-blur-md shadow-xl'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Disc3 size={18} className="text-amber-500" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                                ¿Qué armónica tienes a mano? (Tonalidad)
                            </span>
                        </div>
                        {selectedHarpKey !== 'ALL' && (
                            <button
                                onClick={() => setSelectedHarpKey('ALL')}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition underline underline-offset-4"
                            >
                                Ver todas
                            </button>
                        )}
                    </div>

                    {/* Big Key Buttons for quick touch */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-13 gap-2">
                        <button
                            onClick={() => setSelectedHarpKey('ALL')}
                            className={`py-3 px-2 rounded-2xl font-black text-xs uppercase transition-all flex flex-col items-center justify-center border ${
                                selectedHarpKey === 'ALL'
                                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                                    : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            <span className="text-sm">TODAS</span>
                            <span className="text-[9px] opacity-75 font-semibold mt-0.5">{tracks.length}</span>
                        </button>

                        {POPULAR_HARP_KEYS.map(key => {
                            const count = tracks.filter(t => t.harpKey === key).length;
                            const isSelected = selectedHarpKey === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedHarpKey(key)}
                                    className={`py-3 px-2 rounded-2xl font-black transition-all flex flex-col items-center justify-center border ${
                                        isSelected
                                            ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-black border-amber-300 shadow-xl shadow-amber-500/40 scale-105'
                                            : 'bg-slate-800/90 text-white border-white/5 hover:border-amber-500/40 hover:bg-slate-750'
                                    }`}
                                >
                                    <span className="text-lg lg:text-xl font-black tracking-tight">{key}</span>
                                    <span className={`text-[9px] font-bold mt-0.5 ${isSelected ? 'text-black/80' : 'text-slate-400'}`}>
                                        {count} {count === 1 ? 'tema' : 'temas'}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Other keys dropdown or chips */}
                        {ALL_HARP_KEYS.filter(k => !POPULAR_HARP_KEYS.includes(k)).map(key => {
                            const count = tracks.filter(t => t.harpKey === key).length;
                            const isSelected = selectedHarpKey === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedHarpKey(key)}
                                    className={`py-3 px-2 rounded-2xl font-black transition-all flex flex-col items-center justify-center border ${
                                        isSelected
                                            ? 'bg-amber-500 text-black border-amber-300 shadow-xl scale-105'
                                            : 'bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-700 hover:text-white'
                                    }`}
                                >
                                    <span className="text-base font-black">{key}</span>
                                    <span className="text-[9px] font-bold mt-0.5 opacity-75">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Musician Cheatsheet for Selected Key */}
                    {selectedHarpKey !== 'ALL' && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/40 p-3 rounded-2xl">
                            <div className="flex items-center flex-wrap gap-4 text-slate-300">
                                <span className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Info size={14} /> Armónica en {selectedHarpKey}:
                                </span>
                                <span className="bg-slate-800/80 px-2.5 py-1 rounded-xl border border-white/5">
                                    <b className="text-white">2da Posición (Blues/Cross):</b> Tema en <span className="text-amber-400 font-black">{calculateSongKey(selectedHarpKey, 2)}</span>
                                </span>
                                <span className="bg-slate-800/80 px-2.5 py-1 rounded-xl border border-white/5">
                                    <b className="text-white">1ra Posición (Straight):</b> Tema en <span className="text-amber-400 font-black">{selectedHarpKey}</span>
                                </span>
                                <span className="bg-slate-800/80 px-2.5 py-1 rounded-xl border border-white/5">
                                    <b className="text-white">3ra Posición (Menor):</b> Tema en <span className="text-amber-400 font-black">{calculateSongKey(selectedHarpKey, 3)}m</span>
                                </span>
                            </div>
                            <button
                                onClick={() => openAddModal(selectedHarpKey)}
                                className="text-amber-400 hover:text-amber-300 font-black flex items-center gap-1 text-[11px] uppercase tracking-wider"
                            >
                                <Plus size={14} /> Agregar tema en {selectedHarpKey}
                            </button>
                        </div>
                    )}
                </div>

                {/* ACTIVE PLAYER HERO COMPONENT */}
                {activeTrack ? (
                    <div className={`rounded-3xl border overflow-hidden shadow-2xl transition-all ${
                        isCarMode 
                            ? 'bg-slate-900 border-amber-500/60 p-6 lg:p-8 ring-2 ring-amber-500/20' 
                            : 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-white/10 p-5 lg:p-7'
                    }`}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            
                            {/* YouTube Embed Player */}
                            <div className="lg:col-span-5 aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 relative">
                                <YouTube
                                    videoId={activeTrack.youtubeId}
                                    className="w-full h-full"
                                    iframeClassName="w-full h-full"
                                    onReady={(e) => {
                                        playerRef.current = e.target;
                                        if (isPlaying) e.target.playVideo();
                                    }}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnd={() => {
                                        if (isLooping) {
                                            playerRef.current?.playVideo();
                                        } else {
                                            handleNextTrack();
                                        }
                                    }}
                                    opts={{
                                        playerVars: {
                                            autoplay: 1,
                                            controls: 1,
                                            modestbranding: 1,
                                            rel: 0,
                                            origin: typeof window !== 'undefined' ? window.location.origin : undefined
                                        }
                                    }}
                                />
                            </div>

                            {/* Track Details & Gigantic Car Controls */}
                            <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
                                <div>
                                    {/* Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-xl font-black text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5 ${
                                            isCarMode ? 'bg-amber-500 text-black' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            <Disc3 size={14} /> Armónica: {activeTrack.harpKey}
                                        </span>
                                        <span className="px-3 py-1 rounded-xl bg-slate-800 text-white font-black text-xs tracking-wider uppercase border border-white/10">
                                            Tema en: {activeTrack.songKey}
                                        </span>
                                        <span className="px-3 py-1 rounded-xl bg-slate-800/80 text-slate-300 font-bold text-xs">
                                            {activeTrack.position === 2 ? '2da Pos (Blues)' : activeTrack.position === 1 ? '1ra Pos' : `${activeTrack.position}ta Pos`}
                                        </span>
                                        {activeTrack.playlist && (
                                            <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/20">
                                                {activeTrack.playlist}
                                            </span>
                                        )}
                                        {activeTrack.bpm && (
                                            <span className="px-2 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-mono">
                                                {activeTrack.bpm} BPM
                                            </span>
                                        )}
                                    </div>

                                    {/* Track Title */}
                                    <h2 className={`font-black tracking-tight text-white line-clamp-2 ${isCarMode ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'}`}>
                                        {activeTrack.title}
                                    </h2>

                                    {activeTrack.notes && (
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                                            "{activeTrack.notes}"
                                        </p>
                                    )}
                                </div>

                                {/* CAR / PLAYER CONTROLS (EXTRA LARGE) */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6">
                                        {/* Shuffle */}
                                        <button
                                            onClick={() => setIsShuffle(!isShuffle)}
                                            className={`p-3 rounded-2xl transition ${
                                                isShuffle ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800/60 text-slate-500 hover:text-white'
                                            }`}
                                            title="Aleatorio"
                                        >
                                            <Shuffle size={isCarMode ? 24 : 18} />
                                        </button>

                                        {/* Prev */}
                                        <button
                                            onClick={handlePrevTrack}
                                            className={`rounded-2xl transition active:scale-90 flex items-center justify-center ${
                                                isCarMode 
                                                    ? 'w-16 h-16 bg-slate-800 text-white hover:bg-slate-700 ring-2 ring-white/10' 
                                                    : 'w-12 h-12 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700'
                                            }`}
                                            title="Tema Anterior"
                                        >
                                            <SkipBack size={isCarMode ? 28 : 22} />
                                        </button>

                                        {/* Huge Play / Pause */}
                                        <button
                                            onClick={togglePlayPause}
                                            className={`rounded-3xl transition transform active:scale-95 flex items-center justify-center shadow-2xl ${
                                                isCarMode
                                                    ? 'w-24 h-24 bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/40'
                                                    : 'w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30'
                                            }`}
                                            title={isPlaying ? 'Pausa' : 'Reproducir'}
                                        >
                                            {isPlaying ? (
                                                <Pause size={isCarMode ? 40 : 28} fill="currentColor" />
                                            ) : (
                                                <Play size={isCarMode ? 40 : 28} fill="currentColor" className="ml-1" />
                                            )}
                                        </button>

                                        {/* Next */}
                                        <button
                                            onClick={handleNextTrack}
                                            className={`rounded-2xl transition active:scale-90 flex items-center justify-center ${
                                                isCarMode 
                                                    ? 'w-16 h-16 bg-slate-800 text-white hover:bg-slate-700 ring-2 ring-white/10' 
                                                    : 'w-12 h-12 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700'
                                            }`}
                                            title="Tema Siguiente"
                                        >
                                            <SkipForward size={isCarMode ? 28 : 22} />
                                        </button>

                                        {/* Loop */}
                                        <button
                                            onClick={() => setIsLooping(!isLooping)}
                                            className={`p-3 rounded-2xl transition ${
                                                isLooping ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800/60 text-slate-500 hover:text-white'
                                            }`}
                                            title="Repetir este tema indefinidamente"
                                        >
                                            <RotateCcw size={isCarMode ? 24 : 18} />
                                        </button>

                                        {/* Favorite Toggle */}
                                        <button
                                            onClick={() => toggleFavorite(activeTrack.id)}
                                            className={`p-3 rounded-2xl transition ${
                                                activeTrack.isFavorite ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-white bg-slate-800/60'
                                            }`}
                                            title="Marcar favorito"
                                        >
                                            <Star size={isCarMode ? 24 : 18} fill={activeTrack.isFavorite ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>

                                    {/* Position quick indicator */}
                                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                                        <span>
                                            Tema <b className="text-white">{currentTrackIndex + 1}</b> de <b className="text-white">{filteredTracks.length}</b> en lista
                                        </span>
                                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                            Avance automático al terminar
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
                        <Headphones size={36} className="mx-auto text-slate-600" />
                        <h3 className="text-lg font-bold text-slate-300">No hay temas con estos filtros</h3>
                        <p className="text-xs text-slate-500">Agrega tu primer enlace de YouTube para esta tonalidad o cambia de filtro.</p>
                        <button
                            onClick={() => openAddModal()}
                            className="px-5 py-2.5 rounded-2xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg"
                        >
                            <Plus size={16} /> Agregar tema ahora
                        </button>
                    </div>
                )}

                {/* PLAYLISTS & SEARCH BAR */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                    {/* Playlists Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        <button
                            onClick={() => setSelectedPlaylist('ALL')}
                            className={`px-3.5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition border ${
                                selectedPlaylist === 'ALL'
                                    ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                                    : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'
                            }`}
                        >
                            Todas las Playlists
                        </button>

                        {playlists.map(pl => {
                            const isSelected = selectedPlaylist === pl;
                            return (
                                <button
                                    key={pl}
                                    onClick={() => setSelectedPlaylist(pl)}
                                    className={`px-3.5 py-2 rounded-2xl font-black text-xs tracking-wider whitespace-nowrap transition border ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                            : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'
                                    }`}
                                >
                                    {pl}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setIsNewPlaylistOpen(true)}
                            className="px-3 py-2 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold whitespace-nowrap border border-dashed border-white/10 flex items-center gap-1 transition"
                            title="Crear nueva playlist"
                        >
                            <Plus size={14} /> Nueva
                        </button>
                    </div>

                    {/* Search & Favs */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:w-56">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar tema o estilo..."
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <button
                            onClick={() => setOnlyFavorites(!onlyFavorites)}
                            className={`p-2.5 rounded-2xl border transition ${
                                onlyFavorites 
                                    ? 'bg-amber-500 text-black border-amber-400' 
                                    : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                            }`}
                            title="Ver solo favoritos"
                        >
                            <Star size={16} fill={onlyFavorites ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>

                {/* TRACK LIST */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2 uppercase tracking-widest">
                        <span>Listado de Temas ({filteredTracks.length})</span>
                        <span>Click para reproducir</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredTracks.map((track, idx) => {
                            const isCurrent = activeTrack?.id === track.id;
                            return (
                                <div
                                    key={track.id}
                                    onClick={() => handlePlayTrack(track)}
                                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                                        isCurrent
                                            ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                                            : 'bg-slate-900/70 border-white/5 hover:border-white/10 hover:bg-slate-800/80'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {/* Play icon / Key badge */}
                                        <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black transition-all ${
                                            isCurrent
                                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105'
                                                : 'bg-slate-800 text-slate-300 group-hover:bg-amber-500/20 group-hover:text-amber-400'
                                        }`}>
                                            {isCurrent && isPlaying ? (
                                                <Volume2 size={20} className="animate-pulse" />
                                            ) : (
                                                <span className="text-base">{track.harpKey}</span>
                                            )}
                                        </div>

                                        <div className="overflow-hidden">
                                            <h4 className={`text-sm font-bold truncate leading-tight transition ${isCurrent ? 'text-amber-400 font-black' : 'text-slate-200 group-hover:text-white'}`}>
                                                {track.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                                <span className="bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-white">
                                                    Armónica {track.harpKey}
                                                </span>
                                                <span>Tema: <b className="text-amber-300">{track.songKey}</b></span>
                                                {track.playlist && (
                                                    <span className="hidden sm:inline text-slate-500">
                                                        • {track.playlist}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => toggleFavorite(track.id)}
                                            className={`p-2 rounded-xl transition ${
                                                track.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                                            }`}
                                            title="Favorito"
                                        >
                                            <Star size={16} fill={track.isFavorite ? 'currentColor' : 'none'} />
                                        </button>

                                        <a
                                            href={track.youtubeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-xl text-slate-600 hover:text-red-400 transition"
                                            title="Abrir en YouTube"
                                        >
                                            <ExternalLink size={15} />
                                        </a>

                                        <button
                                            onClick={() => openEditModal(track)}
                                            className="p-2 rounded-xl text-slate-600 hover:text-blue-400 transition"
                                            title="Editar tema"
                                        >
                                            <Edit3 size={15} />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteTrack(track.id)}
                                            className="p-2 rounded-xl text-slate-600 hover:text-rose-400 transition"
                                            title="Eliminar tema"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MODAL: ADD / EDIT TRACK */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase text-white">
                                    {editingTrack ? 'Editar Tema' : 'Pegar Enlace de YouTube'}
                                </h3>
                                <p className="text-xs text-slate-400">Guarda el tema asociado a tu armónica para tocar encima</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveTrack} className="space-y-4">
                            {/* YouTube URL input */}
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                    Enlace de YouTube *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            {/* Title (Optional / Auto) */}
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                    Título del Tema (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={`Ej: Shuffle en ${formData.songKey} con Armónica ${formData.harpKey}`}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            {/* Harmonica Key & Position Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                        Armónica (Tonalidad) *
                                    </label>
                                    <select
                                        value={formData.harpKey}
                                        onChange={(e) => handleHarpKeyChange(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                                    >
                                        {ALL_HARP_KEYS.map(k => (
                                            <option key={k} value={k}>Armónica en {k}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                        Posición *
                                    </label>
                                    <select
                                        value={formData.position}
                                        onChange={(e) => handlePositionChange(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                                    >
                                        {POSITIONS.map(p => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Calculated Song Key & Playlist */}
                            <div className="grid grid-cols-2 gap-3 items-center bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                        Tonalidad del Tema
                                    </span>
                                    <span className="text-xl font-black text-amber-400">
                                        {formData.songKey}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block">
                                        (Auto-calculado)
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                                        Playlist
                                    </label>
                                    <select
                                        value={formData.playlist}
                                        onChange={(e) => setFormData(prev => ({ ...prev, playlist: e.target.value }))}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                    >
                                        {playlists.map(pl => (
                                            <option key={pl} value={pl}>{pl}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Style / Notes */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                        Estilo / Ritmo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.style}
                                        onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
                                        placeholder="Ej: Chicago Shuffle, Slow Blues"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                        Tempo (BPM)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.bpm}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
                                        placeholder="Ej: 110"
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                                    Notas de práctica (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Ej: Solo en minuto 1:30, usar bending de 3ra celda"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400"
                                >
                                    {editingTrack ? 'Actualizar Tema' : 'Guardar y Listar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CREATE PLAYLIST */}
            {isNewPlaylistOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
                        <button
                            onClick={() => setIsNewPlaylistOpen(false)}
                            className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-base font-black uppercase text-white mb-3">Nueva Playlist</h3>
                        <form onSubmit={handleCreatePlaylist} className="space-y-4">
                            <input
                                type="text"
                                required
                                autoFocus
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="Ej: Viajes Nocturnos, Delta Blues..."
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsNewPlaylistOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase"
                                >
                                    Crear Playlist
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
