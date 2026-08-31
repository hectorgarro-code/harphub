import React, { useMemo } from 'react';
import { 
    X, Trophy, Zap, Timer, Star, Target, 
    TrendingUp, Calendar, Award, ChevronRight, 
    Flame, BarChart, BookOpen, Music, Hash
} from 'lucide-react';

const ACHIEVEMENTS_DEF = {
    'first_lesson': { title: 'Primer Paso', description: 'Completa tu primera lección', icon: <BookOpen className="text-blue-400" /> },
    'streak_3': { title: 'Compromiso', description: 'Mantén una racha de 3 días', icon: <Flame className="text-orange-500" /> },
    'streak_7': { title: 'Imparable', description: 'Mantén una racha de 7 días', icon: <Zap className="text-amber-500" /> },
    'points_1000': { title: 'Entusiasta', description: 'Alcanza los 1,000 puntos', icon: <Star className="text-yellow-400" /> },
    'guitar_master': { title: 'Guitar Hero', description: 'Juega 10 veces al Guitar Master', icon: <Hash className="text-purple-400" /> },
    'blues_master': { title: 'Blues Soul', description: 'Completa 5 ejercicios de Blues', icon: <Music className="text-emerald-400" /> },
};

const UserProfileModal = ({ isOpen, onClose, user, stats, achievements }) => {
    if (!isOpen) return null;

    const levelProgress = useMemo(() => {
        const pointsInCurrentLevel = stats.points % 500;
        return (pointsInCurrentLevel / 500) * 100;
    }, [stats.points]);

    const nextLevelPoints = useMemo(() => {
        return 500 - (stats.points % 500);
    }, [stats.points]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                
                {/* Header Section */}
                <div className="relative p-8 md:p-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-b border-slate-800">
                    <button 
                        onClick={onClose}
                        className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-white hover:bg-slate-700 transition-all z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar / Level Ring */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-black text-blue-500 shadow-2xl">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-blue-600 border-4 border-slate-900 flex items-center justify-center text-white font-black text-lg shadow-xl">
                                {stats.level}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{user?.username}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                                <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                    Nivel {stats.level}
                                </span>
                                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                    {stats.points} Puntos Totales
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="max-w-md">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso de Nivel</span>
                                    <span className="text-xs font-black text-blue-400">Faltan {nextLevelPoints} XP</span>
                                </div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 shadow-lg shadow-blue-500/50"
                                        style={{ width: `${levelProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Stats Cards Column */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Estadísticas Vitales</h3>
                            
                            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 hover:border-orange-500/30 transition-all group">
                                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Flame size={28} />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white leading-none mb-1">{stats.streak}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Días de Racha</div>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 hover:border-blue-500/30 transition-all group">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <Timer size={28} />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white leading-none mb-1">{stats.practiceHours.toFixed(1)}h</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tiempo de Práctica</div>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 flex items-center gap-4 hover:border-emerald-500/30 transition-all group">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Trophy size={28} />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white leading-none mb-1">{achievements.length}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logros Desbloqueados</div>
                                </div>
                            </div>
                        </div>

                        {/* Achievements Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Logros y Reconocimientos</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(ACHIEVEMENTS_DEF).map(([key, def]) => {
                                    const isUnlocked = achievements.some(a => a.achievement_key === key);
                                    return (
                                        <div 
                                            key={key} 
                                            className={`p-6 rounded-[2rem] border transition-all ${
                                                isUnlocked 
                                                ? 'bg-slate-800/40 border-slate-700 shadow-lg' 
                                                : 'bg-slate-900 border-slate-800 opacity-40 grayscale'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                                                    isUnlocked ? 'bg-slate-800' : 'bg-slate-950'
                                                }`}>
                                                    {def.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white text-sm uppercase tracking-tight">{def.title}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold leading-tight mt-1">{def.description}</p>
                                                </div>
                                                {isUnlocked && <Award className="ml-auto text-emerald-500" size={20} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Tip */}
                <div className="p-8 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-blue-500" size={20} />
                        <span className="text-xs text-slate-400 font-medium">¡Vas por buen camino! Practica 15 minutos más para asegurar tu racha.</span>
                    </div>
                    <button className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition">
                        Ver Ranking Global <ChevronRight size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UserProfileModal;
