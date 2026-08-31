import React, { useState, useEffect, useRef } from 'react';
import { 
    Mic, StopCircle, Play, Send, History, 
    CheckCircle, Clock, Music, ChevronRight
} from 'lucide-react';
import { AudioRecorder } from '../../../utils/audioRecorder';
import api from '../../../services/api';

export default function PracticeTab({ lesson, user }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordResult, setRecordResult] = useState(null);
    const [volume, setVolume] = useState(0);
    const [notes, setNotes] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const recorderRef = useRef(new AudioRecorder());
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchHistory();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const fetchHistory = async () => {
        if (!user || !lesson) return;
        setLoading(true);
        try {
            const res = await api.request('get_submissions', 'GET', { 
                user_id: user.id, 
                lesson_id: lesson.id 
            });
            setHistory(res || []);
        } catch (err) {
            console.error("Error fetching practice history:", err);
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        const started = await recorderRef.current.start();
        if (started) {
            setIsRecording(true);
            setRecordResult(null);
            intervalRef.current = setInterval(() => {
                setVolume(recorderRef.current.getVolume());
            }, 50);
        }
    };

    const stopRecording = async () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRecording(false);
        setVolume(0);
        const result = await recorderRef.current.stop();
        setRecordResult(result);
    };

    const handleSubmit = async () => {
        if (!recordResult || submitting) return;
        setSubmitting(true);
        try {
            // 1. Upload audio
            const formData = new FormData();
            formData.append('action', 'upload_audio');
            formData.append('audio', recordResult.blob);
            
            const uploadRes = await api.request('upload_audio', 'POST', formData);

            if (!uploadRes.success) throw new Error("Upload failed");

            // 2. Submit practice
            await api.request('submit_practice', 'POST', {
                user_id: user.id,
                lesson_id: lesson.id,
                audio_url: uploadRes.url,
                notes: notes,
                bpm: lesson.bpm || 0,
                duration: Math.round(recordResult.duration || 0)
            });

            setRecordResult(null);
            setNotes('');
            fetchHistory();
            alert("¡Práctica enviada con éxito!");
        } catch (err) {
            console.error("Error submitting practice:", err);
            alert("Error al enviar la práctica");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- RECORDING SECTION --- */}
            <section className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Mic size={120} className="text-blue-500" />
                </div>
                
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Nueva Sesión de Práctica</h2>
                    <p className="text-slate-400 mb-8 font-medium">Graba tu ejecución para llevar un registro o solicitar feedback.</p>

                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-[2rem] bg-slate-950/40 mb-8">
                        {isRecording ? (
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex items-center gap-1 h-12">
                                    {[...Array(12)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1.5 bg-blue-500 rounded-full transition-all duration-75"
                                            style={{ 
                                                height: `${Math.max(10, (volume / 255) * 100 * (0.5 + Math.random() * 0.5))}%`,
                                                opacity: 0.3 + (volume / 255) * 0.7
                                            }}
                                        />
                                    ))}
                                </div>
                                <button 
                                    onClick={stopRecording}
                                    className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/20 hover:scale-105 active:scale-95 transition"
                                >
                                    <StopCircle size={32} />
                                </button>
                                <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Grabando...</span>
                            </div>
                        ) : recordResult ? (
                            <div className="flex flex-col items-center gap-6 w-full px-10">
                                <div className="w-full h-16 bg-slate-900 rounded-2xl flex items-center px-6 gap-4 border border-white/5">
                                    <button className="text-blue-500 hover:text-blue-400 transition">
                                        <Play size={24} fill="currentColor" />
                                    </button>
                                    <div className="flex-1 h-1 bg-white/5 rounded-full relative">
                                        <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full w-1/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">00:12 / 00:30</span>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setRecordResult(null)}
                                        className="h-12 px-6 rounded-2xl bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition"
                                    >
                                        Descartar
                                    </button>
                                    <button 
                                        onClick={startRecording}
                                        className="h-12 px-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition"
                                    >
                                        Re-grabar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={startRecording}
                                className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition group"
                            >
                                <Mic size={36} className="group-hover:scale-110 transition" />
                            </button>
                        )}
                    </div>

                    {recordResult && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Notas o Comentarios</label>
                                <textarea 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="¿En qué te enfocaste en esta sesión? (Ej: Control de bending, rítmica...)"
                                    className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-slate-300 focus:outline-none focus:border-blue-500/50 transition h-32"
                                />
                            </div>
                            <button 
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Enviar para Revisión
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* --- HISTORY SECTION --- */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <History size={20} className="text-slate-500" /> Mi Historial de Práctica
                    </h2>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                        {history.length} Sesiones
                    </span>
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <div className="w-8 h-8 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                            <Music size={48} className="text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Aún no has registrado sesiones de práctica</p>
                        </div>
                    ) : history.map((session) => (
                        <div 
                            key={session.id}
                            className="bg-slate-900/20 border border-white/5 p-6 rounded-3xl flex items-center gap-6 hover:bg-slate-900/40 transition group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                session.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                                {session.status === 'reviewed' ? <CheckCircle size={20} /> : <Clock size={20} />}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-black text-white uppercase tracking-wider">
                                        Sesión #{session.id}
                                    </span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        session.status === 'reviewed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {session.status === 'reviewed' ? 'Revisado' : 'Pendiente'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{session.duration || '0'} Seg</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Music size={10} /> {session.bpm || lesson.bpm} BPM</span>
                                </div>
                            </div>

                            <button className="p-3 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
