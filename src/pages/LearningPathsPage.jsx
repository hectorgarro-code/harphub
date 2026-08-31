import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLearningPath } from '../hooks/useLearningPath';
import { useNavigate } from 'react-router-dom';
import { Map, Zap, Users, Compass, Clock, Award, Play, Plus, ArrowRight } from 'lucide-react';
import ContinueLearningPanel from '../components/learning/ContinueLearningPanel';

export default function LearningPathsPage() {
    const { user } = useAuth();
    const { paths, loading, fetchPaths } = useLearningPath(user?.id);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPaths('popular'); // default to popular/featured
    }, [fetchPaths]);

    if (loading && paths.length === 0) {
        return <div className="p-8 text-center text-slate-400">Cargando rutas de aprendizaje...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-32">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Map className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Rutas de Aprendizaje</h1>
                        <p className="text-slate-400 font-medium">Caminos estructurados para tu evolución musical</p>
                    </div>
                </div>

            </header>

            <ContinueLearningPanel />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paths.map(path => (
                    <div 
                        key={path.id}
                        onClick={() => navigate(`/path/${path.id}`)}
                        className="group bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-2 hover:bg-slate-900/60 hover:border-purple-500/30 transition-all duration-500 cursor-pointer flex flex-col"
                    >
                        <div className="h-48 rounded-[2rem] bg-slate-800 overflow-hidden relative mb-4">
                            {path.cover_image ? (
                                <img src={path.cover_image} alt={path.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                                    <Map size={48} className="text-white/20" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                <Clock size={12} className="text-purple-400" />
                                <span className="text-xs font-bold text-white">{path.estimated_duration || '2.5 hs'}</span>
                            </div>
                        </div>

                        <div className="px-4 pb-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-md uppercase tracking-wider border border-purple-400/20">
                                    {path.difficulty || 'Principiante'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {path.instrument || 'Armónica'}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-purple-400 transition-colors">
                                {path.title}
                            </h3>
                            <p className="text-sm text-slate-400 font-medium line-clamp-2 mb-4 flex-1">
                                {path.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                    <Users size={14} />
                                    <span>{path.followers_count || 0} estudiantes</span>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {paths.length === 0 && !loading && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem] bg-slate-900/20">
                        <Compass className="w-12 h-12 text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No hay rutas disponibles</h3>
                        <p className="text-slate-400">Aún no se han creado rutas de aprendizaje públicas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
