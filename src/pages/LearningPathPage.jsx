import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, Share2, Bookmark, GitFork, 
    Zap, Award, Clock, Lock, CheckCircle2,
    Play, Info, ChevronRight, MoreVertical, Edit3
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function LearningPathPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [path, setPath] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPath();
    }, [id]);

    const fetchPath = async () => {
        setLoading(true);
        try {
            const res = await api.getLearningPath(id, user?.id);
            if (res.success) {
                setPath(res.path);
                setNodes(res.nodes);
                setProgress(res.progress);
            }
        } catch (error) {
            console.error("Error fetching path:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNodeClick = (node) => {
        const isLocked = isNodeLocked(node);
        if (isLocked) return;

        if (node.entity_type === 'lesson') {
            navigate(`/lesson/${node.entity_id}`);
        } else if (node.entity_type === 'collection') {
            // Future: navigate to collection
        }
    };

    const isNodeCompleted = (nodeId) => {
        return progress?.completed_nodes?.includes(nodeId);
    };

    const isNodeLocked = (node) => {
        if (!node.prerequisite_node_id) return false;
        return !progress?.completed_nodes?.includes(node.prerequisite_node_id);
    };

    if (loading) return (
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center gap-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Trazando tu Camino Musical...</p>
        </div>
    );

    if (!path) return <div className="flex-1 bg-slate-950 text-white p-20">Ruta no encontrada.</div>;

    const mastery = progress?.mastery || 0;

    return (
        <div className="flex-1 bg-slate-950 min-h-full pb-40">
            {/* Header Nav */}
            <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-white transition">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                        <div>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-0.5">Ruta de Aprendizaje • {path.instrument}</span>
                            <h2 className="text-sm font-black text-white truncate max-w-[200px] md:max-w-md">{path.title}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {user?.id === path?.creator_id && (
                            <button 
                                onClick={() => navigate(`/path-builder/${id}`)}
                                className="h-10 flex items-center gap-2 px-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                            >
                                <Edit3 size={14} /> Editar
                            </button>
                        )}
                        <button 
                            className="h-10 flex items-center gap-2 px-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                        >
                            <GitFork size={14} /> Fork
                        </button>
                        <div className="flex items-center gap-2 ml-2">
                            <button className="h-10 w-10 flex items-center justify-center bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition">
                                <Bookmark size={18} />
                            </button>
                            <button className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/40 transition">
                                <Zap size={16} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6">
                {/* Hero Section */}
                <header className="pt-12 md:pt-20 mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center font-black text-blue-500 border border-blue-500/20">
                            {path.creator_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Metodología de</p>
                            <h3 className="text-sm font-black text-white">{path.creator_name}</h3>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                        {path.title}
                    </h1>

                    <p className="text-slate-400 font-bold text-lg max-w-2xl mb-12">
                        {path.description}
                    </p>

                    <div className="flex flex-wrap gap-8 items-center">
                        <div className="flex items-center gap-3">
                            <Award className="text-amber-500" size={20} />
                            <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Dificultad</p>
                                <p className="text-xs font-black text-white uppercase">{path.difficulty}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="text-blue-500" size={20} />
                            <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Tiempo Estimado</p>
                                <p className="text-xs font-black text-white uppercase">{path.estimated_duration || 'Flexible'}</p>
                            </div>
                        </div>
                        
                        <div className="ml-auto flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Tu Progreso</p>
                                <p className="text-xs font-black text-white">{Math.round(mastery)}% completado</p>
                            </div>
                            <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-1000" 
                                    style={{ width: `${mastery}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Roadmap Journey */}
                <div className="relative">
                    {/* The Connecting Line */}
                    <div className="absolute left-[39px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-blue-500/50 via-slate-800 to-slate-900/20 z-0"></div>

                    <div className="space-y-16 relative z-10">
                        {nodes.map((node, index) => {
                            const completed = isNodeCompleted(node.id);
                            const locked = isNodeLocked(node);
                            const active = !completed && !locked;

                            return (
                                <div key={node.id} className="flex gap-10 group">
                                    {/* Node Indicator */}
                                    <div className="relative">
                                        <div className={`
                                            w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 border-2
                                            ${completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
                                              locked ? 'bg-slate-900 border-white/5 text-slate-700' : 
                                              'bg-blue-600 border-blue-400 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] scale-110'}
                                        `}>
                                            {completed ? <CheckCircle2 size={32} /> : 
                                             locked ? <Lock size={28} /> : 
                                             <Play size={32} fill="currentColor" />}
                                        </div>
                                        
                                        {node.milestone == 1 && (
                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-xl">
                                                <Award size={14} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Node Content */}
                                    <div className={`
                                        flex-1 p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer
                                        ${locked ? 'bg-slate-950/50 border-white/5 opacity-50 grayscale' : 
                                          active ? 'bg-slate-900/80 border-blue-500/30 hover:border-blue-500/60 shadow-xl' :
                                          'bg-slate-900/40 border-emerald-500/20 hover:border-emerald-500/40'}
                                    `} onClick={() => handleNodeClick(node)}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                        node.entity_type === 'lesson' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                                                    }`}>
                                                        {node.entity_type}
                                                    </span>
                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                                        Paso {index + 1}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black text-white tracking-tight leading-tight">
                                                    {node.entity_title}
                                                </h4>
                                            </div>
                                            <div className={`p-3 rounded-2xl ${active ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>

                                        {node.notes && (
                                            <p className="text-slate-500 text-sm font-bold mb-6 line-clamp-2">
                                                {node.notes}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{node.estimated_time || '15 min'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Award size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{node.entity_difficulty}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Final Milestone CTA */}
                <footer className="mt-40 text-center py-20 border-t border-white/5">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-amber-600 mx-auto flex items-center justify-center text-slate-950 shadow-2xl shadow-amber-900/40 mb-10 animate-bounce">
                        <Award size={40} />
                    </div>
                    <h3 className="text-4xl font-black text-white tracking-tight mb-4">¡Casi en la Meta!</h3>
                    <p className="text-slate-500 font-bold mb-12 max-w-md mx-auto">Completa todos los nodos para masterizar esta metodología y obtener tu insignia de dominio.</p>
                </footer>
            </div>
        </div>
    );
}
