import React, { useState, useRef, useEffect, useMemo } from 'react';
import YouTube from 'react-youtube';
import UniversalVideoPlayer from '../../common/UniversalVideoPlayer';
import { getYouTubeId } from '../../../utils/constants';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { 
    Bookmark, Target, CheckCircle2, X, Clock, PlayCircle, 
    RotateCcw, Repeat, Trash2, Volume2, Video, Sparkles
} from 'lucide-react';

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const WorkspaceVideoPanel = ({ youtubeId, title, lessonBookmarks }) => {
    if (!youtubeId || !youtubeId.trim()) return null;

    const ytId = getYouTubeId(youtubeId);
    const playerRef = useRef(null);
    const { bookmarks, addBookmark, deleteBookmark } = useWorkspace();

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    
    // Bookmark creation state
    const [bookmarkType, setBookmarkType] = useState('moment');
    const [isSettingRange, setIsSettingRange] = useState(false);
    const [rangeStart, setRangeStart] = useState(null);
    const [showBookmarkInput, setShowBookmarkInput] = useState(false);
    const [bookmarkLabel, setBookmarkLabel] = useState('');

    // Active Loop State
    const [activeLoop, setActiveLoop] = useState(null); // { start, end, label }

    // Loop monitor
    useEffect(() => {
        if (!activeLoop || !playerRef.current) return;
        const interval = setInterval(() => {
            try {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const current = playerRef.current.getCurrentTime();
                    if (current >= activeLoop.end || current < activeLoop.start - 0.5) {
                        playerRef.current.seekTo(activeLoop.start, true);
                        playerRef.current.playVideo();
                    }
                }
            } catch (e) {}
        }, 250);
        return () => clearInterval(interval);
    }, [activeLoop]);

    // Parse Teacher Bookmarks
    const teacherBookmarks = useMemo(() => {
        try {
            if (!lessonBookmarks) return [];
            const parsed = typeof lessonBookmarks === 'string' ? JSON.parse(lessonBookmarks) : lessonBookmarks;
            if (!Array.isArray(parsed)) return [];
            return parsed.map((bm, idx) => ({
                id: bm.id || `teacher_${idx}`,
                type: bm.type || 'moment',
                time: typeof bm.time === 'number' ? bm.time : (bm.seconds || 0),
                endTime: bm.endTime || null,
                timeStr: bm.timeStr || formatTime(typeof bm.time === 'number' ? bm.time : bm.seconds),
                endTimeStr: bm.endTimeStr || (bm.endTime ? formatTime(bm.endTime) : null),
                label: bm.label || bm.title || `Punto ${idx + 1}`,
                isStudent: false
            }));
        } catch (e) {
            return [];
        }
    }, [lessonBookmarks]);

    // Normalize Student Bookmarks
    const studentBookmarks = useMemo(() => {
        return (bookmarks || []).map((bm, idx) => {
            const meta = bm.metadata || {};
            const time = typeof meta.time === 'number' ? meta.time : (parseFloat(bm.position) || 0);
            const endTime = typeof meta.endTime === 'number' ? meta.endTime : null;
            return {
                id: bm.id,
                type: meta.type || bm.type || 'moment',
                time,
                endTime,
                timeStr: meta.timeStr || formatTime(time),
                endTimeStr: meta.endTimeStr || (endTime ? formatTime(endTime) : null),
                label: bm.title || meta.label || `Marcador ${idx + 1}`,
                isStudent: true
            };
        });
    }, [bookmarks]);

    const allBookmarks = useMemo(() => {
        const combined = [...teacherBookmarks, ...studentBookmarks];
        return combined.sort((a, b) => a.time - b.time);
    }, [teacherBookmarks, studentBookmarks]);

    const handleAddBookmark = (type) => {
        if (!playerRef.current) return;
        const time = playerRef.current.getCurrentTime();
        if (type === 'practice') {
            setRangeStart(time);
            setIsSettingRange(true);
            setBookmarkType('practice');
        } else {
            setCurrentTime(time);
            setShowBookmarkInput(true);
            setBookmarkLabel('');
            setBookmarkType(type);
        }
    };

    const confirmBookmark = async () => {
        if (!playerRef.current) return;
        const time = playerRef.current.getCurrentTime();
        const startSec = bookmarkType === 'practice' ? rangeStart : currentTime;
        const endSec = bookmarkType === 'practice' ? time : null;
        const timeStr = formatTime(startSec);
        const endTimeStr = endSec ? formatTime(endSec) : null;
        const label = bookmarkLabel.trim() || (bookmarkType === 'practice' ? `Práctica: ${timeStr} - ${endTimeStr}` : `Momento en ${timeStr}`);

        await addBookmark('video', label, startSec, {
            type: bookmarkType,
            time: startSec,
            endTime: endSec,
            timeStr,
            endTimeStr,
            label,
            isStudent: true
        });

        setShowBookmarkInput(false);
        setIsSettingRange(false);
        setRangeStart(null);
        setBookmarkLabel('');
    };

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed);
        if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
            playerRef.current.setPlaybackRate(speed);
        }
    };

    const playBookmark = (bm) => {
        if (!playerRef.current) return;
        playerRef.current.seekTo(bm.time, true);
        playerRef.current.playVideo();

        if (bm.type === 'practice' && bm.endTime) {
            setActiveLoop({
                start: bm.time,
                end: bm.endTime,
                label: bm.label
            });
        } else {
            setActiveLoop(null);
        }
    };

    return (
        <div className="flex flex-col bg-slate-950 text-white p-4 md:p-8 space-y-6">
            {/* --- VIDEO CONTAINER --- */}
            <div className="aspect-video w-full bg-black rounded-[2rem] relative overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
                {ytId ? (
                    <YouTube
                        videoId={ytId}
                        className="w-full h-full"
                        iframeClassName="w-full h-full"
                        onReady={(e) => {
                            playerRef.current = e.target;
                            setIsPlaying(true);
                        }}
                        opts={{
                            playerVars: {
                                autoplay: 0,
                                modestbranding: 1,
                                rel: 0
                            }
                        }}
                    />
                ) : (
                    <UniversalVideoPlayer 
                        mediaUrl={youtubeId} 
                        title={title} 
                        className="w-full h-full"
                    />
                )}
            </div>

            {/* --- ACTIVE LOOP BANNER --- */}
            {activeLoop && (
                <div className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <Repeat size={18} className="text-blue-400 animate-spin" />
                        <div>
                            <span className="text-xs font-black text-blue-400 uppercase tracking-widest block">
                                Modo Bucle Activo
                            </span>
                            <span className="text-sm font-bold text-slate-200">
                                {activeLoop.label} ({formatTime(activeLoop.start)} - {formatTime(activeLoop.end)})
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveLoop(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase tracking-widest text-slate-300 rounded-xl transition"
                    >
                        Detener Bucle
                    </button>
                </div>
            )}

            {/* --- CONTROLS & BOOKMARK BAR --- */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-3xl border border-white/5 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3">
                    {!showBookmarkInput && !isSettingRange ? (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleAddBookmark('moment')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 active:scale-95 transition shadow-lg shadow-red-900/30"
                            >
                                <Bookmark size={14} /> Momento
                            </button>
                            <button 
                                onClick={() => handleAddBookmark('practice')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 active:scale-95 transition shadow-lg shadow-blue-900/30"
                            >
                                <Target size={14} /> Iniciar Práctica
                            </button>
                        </div>
                    ) : isSettingRange && !showBookmarkInput ? (
                        <div className="flex items-center gap-3 animate-in zoom-in">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    Grabando Práctica desde {formatTime(rangeStart)}
                                </span>
                            </div>
                            <button 
                                onClick={() => {
                                    if (playerRef.current) {
                                        setCurrentTime(playerRef.current.getCurrentTime());
                                    }
                                    setShowBookmarkInput(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/30"
                            >
                                <CheckCircle2 size={14} /> Finalizar y Etiquetar
                            </button>
                            <button 
                                onClick={() => { setIsSettingRange(false); setRangeStart(null); }} 
                                className="p-2.5 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                            <input 
                                autoFocus
                                placeholder={bookmarkType === 'practice' ? "Nombre de la práctica..." : "Descripción del momento..."}
                                value={bookmarkLabel}
                                onChange={e => setBookmarkLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && confirmBookmark()}
                                className="bg-slate-950 border border-white/10 rounded-2xl px-5 py-2.5 text-xs text-white outline-none focus:border-red-500/50 w-52 md:w-72"
                            />
                            <button 
                                onClick={confirmBookmark} 
                                className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl hover:bg-emerald-400 transition"
                            >
                                <CheckCircle2 size={16} />
                            </button>
                            <button 
                                onClick={() => { 
                                    setShowBookmarkInput(false); 
                                    if (bookmarkType === 'moment') { 
                                        setIsSettingRange(false); 
                                        setRangeStart(null); 
                                    } 
                                }} 
                                className="p-2.5 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    
                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-slate-950 rounded-2xl p-1 border border-white/5">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                            <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition ${playbackSpeed === speed ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Bookmarks Chips */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar py-1">
                    {allBookmarks.map(bm => (
                        <div key={bm.id} className="flex items-center gap-1 shrink-0">
                            <button 
                                onClick={() => playBookmark(bm)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border transition ${
                                    bm.type === 'practice' 
                                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-300 hover:bg-blue-600/20' 
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/5'
                                }`}
                                title={bm.label}
                            >
                                <Clock size={11} className={bm.type === 'practice' ? 'text-blue-400' : 'text-red-500'} /> 
                                <span>{bm.type === 'practice' ? `${bm.timeStr} - ${bm.endTimeStr}` : bm.timeStr}</span>
                            </button>
                            {bm.isStudent && (
                                <button 
                                    onClick={() => deleteBookmark(bm.id)}
                                    className="p-1 text-slate-600 hover:text-red-500 transition"
                                    title="Eliminar mi marcador"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- ÍNDICE DE CONTENIDO --- */}
            {allBookmarks.length > 0 && (
                <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl backdrop-blur-md">
                    <div className="px-8 py-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2.5">
                            <PlayCircle size={16} className="text-red-500" /> Índice de Contenido
                        </h4>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {allBookmarks.length} Puntos clave
                        </span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {allBookmarks.map((bm, index) => (
                            <div 
                                key={bm.id}
                                className="flex items-center justify-between px-8 py-4 hover:bg-white/5 transition-all group/item"
                            >
                                <button 
                                    onClick={() => playBookmark(bm)}
                                    className="flex-1 flex items-center gap-4 text-left"
                                >
                                    <span className="text-xs font-black text-slate-600 group-hover/item:text-blue-400 transition-colors w-6">
                                        {index + 1}
                                    </span>
                                    <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black border border-white/5 min-w-[60px] text-center ${
                                        bm.type === 'practice' 
                                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/20' 
                                            : 'bg-slate-950 text-red-400'
                                    }`}>
                                        {bm.type === 'practice' ? `${bm.timeStr} - ${bm.endTimeStr}` : bm.timeStr}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="text-sm font-bold text-slate-200 group-hover/item:text-white transition-colors">
                                            {bm.label}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {bm.type === 'practice' && (
                                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                                                    Sesión de Práctica / Loop
                                                </span>
                                            )}
                                            {bm.isStudent ? (
                                                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    Mi Marcador
                                                </span>
                                            ) : (
                                                <span className="text-[8px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    Lección
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {bm.isStudent && (
                                    <button 
                                        onClick={() => deleteBookmark(bm.id)}
                                        className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-600 hover:text-red-500 transition"
                                        title="Eliminar este punto"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceVideoPanel;
