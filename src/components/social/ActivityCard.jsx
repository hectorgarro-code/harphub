import React from 'react';
import { 
    Play, Clock, Activity, Star, Zap, 
    ChevronRight, Music, User, Share2, Quote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ActivityCard({ activity }) {
    const navigate = useNavigate();
    const metrics = activity.metrics_json ? JSON.parse(activity.metrics_json) : {};
    
    const getTypeConfig = (type) => {
        switch (type) {
            case 'bpm_record':
                return {
                    icon: <Zap size={24} className="text-amber-400" />,
                    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
                    border: 'group-hover:border-amber-500/30',
                    label: 'Récord de Velocidad',
                    bgIcon: <Zap size={120} className="text-amber-500/5 absolute -right-4 -bottom-4 rotate-12" />
                };
            case 'practice_session':
                return {
                    icon: <Activity size={24} className="text-blue-400" />,
                    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
                    border: 'group-hover:border-blue-500/30',
                    label: 'Sesión Destacada',
                    bgIcon: <Activity size={120} className="text-blue-500/5 absolute -right-4 -bottom-4 -rotate-12" />
                };
            case 'review_received':
                return {
                    icon: <Star size={24} className="text-emerald-400" />,
                    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
                    border: 'group-hover:border-emerald-500/30',
                    label: 'Feedback Técnico',
                    bgIcon: <Star size={120} className="text-emerald-500/5 absolute -right-4 -bottom-4 rotate-12" />
                };
            case 'first_submission':
                return {
                    icon: <Music size={24} className="text-rose-400" />,
                    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
                    border: 'group-hover:border-rose-500/30',
                    label: 'Nueva Práctica',
                    bgIcon: <Music size={120} className="text-rose-500/5 absolute -right-4 -bottom-4 rotate-6" />
                };
            default:
                return {
                    icon: <Activity size={24} className="text-indigo-400" />,
                    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
                    border: 'group-hover:border-indigo-500/30',
                    label: 'Actividad Musical',
                    bgIcon: <Activity size={120} className="text-indigo-500/5 absolute -right-4 -bottom-4 rotate-12" />
                };
        }
    };

    const config = getTypeConfig(activity.type);
    const hasContent = activity.title || activity.content;
    const hasMetrics = metrics.bpm || metrics.duration || activity.lesson_title;

    return (
        <div className={`group relative bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 ${config.border} hover:-translate-y-1`}>
            {/* Background Gradient & Icon */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            {config.bgIcon}
            
            <div className="relative p-8 flex flex-col h-full min-h-[280px]">
                {/* Header: User Info & Tag */}
                <div className="flex items-start justify-between mb-auto z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-800/80 bg-slate-900">
                                {activity.avatar_url ? (
                                    <img src={activity.avatar_url} alt={activity.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-black text-white tracking-tight leading-none mb-1 group-hover:text-blue-400 transition-colors">{activity.username}</h4>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">
                                <Clock size={10} /> Reciente
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/40 border border-white/10 backdrop-blur-md shadow-lg">
                        {config.icon}
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{config.label}</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="py-8 z-10 relative">
                    {hasContent ? (
                        <div className="space-y-4">
                            {activity.title && (
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                                    {activity.title}
                                </h3>
                            )}
                            {activity.content && (
                                <div className="flex gap-4 items-start">
                                    <Quote size={24} className="text-white/20 shrink-0 mt-1" />
                                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed max-w-xl italic">
                                        "{activity.content}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 opacity-60">
                            <div className="w-12 h-1 bg-white/10 rounded-full"></div>
                            <p className="text-slate-400 text-sm font-black uppercase tracking-widest italic">Sesión registrada en el estudio</p>
                            <div className="w-12 h-1 bg-white/10 rounded-full"></div>
                        </div>
                    )}
                </div>

                {/* Metrics Grid */}
                {hasMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 z-10">
                        {metrics.bpm && (
                            <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md flex flex-col items-start justify-center group/metric hover:bg-slate-900/80 transition-colors">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Velocidad</span>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-white">{metrics.bpm}</span>
                                    <span className="text-xs font-bold text-amber-500 mb-1">BPM</span>
                                </div>
                            </div>
                        )}
                        {metrics.duration && (
                            <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md flex flex-col items-start justify-center group/metric hover:bg-slate-900/80 transition-colors">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tiempo</span>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black text-white">{metrics.duration}</span>
                                    <span className="text-xs font-bold text-blue-400 mb-1">MIN</span>
                                </div>
                            </div>
                        )}
                        {activity.lesson_title && (
                            <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md col-span-2 md:col-span-1 flex flex-col justify-center">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Módulo de Estudio</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                        <Music size={12} />
                                    </div>
                                    <span className="text-xs font-bold text-white truncate">{activity.lesson_title}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 mt-auto border-t border-white/10 z-10">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition group/btn">
                        <Share2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Compartir Logro</span>
                    </button>

                    <button 
                        onClick={() => activity.lesson_id && navigate(`/lesson/${activity.lesson_id}`)}
                        className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-900/50 hover:shadow-blue-600/50"
                    >
                        Practicar Ahora
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
