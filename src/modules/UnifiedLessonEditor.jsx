import React, { useState, useEffect, useRef } from 'react';
import {
    Save, Plus, Trash2, GripVertical, Settings, Eye, Video,
    Music, FileText, Layout, ChevronRight, Bookmark, Clock,
    Star, Image as ImageIcon, Link as LinkIcon, X, Maximize2,
    AlertCircle, CheckCircle2, MoreVertical, Search, PanelLeftClose,
    PanelRightClose, PanelLeft, PanelRight, Loader2, ArrowLeft,
    PlayCircle, Activity, Target, Zap, ListChecks, Layers,
    FileAudio, Volume2, Timer, Repeat, Edit3, Share2, Upload, FileUp, Mic2, StopCircle
} from 'lucide-react';
import { 
    INSTRUMENTS, CATEGORIES, getYouTubeId, isTikTokUrl, getTikTokId, 
    NOTES, HARP_FREQS 
} from '../utils/constants';
import YouTube from 'react-youtube';
import SharedScalesPanel from '../components/SharedScalesPanel';
import { YinPitchDetector } from '../utils/pitchDetector';
import { playHarpNote, getAudioContext, playTabSequence } from '../utils/audio';
import InteractiveHarmonica from '../components/harmonica/InteractiveHarmonica';

// --- CONSTANTES ---
const PRESETS = [
    {
        id: 'harmonica_practice',
        name: 'Harmonica Practice',
        icon: <Zap size={16} />,
        blocks: [
            { type: 'video', title: 'Video Tutorial' },
            { type: 'sea-tab', title: 'Tablatura SEA' },
            { type: 'notes', title: 'Mis Notas de Estudio' },
            { type: 'checkpoints', title: 'Índice de Práctica' }
        ]
    },
    {
        id: 'gp_study',
        name: 'Guitar Pro Study',
        icon: <Activity size={16} />,
        blocks: [
            { type: 'gp-tab', title: 'Partitura Interactiva' },
            { type: 'practice', title: 'Metrónomo y Objetivos' },
            { type: 'notes', title: 'Apuntes Técnicos' }
        ]
    },
    {
        id: 'theory',
        name: 'Theory Study',
        icon: <FileText size={16} />,
        blocks: [
            { type: 'text', title: 'Explicación Teórica' },
            { type: 'links', title: 'Lecciones Relacionadas' },
            { type: 'notes', title: 'Resumen Personal' }
        ]
    },
    {
        id: 'impro_session',
        name: 'Improvisation Session',
        icon: <Music size={16} />,
        blocks: [
            { type: 'video', title: 'Backing Track' },
            { type: 'practice', title: 'Entrenamiento de Escalas' },
            { type: 'checkpoints', title: 'Objetivos de Impro' }
        ]
    }
];

