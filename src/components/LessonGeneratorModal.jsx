import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Video, Clock, Trash2, Disc, Music, Star, Save,
    Gauge, MapPin, FileText, Link as LinkIcon, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import { INSTRUMENTS, getYouTubeId, isTikTokUrl, getTikTokId } from '../utils/constants';

const LessonGeneratorModal = ({
    setIsAdding, editingLessonId, selectedItem,
    newLessonType, setNewLessonType,
    newLessonDifficulty, setNewLessonDifficulty,
    newLessonKey, setNewLessonKey,
    newVideoTimestamp, setNewVideoTimestamp,
    newLessonBookmarks, setNewLessonBookmarks,
    newLessonNotes, setNewLessonNotes,
    tabContent, setTabContent,
    newLessonAttachments, setNewLessonAttachments,
    newLessonDuration, setNewLessonDuration,
    newLessonCompleted, setNewLessonCompleted,
    newLessonTitle, setNewLessonTitle,
    newLessonArtist, setNewLessonArtist,
    newLessonCategory, setNewLessonCategory,
    newLessonInstrument, setNewLessonInstrument,
    newLessonYoutubeId, setNewLessonYoutubeId,
    newLessonWorkspaceConfig, setNewLessonWorkspaceConfig,
    addItem, collections = []
}) => {
    const [newAttachmentLink, setNewAttachmentLink] = useState({ title: '', url: '' });
    const [mobileTab, setMobileTab] = useState('media'); // 'media' | 'meta' | 'notes'
    const playerRef = useRef(null);
    const [ytReady, setYtReady] = useState(false);
    
    // El previewId ahora viene directamente del estado global
    const previewId = isTikTokUrl(newLessonYoutubeId) ? newLessonYoutubeId : getYouTubeId(newLessonYoutubeId);

    // Automatic metadata fetching (Title and Artist)
    useEffect(() => {
        if (!newLessonYoutubeId || editingLessonId) return; // Don't overwrite if editing

        const fetchMetadata = async () => {
            try {
                let fetchUrl = '';
                if (isTikTokUrl(newLessonYoutubeId)) {
                    fetchUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(newLessonYoutubeId)}`;
                } else {
                    const ytId = getYouTubeId(newLessonYoutubeId);
                    if (ytId) {
                        fetchUrl = `https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytId}`)}`;
                    }
                }

                if (fetchUrl) {
                    const res = await fetch(fetchUrl);
                    const data = await res.json();
                    
                    // Solo autocompletar si los campos están vacíos
                    if (data.title && !newLessonTitle) {
                        // Clean titles (remove | YouTube, etc if needed, but let's keep it simple)
                        setNewLessonTitle(data.title);
                    }
                    if (data.author_name && !newLessonArtist) {
                        setNewLessonArtist(data.author_name);
                    }
                }
            } catch (e) {
                console.warn("Could not fetch video metadata:", e);
            }
        };

        const timer = setTimeout(fetchMetadata, 800); // Debounce to wait for full paste
        return () => clearTimeout(timer);
    }, [newLessonYoutubeId, editingLessonId]);

    useEffect(() => {
        let retryInterval = null;
        setYtReady(false);

        const attachPlayer = () => {
            const container = document.getElementById('yt-preview-player');
            if (!container || !window.YT || !window.YT.Player) return false;

            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (e) {}
                playerRef.current = null;
            }

            console.log("Attaching YouTube Player for ID:", previewId);
            playerRef.current = new window.YT.Player('yt-preview-player', {
                videoId: previewId,
                height: '100%',
                width: '100%',
                playerVars: { 
                    enablejsapi: 1, 
                    origin: window.location.origin,
                    widget_referrer: window.location.origin,
                    rel: 0,
                    modestbranding: 1
                },
                events: { 
                    onReady: (event) => {
                        console.log("YouTube Player Ready");
                        setYtReady(true);
                        if (event.target.getDuration && !newLessonDuration) {
                            const duration = Math.floor(event.target.getDuration());
                            if (duration > 0) {
                                const m = Math.floor(duration / 60);
                                const s = duration % 60;
                                setNewLessonDuration(`${m}:${s.toString().padStart(2, '0')}`);
                            }
                        }
                    }, 
                    onStateChange: (event) => {
                        // Opcional: manejar cambios de estado
                    },
                    onError: (e) => {
                        console.error("YouTube Player Error:", e);
                        setYtReady(false);
                    }
                }
            });
            return true;
        };

        if (mobileTab === 'media' && previewId && !isTikTokUrl(newLessonYoutubeId)) {
            // Asegurar que la API esté cargada
            if (!window.YT || !window.YT.Player) {
                if (!document.getElementById('yt-api-script')) {
                    const tag = document.createElement('script');
                    tag.id = 'yt-api-script';
                    tag.src = 'https://www.youtube.com/iframe_api';
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                }
            }

            // Intentar vincular inmediatamente o reintentar hasta que el DOM esté listo
            if (!attachPlayer()) {
                retryInterval = setInterval(() => {
                    if (attachPlayer()) clearInterval(retryInterval);
                }, 300);
            }
        }

        return () => {
            if (retryInterval) clearInterval(retryInterval);
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (e) {}
                playerRef.current = null;
            }
        };
    }, [previewId, newLessonType, mobileTab, newLessonYoutubeId]);

    const handlePinTime = () => {
        if (playerRef.current?.getCurrentTime) {
            const t = Math.floor(playerRef.current.getCurrentTime());
            const timeStr = `${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;
            setNewVideoTimestamp({ title: newVideoTimestamp.title.trim() || `Marcador @ ${timeStr}`, time: timeStr });
        }
    };
    const setPlaybackRate = (rate) => { if (playerRef.current?.setPlaybackRate) playerRef.current.setPlaybackRate(rate); };

    const handleSubmit = (e) => {
        e.preventDefault();
        const d = new FormData(e.target);
        let finalBookmarks = [...newLessonBookmarks];
        if (newVideoTimestamp.title && newVideoTimestamp.time && newVideoTimestamp.time !== '00:00') {
            const parts = newVideoTimestamp.time.split(':');
            const secs = parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : parseInt(newVideoTimestamp.time);
            if (!finalBookmarks.some(bm => bm.time === newVideoTimestamp.time && bm.title === newVideoTimestamp.title))
                finalBookmarks.push({ title: newVideoTimestamp.title, time: newVideoTimestamp.time, seconds: secs });
        }
        
        // Sincronizar estados controlados con FormData para el backend
        d.set('title', newLessonTitle);
        d.set('artist', newLessonArtist);
        d.set('category', newLessonCategory);
        d.set('instrument', newLessonInstrument);
        d.set('youtubeId', previewId); // Guardar el ID limpio o la URL de TikTok
        d.set('difficulty', newLessonDifficulty);
        d.set('harmonica_key', newLessonKey);
        d.set('video_bookmarks', JSON.stringify(finalBookmarks));
        d.set('personal_notes', newLessonNotes);
        d.set('practiceTab', tabContent);
        d.set('attachments', JSON.stringify(newLessonAttachments));
        d.set('duration', newLessonDuration);
        d.set('completed', newLessonCompleted ? 1 : 0);
        d.set('workspace_config', JSON.stringify(newLessonWorkspaceConfig));
        
        if (newLessonType === 'video') {
            // Keep both if possible, but prioritize ID cleaning
        } else { 
            d.delete('youtubeId'); 
        }
        
        if (editingLessonId) { d.set('action', 'update_lesson'); d.set('id', editingLessonId); }
        else d.set('action', 'add_lesson');
        addItem(d);
    };

    const inputCls = "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:ring-2 ring-blue-500 transition";
    const labelCls = "text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 block";

    // --- SECCIÓN MEDIOS ---
    const mediaSectionContent = (
        <div className="space-y-4">
            <>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="bg-slate-900/80 border border-slate-700/50 rounded-[1.5rem] p-4 shadow-xl">
                        <label className={labelCls + " flex items-center gap-2 mb-2"}>
                            <Video size={12} className="text-blue-500" /> URL o ID del Video
                        </label>
                        <div className="flex gap-2" id="tour-gen-url-input">
                            <input
                                name="youtubeId"
                                value={newLessonYoutubeId}
                                placeholder="https://www.youtube.com/watch?v=..."
                                required
                                onChange={(e) => setNewLessonYoutubeId(e.target.value)}
                                className={inputCls + " !py-2.5 !px-3 font-mono text-xs"}
                            />
                            {newLessonYoutubeId && !ytReady && (
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setYtReady(false);
                                        const event = new CustomEvent('force-yt-reload');
                                        window.dispatchEvent(event);
                                    }}
                                    className="bg-blue-600 text-white px-3 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
                                >
                                    Cargar
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {previewId && (
                        <div className={`mx-auto bg-slate-950 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-inner relative group ${isTikTokUrl(previewId) ? 'w-[320px]' : 'w-full max-w-[622px]'}`}>
                            <div key={isTikTokUrl(previewId) ? 'tiktok-container' : 'youtube-container'} className={`relative bg-black flex items-center justify-center transition-all ${isTikTokUrl(previewId) ? 'h-[480px]' : 'aspect-video'}`}>
                                {isTikTokUrl(previewId)
                                    ? <iframe key="tiktok-frame" src={`https://www.tiktok.com/embed/v2/${getTikTokId(previewId)}`} className="w-full h-full" frameBorder="0" allow="fullscreen" />
                                    : <div key="youtube-el" id="yt-preview-player" className="w-full h-full" />
                                }
                                {!ytReady && !isTikTokUrl(previewId) && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
                                        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mb-3" />
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Sincronizando Player...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {previewId && !isTikTokUrl(newLessonYoutubeId) && (
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${ytReady ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {ytReady ? '✓ Video Sincronizado' : '⌛ Pendiente...'}
                                </span>
                            </div>
                            {ytReady && (
                                <div className="flex items-center gap-1.5">
                                    <Gauge size={10} className="text-slate-600" />
                                    {[0.75, 1, 1.25].map(rate => (
                                        <button key={rate} type="button" onClick={() => setPlaybackRate(rate)}
                                            className="px-2 py-0.5 text-[9px] font-black rounded bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition">
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {!previewId && newLessonYoutubeId && (
                        <p className="text-[10px] font-bold mt-2 text-red-500 uppercase tracking-tight">
                            ⚠ ID o URL de video no válido
                        </p>
                    )}
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={14} className="text-amber-500" />
                        <h3 className="text-sm font-black text-white">Bookmarks / Índice</h3>
                    </div>
                    <div className="flex gap-2 mb-3">
                        <input type="text" placeholder="Ej: Ejercicio 1"
                            value={newVideoTimestamp.title}
                            onChange={e => setNewVideoTimestamp({ ...newVideoTimestamp, title: e.target.value })}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 ring-amber-500 outline-none" />
                        <input type="text" placeholder="00:00"
                            value={newVideoTimestamp.time}
                            onChange={e => setNewVideoTimestamp({ ...newVideoTimestamp, time: e.target.value })}
                            className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white focus:ring-2 ring-amber-500 outline-none text-center font-mono" />
                        <button type="button" onClick={handlePinTime}
                            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition ${ytReady ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                            disabled={!ytReady}><MapPin size={14} /></button>
                        <button type="button"
                            onClick={() => {
                                if (newVideoTimestamp.title && newVideoTimestamp.time) {
                                    const parts = newVideoTimestamp.time.split(':');
                                    const secs = parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : parseInt(newVideoTimestamp.time);
                                    setNewLessonBookmarks([...newLessonBookmarks, { title: newVideoTimestamp.title, time: newVideoTimestamp.time, seconds: secs }]);
                                    setNewVideoTimestamp({ title: '', time: '00:00' });
                                }
                            }}
                            className="w-10 h-10 shrink-0 bg-amber-500 text-slate-900 font-bold rounded-xl flex items-center justify-center">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {newLessonBookmarks.length === 0 && <p className="text-xs text-slate-600 italic text-center py-3">Sin marcadores</p>}
                        {newLessonBookmarks.map((bm, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800/40 px-3 py-2.5 rounded-xl border border-white/5 group hover:border-amber-500/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-[10px] font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">{bm.time}</span>
                                    <span className="text-sm font-medium text-slate-300 truncate">{bm.title}</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setNewLessonBookmarks(newLessonBookmarks.filter((_, idx) => idx !== i))} 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition"
                                    title="Eliminar marcador"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-emerald-500" />
                        <h3 className="text-sm font-black text-white">Archivos y Enlaces</h3>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 border-dashed mb-3">
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Subir PDF o Imagen</label>
                        <input type="file" name="attachment_files[]" multiple accept=".pdf,image/*"
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-500/10 file:text-emerald-500" />
                    </div>
                    <div className="flex gap-2 mb-3">
                        <div className="flex-1 space-y-2">
                            <input type="text" placeholder="Título del enlace..."
                                value={newAttachmentLink.title}
                                onChange={e => setNewAttachmentLink({ ...newAttachmentLink, title: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 ring-emerald-500 outline-none" />
                            <input type="text" placeholder="URL (https://...)"
                                value={newAttachmentLink.url}
                                onChange={e => setNewAttachmentLink({ ...newAttachmentLink, url: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 ring-emerald-500 outline-none font-mono" />
                        </div>
                        <button type="button"
                            onClick={() => { if (newAttachmentLink.title && newAttachmentLink.url) { setNewLessonAttachments([...newLessonAttachments, { type: 'link', title: newAttachmentLink.title, url: newAttachmentLink.url }]); setNewAttachmentLink({ title: '', url: '' }); } }}
                            className="bg-emerald-500 text-slate-900 font-bold px-3 rounded-xl self-end h-10"><Plus size={18} /></button>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                        {newLessonAttachments.length === 0 && <p className="text-xs text-slate-600 italic text-center py-2">Sin adjuntos</p>}
                        {newLessonAttachments.map((at, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-800/30 px-3 py-2 rounded-lg">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${at.type === 'file' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {at.type === 'file' ? <FileText size={11} /> : <LinkIcon size={11} />}
                                    </div>
                                    <span className="text-sm text-slate-300 truncate">{at.title}</span>
                                </div>
                                <button type="button" onClick={() => setNewLessonAttachments(newLessonAttachments.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 p-1 shrink-0"><Trash2 size={13} /></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Disc size={14} className="text-blue-500" />
                        <h3 className="text-sm font-black text-white">Archivo Guitar Pro (.gp)</h3>
                    </div>
                    <input 
                        type="file" 
                        name="gpFile_upload" 
                        accept=".gp3,.gp4,.gp5,.gpx,.gp" 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 transition cursor-pointer" 
                    />
                    {editingLessonId && selectedItem?.gpFile && (
                        <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                            ✓ Archivo actual: {selectedItem.gpFile.split('/').pop()}
                        </p>
                    )}
                </div>
            </>
        </div>
    );

    // --- SECCIÓN METADATOS ---
    const metaSectionContent = (
        <div className="space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
                <div>
                    <label className={labelCls}>Título de la lección</label>
                    <input 
                        name="title" 
                        value={newLessonTitle} 
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="Ej: Riff de Chicago Blues" 
                        required 
                        className={inputCls} 
                    />
                </div>
                <div>
                    <label className={labelCls}>Artista / Autor</label>
                    <input 
                        name="artist" 
                        value={newLessonArtist} 
                        onChange={(e) => setNewLessonArtist(e.target.value)}
                        placeholder="Ej: Little Walter" 
                        className={inputCls} 
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>Colección</label>
                        <select 
                            name="category" 
                            value={newLessonCategory} 
                            onChange={(e) => setNewLessonCategory(e.target.value)}
                            className={inputCls + " appearance-none cursor-pointer"}
                        >
                            {collections.map(col => {
                                // Formatting for system collections (legacy categories)
                                const isSystem = ['daily', 'warmup', 'challenge', 'jam', 'riffs', 'groove', 'theory'].includes(col.title);
                                const title = isSystem 
                                    ? (col.title === 'daily' ? 'Práctica Diaria' :
                                       col.title === 'warmup' ? 'Warm Up' :
                                       col.title === 'challenge' ? 'Desafíos' :
                                       col.title === 'jam' ? 'Jams' :
                                       col.title === 'riffs' ? 'Riffs & Licks' :
                                       col.title === 'groove' ? 'Groove' :
                                       col.title === 'theory' ? 'Teoría' : col.title)
                                    : col.title;
                                
                                return <option key={col.id} value={isSystem ? col.title : col.id}>{title}</option>;
                            })}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Instrumento</label>
                        <select 
                            name="instrument" 
                            value={newLessonInstrument} 
                            onChange={(e) => setNewLessonInstrument(e.target.value)}
                            className={inputCls + " appearance-none cursor-pointer"}
                        >
                            {INSTRUMENTS.map(ins => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls + " flex items-center gap-1"}><Music size={11} /> Armónica (Key)</label>
                        <select value={newLessonKey} onChange={e => setNewLessonKey(e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                            <option value="ALL">Todas</option>
                            {['C','A','G','D','F','Bb','E'].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls + " flex items-center gap-1"}><Clock size={11} /> Duración</label>
                        <input type="text" value={newLessonDuration} onChange={e => setNewLessonDuration(e.target.value)} placeholder="5:30" className={inputCls} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${newLessonCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                        <Check size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white">Lección Completada</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Marcar como terminada</p>
                    </div>
                </div>
                <button type="button" onClick={() => setNewLessonCompleted(!newLessonCompleted)}
                    className={`w-12 h-6 rounded-full flex items-center transition-colors ${newLessonCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${newLessonCompleted ? 'translate-x-6' : ''}`} />
                </button>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className={labelCls}>Dificultad</label>
                <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setNewLessonDifficulty(star)}
                            className={`p-2 transition rounded-lg ${newLessonDifficulty >= star ? 'text-amber-500 scale-110' : 'text-slate-700'}`}>
                            <Star fill={newLessonDifficulty >= star ? 'currentColor' : 'none'} size={26} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- SECCIÓN NOTAS ---
    const notesSectionContent = (
        <div className="space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className={labelCls + " flex items-center justify-between"}>
                    <span>Tabs Extra / Ejercicios</span>
                    <span className="text-blue-500 lowercase normal-case tracking-normal text-[10px]">Soporta saltos de línea</span>
                </label>
                <textarea name="practiceTab" value={tabContent} onChange={e => setTabContent(e.target.value)}
                    placeholder="Agrega tablaturas aquí..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm h-40 resize-none outline-none focus:ring-2 ring-blue-500 font-mono tracking-widest text-blue-300 custom-scrollbar" />
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <label className={labelCls}>Notas Personales (Teoría, Tips)</label>
                <textarea value={newLessonNotes} onChange={e => setNewLessonNotes(e.target.value)} name="personal_notes"
                    placeholder="Apunta conceptos teóricos, qué hacer con la lengua, ritmo..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm h-40 resize-none outline-none focus:ring-2 ring-emerald-500 transition text-slate-300 custom-scrollbar" />
            </div>
        </div>
    );

    const mobileTabs = [
        { id: 'media', label: 'Video' },
        { id: 'workspace', label: 'Workspace' },
        { id: 'meta', label: 'Datos' },
        { id: 'notes', label: 'Notas' },
    ];

    const addBlock = (type) => {
        const id = `${type}_${Date.now()}`;
        const titles = {
            video: 'Video & Teoría',
            tab: 'Partitura Interactiva',
            notes: 'Mis Notas',
            blocks: 'SEA Editor',
            practice: 'Herramientas de Práctica',
            links: 'Recursos Extra',
            attachments: 'Archivos'
        };
        const newBlock = { id, type, title: titles[type] || 'Nuevo Bloque', description: '', links: [], attachments: [] };
        setNewLessonWorkspaceConfig({
            ...newLessonWorkspaceConfig,
            webBlocks: [...(newLessonWorkspaceConfig.webBlocks || []), newBlock]
        });
    };

    const removeBlock = (id) => {
        setNewLessonWorkspaceConfig({
            ...newLessonWorkspaceConfig,
            webBlocks: newLessonWorkspaceConfig.webBlocks.filter(b => b.id !== id)
        });
    };

    const updateBlock = (id, updates) => {
        setNewLessonWorkspaceConfig({
            ...newLessonWorkspaceConfig,
            webBlocks: newLessonWorkspaceConfig.webBlocks.map(b => b.id === id ? { ...b, ...updates } : b)
        });
    };

    const moveBlock = (index, direction) => {
        const newBlocks = [...newLessonWorkspaceConfig.webBlocks];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newBlocks.length) return;
        [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
        setNewLessonWorkspaceConfig({ ...newLessonWorkspaceConfig, webBlocks: newBlocks });
    };

    const workspaceSectionContent = (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className={labelCls}>Estructura de la Lección (Bloques)</label>
                <div className="flex gap-2">
                    <select 
                        onChange={(e) => { if(e.target.value) addBlock(e.target.value); e.target.value = ''; }}
                        className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                    >
                        <option value="">+ Añadir Bloque</option>
                        <option value="video">Video</option>
                        <option value="tab">Partitura (GP)</option>
                        <option value="notes">Notas</option>
                        <option value="blocks">SEA Editor</option>
                        <option value="practice">Práctica</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {newLessonWorkspaceConfig.webBlocks?.map((block, idx) => (
                    <div key={block.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Block Header */}
                        <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400">
                                    {idx + 1}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{block.type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => moveBlock(idx, -1)} className="p-1.5 text-slate-500 hover:text-white transition disabled:opacity-20" disabled={idx === 0}>
                                    <Plus size={14} className="rotate-45" />
                                </button>
                                <button type="button" onClick={() => moveBlock(idx, 1)} className="p-1.5 text-slate-500 hover:text-white transition disabled:opacity-20" disabled={idx === newLessonWorkspaceConfig.webBlocks.length - 1}>
                                    <Plus size={14} className="rotate-45" />
                                </button>
                                <button type="button" onClick={() => removeBlock(block.id)} className="ml-2 p-1.5 text-slate-500 hover:text-red-500 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Block Editor */}
                        <div className="p-4 space-y-3">
                            <input 
                                type="text"
                                placeholder="Título del bloque..."
                                value={block.title}
                                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition"
                            />
                            <textarea 
                                placeholder="Descripción o explicación..."
                                value={block.description}
                                onChange={(e) => updateBlock(block.id, { description: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 outline-none focus:border-blue-500/50 transition min-h-[60px]"
                            />
                            
                            {/* Links Mini-Editor */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Links de interés</span>
                                    <button 
                                        type="button"
                                        onClick={() => updateBlock(block.id, { links: [...(block.links || []), { title: '', url: '' }] })}
                                        className="text-[9px] font-black text-blue-500 uppercase"
                                    >
                                        + Agregar Link
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {block.links?.map((link, lIdx) => (
                                        <div key={lIdx} className="flex gap-2">
                                            <input 
                                                type="text"
                                                placeholder="Título"
                                                value={link.title}
                                                onChange={(e) => {
                                                    const newLinks = [...block.links];
                                                    newLinks[lIdx].title = e.target.value;
                                                    updateBlock(block.id, { links: newLinks });
                                                }}
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none"
                                            />
                                            <input 
                                                type="text"
                                                placeholder="URL"
                                                value={link.url}
                                                onChange={(e) => {
                                                    const newLinks = [...block.links];
                                                    newLinks[lIdx].url = e.target.value;
                                                    updateBlock(block.id, { links: newLinks });
                                                }}
                                                className="flex-[2] bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => updateBlock(block.id, { links: block.links.filter((_, i) => i !== lIdx) })}
                                                className="p-1.5 text-slate-600 hover:text-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Templates Footer */}
            <div className="pt-4 border-t border-slate-800">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-3 text-center">O usar un template predefinido</span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        type="button"
                        onClick={() => setNewLessonWorkspaceConfig({
                            layoutMode: 'vertical',
                            webBlocks: [
                                { id: 'video_1', type: 'video', title: 'Explicación Teórica', description: '', links: [], attachments: [] },
                                { id: 'sea_1', type: 'blocks', title: 'Sintaxis Estructural (SEA)', description: '', links: [], attachments: [] },
                                { id: 'practice_1', type: 'practice', title: 'Rutina de Práctica', description: '', links: [], attachments: [] }
                            ]
                        })}
                        className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 whitespace-nowrap hover:bg-blue-600/20 transition"
                    >
                        Harmonica Routine
                    </button>
                    <button
                        type="button"
                        onClick={() => setNewLessonWorkspaceConfig({
                            layoutMode: 'vertical',
                            webBlocks: [
                                { id: 'video_1', type: 'video', title: 'Tutorial de la Canción', description: '', links: [], attachments: [] },
                                { id: 'tab_1', type: 'tab', title: 'Partitura Interactiva', description: '', links: [], attachments: [] },
                                { id: 'notes_1', type: 'notes', title: 'Mis Apuntes', description: '', links: [], attachments: [] }
                            ]
                        })}
                        className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 whitespace-nowrap hover:bg-blue-600/20 transition"
                    >
                        Song Study (GP)
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[150] flex flex-col">
            {/* HEADER */}
            <div className="shrink-0 flex items-center justify-between px-4 pt-safe pt-4 pb-3 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <Plus className="text-blue-500" size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-white leading-tight">{editingLessonId ? 'Editar Lección' : 'Nueva Lección'}</h2>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{editingLessonId ? 'Modificando metadatos' : 'Crea material de estudio'}</p>
                    </div>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 active:bg-slate-700 transition">
                    <X size={18} />
                </button>
            </div>



            {/* PESTAÑAS MÓVILES */}
            <div className="shrink-0 flex px-4 gap-2 pt-2 pb-3 bg-slate-900 border-b border-slate-800" id="tour-gen-tabs">
                {mobileTabs.map(tab => (
                    <button key={tab.id} type="button" onClick={() => setMobileTab(tab.id)}
                        id={`tour-gen-tab-${tab.id}`}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${mobileTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-400'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENIDO CON SCROLL */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
                    {mobileTab === 'media' && mediaSectionContent}
                    {mobileTab === 'workspace' && workspaceSectionContent}
                    {mobileTab === 'meta' && metaSectionContent}
                    {mobileTab === 'notes' && notesSectionContent}
                </div>

                {/* FOOTER FIJO */}
                <div className="shrink-0 px-4 py-4 border-t border-slate-800 bg-slate-900 flex gap-3">
                    <button type="button" onClick={() => setIsAdding(false)}
                        className="flex-1 py-3.5 rounded-xl font-black text-sm text-slate-400 bg-slate-800 active:bg-slate-700 transition uppercase tracking-widest">
                        Cancelar
                    </button>
                    <button type="submit"
                        id="tour-gen-save"
                        className="flex-1 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition">
                        <Save size={16} /> Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LessonGeneratorModal;
