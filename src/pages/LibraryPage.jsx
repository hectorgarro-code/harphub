import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
    BookOpen, Folder, Star, Clock, 
    Plus, Search, Filter, MoreVertical,
    Music, Layout, Grid, List, ChevronRight, X, Edit3, Trash2, Video,
    ChevronDown, ChevronUp, Check, Flame, Zap, Play, FilterX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CollectionModal from '../components/collections/CollectionModal';

export default function LibraryPage({ setIsAdding }) {
    const { user } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [instrumentFilter, setInstrumentFilter] = useState('all');
    const [durationFilter, setDurationFilter] = useState('all');
    const [completionFilter, setCompletionFilter] = useState('all'); // all, completed, pending
    const [sortBy, setSortBy] = useState('title');
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        if (user) fetchLibrary();

        const handleUpdate = () => fetchLibrary();
        const handleOpenNewCol = () => {
            setSelectedCollection(null);
            setIsNewCollectionOpen(true);
        };

        window.addEventListener('lesson-updated', handleUpdate);
        window.addEventListener('collections-updated', handleUpdate);
        window.addEventListener('focus', handleUpdate);
        window.addEventListener('open-new-collection', handleOpenNewCol);

        return () => {
            window.removeEventListener('lesson-updated', handleUpdate);
            window.removeEventListener('collections-updated', handleUpdate);
            window.removeEventListener('focus', handleUpdate);
            window.removeEventListener('open-new-collection', handleOpenNewCol);
        };
    }, [user]);

    const fetchLibrary = async () => {
        setLoading(true);
        try {
            const resL = await api.request('get_lessons', 'GET', { user_id: user?.id });
            if (Array.isArray(resL)) setLessons(resL);

            const resC = await api.request('get_collections', 'GET', { user_id: user?.id });
            if (resC.success) {
                setCollections(resC.collections);
                // Expand all by default
                const expanded = {};
                resC.collections.forEach(c => expanded[c.id] = true);
                expanded['others'] = true;
                setExpandedGroups(expanded);
            }
        } catch (error) {
            console.error("Error fetching library:", error);
        } finally {
            setLoading(false);
        }
    };

    const parseDuration = (d) => {
        if (!d) return 5;
        if (typeof d === 'number') return d;
        const s = String(d);
        if (s.includes(':')) {
            const parts = s.split(':').map(Number);
            if (parts.length === 2) return parts[0] + (parts[1] / 60);
            if (parts.length === 3) return (parts[0] * 60) + parts[1] + (parts[2] / 60);
        }
        return parseFloat(s) || 5;
    };

    const filteredLessons = useMemo(() => {
        return lessons.filter(l => {
            const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesInstrument = instrumentFilter === 'all' || l.instrument?.toLowerCase() === instrumentFilter.toLowerCase();
            const matchesCompletion = completionFilter === 'all' ? true : (completionFilter === 'completed' ? l.completed : !l.completed);
            
            const mins = parseDuration(l.duration);
            let matchesDuration = true;
            if (durationFilter === '<10') matchesDuration = mins < 10;
            else if (durationFilter === '10-30') matchesDuration = mins >= 10 && mins <= 30;
            else if (durationFilter === '>30') matchesDuration = mins > 30;

            return matchesSearch && matchesInstrument && matchesCompletion && matchesDuration;
        }).sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'difficulty') {
                const diffMap = { 'Fácil': 1, 'Media': 2, 'Difícil': 3, 'Experto': 4 };
                return (diffMap[a.difficulty] || 0) - (diffMap[b.difficulty] || 0);
            }
            if (sortBy === 'duration') return parseDuration(a.duration) - parseDuration(b.duration);
            return 0;
        });
    }, [lessons, searchTerm, instrumentFilter, completionFilter, durationFilter, sortBy]);

    const groupedLessons = useMemo(() => {
        const groups = collections.map(col => {
            const lessonsInCol = filteredLessons.filter(l => l.category === col.title || l.collection_id === col.id);
            return {
                ...col,
                lessons: lessonsInCol,
                type: col.title?.toLowerCase()
            };
        }).filter(g => g.lessons.length > 0);

        // Add Watch Later
        const watchLaterData = JSON.parse(localStorage.getItem('watch_later') || '[]');
        if (watchLaterData.length > 0) {
            groups.unshift({
                id: 'watch_later',
                title: 'Ver más tarde',
                lessons: watchLaterData.map(act => ({
                    id: act.content_id || act.id,
                    title: act.lesson_title || 'Publicación guardada',
                    youtube_id: act.metadata?.youtube_id,
                    instrument: act.metadata?.instrument || 'Varios',
                    duration: act.metadata?.duration ? `${Math.floor(act.metadata.duration / 60)}:00` : '5:00',
                    is_activity: true // Flag to handle different link/data
                })),
                type: 'daily'
            });
        }

        const otherLessons = filteredLessons.filter(l => 
            !collections.some(col => l.category === col.title || l.collection_id === col.id)
        );

        if (otherLessons.length > 0) {
            groups.push({
                id: 'others',
                title: 'Otras Lecciones',
                lessons: otherLessons,
                type: 'others'
            });
        }

        return groups;
    }, [collections, filteredLessons]);

    const toggleGroup = (id) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allGroupsExpanded = useMemo(() => 
        groupedLessons.length > 0 && groupedLessons.every(g => expandedGroups[g.id]),
    [groupedLessons, expandedGroups]);

    const toggleAllGroups = () => {
        const newState = {};
        groupedLessons.forEach(g => {
            newState[g.id] = !allGroupsExpanded;
        });
        setExpandedGroups(newState);
    };

    const getGroupIcon = (type) => {
        switch (type) {
            case 'daily':
            case 'práctica diaria': return <Clock size={20} className="text-blue-400" />;
            case 'jam':
            case 'jams': return <Music size={20} className="text-emerald-400" />;
            case 'riffs':
            case 'riffs & licks': return <Flame size={20} className="text-purple-400" />;
            case 'groove': return <Zap size={20} className="text-pink-400" />;
            default: return <BookOpen size={20} className="text-slate-400" />;
        }
    };

    const getGroupColor = (type) => {
        switch (type) {
            case 'daily':
            case 'práctica diaria': return 'bg-blue-500/10 border-blue-500/20';
            case 'jam':
            case 'jams': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'riffs':
            case 'riffs & licks': return 'bg-purple-500/10 border-purple-500/20';
            case 'groove': return 'bg-pink-500/10 border-pink-500/20';
            default: return 'bg-slate-800/50 border-white/5';
        }
    };

    return (
        <div className="flex-1 bg-slate-950 min-h-screen pb-32">
            <header className="px-8 pt-12 pb-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Bóveda de Lecciones</h1>
                        <p className="text-slate-500 font-bold text-sm">Organiza tu conocimiento y domina tu instrumento.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative group flex-1 md:flex-none md:min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Buscar lección, artista..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        <div className="flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 relative group hover:bg-slate-900 transition-colors">
                            <Layout size={14} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                            <select 
                                value={instrumentFilter}
                                onChange={(e) => setInstrumentFilter(e.target.value)}
                                className="bg-transparent py-3.5 pl-2 pr-6 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none cursor-pointer appearance-none"
                            >
                                <option value="all" className="bg-slate-950">TODOS</option>
                                <option value="harmonica" className="bg-slate-950">ARMÓNICA</option>
                                <option value="guitar" className="bg-slate-950">GUITARRA</option>
                                <option value="piano" className="bg-slate-950">PIANO</option>
                                <option value="ukelele" className="bg-slate-950">UKELELE</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-900/30 p-4 rounded-[2rem] border border-white/5">
                    <div className="flex flex-wrap items-center gap-4">

                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5">
                            <Clock size={14} className="text-slate-500" />
                            <select 
                                value={durationFilter}
                                onChange={(e) => setDurationFilter(e.target.value)}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer"
                            >
                                <option value="all">CUALQUIER DURACIÓN</option>
                                <option value="<10">MENOR A 10 MIN</option>
                                <option value="10-30">10 A 30 MIN</option>
                                <option value=">30">MÁS DE 30 MIN</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5">
                            <Star size={14} className="text-slate-500" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none cursor-pointer"
                            >
                                <option value="title">ORDENAR POR TÍTULO</option>
                                <option value="difficulty">ORDENAR POR DIFICULTAD</option>
                                <option value="duration">ORDENAR POR DURACIÓN</option>
                            </select>
                        </div>

                        <button 
                            onClick={() => {
                                setCompletionFilter(prev => {
                                    if (prev === 'all') return 'pending';
                                    if (prev === 'pending') return 'completed';
                                    return 'all';
                                });
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                completionFilter === 'completed' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 
                                completionFilter === 'pending' ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 
                                'bg-slate-950/50 border-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <Check size={14} className={completionFilter === 'all' ? 'opacity-50' : ''} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {completionFilter === 'all' ? 'TODAS LAS LECCIONES' : 
                                 completionFilter === 'pending' ? 'SOLO PENDIENTES' : 'SOLO FINALIZADAS'}
                            </span>
                        </button>
                    </div>

                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-3">
                        {filteredLessons.length} RESULTADOS
                        <button 
                            onClick={toggleAllGroups}
                            title={allGroupsExpanded ? "Colapsar todo" : "Expandir todo"}
                            className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center hover:bg-slate-800 transition shadow-lg"
                        >
                            <ChevronUp size={14} className={`transition-transform duration-300 ${allGroupsExpanded ? '' : 'rotate-180'}`} />
                        </button>
                    </div>
                </div>

                {/* Grouped Accordions */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1,2,3].map(n => <div key={n} className="h-24 bg-slate-900/50 rounded-[2rem]"></div>)}
                        </div>
                    ) : groupedLessons.length > 0 ? (
                        groupedLessons.map(group => {
                            const isExpanded = expandedGroups[group.id];
                            const title = (group.title === 'daily' ? 'Práctica Diaria' :
                                   group.title === 'warmup' ? 'Warm Up' :
                                   group.title === 'challenge' ? 'Desafíos' :
                                   group.title === 'jam' ? 'Jams (Temas)' :
                                   group.title === 'riffs' ? 'Riffs & Licks' :
                                   group.title === 'groove' ? 'Groove' :
                                   group.title === 'theory' ? 'Teoría' : group.title);

                            return (
                                <div key={group.id} className="group/accordion bg-slate-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500">
                                    <div 
                                        onClick={() => toggleGroup(group.id)}
                                        className={`flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-xl ${getGroupColor(group.type)}`}>
                                                {getGroupIcon(group.type)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.lessons.length} Lecciones</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            {isExpanded && (
                                                <div className="hidden md:flex items-center gap-2 mr-4">
                                                    {group.id === 'watch_later' && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('¿Vaciar lista de Ver más tarde?')) {
                                                                    localStorage.removeItem('watch_later');
                                                                    fetchLibrary(); // This won't work as expected if it doesn't refetch groups, but since groups is useMemo it might update if state changes.
                                                                    // Actually, I should probably use a local state for watchLater to trigger re-render.
                                                                    window.location.reload(); // Simple way to refresh
                                                                }
                                                            }}
                                                            className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition flex items-center gap-2 px-4"
                                                            title="Vaciar lista"
                                                        >
                                                            <Trash2 size={16} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Vaciar</span>
                                                        </button>
                                                    )}
                                                    {group.id !== 'watch_later' && (
                                                        <>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Logic to mark all in this group as completed
                                                                    const ids = group.lessons.map(l => l.id);
                                                                    if (window.confirm(`¿Marcar las ${ids.length} lecciones como finalizadas?`)) {
                                                                        Promise.all(ids.map(id => api.request('update_lesson', 'POST', { id, completed: 1, user_id: user.id })))
                                                                            .then(() => fetchLibrary());
                                                                    }
                                                                }}
                                                                className="p-2.5 bg-slate-900 text-slate-500 hover:text-white rounded-xl border border-white/5 transition"
                                                                title="Marcar todas como completadas"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Logic to mark all in this group as starred/saved
                                                                    const ids = group.lessons.map(l => l.id);
                                                                    Promise.all(ids.map(id => api.toggleSave(user.id, 'lesson', id)))
                                                                        .then(() => fetchLibrary());
                                                                }}
                                                                className="p-2.5 bg-slate-900 text-slate-500 hover:text-white rounded-xl border border-white/5 transition"
                                                                title="Añadir todas a favoritos"
                                                            >
                                                                <Star size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}
                                                                className="p-2.5 bg-slate-900 text-slate-500 hover:text-white rounded-xl border border-white/5 transition"
                                                                title="Nueva Lección en esta colección"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <div className={`w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover/accordion:text-white transition-all ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 border-t border-white/5 bg-black/20">
                                            {group.lessons.map(lesson => {
                                                const thumb = lesson.youtube_id 
                                                    ? `https://img.youtube.com/vi/${lesson.youtube_id}/hqdefault.jpg` 
                                                    : lesson.cover_image 
                                                        ? (lesson.cover_image.startsWith('http') ? lesson.cover_image : `http://localhost/harphub/${lesson.cover_image}`)
                                                        : null;

                                                return (
                                                    <Link 
                                                        key={lesson.id} 
                                                        to={`/lesson/${lesson.id}`}
                                                        className="group/card flex flex-col bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden hover:bg-slate-900 hover:border-blue-500/30 transition-all duration-500 shadow-xl hover:shadow-blue-500/10"
                                                    >
                                                        <div className="aspect-video relative overflow-hidden bg-slate-800">
                                                            {thumb ? (
                                                                <img src={thumb} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" alt={lesson.title} />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Play size={40} className="text-slate-700 group-hover/card:text-blue-500 transition-colors" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors"></div>
                                                            
                                                            {/* Badges on Thumbnail */}
                                                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                                {lesson.completed && (
                                                                    <div className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/40 border border-emerald-400/50">
                                                                        <Check size={14} strokeWidth={4} />
                                                                    </div>
                                                                )}
                                                                <div className="px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1 shadow-xl">
                                                                    {[1,2,3,4,5].map(dot => (
                                                                        <div 
                                                                            key={dot} 
                                                                            className={`w-1.5 h-1.5 rounded-full ${dot <= (lesson.difficulty === 'Fácil' ? 1 : lesson.difficulty === 'Media' ? 2 : lesson.difficulty === 'Difícil' ? 4 : 5) ? 'bg-amber-500' : 'bg-slate-700'}`}
                                                                        ></div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] font-black text-white border border-white/10">
                                                                {lesson.duration || '5:00'}
                                                            </div>
                                                        </div>

                                                        <div className="p-5">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                                                    <Clock size={12} />
                                                                </div>
                                                                <h4 className="font-black text-white leading-tight line-clamp-2 group-hover/card:text-blue-400 transition-colors">
                                                                    {lesson.title}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{lesson.instrument?.charAt(0)}. • {title}</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-32 text-center bg-slate-900/20 rounded-[4rem] border border-dashed border-white/5">
                            <FilterX size={64} className="mx-auto text-slate-800 mb-8" />
                            <h3 className="text-2xl font-black text-white mb-3">No se encontraron lecciones</h3>
                            <p className="text-slate-500 font-bold mb-12 max-w-md mx-auto">Prueba ajustando tus filtros o busca algo diferente.</p>
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setInstrumentFilter('all');
                                    setDurationFilter('all');
                                    setCompletionFilter('all');
                                }}
                                className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <CollectionModal 
                isOpen={isNewCollectionOpen} 
                onClose={() => { setIsNewCollectionOpen(false); setSelectedCollection(null); }}
                user={user}
                onCreated={fetchLibrary}
                collection={selectedCollection}
            />
        </div>
    );
}
