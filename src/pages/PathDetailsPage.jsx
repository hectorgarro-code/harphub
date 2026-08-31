import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLearningPath } from '../hooks/useLearningPath';
import { Map, ArrowLeft, Play, CheckCircle2, Lock, Clock, Trophy, BookOpen } from 'lucide-react';

export default function PathDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { currentPath, pathNodes, pathProgress, loading, fetchPathDetails } = useLearningPath(user?.id);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchPathDetails(id);
        }
    }, [id, fetchPathDetails]);

    if (loading || !currentPath) {
        return <div className="p-8 text-center text-slate-400">Cargando detalles de la ruta...</div>;
    }

    const completedNodeIds = pathProgress?.completed_nodes || [];
    
    // Find first incomplete node
    let nextNodeId = null;
    for (const node of pathNodes) {
        if (!completedNodeIds.includes(node.id)) {
            nextNodeId = node.id;
            break;
        }
    }

    const handleNodeClick = (node) => {
        const isLocked = !completedNodeIds.includes(node.id) && node.id !== nextNodeId && node.is_required;
        if (isLocked) return;

        if (node.entity_type === 'lesson') {
            navigate(`/lesson/${node.entity_id}`);
        } else if (node.entity_type === 'collection') {
            navigate(`/library?collection=${node.entity_id}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-32">
            <button 
                onClick={() => navigate('/learning-paths')}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft size={16} /> Volver a Rutas
            </button>

            <header className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-8 mb-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                {currentPath.cover_image && (
                    <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{backgroundImage: `url(${currentPath.cover_image})`}}></div>
                )}
                
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl relative z-10 shrink-0">
                    <Map size={48} className="text-white" />
                </div>
                
                <div className="relative z-10 flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                        <span className="text-xs font-black text-purple-400 uppercase tracking-widest bg-purple-400/10 px-3 py-1 rounded-lg border border-purple-400/20">
                            {currentPath.difficulty}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={12} /> {currentPath.estimated_duration || 'Estimado 2 hs'}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-4">{currentPath.title}</h1>
                    <p className="text-slate-300 text-lg">{currentPath.description}</p>
                </div>
            </header>

            {/* ROADMAP VISUALIZATION */}
            <div className="relative py-12 px-4 md:px-12 bg-slate-900/30 rounded-[3rem] border border-white/5">
                {/* Center Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-800 -translate-x-1/2 rounded-full z-0 overflow-hidden">
                    {/* Progress Fill */}
                    <div 
                        className="w-full bg-gradient-to-b from-purple-500 to-blue-500 transition-all duration-1000"
                        style={{ height: `${pathNodes.length > 0 ? (completedNodeIds.length / pathNodes.length) * 100 : 0}%` }}
                    ></div>
                </div>

                <div className="space-y-16 relative z-10">
                    {pathNodes.map((node, index) => {
                        const isCompleted = completedNodeIds.includes(node.id);
                        const isNext = node.id === nextNodeId;
                        const isLocked = !isCompleted && !isNext && node.is_required;
                        
                        // Alternate left/right for visual rhythm
                        const isLeft = index % 2 === 0;

                        return (
                            <div key={node.id} className={`flex items-center w-full ${isLeft ? 'flex-row-reverse' : ''}`}>
                                {/* Empty space for alternating layout */}
                                <div className="w-1/2 hidden md:block"></div>
                                
                                {/* Node Dot */}
                                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    <button 
                                        onClick={() => handleNodeClick(node)}
                                        disabled={isLocked}
                                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                                            isCompleted ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]' :
                                            isNext ? 'bg-blue-500 border-white animate-pulse text-white shadow-[0_0_30px_rgba(59,130,246,0.6)] scale-110' :
                                            'bg-slate-800 border-slate-700 text-slate-500'
                                        }`}
                                    >
                                        {isCompleted ? <CheckCircle2 size={24} /> : 
                                         isLocked ? <Lock size={24} /> : 
                                         node.entity_type === 'lesson' ? <Play size={24} className="ml-1" /> :
                                         node.entity_type === 'collection' ? <BookOpen size={24} /> :
                                         <Trophy size={24} />}
                                    </button>
                                </div>

                                {/* Node Content Card */}
                                <div className={`w-full md:w-1/2 ${isLeft ? 'md:pr-16 text-right' : 'md:pl-16 text-left'} pl-20 md:pl-${isLeft ? '0' : '16'}`}>
                                    <div 
                                        onClick={() => handleNodeClick(node)}
                                        className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer ${
                                            isCompleted ? 'bg-slate-800/80 border-purple-500/30' :
                                            isNext ? 'bg-blue-900/40 border-blue-500/50 hover:bg-blue-900/60 shadow-xl' :
                                            'bg-slate-900/50 border-white/5 opacity-60'
                                        }`}
                                    >
                                        <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isCompleted ? 'text-purple-400' : isNext ? 'text-blue-400' : 'text-slate-500'}`}>
                                            Paso {index + 1} • {node.entity_type}
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-2">{node.title || node.entity_title}</h3>
                                        {node.description && (
                                            <p className="text-sm text-slate-400 font-medium">{node.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