const UnifiedLessonEditor = ({
    setIsAdding,
    addItem,
    collections = [],
    selectedItem,
    editingLessonId
}) => {
    const [lesson, setLesson] = useState({
        title: 'Nueva Lección',
        artist: '',
        instrument: 'harmonica',
        difficulty: 3,
        category: 'daily',
        harmonica_key: 'ALL',
        youtubeId: '',
        duration: '',
        personal_notes: '',
        blocks: []
    });

    const [activeBlockId, setActiveBlockId] = useState(null);
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // File Upload Refs & States
    const gpFileRef = useRef(null);
    const attachmentsRef = useRef(null);
    const [selectedGpFile, setSelectedGpFile] = useState(null);
    const [selectedAttachments, setSelectedAttachments] = useState([]);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        if (selectedItem) {
            let blocks = [];
            try {
                const config = typeof selectedItem.workspace_config === 'string' 
                    ? JSON.parse(selectedItem.workspace_config) 
                    : (selectedItem.workspace_config || {});
                blocks = config.webBlocks || [];
            } catch (e) {
                console.error("Error parsing workspace_config:", e);
            }

            setLesson({
                title: selectedItem.title || '',
                artist: selectedItem.artist || '',
                instrument: selectedItem.instrument || 'harmonica',
                difficulty: selectedItem.difficulty || 3,
                category: selectedItem.category || 'daily',
                harmonica_key: selectedItem.harmonica_key || 'ALL',
                youtubeId: selectedItem.youtubeId || '',
                duration: selectedItem.duration || '',
                personal_notes: selectedItem.personal_notes || '',
                blocks: blocks
            });
            if (blocks.length > 0) setActiveBlockId(blocks[0].id);
        } else {
            setShowPresets(true);
        }
    }, [selectedItem]);

    // --- LOGICA DE BLOQUES ---
    const applyPreset = (preset) => {
        const newBlocks = preset.blocks.map((b, i) => ({
            id: `${b.type}_${Date.now()}_${i}`,
            type: b.type,
            title: b.title,
            description: '',
            content: getInitialContent(b.type),
            links: [],
            attachments: [],
            isLoading: false
        }));
        setLesson(prev => ({ ...prev, blocks: newBlocks }));
        setShowPresets(false);
        if (newBlocks.length > 0) setActiveBlockId(newBlocks[0].id);
    };

    const getInitialContent = (type) => {
        switch (type) {
            case 'video': return { url: '', artist: '', bookmarks: [], speed: 1, loop: false, duration: '' };
            case 'sea-tab': return { code: '', bpm: 100, measures: 4 };
            case 'gp-tab': return { url: '', fileName: '' };
            case 'practice': return { targetBpm: 120, currentBpm: 80, timer: 15 };
            case 'checkpoints': return { items: [{ id: '1', text: 'Tocar frase limpia', done: false }] };
            case 'attachments': return { files: [] };
            case 'links': return { items: [] };
            default: return { text: '' };
        }
    };

    const addBlock = (type) => {
        const newBlock = {
            id: `${type}_${Date.now()}`,
            type,
            title: `Nuevo bloque de ${type.toUpperCase()}`,
            description: '',
            content: getInitialContent(type),
            links: [],
            attachments: [],
            isLoading: false
        };
        setLesson(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
        setActiveBlockId(newBlock.id);
    };

    const updateBlock = (id, updates) => {
        setLesson(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
        }));
    };

    const removeBlock = (id) => {
        setLesson(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            
            // Si el primer bloque es video, usar su URL para el youtubeId principal
            const videoBlock = lesson.blocks.find(b => b.type === 'video');
            const cleanYtId = videoBlock ? (isTikTokUrl(videoBlock.content.url) ? videoBlock.content.url : getYouTubeId(videoBlock.content.url)) : lesson.youtubeId;

            formData.append('title', lesson.title);
            formData.append('artist', lesson.artist);
            formData.append('instrument', lesson.instrument);
            formData.append('difficulty', lesson.difficulty);
            formData.append('category', lesson.category);
            formData.append('harmonica_key', lesson.harmonica_key);
            formData.append('youtubeId', cleanYtId);
            formData.append('duration', lesson.duration);
            formData.append('personal_notes', lesson.personal_notes);

            // Extract video bookmarks if present
            if (videoBlock && videoBlock.content.bookmarks) {
                formData.append('video_bookmarks', JSON.stringify(videoBlock.content.bookmarks));
            }
            
            // Add blocks to workspace_config
            const workspaceConfig = {
                layoutMode: 'vertical',
                webBlocks: lesson.blocks
            };
            formData.append('workspace_config', JSON.stringify(workspaceConfig));

            // Files
            if (selectedGpFile) {
                formData.append('gpFile_upload', selectedGpFile);
            }
            selectedAttachments.forEach(file => {
                formData.append('attachment_files[]', file);
            });

            if (editingLessonId) {
                formData.append('action', 'update_lesson');
                formData.append('id', editingLessonId);
            } else {
                formData.append('action', 'add_lesson');
            }

            const res = await addItem(formData);
            if (res.success) {
                setIsAdding(false);
            }
        } catch (error) {
            console.error("Error saving lesson:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchVideoMetadata = async (blockId, url) => {
        const id = getYouTubeId(url);
        if (!id) return;
        
        updateBlock(blockId, { isLoading: true });
        try {
            const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
            const data = await res.json();
            
            if (data.title) {
                const title = data.title;
                const artist = data.author_name || '';
                
                updateBlock(blockId, { 
                    title: `Video: ${title}`,
                    description: `Por ${artist}`,
                    content: { 
                        ...lesson.blocks.find(b => b.id === blockId).content, 
                        url,
                        artist 
                    },
                    isLoading: false
                });

                // Also update global lesson title/artist if they are empty
                setLesson(prev => ({
                    ...prev,
                    title: prev.title === 'Nueva Lección' ? title : prev.title,
                    artist: prev.artist === '' ? artist : prev.artist
                }));
            }
        } catch (e) {
            console.error("Error fetching video metadata:", e);
            updateBlock(blockId, { isLoading: false });
        }
    };

    // --- DRAG AND DROP ---
    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItemIndex === index || isPreview) return;
        const remainingItems = lesson.blocks.filter((_, idx) => idx !== draggedItemIndex);
        const reorderedItems = [
            ...remainingItems.slice(0, index),
            lesson.blocks[draggedItemIndex],
            ...remainingItems.slice(index)
        ];
        setLesson(prev => ({ ...prev, blocks: reorderedItems }));
        setDraggedItemIndex(index);
    };

    const renderBlockEditor = (block) => {
        const props = { block, isPreview, updateBlock, removeBlock, lesson, setLesson, formatTime, fetchVideoMetadata };

        switch (block.type) {
            case 'video': return <VideoBlockEditor {...props} />;
            case 'sea-tab': return <SeaTabBlockEditor {...props} />;
            case 'gp-tab': return <GpTabBlockEditor {...props} gpFileRef={gpFileRef} selectedGpFile={selectedGpFile} setSelectedGpFile={setSelectedGpFile} />;
            case 'practice': return <PracticeBlockEditor {...props} />;
            case 'checkpoints': return <CheckpointsBlockEditor {...props} />;
            case 'attachments': return <AttachmentsBlockEditor {...props} attachmentsRef={attachmentsRef} selectedAttachments={selectedAttachments} setSelectedAttachments={setSelectedAttachments} />;
            default: return <DefaultBlockEditor {...props} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
            {/* --- SIDEBAR IZQUIERDO --- */}
            <aside className={`border-r border-white/5 bg-slate-900/50 flex flex-col shrink-0 transition-all duration-500 ${isLeftCollapsed ? 'w-0 opacity-0' : 'w-72'}`}>
                <div className="p-6 h-full flex flex-col min-w-[288px]">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                        <Layers size={14} /> Estructura de Lección
                    </h2>

                    <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-2">
                        {lesson.blocks.map((block, idx) => (
                            <div
                                key={block.id}
                                draggable={!isPreview}
                                onDragStart={(e) => setDraggedItemIndex(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragEnd={() => setDraggedItemIndex(null)}
                            >
                                <button
                                    onClick={() => {
                                        setActiveBlockId(block.id);
                                        document.getElementById(`block-${block.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${activeBlockId === block.id
                                        ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                                        : 'bg-slate-950/40 border-transparent text-slate-500 hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="text-[10px] font-black opacity-30">{String(idx + 1).padStart(2, '0')}</span>
                                    <span className="text-xs font-bold truncate text-left flex-1">{block.title}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {!isPreview && (
                        <button
                            onClick={() => setShowPresets(true)}
                            className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            <Layout size={14} /> Cambiar Template
                        </button>
                    )}
                </div>
            </aside>

            {/* --- CANVAS CENTRAL --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
                <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-slate-900/20 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsAdding(false)} className="p-2 text-slate-500 hover:text-white transition"><ArrowLeft size={18} /></button>
                        <div className="h-6 w-px bg-white/10" />
                        <input
                            value={lesson.title}
                            onChange={e => setLesson({ ...lesson, title: e.target.value })}
                            readOnly={isPreview}
                            placeholder="Título de la lección"
                            className="bg-transparent text-lg font-black text-white outline-none w-64"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsPreview(!isPreview)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isPreview ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {isPreview ? <Edit3 size={14} /> : <Eye size={14} />} {isPreview ? 'Editar' : 'Vista Previa'}
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSaving}
                            className="px-6 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-105 transition flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {editingLessonId ? 'Actualizar' : 'Guardar'}
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <button onClick={() => setIsRightCollapsed(!isRightCollapsed)} className="p-2 text-slate-500 hover:text-white transition"><PanelRight size={18} /></button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-4 max-w-4xl mx-auto w-full custom-scrollbar scroll-smooth pb-40">
                    {showPresets ? (
                        <div className="py-20 animate-in fade-in zoom-in duration-500">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight italic">Presets de Aprendizaje</h2>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Selecciona un punto de partida optimizado</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {PRESETS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => applyPreset(p)}
                                        className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:border-blue-500 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition">
                                            {p.icon}
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">{p.name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {p.blocks.map(b => (
                                                <span key={b.type} className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-2 py-1 rounded-md">{b.type}</span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowPresets(false)} className="mt-10 mx-auto block text-[10px] font-black uppercase text-slate-500 hover:text-white tracking-widest underline underline-offset-4">Empezar desde blanco</button>
                        </div>
                    ) : (
                        lesson.blocks.map((block) => (
                            <div key={block.id} id={`block-${block.id}`}>
                                {renderBlockEditor(block)}
                            </div>
                        ))
                    )}

                    {!isPreview && !showPresets && (
                        <div className="pt-20 border-t border-white/5 flex flex-wrap justify-center gap-3">
                            {['video', 'sea-tab', 'gp-tab', 'practice', 'checkpoints', 'notes', 'links', 'attachments', 'text'].map(type => (
                                <button key={type} onClick={() => addBlock(type)} className="px-5 py-3 bg-slate-900 hover:bg-blue-600/10 hover:text-blue-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition">
                                    + {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* --- SIDEBAR DERECHO --- */}
            <aside className={`border-l border-white/5 bg-slate-900/80 backdrop-blur-xl shrink-0 overflow-y-auto transition-all duration-500 ${isRightCollapsed ? 'w-0 opacity-0' : 'w-80'}`}>
                <div className="p-8 space-y-8 min-w-[320px]">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Configuración Global</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Artista</label>
                            <input
                                value={lesson.artist}
                                onChange={e => setLesson({ ...lesson, artist: e.target.value })}
                                readOnly={isPreview}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Dificultad</label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => !isPreview && setLesson({ ...lesson, difficulty: s })} className={`flex-1 h-10 rounded-xl border transition-all ${lesson.difficulty >= s ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-white/5 text-slate-700'}`}>
                                        <Star size={14} fill={lesson.difficulty >= s ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Instrumento</label>
                            <select 
                                value={lesson.instrument}
                                onChange={e => setLesson({ ...lesson, instrument: e.target.value })}
                                disabled={isPreview}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                            >
                                {INSTRUMENTS.map(ins => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Categoría</label>
                            <select 
                                value={lesson.category}
                                onChange={e => setLesson({ ...lesson, category: e.target.value })}
                                disabled={isPreview}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                            >
                                {collections.map(col => {
                                    const isSystem = CATEGORIES.some(c => c.id === col.id);
                                    return <option key={col.id} value={isSystem ? col.title : col.id}>{col.title}</option>;
                                })}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Tonalidad Armónica</label>
                            <select 
                                value={lesson.harmonica_key}
                                onChange={e => setLesson({ ...lesson, harmonica_key: e.target.value })}
                                disabled={isPreview}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none"
                            >
                                <option value="ALL">Todas / No aplica</option>
                                {['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Duración</label>
                            <div className="relative">
                                <input
                                    value={lesson.duration}
                                    onChange={e => setLesson({ ...lesson, duration: e.target.value })}
                                    readOnly={isPreview}
                                    placeholder="Ej: 5:30"
                                    className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all"
                                />
                                <Clock size={14} className="absolute right-5 top-4.5 text-slate-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

// --- BLOCK EDITOR COMPONENTS ---

const BlockWrapper = ({ block, isPreview, updateBlock, removeBlock, icon, color, children }) => (
    <div className={`transition-all duration-500 overflow-hidden ${isPreview ? 'mb-10' : 'mb-8'}`}>
        {!isPreview && (
            <div className="flex items-center gap-3 mb-4 group/header">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} text-white shadow-lg`}>
                    {icon}
                </div>
                <input
                    value={block.title}
                    onChange={e => updateBlock(block.id, { title: e.target.value })}
                    className="bg-transparent text-lg font-black text-white outline-none flex-1 border-b border-transparent focus:border-white/10 transition"
                    placeholder="Título del bloque..."
                />
                <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition">
                    <button onClick={() => removeBlock(block.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                    <div className="p-2 text-slate-700 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></div>
                </div>
            </div>
        )}
        <div className={`${isPreview ? 'bg-transparent' : 'bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] shadow-xl'}`}>
            {!isPreview && (
                <textarea
                    value={block.description || ''}
                    onChange={e => updateBlock(block.id, { description: e.target.value })}
                    className="w-full bg-transparent text-sm text-slate-400 outline-none resize-none mb-4 border-b border-white/5 pb-2"
                    placeholder="Descripción opcional del bloque..."
                    rows={1}
                />
            )}
            {block.description && isPreview && (
                <p className="text-slate-400 text-sm mb-6 leading-relaxed italic">{block.description}</p>
            )}
            {children}
        </div>
    </div>
);

const VideoBlockEditor = ({ block, isPreview, updateBlock, removeBlock, lesson, setLesson, formatTime, fetchVideoMetadata }) => {
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [bookmarkLabel, setBookmarkLabel] = useState('');
    const [showBookmarkInput, setShowBookmarkInput] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [bookmarkType, setBookmarkType] = useState('moment'); // 'moment' | 'practice'
    const [isSettingRange, setIsSettingRange] = useState(false);
    const [rangeStart, setRangeStart] = useState(null);

    const handleAddBookmark = (type = 'moment') => {
        const time = playerRef.current.getCurrentTime();
        if (type === 'practice' && !isSettingRange) {
            setIsSettingRange(true);
            setRangeStart(time);
            setBookmarkType('practice');
        } else {
            setCurrentTime(time);
            setShowBookmarkInput(true);
            setBookmarkLabel('');
            setBookmarkType(type);
        }
    };

    const confirmBookmark = () => {
        const time = playerRef.current.getCurrentTime();
        const newBookmark = { 
            id: Date.now(), 
            type: bookmarkType,
            time: bookmarkType === 'practice' ? rangeStart : currentTime, 
            endTime: bookmarkType === 'practice' ? time : null,
            timeStr: formatTime(bookmarkType === 'practice' ? rangeStart : currentTime),
            endTimeStr: bookmarkType === 'practice' ? formatTime(time) : null,
            label: bookmarkLabel || (bookmarkType === 'practice' ? `Práctica: ${formatTime(rangeStart)} - ${formatTime(time)}` : `Momento en ${formatTime(currentTime)}`) 
        };
        updateBlock(block.id, { 
            content: { 
                ...block.content, 
                bookmarks: [...(block.content.bookmarks || []), newBookmark] 
            } 
        });
        setShowBookmarkInput(false);
        setIsSettingRange(false);
        setRangeStart(null);
    };

    return (
        <BlockWrapper block={block} isPreview={isPreview} updateBlock={updateBlock} removeBlock={removeBlock} icon={<Video size={16} />} color="bg-red-600">
            <div className="space-y-6">
                {!isPreview && (
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                placeholder="URL de YouTube"
                                value={block.content.url}
                                onChange={e => {
                                    const url = e.target.value;
                                    updateBlock(block.id, { content: { ...block.content, url } });
                                    if (getYouTubeId(url)) fetchVideoMetadata(block.id, url);
                                }}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-red-500/30 transition"
                            />
                            {block.isLoading && <Loader2 size={16} className="absolute right-4 top-3.5 animate-spin text-red-500" />}
                        </div>
                    </div>
                )}
                
                <div className="space-y-6">
                    <div className="aspect-video w-full bg-black rounded-[2rem] relative overflow-hidden border border-white/10 shadow-2xl">
                        {getYouTubeId(block.content.url) ? (
                            <YouTube
                                videoId={getYouTubeId(block.content.url)}
                                className="w-full h-full"
                                iframeClassName="w-full h-full"
                                onReady={(e) => {
                                    playerRef.current = e.target;
                                    const duration = e.target.getDuration();
                                    if (duration && !lesson.duration) {
                                        const formatted = formatTime(duration);
                                        setLesson(prev => ({ ...prev, duration: formatted }));
                                    }
                                    setIsPlaying(true);
                                }}
                                opts={{
                                    playerVars: {
                                        autoplay: 0,
                                        modestbranding: 1,
                                        rel: 0,
                                    },
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-800">
                                <Video size={48} className="mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Pega un link de YouTube arriba</span>
                            </div>
                        )}
                    </div>

                    {isPlaying && playerRef.current && (
                        <div className="space-y-6">
                            {/* Controls & Bookmarks */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/40 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    {!showBookmarkInput && !isSettingRange ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleAddBookmark('moment')}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition shadow-lg shadow-red-900/20"
                                            >
                                                <Bookmark size={14} /> Momento
                                            </button>
                                            <button 
                                                onClick={() => handleAddBookmark('practice')}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
                                            >
                                                <Target size={14} /> Iniciar Práctica
                                            </button>
                                        </div>
                                    ) : isSettingRange && !showBookmarkInput ? (
                                        <div className="flex items-center gap-3 animate-in zoom-in">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Grabando Práctica desde {formatTime(rangeStart)}</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setCurrentTime(playerRef.current.getCurrentTime());
                                                    setShowBookmarkInput(true);
                                                }}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
                                            >
                                                <CheckCircle2 size={14} /> Finalizar y Etiquetar
                                            </button>
                                            <button onClick={() => { setIsSettingRange(false); setRangeStart(null); }} className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition">
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
                                                className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-500/50 w-48 md:w-64"
                                            />
                                            <button onClick={confirmBookmark} className="p-2 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition">
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button onClick={() => { setShowBookmarkInput(false); if(bookmarkType==='moment') { setIsSettingRange(false); setRangeStart(null); } }} className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-1 bg-slate-900 rounded-xl p-1 border border-white/5">
                                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => {
                                                    playerRef.current.setPlaybackRate(speed);
                                                    updateBlock(block.id, { content: { ...block.content, speed } });
                                                }}
                                                className={`px-2 py-1 rounded-lg text-[9px] font-black transition ${block.content.speed === speed ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar py-1">
                                    {block.content.bookmarks?.map(bm => (
                                        <div key={bm.id} className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={() => playerRef.current.seekTo(bm.time, true)}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-white/5 transition group/bm"
                                                title={bm.label}
                                            >
                                                <Clock size={10} className="text-red-500" /> {bm.timeStr}
                                            </button>
                                            {!isPreview && (
                                                <button 
                                                    onClick={() => updateBlock(block.id, { 
                                                        content: { 
                                                            ...block.content, 
                                                            bookmarks: block.content.bookmarks.filter(b => b.id !== bm.id) 
                                                        } 
                                                    })}
                                                    className="p-1.5 text-slate-600 hover:text-red-500 transition"
                                                >
                                                    <X size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Clickable Index */}
                            {block.content.bookmarks?.length > 0 && (
                                <div className="bg-slate-950/20 rounded-[2rem] border border-white/5 overflow-hidden">
                                    <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                            <PlayCircle size={14} className="text-red-500" /> Índice de Contenido
                                        </h4>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{block.content.bookmarks.length} Puntos clave</span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {block.content.bookmarks.map((bm, index) => (
                                            <button 
                                                key={bm.id}
                                                onClick={() => {
                                                    playerRef.current.seekTo(bm.time, true);
                                                    playerRef.current.playVideo();
                                                }}
                                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all group/item text-left"
                                            >
                                                <span className="text-[10px] font-black text-slate-700 group-hover/item:text-blue-500 transition-colors w-4">{index + 1}</span>
                                                <div className={`px-2 py-1 rounded-lg text-[9px] font-black border border-white/5 min-w-[50px] text-center ${bm.type === 'practice' ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900 text-red-500'}`}>
                                                    {bm.type === 'practice' ? `${bm.timeStr} - ${bm.endTimeStr}` : bm.timeStr}
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <span className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">{bm.label}</span>
                                                    {bm.type === 'practice' && <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Sesión de Práctica</span>}
                                                </div>
                                                <ChevronRight size={14} className="text-slate-700 group-hover/item:text-blue-500 transition-transform group-hover/item:translate-x-1" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </BlockWrapper>
    );
};

const SeaTabBlockEditor = ({ block, isPreview, updateBlock, removeBlock, lesson }) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showScales, setShowScales] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [harpKey, setHarpKey] = useState(lesson.harmonica_key || 'C');
    const [isListening, setIsListening] = useState(false);
    const playbackRef = useRef(null);

    const symbols = ["'", "''", "'''", "~", "(", ")", "/", "\\", "v", "h", "p", "-", " "];

    const insertSymbol = (s) => {
        const currentCode = block.content.code || "";
        updateBlock(block.id, { 
            content: { 
                ...block.content, 
                code: currentCode + s 
            } 
        });
    };

    const handleTogglePlay = () => {
        if (isPlaying) {
            playbackRef.current?.stop();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            const sequence = playTabSequence(block.content.code || "", {
                bpm: block.content.bpm || 100,
                harpKey: harpKey,
                onComplete: () => setIsPlaying(false)
            });
            playbackRef.current = sequence;
        }
    };

    useEffect(() => {
        return () => {
            playbackRef.current?.stop();
        };
    }, []);

    return (
        <BlockWrapper block={block} isPreview={isPreview} updateBlock={updateBlock} removeBlock={removeBlock} icon={<Layers size={16} />} color="bg-blue-600">
            <div className="space-y-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-3">
                        <button 
                            onClick={handleTogglePlay}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'}`}
                        >
                            {isPlaying ? <StopCircle size={18} /> : <PlayCircle size={18} />}
                        </button>
                        <button 
                            onClick={() => setShowScales(true)}
                            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
                        >
                            <Target size={18} />
                        </button>
                        <button 
                            onClick={() => setShowInfo(true)}
                            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
                        >
                            <AlertCircle size={18} />
                        </button>
                        <button 
                            onClick={() => setIsListening(!isListening)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            title="Escritura Automática (Micro)"
                        >
                            <Mic2 size={18} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">BPM</span>
                            <input 
                                type="number"
                                value={block.content.bpm || 100}
                                onChange={(e) => updateBlock(block.id, { content: { ...block.content, bpm: parseInt(e.target.value) } })}
                                className="w-12 bg-transparent text-sm font-black text-blue-400 outline-none text-center"
                            />
                        </div>
                        <select 
                            value={harpKey}
                            onChange={(e) => setHarpKey(e.target.value)}
                            className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-black text-blue-400 outline-none"
                        >
                            {NOTES.map(n => <option key={n} value={n}>Key: {n}</option>)}
                        </select>
                    </div>
                </div>

                {/* Unified Editor Area */}
                <div className="relative group/editor">
                    <textarea
                        className={`w-full bg-slate-950/80 border border-blue-500/10 rounded-[3rem] p-12 text-3xl font-black text-blue-100 tracking-[0.3em] uppercase text-center outline-none resize-none transition-all duration-500 ${isPlaying ? 'ring-4 ring-emerald-500/20 text-emerald-400' : 'focus:ring-4 focus:ring-blue-500/10'}`}
                        placeholder="-3' -4 -5 6 ~"
                        rows={2}
                        value={block.content.code}
                        onChange={e => updateBlock(block.id, { content: { ...block.content, code: e.target.value } })}
                        readOnly={isPreview}
                    />
                    {isPlaying && (
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-[3rem] pointer-events-none" />
                    )}

                    {/* SEA Symbol Keyboard */}
                    {!isPreview && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 p-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-20">
                            {symbols.map(s => (
                                <button 
                                    key={s}
                                    onClick={() => insertSymbol(s)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 border border-white/5 text-sm font-black text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all"
                                >
                                    {s === " " ? "␣" : s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Interactive Harmonica Component */}
                <div className="py-4">
                    <InteractiveHarmonica 
                        harpKey={harpKey}
                        isListening={isListening}
                        isRecording={isListening}
                        bpm={block.content.bpm || 100}
                        onNoteDetected={(note) => {
                            if (!isPreview) {
                                const currentCode = block.content.code || "";
                                const lastNote = currentCode.trim().split(' ').pop();
                                if (lastNote !== note) {
                                    updateBlock(block.id, { 
                                        content: { 
                                            ...block.content, 
                                            code: currentCode + (currentCode.endsWith(' ') || currentCode === '' ? '' : ' ') + note + ' ' 
                                        } 
                                    });
                                }
                            }
                        }}
                    />
                </div>

                {/* Modales */}
                {showInfo && <SeaInstructionModal onClose={() => setShowInfo(false)} />}
                {showScales && <ReferenceScalesModal onClose={() => setShowScales(false)} />}
            </div>
        </BlockWrapper>
    );
};

const ReferenceScalesModal = ({ onClose }) => {
    const scales = [
        { name: "Escala de Blues Menor (The Queen)", tab: "-2 -3' 4 -4' -4 -5 6", desc: "La escala definitiva. El alma del blues está en el -3' y el -4'." },
        { name: "Escala Pentatónica Menor", tab: "-2 -3' 4 -4 -5 6", desc: "Más 'limpia' que la anterior, ideal para riffs rápidos de rock-blues." },
        { name: "Escala de Blues Mayor", tab: "-2 -3'' -3' -3 -4 5 6", desc: "Para ese sonido dulce y melódico estilo Sonny Boy Williamson II. El control del -3'' es vital." },
        { name: "Modo Mixolidio", tab: "-2 -3'' -3 4 -4 5 -5 6", desc: "Fundamental para seguir la progresión de acordes sin sonar 'demasiado' triste." }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/10 rounded-[3rem] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Target className="text-blue-500" /> Escalas de Referencia
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all"><X size={20} /></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                    {scales.map((s, idx) => (
                        <div key={idx} className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group">
                            <h4 className="text-sm font-black text-blue-400 uppercase mb-2 tracking-widest group-hover:text-blue-300">{s.name}</h4>
                            <div className="text-2xl font-black text-white tracking-[0.2em] mb-3 font-mono">{s.tab}</div>
                            <p className="text-[11px] text-slate-500 italic">{s.desc}</p>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-white/5">
                        <SharedScalesPanel className="!bg-transparent !border-0 !p-2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const GpTabBlockEditor = ({ block, isPreview, updateBlock, removeBlock, gpFileRef, selectedGpFile, setSelectedGpFile }) => (
    <BlockWrapper block={block} isPreview={isPreview} updateBlock={updateBlock} removeBlock={removeBlock} icon={<Music size={16} />} color="bg-indigo-600">
        <div className="space-y-4">
            {!isPreview && (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-[2rem] bg-slate-950/30">
                    <input 
                        type="file" 
                        ref={gpFileRef} 
                        className="hidden" 
                        accept=".gp,.gp3,.gp4,.gp5,.gpx"
                        onChange={(e) => setSelectedGpFile(e.target.files[0])}
                    />
                    <FileUp size={32} className="text-slate-700 mb-4" />
                    <button 
                        onClick={() => gpFileRef.current?.click()}
                        className="px-6 py-2 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                    >
                        {selectedGpFile ? 'Cambiar archivo GP' : 'Cargar archivo Guitar Pro'}
                    </button>
                    {selectedGpFile && <p className="mt-4 text-xs font-bold text-indigo-400">{selectedGpFile.name}</p>}
                    {block.content.fileName && !selectedGpFile && <p className="mt-4 text-xs font-bold text-slate-500">Actual: {block.content.fileName}</p>}
                </div>
            )}
            {(selectedGpFile || block.content.url) && isPreview && (
                <div className="bg-slate-950 p-8 rounded-[2rem] border border-indigo-500/20 text-center">
                    <Music size={24} className="text-indigo-500 mx-auto mb-4" />
                    <p className="text-sm font-bold text-white">Partitura Interactiva Cargada</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">Lista para AlphaTab Engine</p>
                </div>
            )}
        </div>
    </BlockWrapper>
);

const PracticeBlockEditor = ({ block, isPreview, updateBlock, removeBlock }) => (
    <BlockWrapper block={block} isPreview={isPreview} updateBlock={updateBlock} removeBlock={removeBlock} icon={<Target size={16} />} color="bg-amber-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Target BPM</p>
                {!isPreview ? (
                    <input 
                        type="number" 
                        value={block.content.targetBpm}
                        onChange={e => updateBlock(block.id, { content: { ...block.content, targetBpm: e.target.value } })}
                        className="bg-transparent text-4xl font-black text-amber-500 outline-none w-20 text-center"
                    />
                ) : (
                    <p className="text-4xl font-black text-amber-500">{block.content.targetBpm}</p>
                )}
            </div>
            <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Current</p>
                <p className="text-4xl font-black text-white">{block.content.currentBpm}</p>
            </div>
            <div className="p-6 bg-slate-950/50 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center">
                <Timer size={24} className="text-slate-700 mb-2" />
                <p className="text-xl font-black text-white">{block.content.timer} min</p>
            </div>
        </div>
    </BlockWrapper>
);

const CheckpointsBlockEditor = ({ block, isPreview, updateBlock, removeBlock }) => (
    <BlockWrapper block={block} isPreview={isPreview} updateBlock={updateBlock} removeBlock={removeBlock} icon={<ListChecks size={16} />} color="bg-emerald-600">
        <div className="space-y-3">
            {block.content.items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 group">
                    <div
                        onClick={() => !isPreview && updateBlock(block.id, {
                            content: {
                                ...block.content,
                                items: block.content.items.map(it => it.id === item.id ? { ...it, done: !it.done } : it)
                            }
                        })}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${item.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-800'}`}>
                        {item.done && <CheckCircle2 size={14} />}
                    </div>
                    <input
                        value={item.text}
                        readOnly={isPreview}
                        onChange={e => updateBlock(block.id, {
                            content: {
                                ...block.content,
                                items: block.content.items.map(it => it.id === item.id ? { ...it, text: e.target.value } : it)
                            }
                        })}
                        className="bg-transparent text-sm font-bold text-white outline-none flex-1"
                    />
                    {!isPreview && (
                        <button
                            onClick={() => updateBlock(block.id, { content: { ...block.content, items: block.content.items.filter(it => it.id !== item.id) } })}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500 transition">
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            ))}
            {!isPreview && (
                <button
                    onClick={() => updateBlock(block.id, {
                        content: {
                            ...block.content,
                            items: [...block.content.items, { id: Date.now().toString(), text: 'Nuevo Logro', done: false }]
                        }
                    })}
                    className="w-full py-3 border border-dashed border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-600 hover:text-white transition">+ Añadir Logro</button>
            )}
        </div>
    </BlockWrapper>
);

const AttachmentsBlockEditor = ({ block, isPreview, updateBlock, removeBlock, attachmentsRef, selectedAttachments, setSelectedAttachments }) => (
    <BlockWrapper block={block} isPreview={isPreview} updateBlock={updateBlock} removeBlock={removeBlock} icon={<Upload size={16} />} color="bg-slate-500">
        <div className="space-y-4">
            {!isPreview && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 rounded-[2rem] bg-slate-950/30">
                    <input 
                        type="file" 
                        ref={attachmentsRef} 
                        multiple 
                        className="hidden" 
                        onChange={(e) => setSelectedAttachments([...selectedAttachments, ...Array.from(e.target.files)])}
                    />
                    <button 
                        onClick={() => attachmentsRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400"
                    >
                        <Plus size={14} /> Seleccionar Archivos
                    </button>
                </div>
            )}
            <div className="grid grid-cols-1 gap-2">
                {selectedAttachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <FileText size={14} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-300">{file.name}</span>
                        </div>
                        {!isPreview && (
                            <button 
                                onClick={() => setSelectedAttachments(selectedAttachments.filter((_, idx) => idx !== i))}
                                className="text-slate-600 hover:text-red-500"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </BlockWrapper>
);

const DefaultBlockEditor = ({ block, isPreview, updateBlock, removeBlock }) => (
    <BlockWrapper block={block} isPreview={isPreview} updateBlock={updateBlock} removeBlock={removeBlock} icon={<FileText size={16} />} color="bg-slate-600">
        {isPreview ? (
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{block.content.text || 'Sin texto.'}</p>
        ) : (
            <textarea
                className="w-full bg-transparent text-slate-300 outline-none resize-none min-h-[100px]"
                placeholder="Instrucciones, teoría o contexto..."
                value={block.content.text}
                onChange={e => updateBlock(block.id, { content: { ...block.content, text: e.target.value } })}
            />
        )}
    </BlockWrapper>
);

export default UnifiedLessonEditor;