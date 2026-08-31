import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
    Star, Edit3, Trash2, Clock, Music, Type, Mic2, Youtube, Save, History, 
    ChevronRight, ChevronLeft, MapPin, Disc, FileText, Link as LinkIcon, ExternalLink, 
    ArrowLeft, Bookmark, Gauge, BookOpen, Info, Play, Plus, X, Maximize2, Minimize2, Square
} from 'lucide-react';
import AlphaTabPlayer from '../AlphaTabPlayer';
import { CATEGORIES, getYouTubeId, isTikTokUrl, getTikTokId } from '../utils/constants';
import { playTabSequence } from '../utils/audio';
import { SEA_SYMBOLS, parseSEAToken, validateMeasures } from '../utils/sea';
import SEAVirtualKeyboard from './SEA/SEAVirtualKeyboard';
import SEAMeasureMonitor from './SEA/SEAMeasureMonitor';
import SEATabLibrary from './SEA/SEATabLibrary';
import SharedScalesPanel from './SharedScalesPanel';

const LessonViewer = ({
    selectedItem,
    setSelectedItem,
    filteredItems,
    items,
    openEditModal,
    deleteItem,
    addItem,
    patchItem,
    bpm,
    addPoints,
    unlockAchievement,
    onShowTour
}) => {
    const playerRef = useRef(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [activeTab, setActiveTab] = useState('bookmarks');
    const [tabFontSize, setTabFontSize] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackController, setPlaybackController] = useState(null);
    const [activeTabIndex, setActiveTabIndex] = useState(-1);
    const [isEditingTab, setIsEditingTab] = useState(false);
    const [showScalesInfo, setShowScalesInfo] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const textareaRef = useRef(null);

    const insertSymbol = (symbol) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = localTab;
        const newText = text.substring(0, start) + symbol + text.substring(end);
        setLocalTab(newText);
        
        // Mantener el foco y mover el cursor
        setTimeout(() => {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(start + symbol.length, start + symbol.length);
        }, 0);
    };

    // Dynamic states for auto-save
    const [notes, setNotes] = useState(selectedItem?.personal_notes || '');
    const [localTab, setLocalTab] = useState(selectedItem?.practiceTab || '');
    const [localBookmarks, setLocalBookmarks] = useState([]);
    const [localAttachments, setLocalAttachments] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Initial load of complex fields
    useEffect(() => {
        setNotes(selectedItem?.personal_notes || '');
        setLocalTab(selectedItem?.practiceTab || '');
        try {
            setLocalBookmarks(selectedItem?.video_bookmarks ? JSON.parse(selectedItem.video_bookmarks) : []);
        } catch (e) { setLocalBookmarks([]); }
        
        try {
            setLocalAttachments(selectedItem?.attachments ? JSON.parse(selectedItem.attachments) : []);
        } catch (e) { setLocalAttachments([]); }
    }, [selectedItem?.id]);

    // Auto-save logic (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const hasChanged = 
                notes !== (selectedItem?.personal_notes || '') ||
                localTab !== (selectedItem?.practiceTab || '') ||
                JSON.stringify(localBookmarks) !== (selectedItem?.video_bookmarks || '[]') ||
                JSON.stringify(localAttachments) !== (selectedItem?.attachments || '[]');

            if (hasChanged && selectedItem?.id) {
                saveChanges();
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [notes, localTab, localBookmarks, localAttachments]);

    const saveChanges = async () => {
        if (!selectedItem?.id) return;
        setIsSaving(true);
        await patchItem(selectedItem.id, {
            personal_notes: notes,
            practiceTab: localTab,
            video_bookmarks: JSON.stringify(localBookmarks),
            attachments: JSON.stringify(localAttachments)
        });
        setIsSaving(false);
        setLastSaved(new Date());
    };

    const updatePlaybackRate = (rate) => {
        setPlaybackRate(rate);
        if (playerRef.current && playerRef.current.setPlaybackRate) {
            playerRef.current.setPlaybackRate(rate);
        }
    };

    const handlePlayTab = () => {
        if (isPlaying && playbackController) {
            playbackController.stop();
            setIsPlaying(false);
            setActiveTabIndex(-1);
            setPlaybackController(null);
            return;
        }

        if (!localTab) return;
        setIsPlaying(true);
        setActiveTabIndex(0);
        const controller = playTabSequence(localTab, {
            bpm: bpm,
            onStep: (index) => {
                setActiveTabIndex(index);
                const activeElem = document.getElementById(`viewer-tab-token-${index}`);
                if (activeElem) {
                    activeElem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            },
            onComplete: () => {
                setIsPlaying(false);
                setActiveTabIndex(-1);
                setPlaybackController(null);
            }
        });
        setPlaybackController(controller);
    };

    useEffect(() => {
        if (!selectedItem || !selectedItem.youtubeId || isTikTokUrl(selectedItem.youtubeId)) return;

        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) {
                console.error("Error destroying player", e);
            }
            playerRef.current = null;
        }

        const attachPlayer = () => {
            if (!window.YT || !window.YT.Player || !selectedItem?.id) return;
            const container = document.getElementById(`yt-player-${selectedItem.id}`);
            if (!container) return;

            playerRef.current = new window.YT.Player(`yt-player-${selectedItem.id}`, {
                events: {
                    'onReady': (event) => {
                        event.target.setPlaybackRate(playbackRate);
                    }
                }
            });
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const existingCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (existingCallback) existingCallback();
                attachPlayer();
            };
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            setTimeout(attachPlayer, 100);
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) { }
                playerRef.current = null;
            }
        };
    }, [selectedItem?.id, selectedItem?.youtubeId]);

    const handleBookmarkClick = (seconds) => {
        if (!selectedItem?.id || isTikTokUrl(selectedItem?.youtubeId)) return;
        
        if (playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(seconds, true);
            playerRef.current.playVideo();
        } else {
            const iframe = document.getElementById(`yt-player-${selectedItem.id}`);
            if (iframe) {
                const vid = getYouTubeId(selectedItem.youtubeId);
                iframe.src = `https://www.youtube.com/embed/${vid}?autoplay=1&enablejsapi=1&start=${seconds}`;
            }
        }
    };

    const addMarker = () => {
        if (!playerRef.current || !playerRef.current.getCurrentTime) return;
        const totalSeconds = Math.floor(playerRef.current.getCurrentTime());
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const newMarker = {
            time: timeStr,
            seconds: totalSeconds,
            title: `Nuevo marcador a las ${timeStr}`
        };
        
        setLocalBookmarks(prev => [...prev, newMarker].sort((a, b) => a.seconds - b.seconds));
        setActiveTab('bookmarks');
    };

    const deleteMarker = (index) => {
        setLocalBookmarks(prev => prev.filter((_, i) => i !== index));
    };

    const addLink = () => {
        setIsLinkModalOpen(true);
    };

    const deleteAttachment = (index) => {
        setLocalAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('action', 'update_lesson');
        formData.append('id', selectedItem?.id);
        formData.append('user_id', selectedItem?.user_id);
        formData.append('attachment_files[]', file);
        formData.append('attachments', JSON.stringify(localAttachments)); // Para mantener los actuales

        try {
            setIsSaving(true);
            const res = await fetch('backend/api_harphub.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                if (data.attachments) setLocalAttachments(data.attachments);
                // Trigger refresh en App.jsx para que el resto de componentes se enteren
                if (selectedItem?.id) patchItem(selectedItem.id, {}); 
            } else {
                alert("Error al subir archivo: " + (data.error || "Desconocido"));
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const hasBookmarks = localBookmarks.length > 0;
    const hasAttachments = localAttachments.length > 0;
    const hasTab = !!selectedItem?.practiceTab;

    if (!selectedItem) return null;

    return (
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 pb-10">
            <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 pb-4 border-b border-slate-800/50">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setSelectedItem(null)} className="flex items-center gap-3 text-slate-400 hover:text-white transition group">
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition shadow-sm">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Repertorio</span>
                        </button>
                        
                        {/* Status de Autoguardado */}
                        <div className="flex items-center gap-2">
                            {isSaving ? (
                                <span className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                                    <Save size={12} /> Guardando...
                                </span>
                            ) : lastSaved ? (
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Cambios guardados {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-4">
                        {selectedItem.title}
                        {selectedItem.gpFile && <span className="text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-1 rounded lowercase tracking-wider transform -translate-y-1">.gp</span>}
                        {selectedItem.completed ? <Star className="text-amber-500 fill-amber-500" size={24} /> : null}
                    </h2>
                </div>
                <div className="flex gap-3">
                    {!selectedItem.completed && (
                        <button 
                            onClick={async () => {
                                await patchItem(selectedItem.id, { completed: 1 });
                                if (addPoints) addPoints(50);
                                if (unlockAchievement) unlockAchievement('first_lesson');
                            }} 
                            className="px-6 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 hover:scale-105 transition font-black text-xs uppercase tracking-widest gap-2"
                        >
                            <Star size={16} fill="currentColor" /> Completar Lección
                        </button>
                    )}
                    <button onClick={() => openEditModal(selectedItem)} className="px-4 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition font-bold text-sm gap-2">
                        <Edit3 size={16} /> Configuración
                    </button>
                    {onShowTour && (
                        <button onClick={onShowTour} title="Ver Tutorial" className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-500 transition border border-slate-800 hover:border-blue-500/50 shadow-sm">
                            <Info size={16} />
                        </button>
                    )}
                    <button onClick={() => deleteItem(selectedItem.id)} className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 transition">
                        <Trash2 size={16} />
                    </button>
                </div>
            </header>

            <div className="flex flex-col xl:flex-row gap-8 transition-all duration-500">
                <div className={`flex-1 min-w-0 space-y-6 transition-all duration-500 ${isEditingTab ? 'xl:w-[45%]' : 'xl:w-[70%]'}`}>
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                        {selectedItem.gpFile ? (
                            <div className="w-full bg-slate-100 relative h-[600px] lg:h-[800px] max-h-[90vh]">
                                <AlphaTabPlayer fileUrl={selectedItem.gpFile} />
                            </div>
                        ) : selectedItem.youtubeId ? (
                            <div className="w-full h-full flex flex-col">
                                <div className="bg-black w-full relative shrink-0" style={{ height: isTikTokUrl(selectedItem.youtubeId) ? '700px' : 'auto', aspectRatio: isTikTokUrl(selectedItem.youtubeId) ? 'auto' : '16/9' }} id="yt-container">
                                    {isTikTokUrl(selectedItem.youtubeId) ? (
                                        <iframe src={`https://www.tiktok.com/embed/v2/${getTikTokId(selectedItem.youtubeId)}`} width="100%" height="100%" frameBorder="0" allow="fullscreen" className="rounded-t-[2.5rem]"></iframe>
                                    ) : (
                                        <iframe id={`yt-player-${selectedItem.id}`} width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(selectedItem.youtubeId)}?enablejsapi=1&origin=${window.location.origin}`} frameBorder="0" allowFullScreen></iframe>
                                    )}
                                    
                                    {/* Botón flotante para añadir marcador */}
                                    {!isTikTokUrl(selectedItem.youtubeId) && (
                                        <button 
                                            onClick={addMarker}
                                            className="absolute bottom-6 right-6 bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-xl shadow-amber-500/30 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 z-10 font-black flex items-center gap-3"
                                        >
                                            <MapPin size={20} fill="currentColor" />
                                            <span className="text-xs uppercase tracking-widest">Marcar Punto</span>
                                        </button>
                                    )}
                                </div>
                                {!isTikTokUrl(selectedItem.youtubeId) && (
                                    <div className="flex items-center gap-2 p-4 bg-slate-950/50 border-t border-slate-800 shrink-0 overflow-x-auto custom-scrollbar">
                                        <Gauge size={14} className="text-slate-500 ml-2 shrink-0" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2 shrink-0">Velocidad:</span>
                                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                            <button key={rate} onClick={() => updatePlaybackRate(rate)} className={`py-1.5 px-3 text-[10px] font-bold rounded-xl transition whitespace-nowrap ${playbackRate === rate ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                                {rate}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center p-8 relative">
                                <Music size={64} className="mb-6 text-emerald-500 opacity-20" />
                                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-[0.2em] opacity-80">Tablatura Local / Ejercicio</h3>
                                {selectedItem.practiceTab ? (
                                    <div className="w-full overflow-y-auto custom-scrollbar flex flex-wrap gap-x-4 gap-y-2 items-center justify-center p-4">
                                        {selectedItem.practiceTab.split(/[\s,]+/).filter(t => t).map((token, idx) => (
                                            <span 
                                                key={idx}
                                                id={`viewer-tab-token-${idx}`}
                                                style={{ fontSize: `${tabFontSize}px` }}
                                                className={`font-black tracking-widest transition-all duration-300 ${activeTabIndex === idx ? 'text-blue-400 scale-125 tab-glow' : 'text-blue-100/90'}`}
                                            >
                                                {token}
                                            </span>
                                        ))}
                                        <button 
                                            onClick={handlePlayTab}
                                            className={`absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isPlaying ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-110' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-110'}`}
                                        >
                                            {isPlaying ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-slate-500">{selectedItem.description}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex flex-col gap-6 shrink-0 relative transition-all duration-500 ${isEditingTab ? 'xl:w-[55%]' : 'xl:w-96'}`}>
                    <div className="sticky top-6 flex flex-col gap-6 h-full max-h-[85vh]">
                        <div className="flex gap-2 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-inner shrink-0 justify-around" id="tour-viewer-tabs">
                            <button id="tour-viewer-tab-bookmarks" onClick={() => setActiveTab('bookmarks')} title="Marcadores" className={`flex items-center justify-center w-12 h-12 rounded-xl transition ${activeTab === 'bookmarks' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                                <Bookmark size={20} fill={activeTab === 'bookmarks' ? "currentColor" : "none"} />
                            </button>
                            <button id="tour-viewer-tab-attachments" onClick={() => setActiveTab('attachments')} title="Archivos" className={`flex items-center justify-center w-12 h-12 rounded-xl transition ${activeTab === 'attachments' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                                <FileText size={20} />
                            </button>
                            <button id="tour-viewer-tab-sea" onClick={() => setActiveTab('tab')} title="Tablaturas" className={`flex items-center justify-center w-12 h-12 rounded-xl transition ${activeTab === 'tab' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                                <Type size={20} />
                            </button>
                            <button id="tour-viewer-tab-notes" onClick={() => setActiveTab('notes')} title="Notas" className={`flex items-center justify-center w-12 h-12 rounded-xl transition ${activeTab === 'notes' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                                <BookOpen size={20} />
                            </button>
                            <button id="tour-viewer-tab-info" onClick={() => setActiveTab('info')} title="Información" className={`flex items-center justify-center w-12 h-12 rounded-xl transition ${activeTab === 'info' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                                <Info size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl flex-1 overflow-hidden flex flex-col relative min-h-[450px]">
                            {activeTab === 'bookmarks' && (
                                <div className="p-6 flex flex-col h-full absolute inset-0">
                                    <div className="flex justify-between items-center mb-4 shrink-0">
                                        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={14} /> Marcadores de Tiempo
                                        </h3>
                                        <button onClick={addMarker} className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2 pb-6">
                                        {localBookmarks.length > 0 ? localBookmarks.map((bm, i) => (
                                            <div key={i} className="group relative">
                                                <button onClick={() => handleBookmarkClick(bm.seconds)} className="w-full text-left bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl transition flex items-start gap-3">
                                                    <span className="text-xs font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded inline-block whitespace-nowrap border border-amber-500/20 shadow-sm">{bm.time}</span>
                                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white mt-0.5 line-clamp-2 leading-snug">{bm.title}</span>
                                                </button>
                                                <button 
                                                    onClick={() => deleteMarker(i)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg scale-0 group-hover:scale-100"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center opacity-30 p-8">
                                                <Bookmark size={48} className="mb-4" />
                                                <p className="text-xs font-bold uppercase tracking-widest">No hay marcadores aún</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'attachments' && (
                                <div className="p-6 flex flex-col h-full absolute inset-0 bg-slate-900">
                                    <div className="flex justify-between items-center mb-6 shrink-0">
                                        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin size={14} /> Material & Enlaces
                                        </h3>
                                        <div className="flex gap-2">
                                            <button onClick={addLink} className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition">
                                                <LinkIcon size={16} />
                                            </button>
                                            <label className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition cursor-pointer">
                                                <Plus size={16} />
                                                <input type="file" className="hidden" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 pb-6 space-y-3">
                                        {localAttachments.length > 0 ? localAttachments.map((at, i) => (
                                            <div key={i} className="group relative">
                                                {at.type === 'lesson_link' ? (
                                                    <button 
                                                        onClick={() => {
                                                            const targetLesson = items.find(item => item.id === at.lessonId);
                                                            if (targetLesson) setSelectedItem(targetLesson);
                                                        }}
                                                        className="flex items-center justify-between w-full bg-blue-600/10 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-sm hover:bg-blue-600/20 transition-all text-left"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-600/20">
                                                                <BookOpen size={20} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{at.title}</p>
                                                                <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black">Lección Vinculada</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-blue-500" />
                                                    </button>
                                                ) : (
                                                    <a href={at.type === 'file' ? `http://localhost/harphub/${at.url}` : at.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm hover:border-blue-500/30 transition-all">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${at.type === 'file' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                                {at.type === 'file' ? <FileText size={20} /> : <LinkIcon size={20} />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">{at.title}</p>
                                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{at.type === 'file' ? 'Documento' : 'Enlace'}</p>
                                                            </div>
                                                        </div>
                                                        <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-500" />
                                                    </a>
                                                )}
                                                <button 
                                                    onClick={() => deleteAttachment(i)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg scale-0 group-hover:scale-100"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center opacity-30 p-8">
                                                <FileText size={48} className="mb-4" />
                                                <p className="text-xs font-bold uppercase tracking-widest">Sin archivos o enlaces</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tab' && (
                                <div className="p-3 lg:p-6 flex flex-col h-full absolute inset-0 bg-slate-900">
                                    <div className="flex justify-between items-center gap-1 mb-4 shrink-0 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/50">
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                                                <Type size={16} />
                                            </div>
                                            <button 
                                                onClick={() => setIsMaximized(!isMaximized)}
                                                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition"
                                                title={isMaximized ? "Minimizar" : "Pantalla Completa"}
                                            >
                                                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/5 flex-1 justify-end">
                                            {isEditingTab && (
                                                <div className="flex items-center gap-1 mr-1 pr-1 border-r border-slate-800">
                                                    <SEAMeasureMonitor text={localTab} size="w-2 h-2" />
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-1">
                                                {isEditingTab && (
                                                    <>
                                                        <button onClick={() => setIsLibraryOpen(true)} title="Cargar desde Archivo"
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-amber-500 transition-all active:scale-90"><History size={14} /></button>
                                                        <button onClick={async () => {
                                                                if (!localTab.trim()) return;
                                                                const name = prompt("Nombre para esta tablatura:", selectedItem?.title || "Nueva Tablatura");
                                                                if (name) {
                                                                    await addItem({ title: name, practiceTab: localTab, category: selectedItem?.category || 'daily', youtubeId: '' });
                                                                    alert("Guardado en el Archivo!");
                                                                }
                                                            }} title="Guardar como nueva Tablatura"
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-emerald-500 transition-all active:scale-90"><Plus size={14} /></button>
                                                        <div className="w-px h-4 bg-slate-800 mx-1" />
                                                    </>
                                                )}
                                                
                                                <button onClick={() => setIsEditingTab(!isEditingTab)} title={isEditingTab ? "Ver Tablatura" : "Editar Tablatura"}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 ${isEditingTab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}><Edit3 size={14} /></button>
                                                
                                                <div className="w-px h-4 bg-slate-800 mx-1" />
                                                
                                                <div className="flex items-center bg-slate-900/50 rounded-lg p-0.5 border border-slate-800">
                                                    <button onClick={() => setTabFontSize(Math.max(12, tabFontSize - 2))} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-500 transition-colors"><ChevronLeft size={12} /></button>
                                                    <span className="text-[9px] font-black text-slate-400 w-6 text-center">{tabFontSize}</span>
                                                    <button onClick={() => setTabFontSize(Math.min(100, tabFontSize + 2))} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-500 transition-colors"><ChevronRight size={12} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 pb-6">
                                        <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm shadow-inner min-h-full relative group flex flex-col">
                                            {isLibraryOpen ? (
                                                <div className="absolute inset-0 z-50 bg-slate-900 overflow-hidden rounded-[2rem]">
                                                    <SEATabLibrary 
                                                        items={items} 
                                                        onClose={() => setIsLibraryOpen(false)}
                                                        onSelect={(item) => {
                                                            setLocalTab(item.practiceTab);
                                                            setIsLibraryOpen(false);
                                                        }}
                                                    />
                                                </div>
                                            ) : isEditingTab ? (
                                                <div className="flex-1 flex flex-col min-h-0">
                                                    <div className="flex-1 bg-slate-900/60 rounded-[1.5rem] border border-slate-800/50 shadow-inner relative flex flex-col min-h-0 overflow-hidden">
                                                        <div className="absolute top-3 right-4 flex items-center gap-2 pointer-events-none opacity-40">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Editor SEA</span>
                                                        </div>
                                                        <textarea 
                                                            ref={textareaRef}
                                                            value={localTab}
                                                            onChange={(e) => setLocalTab(e.target.value)}
                                                            placeholder="Ingresa la tablatura usando SEA (ej: -3'q~ 4e)"
                                                            className="flex-1 bg-transparent text-center font-black tracking-[0.1em] text-blue-100 outline-none resize-none custom-scrollbar p-6"
                                                            style={{ fontSize: `${tabFontSize}px`, lineHeight: '1.6' }}
                                                        />
                                                    {/* TECLADO VIRTUAL SEA COMPARTIDO */}
                                                    <SEAVirtualKeyboard onInsert={insertSymbol} />
                                                </div>
                                            </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-x-6 gap-y-8 items-center justify-center py-10">
                                                    {localTab.split(/[\s,]+/).filter(t => t).map((rawToken, idx) => {
                                                        const p = parseSEAToken(rawToken);
                                                        return (
                                                            <div 
                                                                key={idx}
                                                                id={`viewer-tab-token-${idx}`}
                                                                style={{ minWidth: `${tabFontSize * 1.5}px` }}
                                                                className={`relative flex flex-col items-center justify-center transition-all duration-300 ${activeTabIndex === idx ? 'scale-125' : 'opacity-90'}`}
                                                            >
                                                                <div className="relative flex items-center">
                                                                    {p.prefix && <span className="text-slate-600 text-base -mr-1">{p.prefix}</span>}
                                                                    <div className="relative">
                                                                        <span className={`font-black tracking-tighter ${activeTabIndex === idx ? 'text-blue-400 tab-glow' : 'text-white'}`} style={{ fontSize: `${tabFontSize}px` }}>
                                                                            {p.body}
                                                                        </span>
                                                                        {p.bend && (
                                                                            <span className="absolute -top-3 -right-2 text-indigo-400 font-black text-sm tracking-tighter">
                                                                                {p.bend}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {p.suffix && <span className="text-slate-600 text-base -ml-1">{p.suffix}</span>}
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    {p.duration && (
                                                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 rounded-md border border-emerald-500/20 uppercase tracking-tighter">
                                                                            {p.duration}
                                                                        </span>
                                                                    )}
                                                                    {p.expression && (
                                                                        <span className="text-[10px] font-black text-amber-500 animate-pulse">
                                                                            {p.expression}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <button 
                                                onClick={handlePlayTab}
                                                className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 hover:scale-110 ${isPlaying ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                                            >
                                                {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center mt-4 mb-2 shrink-0">
                                            <button onClick={() => setShowScalesInfo(true)} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest transition active:scale-95 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 shadow-sm">
                                                <Info size={12} /> Escalas de Referencia
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FULLSCREEN OVERLAY FOR TAB EDITOR - Using Portal to beat Sidebar z-index */}
                            {isMaximized && createPortal(
                                <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col p-4 lg:p-10 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex justify-between items-center mb-6 lg:mb-10 shrink-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                <Edit3 size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-xl lg:text-3xl font-black text-white tracking-tight italic uppercase leading-none truncate">Editor SEA</h2>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5 truncate">{selectedItem?.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 lg:gap-4">
                                            <SEAMeasureMonitor text={localTab} size="w-3 lg:w-4 h-3 lg:h-4" />
                                            <div className="w-px h-8 bg-slate-800 mx-1 lg:mx-2" />
                                            <button 
                                                onClick={() => setIsMaximized(false)}
                                                className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center border border-slate-800 hover:text-white transition active:scale-90 shadow-xl"
                                            >
                                                <Minimize2 size={24} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col gap-8 min-h-0">
                                        <div className="flex-1 bg-slate-900/40 rounded-[3rem] border border-white/5 shadow-inner overflow-hidden relative flex flex-col">
                                            <textarea 
                                                ref={textareaRef}
                                                value={localTab}
                                                onChange={(e) => setLocalTab(e.target.value)}
                                                placeholder="Ingresa la tablatura usando SEA..."
                                                className="w-full h-full bg-transparent text-center font-black tracking-[0.1em] text-blue-100 outline-none resize-none custom-scrollbar p-12 lg:p-20 leading-relaxed"
                                                style={{ fontSize: `${tabFontSize * 1.5}px` }}
                                            />
                                            
                                            <div className="absolute bottom-8 left-8">
                                                <button onClick={() => setShowScalesInfo(true)} className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-blue-400 px-4 py-3 rounded-xl transition shadow-xl active:scale-95">
                                                    <Info size={16} />
                                                    <span className="text-xs uppercase font-black tracking-widest">Escalas de Referencia</span>
                                                </button>
                                            </div>
                                            
                                            <div className="absolute bottom-8 right-8 flex gap-3">
                                                <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-700 shadow-xl">
                                                    <button onClick={() => setTabFontSize(Math.max(12, tabFontSize - 4))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"><ChevronLeft size={16} /></button>
                                                    <span className="text-sm font-black text-slate-300 w-10 text-center">{tabFontSize}</span>
                                                    <button onClick={() => setTabFontSize(Math.min(100, tabFontSize + 4))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"><ChevronRight size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="shrink-0 flex flex-col gap-6">
                                            <SEAVirtualKeyboard onInsert={insertSymbol} />
                                            
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={handlePlayTab}
                                                    className={`flex-1 flex items-center justify-center gap-4 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${isPlaying ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02]' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20 hover:scale-[1.02]'}`}
                                                >
                                                    {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />} {isPlaying ? 'Detener Reproducción' : 'Escuchar Interpretación'}
                                                </button>
                                                <button 
                                                    onClick={saveChanges}
                                                    className="bg-emerald-600 shadow-xl text-white hover:bg-emerald-500 px-16 rounded-[2rem] font-black transition-all active:scale-95 border border-emerald-500/20"
                                                >
                                                    <Save size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>,
                                document.body
                            )}

                            {activeTab === 'notes' && (
                                <div className="p-6 flex flex-col h-full absolute inset-0 bg-slate-900">
                                    <div className="flex justify-between items-center mb-4 shrink-0">
                                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen size={14} /> Diario de Práctica
                                        </h3>
                                        <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase">
                                            Autoguardado On
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <textarea 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Escribe tus apuntes, progresos o dudas aquí..."
                                            className="w-full h-full bg-slate-950/50 border border-slate-800 rounded-[2rem] p-6 text-sm font-medium text-slate-300 leading-relaxed outline-none focus:ring-2 ring-emerald-500/30 transition-all placeholder:text-slate-700 resize-none custom-scrollbar"
                                        />
                                    </div>
                                    <div className="mt-4 p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Descripción Original</p>
                                        <p className="text-xs text-slate-400 italic line-clamp-2">{selectedItem.description || 'Sin descripción'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="p-6 flex flex-col h-full absolute inset-0 bg-slate-900 overflow-y-auto custom-scrollbar">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 shrink-0">
                                        <Info size={14} /> Datos Técnicos
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">Artista</p>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                                    <Mic2 size={14} className="text-blue-400" /> {selectedItem.artist || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">Tono</p>
                                                <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase">
                                                    <Music size={14} /> {selectedItem.harmonica_key || 'C'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-slate-950/50 p-5 rounded-[2rem] border border-slate-800/50">
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-4">Dificultad de la Lección</p>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <div key={s} className={`flex-1 h-2 rounded-full ${selectedItem.difficulty >= s ? "bg-amber-500" : "bg-slate-800"}`} />
                                                ))}
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-[8px] font-black text-slate-600 uppercase">Principiante</span>
                                                <span className="text-[8px] font-black text-slate-600 uppercase">Pro</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Categoría</span>
                                                <span className="text-[10px] font-black text-white bg-slate-800 px-3 py-1 rounded-full uppercase">
                                                    {CATEGORIES.find(c => c.id === selectedItem.category)?.name || selectedItem.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Duración</span>
                                                <span className="text-[10px] font-black text-slate-300">{selectedItem.duration || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 mt-12 border-t border-slate-800/50">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Lecciones Relacionadas</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredItems.filter(i => i.id !== selectedItem.id).slice(0, 4).map(item => (
                        <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 cursor-pointer hover:border-blue-500 transition group shadow-lg">
                            <div className="aspect-video bg-slate-950 rounded-xl mb-3 overflow-hidden relative border border-slate-800 shadow-inner">
                                {item.youtubeId && !isTikTokUrl(item.youtubeId) && getYouTubeId(item.youtubeId).length === 11 ? (
                                    <img 
                                        src={`https://img.youtube.com/vi/${getYouTubeId(item.youtubeId)}/hqdefault.jpg`} 
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" 
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800"><Music size={32} className="text-blue-500 opacity-50" /></div>
                                )}
                            </div>
                            <h4 className="font-bold text-white text-xs truncate">{item.title}</h4>
                            <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-widest">{item.category}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL DE ESCALAS DE REFERENCIA */}
            {showScalesInfo && createPortal(
                <div className="fixed inset-0 z-[11000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl relative">
                        <button onClick={() => setShowScalesInfo(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 z-10">
                            <X size={18} />
                        </button>
                        <SharedScalesPanel 
                            className="bg-transparent border-none shadow-none p-0" 
                            titleSize="text-xl" 
                            iconSize={24} 
                            titleMargin="mb-8"
                            titlePadding="pb-4"
                        />
                    </div>
                </div>,
                document.body
            )}
            <LessonLinkModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                items={items}
                currentLessonId={selectedItem.id}
                onAddLink={(title, url) => {
                    setLocalAttachments(prev => [...prev, { type: 'link', title, url }]);
                    setActiveTab('attachments');
                    setIsLinkModalOpen(false);
                }}
                onAddLesson={(lesson) => {
                    setLocalAttachments(prev => [...prev, { 
                        type: 'lesson_link', 
                        title: lesson.title, 
                        lessonId: lesson.id 
                    }]);
                    setActiveTab('attachments');
                    setIsLinkModalOpen(false);
                }}
            />
        </div>
    );
};

// --- Modal para Enlaces y Vinculación Interna ---
function LessonLinkModal({ isOpen, onClose, items, currentLessonId, onAddLink, onAddLesson }) {
    const [tab, setTab] = useState('external'); // 'external' o 'internal'
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const filteredLessons = items.filter(i => 
        i.id !== currentLessonId && 
        (i.title.toLowerCase().includes(search.toLowerCase()) || 
         i.artist?.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 5);

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                            <LinkIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">Vincular Material</h2>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Enriquecer esta lección</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"><X size={18} /></button>
                </div>

                {/* Tabs de Selección */}
                <div className="flex gap-2 p-1.5 bg-slate-950/50 rounded-2xl border border-white/5 mb-8">
                    <button 
                        onClick={() => setTab('external')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'external' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Enlace Externo
                    </button>
                    <button 
                        onClick={() => setTab('internal')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === 'internal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                        Lección Interna
                    </button>
                </div>

                <div className="space-y-6">
                    {tab === 'external' ? (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-2">Título del Enlace</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Teoría de Bending PDF"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-2">URL (Destino)</label>
                                    <input 
                                        type="text" 
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (title && url) onAddLink(title, url);
                                }}
                                className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!title || !url}
                            >
                                Vincular URL
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar lección por título o autor..."
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:border-indigo-500 outline-none transition"
                                    />
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {filteredLessons.length > 0 ? filteredLessons.map(lesson => (
                                        <button 
                                            key={lesson.id}
                                            onClick={() => onAddLesson(lesson)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-transparent hover:border-indigo-500/50 hover:bg-indigo-500/5 transition group text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{lesson.title}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lesson.artist || 'Sin Autor'}</p>
                                            </div>
                                            <Plus className="ml-auto text-slate-700 group-hover:text-indigo-500" size={16} />
                                        </button>
                                    )) : (
                                        <div className="py-12 text-center opacity-20">
                                            <Search size={48} className="mx-auto mb-4" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">No se encontraron lecciones</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LessonViewer;
