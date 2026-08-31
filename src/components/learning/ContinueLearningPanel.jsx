import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useReminders } from '../../hooks/useReminders';
import { Play, Map, Clock, ArrowRight, X, Bell, MoreHorizontal, Bookmark, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContinueLearningPanel() {
    const { user } = useAuth();
    const { reminders, loading, dismissReminder, snoozeReminder, archiveReminder } = useReminders(user?.id);
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState(null);

    if (loading || !reminders || reminders.length === 0) return null;

    // Tomamos el recordatorio más prioritario o el más reciente
    const activeReminder = reminders[0];

    const getIcon = () => {
        switch (activeReminder.entity_type) {
            case 'path': return <Map className="w-5 h-5 text-purple-400" />;
            case 'lesson': return <Play className="w-5 h-5 text-blue-400" />;
            default: return <Bell className="w-5 h-5 text-amber-400" />;
        }
    };

    const handleContinue = () => {
        if (activeReminder.entity_type === 'path') {
            navigate(`/path/${activeReminder.entity_id}`);
        } else if (activeReminder.entity_type === 'lesson') {
            navigate(`/lesson/${activeReminder.entity_id}`);
        }
    };

    return (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/20 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center shadow-inner">
                        {getIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5">
                                Continuar Aprendiendo
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Clock size={10} />
                                Hace 2 días
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-1">
                            {activeReminder.entity_title || "Retoma tu sesión"}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">
                            {activeReminder.custom_message}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleContinue}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                    >
                        <Play size={18} className="fill-current" />
                        Continuar
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setOpenMenuId(openMenuId === activeReminder.id ? null : activeReminder.id)}
                            className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        
                        {openMenuId === activeReminder.id && (
                            <div className="absolute right-0 top-14 w-48 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => dismissReminder(activeReminder.id)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition">
                                    <X size={16} /> Descartar
                                </button>
                                <button onClick={() => archiveReminder(activeReminder.id)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition">
                                    <CheckCircle2 size={16} /> Ya lo terminé
                                </button>
                                <button onClick={() => snoozeReminder(activeReminder.id)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition">
                                    <Bookmark size={16} /> Recordar después
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Progress Bar Visual (Decorative for now, but creates urgency/progress feel) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div className="h-full bg-blue-500 w-[65%] rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
        </div>
    );
}
