import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
    Search, TrendingUp, Users, Music, 
    Layers, Zap, Play, ChevronRight,
    Star, Award, Globe, Compass, BookOpen
} from 'lucide-react';
import { MOCK_DISCOVERY } from '../utils/mockSocialData';

export default function DiscoveryPage() {
    const { user } = useAuth();
    const [data, setData] = useState({ trending_creators: [], popular_collections: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiscovery();
    }, []);

    const fetchDiscovery = async () => {
        setLoading(true);
        try {
            const res = await api.getDiscovery(user?.id);
            if (res.success && (res.creators?.length > 0 || res.collections?.length > 0)) {
                setData(res);
            } else {
                setData(MOCK_DISCOVERY);
            }
        } catch (error) {
            console.error("Error fetching discovery data, using mock data:", error);
            setData(MOCK_DISCOVERY);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em]">Explorando el multiverso musical...</p>
        </div>
    );

    return (
        <div className="flex-1 bg-slate-950 min-h-full pb-32">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Discovery Hero */}
                <div className="mb-16 p-12 rounded-[4rem] bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden shadow-2xl shadow-emerald-900/20 group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl">
                                <Compass size={24} className="text-white" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.4em]">Exploración de Conocimiento</span>
                        </div>
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
                            Descubre nuevos <br/> horizontes musicales
                        </h2>
                        <p className="text-emerald-50 font-medium text-lg max-w-xl opacity-80">
                            Conéctate con músicos que comparten tu pasión y descubre bibliotecas de conocimiento diseñadas para acelerar tu aprendizaje.
                        </p>
                    </div>
                    <Globe size={200} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
                    {/* Trending Creators */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                                <TrendingUp size={16} className="text-emerald-500" /> Creadores Tendencia
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {data.creators?.map((creator, i) => (
                                <Link 
                                    key={creator.id} 
                                    to={`/profile/${creator.username}`}
                                    className="group flex items-center gap-4 p-5 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:bg-slate-900 hover:border-emerald-500/30 transition-all duration-500"
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                                            {creator.avatar_url ? (
                                                <img src={creator.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-black text-emerald-500">{creator.username.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-950 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-black text-white group-hover:text-emerald-400 transition truncate">{creator.full_name || creator.username}</h4>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-600">@{creator.username}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-700 group-hover:text-emerald-500 transition group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Popular Collections */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                                <Layers size={16} className="text-blue-500" /> Colecciones Populares
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.collections?.map(col => (
                                <div key={col.id} className="group bg-slate-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-slate-900 hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full">
                                    <div className="h-44 bg-slate-800 relative">
                                        {col.cover_image ? (
                                            <img src={col.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                                        ) : col.sample_youtube_id ? (
                                            <img 
                                                src={`https://img.youtube.com/vi/${col.sample_youtube_id}/hqdefault.jpg`} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 opacity-60 group-hover:opacity-100" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                <Layers size={48} className="text-slate-700" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-6 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                                            {col.lesson_count || 0} ITEMS
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-2xl font-black text-white group-hover:text-blue-400 transition mb-3 leading-tight tracking-tight">
                                                {col.title}
                                            </h4>
                                            <p className="text-slate-500 text-sm font-medium line-clamp-2 italic mb-6">
                                                {col.description || "Una colección curada de conocimiento musical."}
                                            </p>
                                        </div>
                                        <Link 
                                            to={`/collection/${col.id}`}
                                            className="w-full py-4 bg-slate-800/50 hover:bg-blue-600 rounded-[1.5rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all shadow-xl shadow-blue-900/0 hover:shadow-blue-900/30"
                                        >
                                            Explorar Colección <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trending Paths */}
                <div className="mb-24">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                            <BookOpen size={16} className="text-amber-500" /> Rutas de Aprendizaje Tendencia
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.paths?.map(path => (
                            <Link 
                                key={path.id} 
                                to={`/path/${path.id}`}
                                className="group bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 hover:bg-slate-900 hover:border-amber-500/30 transition-all duration-500"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                        <Compass size={24} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{path.instrument}</span>
                                </div>
                                <h4 className="text-xl font-black text-white group-hover:text-amber-400 transition mb-3 leading-tight tracking-tight">
                                    {path.title}
                                </h4>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2 italic mb-8">
                                    {path.description}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                            {path.creator_name?.charAt(0)}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600">@{path.creator_name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{path.node_count} PASOS</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArrowRight({ size, className }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
    );
}
