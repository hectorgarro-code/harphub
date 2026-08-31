import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, CheckCircle, Clock, ChevronRight, 
    Play, Music, Star, ArrowLeft
} from 'lucide-react';
import api from '../../../services/api';
import ContextualReviewUI from './ContextualReviewUI';

export default function ReviewsTab({ lesson, user }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, [lesson, user]);

    const fetchSubmissions = async () => {
        if (!user || !lesson) return;
        setLoading(true);
        try {
            const res = await api.request('get_submissions', 'GET', { 
                user_id: user.id, 
                lesson_id: lesson.id 
            });
            setSubmissions(res || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    if (selectedSubmissionId) {
        return (
            <ContextualReviewUI 
                submissionId={selectedSubmissionId} 
                readOnly={true}
                onBack={() => setSelectedSubmissionId(null)}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-16 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Feedback Recibido</h2>
                <p className="text-slate-400 font-medium">Revisa las correcciones técnicas de tus profesores sobre tus prácticas.</p>
            </header>

            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-8 h-8 border-4 border-white/5 border-t-rose-500 rounded-full animate-spin" />
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="py-24 text-center bg-slate-900/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <MessageSquare size={48} className="text-slate-800 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Sin Feedback aún</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                            Envía tus prácticas desde la pestaña "Práctica" para recibir revisiones de tus profesores.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {submissions.map((sub) => (
                            <div 
                                key={sub.id}
                                className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-slate-900/60 transition"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                        sub.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-900/20' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                        {sub.status === 'reviewed' ? <Star size={24} fill="currentColor" /> : <Clock size={24} />}
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-lg font-black text-white tracking-tight">
                                                Revisión #{sub.id}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                sub.status === 'reviewed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                            }`}>
                                                {sub.status === 'reviewed' ? 'Completado' : 'Pendiente'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Play size={10} fill="currentColor" /> {sub.duration}s</span>
                                            {sub.status === 'reviewed' && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-emerald-500">Feedback Disponible</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => sub.status === 'reviewed' && setSelectedSubmissionId(sub.id)}
                                    disabled={sub.status !== 'reviewed'}
                                    className={`h-12 px-6 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        sub.status === 'reviewed' 
                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95' 
                                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                    }`}
                                >
                                    Ver Review
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
