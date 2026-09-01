import React, { useState, useMemo } from 'react';
import { Play, Music, Youtube, LayoutList, ChevronUp, ChevronDown, KeyRound, Type, AlignLeft, Search, Filter, Piano, Guitar, Mic2, Drum, Star, Check, Clock, X, ChevronsUp, Plus } from 'lucide-react';
import { CATEGORIES, INSTRUMENTS, getYouTubeId, isTikTokUrl } from '../utils/constants';

const LessonDashboardList = ({ items, setSelectedItem, patchItem, onAddLesson, forcedOpenCategory }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [hideCompleted, setHideCompleted] = useState(false);
    const [difficultySort, setDifficultySort] = useState('none'); // 'none', 'asc', 'desc'
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterKey, setFilterKey] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [filterInstrument, setFilterInstrument] = useState('ALL');

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedItems = useMemo(() => {
        let result = items.filter(item => {
            // Text Search
            const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase()));

            // Category Filter
            const matchCategory = filterCategory === 'ALL' || item.category === filterCategory;

            // Key Filter
            const matchKey = filterKey === 'ALL' || item.harmonica_key === filterKey;

            // Type Filter
            let itemType = 'text';
            if (item.gpFile) itemType = 'gp';
            else if (item.youtubeId) itemType = 'video';
            const matchType = filterType === 'ALL' || itemType === filterType;

            // Instrument Filter
            const matchInstrument = filterInstrument === 'ALL' || (item.instrument || 'harmonica') === filterInstrument;

            return matchSearch && matchCategory && matchKey && matchType && matchInstrument;
        });

        result.sort((a, b) => {
            let aValue = a[sortConfig.key] || '';
            let bValue = b[sortConfig.key] || '';

            if (sortConfig.key === 'type') {
                aValue = a.gpFile ? 'Guitar Pro' : a.youtubeId ? 'Video' : 'Tablatura';
                bValue = b.gpFile ? 'Guitar Pro' : b.youtubeId ? 'Video' : 'Tablatura';
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return result;
    }, [items, sortConfig, searchTerm, filterCategory, filterKey, filterType, filterInstrument]);

    const [openCategory, setOpenCategory] = useState(null);

    // Sync forcedOpenCategory from tour
    React.useEffect(() => {
        if (forcedOpenCategory) {
            setOpenCategory(forcedOpenCategory);
        }
    }, [forcedOpenCategory]);

    const groupedItems = useMemo(() => {
        const groups = {};
        CATEGORIES.forEach(cat => {
            let catItems = sortedItems.filter(item => item.category === cat.id);
            
            // Apply per-accordion filters
            if (hideCompleted) {
                catItems = catItems.filter(item => parseInt(item.completed) !== 1);
            }

            // Apply difficulty sort
            if (difficultySort !== 'none') {
                catItems.sort((a, b) => {
                    const diffA = parseInt(a.difficulty) || 0;
                    const diffB = parseInt(b.difficulty) || 0;
                    return difficultySort === 'asc' ? diffA - diffB : diffB - diffA;
                });
            }

            groups[cat.id] = catItems;
        });
        return groups;
    }, [sortedItems, hideCompleted, difficultySort]);

    const toggleCompleted = async (e, item) => {
        e.stopPropagation();
        const newStatus = parseInt(item.completed) === 1 ? 0 : 1;
        await patchItem(item.id, { completed: newStatus });
    };

    const cycleDifficultySort = () => {
        if (difficultySort === 'none') setDifficultySort('asc');
        else if (difficultySort === 'asc') setDifficultySort('desc');
        else setDifficultySort('none');
    };

    const cycleInstrument = (e) => {
        e.stopPropagation();
        const options = ['ALL', ...INSTRUMENTS.map(i => i.id)];
        const currentIdx = options.indexOf(filterInstrument);
        const nextIdx = (currentIdx + 1) % options.length;
        setFilterInstrument(options[nextIdx]);
    };

    const getContentTypeIcon = (item) => {
        if (item.gpFile) return <Music size={16} className="text-blue-500" />;
        if (item.youtubeId) return <Youtube size={16} className="text-red-500" />;
        return <AlignLeft size={16} className="text-emerald-500" />;
    };

    const getInstrumentIcon = (instrumentId) => {
        const ins = INSTRUMENTS.find(i => i.id === instrumentId) || INSTRUMENTS[0];
        const Icon = ins.icon;
        return <Icon size={14} className="text-slate-500" />;
    };

    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <LayoutList size={64} className="mb-4 text-blue-500" />
                <p className="font-black uppercase tracking-[0.4em] text-lg text-white">No hay lecciones guardadas</p>
                <p className="text-sm font-medium mt-2 text-slate-300">Usa "Nueva Lección" para comenzar a armar tu biblioteca</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 lg:p-8 flex flex-col pt-4 custom-scrollbar">
            {/* Search and Global Controls */}
            <div className="flex flex-col gap-3 mb-4 shrink-0">
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-2.5 shadow-sm flex gap-2 lg:gap-3">
                    <div id="tour-search" className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar lección, artista..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800/50 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition"
                        />
                    </div>
                    <button 
                        id="tour-instrument"
                        onClick={cycleInstrument}
                        className={`px-3 lg:px-5 rounded-xl flex items-center justify-center gap-2 transition shrink-0 border ${filterInstrument !== 'ALL' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                        title={`Filtrar por: ${filterInstrument === 'ALL' ? 'Todos' : INSTRUMENTS.find(i => i.id === filterInstrument)?.name}`}
                    >
                        {filterInstrument === 'ALL' ? <LayoutList size={16} /> : (
                            React.createElement(INSTRUMENTS.find(i => i.id === filterInstrument)?.icon || Music, { size: 16 })
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                            {filterInstrument === 'ALL' ? 'Todos' : INSTRUMENTS.find(i => i.id === filterInstrument)?.name}
                        </span>
                    </button>
                </div>

                <div className="flex justify-between items-center px-2">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        {sortedItems.length} RESULTADOS
                    </p>
                    <button 
                        onClick={() => setOpenCategory(null)}
                        className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                        title="Cerrar todas las categorías"
                    >
                        <ChevronsUp size={16} />
                    </button>
                </div>
            </div>

            {/* Accordion Categories */}
            <div className="flex flex-col gap-2.5 pb-20">
                {CATEGORIES.map((cat, idx) => {
                    const categoryItems = groupedItems[cat.id] || [];
                    if (categoryItems.length === 0 && searchTerm === '') return null;
                    if (categoryItems.length === 0 && searchTerm !== '') return null;

                    const isOpen = openCategory === cat.id;

                    const CatIcon = cat.icon;

                    return (
                        <div key={cat.id} id={idx === 0 ? "tour-accordion" : undefined} className={`bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-2xl ring-1 ring-blue-500/20' : 'hover:bg-slate-800/40'}`}>
                            <div
                                onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                                className="w-full p-6 flex items-center justify-between group transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isOpen ? `${cat.bg.replace('/10', '/20')} ${cat.color} shadow-lg ring-1 ring-white/10` : `bg-slate-800/50 ${cat.color} group-hover:bg-slate-700`}`}>
                                        <CatIcon size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`text-lg font-black uppercase tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                            {cat.name}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {categoryItems.length} Lecciones
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 lg:gap-4 mr-2">
                                    {isOpen && (
                                        <div id="tour-filters-group" className="flex items-center bg-slate-950/40 rounded-xl border border-white/5 p-1 gap-1 animate-in fade-in zoom-in duration-200">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setHideCompleted(!hideCompleted); }}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${hideCompleted ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                title={hideCompleted ? "Mostrar completadas" : "Ocultar completadas"}
                                            >
                                                <Check size={14} strokeWidth={hideCompleted ? 4 : 2} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); cycleDifficultySort(); }}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${difficultySort !== 'none' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                title="Ordenar por dificultad"
                                            >
                                                <div className="flex flex-col items-center -space-y-1">
                                                    <Star size={12} fill={difficultySort !== 'none' ? "currentColor" : "none"} />
                                                    {difficultySort === 'asc' && <ChevronUp size={10} />}
                                                    {difficultySort === 'desc' && <ChevronDown size={10} />}
                                                </div>
                                            </button>
                                            <div className="w-[1px] h-4 bg-white/5 mx-0.5" />
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onAddLesson(cat.id); }}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center transition bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white border border-blue-500/20"
                                                title="Nueva lección en esta categoría"
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    )}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? `${cat.bg} ${cat.color} rotate-180` : 'text-slate-600'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Accordion Content */}
                            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isOpen ? 'max-h-[20000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 lg:p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
                                    {categoryItems.map((item) => {
                                        const ytId = item.youtubeId && !isTikTokUrl(item.youtubeId) ? getYouTubeId(item.youtubeId) : null;
                                        
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedItem(item)}
                                                className="bg-slate-900/40 border border-white/5 rounded-[1.5rem] overflow-hidden cursor-pointer hover:bg-slate-800 transition-all group flex flex-col shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 duration-300"
                                            >
                                                {/* Thumbnail Area */}
                                                <div className="aspect-video w-full bg-slate-950 relative overflow-hidden shrink-0">
                                                    {ytId && ytId.length === 11 ? (
                                                        <img 
                                                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                                                            alt={item.title}
                                                            onError={(e) => { 
                                                                e.target.onerror = null; 
                                                                e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop';
                                                            }}
                                                        />
                                                    ) : isTikTokUrl(item.youtubeId) ? (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors relative">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-rose-500/10 opacity-50" />
                                                            <Music size={48} className="text-white opacity-20 mb-2 group-hover:scale-110 transition-transform relative z-10" />
                                                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest relative z-10">TikTok Lesson</span>
                                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-cyan-500 via-white to-rose-500 rounded-full opacity-30" />
                                                        </div>
                                                    ) : item.gpFile ? (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                                                            <Music size={48} className="text-blue-500/20 mb-2 group-hover:scale-110 transition-transform" />
                                                            <span className="text-[10px] font-black text-blue-500/40 uppercase tracking-widest">Partitura GP</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 group-hover:bg-slate-800 transition-colors">
                                                            <CatIcon size={48} className="text-slate-700/20 mb-2 group-hover:scale-110 transition-transform" />
                                                            <span className="text-[8px] font-black text-slate-700/40 uppercase tracking-widest">Lección Local</span>
                                                        </div>
                                                    )}

                                                    {/* Overlays */}
                                                    {item.duration && (
                                                        <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md text-[9px] font-black text-white px-2 py-0.5 rounded shadow-xl border border-white/10 tracking-widest">
                                                            {item.duration}
                                                        </div>
                                                    )}

                                                    {parseInt(item.completed) === 1 && (
                                                        <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-slate-950 text-[8px] font-black px-2 py-1 rounded flex items-center gap-1 shadow-lg uppercase tracking-widest z-10">
                                                            <Check size={8} strokeWidth={4} /> Listas
                                                        </div>
                                                    )}
                                                    
                                                    <div className="absolute top-2.5 right-2.5 flex gap-1 items-center">
                                                        <button 
                                                            onClick={(e) => toggleCompleted(e, item)}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-xl border ${parseInt(item.completed) === 1 ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-black/40 text-white/50 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400'}`}
                                                            title="Marcar como completada"
                                                        >
                                                            <Check size={14} strokeWidth={4} />
                                                        </button>
                                                        <div className="flex gap-1 bg-black/40 backdrop-blur-sm p-1 rounded-lg border border-white/5 h-7 items-center">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <div 
                                                                    key={star} 
                                                                    className={`w-1.5 h-1.5 rounded-full ${parseInt(item.difficulty) >= star ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'bg-slate-700'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Hover Play Icon Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                                                            <Play size={24} fill="currentColor" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="p-4 flex gap-4 items-start">
                                                    {/* "Channel" Icon (Category Icon) */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner border border-white/5 transition-transform group-hover:scale-110 ${parseInt(item.completed) ? 'bg-emerald-500/10 text-emerald-500' : `${cat.bg} ${cat.color}`}`}>
                                                        <CatIcon size={18} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`text-sm font-black leading-tight mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors ${parseInt(item.completed) ? 'text-slate-500 line-through decoration-emerald-500/30' : 'text-slate-100'}`}>
                                                            {item.title}
                                                        </h4>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 truncate">
                                                                <span className="truncate">{item.artist || 'HarpHub Original'}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                                                                <span className="uppercase text-blue-500/70 text-[9px] tracking-widest">{cat.name}</span>
                                                            </div>
                                                            {item.harmonica_key && item.harmonica_key !== 'ALL' && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-tighter bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                                                                        Tono: {item.harmonica_key}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {sortedItems.length === 0 && searchTerm !== '' && (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <Search size={48} className="mb-4 text-slate-600" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">No se encontraron resultados para "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonDashboardList;
