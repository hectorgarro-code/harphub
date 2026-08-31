import React, { useState, useEffect } from 'react';
import { 
    GraduationCap, Clock, CheckCircle, AlertCircle, 
    ChevronRight, Search, Filter, Play, User, Music,
    MessageSquare, Star, Activity
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ContextualReviewUI from '../components/lessons/workspace/ContextualReviewUI';

export default function ReviewCenter() {
    const { user } = useAuth();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
    const [filter, setFilter] = useState('pending'); // 'pending' | 'reviewed' | 'all'

    useEffect(() => {
        fetchQueue();
    }, [user, filter]);

    const fetchQueue = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Creators see submissions for THEIR lessons
            const res = await api.request('get_review_queue', 'GET', { creator_id: user.id });
            setQueue(res || []);
        } catch (err) {
            console.error("Error fetching review queue:", err);
        } finally {
            setLoading(false);
        }
    };

    if (selectedSubmissionId) {
        return (
            <ContextualReviewUI 
                submissionId={selectedSubmissionId} 
                onBack={() => {
                    setSelectedSubmissionId(null);
                    fetchQueue();
                }} 
            />
        );
    }

    const filteredQueue = queue.filter(s => {
        if (filter === 'all') return true;
        return s.status === filter;
    });

    return (
        <div className="min-h-screen bg-slate-950 p-8 md:p-12 animate-in fade-in duration-700">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-900/20">
                                <GraduationCap size={28} />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Review Center</h1>
                        </div>
                        <p className="text-slate-400 font-medium text-lg">Gestiona las solicitudes de feedback y mejora el progreso de tus alumnos.</p>
                    </div>

                    <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                        {['pending', 'reviewed', 'all'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === f 
                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' 
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {f === 'pending' ? 'Pendientes' : f === 'reviewed' ? 'Revisados' : 'Todos'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- STATS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <Clock size={28} />
                        </div>
                        <div>
                            <span className="block text-3xl font-black text-white">{queue.filter(s => s.status === 'pending').length}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">En Espera</span>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <span className="block text-3xl font-black text-white">{queue.filter(s => s.status === 'reviewed').length}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completados</span>
                        </div>
                    </div>
                    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Activity size={28} />
                        </div>
                        <div>
                            <span className="block text-3xl font-black text-white">{queue.length}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                        </div>
                    </div>
                </div>

                {/* --- QUEUE --- */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-10 h-10 border-4 border-white/5 border-t-rose-500 rounded-full animate-spin" />
                        </div>
                    ) : filteredQueue.length === 0 ? (
                        <div className="py-32 text-center bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                            <Star size={64} className="text-slate-800 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Bandeja Vacía</h3>
                            <p className="text-slate-500 font-medium">No hay solicitudes de revisión en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredQueue.map(sub => (
                                <div 
                                    key={sub.id}
                                    onClick={() => setSelectedSubmissionId(sub.id)}
                                    className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center gap-8 hover:bg-slate-900/60 transition group cursor-pointer active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-5 md:w-1/3">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden border border-white/5">
                                            {sub.avatar_url ? <img src={sub.avatar_url} alt="" /> : <User size={32} />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white tracking-tight">{sub.student_name}</h4>
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Alumno</span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Music size={14} className="text-blue-500" />
                                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{sub.lesson_title}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(sub.created_at).toLocaleString()}</span>
                                            <span className="flex items-center gap-1.5"><Play size={12} fill="currentColor" /> {sub.duration}s</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            sub.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                            {sub.status === 'reviewed' ? 'Completado' : 'Pendiente'}
                                        </span>
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600 group-hover:bg-rose-600 group-hover:text-white transition-all group-hover:translate-x-1">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
