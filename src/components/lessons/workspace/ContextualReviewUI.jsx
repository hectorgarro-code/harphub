import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeft, Play, Pause, Plus, Trash2, Send, 
    MessageSquare, Clock, Music, User, Activity,
    Save, CheckCircle
} from 'lucide-react';
import api from '../../../services/api';

export default function ContextualReviewUI({ submissionId, onBack, readOnly = false }) {
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [generalFeedback, setGeneralFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const audioRef = useRef(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [submissionId]);

    const fetchSubmissionDetails = async () => {
        setLoading(true);
        try {
            const res = await api.request('get_submission_details', 'GET', { submission_id: submissionId });
            if (res.success) {
                setSubmission(res.submission);
                setGeneralFeedback(res.submission.feedback || '');
                setMarkers(res.markers || []);
            }
        } catch (err) {
            console.error("Error fetching submission details:", err);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        if (audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const handleTimelineClick = (e) => {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedTime = (x / rect.width) * duration;
        audioRef.current.currentTime = clickedTime;
    };

    const addMarker = () => {
        const newMarker = {
            id: Date.now(),
            timestamp: currentTime,
            comment: '',
            type: 'technical' // Default type
        };
        setMarkers([...markers, newMarker].sort((a, b) => a.timestamp - b.timestamp));
    };

    const updateMarker = (id, text) => {
        setMarkers(markers.map(m => m.id === id ? { ...m, comment: text } : m));
    };

    const removeMarker = (id) => {
        setMarkers(markers.filter(m => m.id !== id));
    };

    const handleSubmitReview = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await api.request('submit_review', 'POST', {
                submission_id: submissionId,
                feedback: generalFeedback,
                markers: markers.map(m => ({
                    timestamp: m.timestamp,
                    comment: m.comment
                }))
            });

            if (res.success) {
                alert("¡Revisión enviada!");
                onBack();
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Error al enviar la revisión");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950">
            <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-screen w-full flex flex-col bg-slate-950 text-white overflow-hidden">
            {/* --- TOP BAR --- */}
            <header className="h-16 flex items-center justify-between px-8 bg-slate-900 border-b border-white/5 z-30 shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 text-slate-500 hover:text-white transition">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-black uppercase tracking-widest text-rose-500">Revisión Técnica</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{submission?.student_name}</span>
                            <span className="text-[10px] text-slate-700">•</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{submission?.lesson_title}</span>
                        </div>
                    </div>
                </div>

                {!readOnly && (
                    <button 
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className="h-10 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-rose-900/40 flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                        Finalizar Revisión
                    </button>
                )}
            </header>

            {/* --- MAIN WORKSPACE --- */}
            <main className="flex-1 flex min-h-0">
                {/* Left: Player & Timeline */}
                <div className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto w-full space-y-12">
                        {/* Student Notes Card */}
                        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <MessageSquare size={120} />
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 block">Mensaje del Alumno</span>
                                <p className="text-lg text-slate-300 leading-relaxed italic">
                                    "{submission?.notes || 'No se incluyeron notas adicionales.'}"
                                </p>
                            </div>
                        </div>

                        {/* DAW PLAYER UI */}
                        <div className="bg-slate-900/60 border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-8">
                            <audio 
                                ref={audioRef}
                                src={submission?.audio_url}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                            />

                            {/* Timeline with Markers */}
                            <div className="relative pt-8 pb-4">
                                {/* Markers Row */}
                                <div className="absolute inset-x-0 top-0 h-8 pointer-events-none">
                                    {markers.map(m => (
                                        <div 
                                            key={m.id}
                                            className="absolute bottom-0 w-[1px] h-6 bg-rose-500 transition-all shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                                            style={{ left: `${(m.timestamp / duration) * 100}%` }}
                                        >
                                            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-rose-500" />
                                        </div>
                                    ))}
                                </div>

                                {/* Main Track */}
                                <div 
                                    ref={timelineRef}
                                    onClick={handleTimelineClick}
                                    className="h-24 bg-slate-950 rounded-2xl relative cursor-pointer group overflow-hidden border border-white/5"
                                >
                                    {/* Waveform Placeholder (Fake Wave) */}
                                    <div className="absolute inset-0 flex items-center justify-around px-2 opacity-20">
                                        {[...Array(60)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-[2px] bg-blue-500 rounded-full"
                                                style={{ height: `${20 + Math.random() * 60}%` }}
                                            />
                                        ))}
                                    </div>

                                    {/* Progress Bar */}
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-blue-500/20 border-r-2 border-blue-500 transition-all duration-75 pointer-events-none"
                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                    >
                                        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-blue-500/30 to-transparent" />
                                    </div>
                                </div>

                                {/* Time Labels */}
                                <div className="flex justify-between mt-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                                    <span>{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={togglePlay}
                                        className="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl"
                                    >
                                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                    </button>
                                    
                                    {!readOnly && (
                                        <button 
                                            onClick={addMarker}
                                            className="h-12 px-6 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all group"
                                        >
                                            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                                            Añadir Marcador de Feedback
                                        </button>
                                    )}
                                </div>

                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Status</span>
                                    <span className="text-xs font-bold text-blue-400">Analizando ejecución...</span>
                                </div>
                            </div>
                        </div>

                        {/* General Feedback Area */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Feedback General de la Sesión</label>
                            <textarea 
                                value={generalFeedback}
                                onChange={(e) => setGeneralFeedback(e.target.value)}
                                readOnly={readOnly}
                                placeholder={readOnly ? "No hay feedback general." : "Escribe un resumen general de la ejecución..."}
                                className={`w-full bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 text-slate-300 focus:outline-none transition h-48 text-lg ${!readOnly ? 'focus:border-rose-500/50' : ''}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Markers Sidebar */}
                <div className="w-96 bg-slate-900 border-l border-white/5 flex flex-col shrink-0">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Marcadores ({markers.length})</h3>
                        <Activity size={16} className="text-rose-500" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {markers.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
                                <Plus size={40} className="mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest leading-loose px-12">
                                    Haz clic en la línea de tiempo para señalar momentos técnicos específicos.
                                </p>
                            </div>
                        ) : markers.map((m, idx) => (
                            <div key={m.id} className="bg-slate-950 rounded-2xl p-5 border border-white/5 space-y-4 group animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(m.timestamp * 1000).toISOString().substr(14, 5)}
                                        </span>
                                    </div>
                                    {!readOnly && (
                                        <button 
                                            onClick={() => removeMarker(m.id)}
                                            className="p-2 text-slate-700 hover:text-red-400 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <textarea 
                                    value={m.comment}
                                    onChange={(e) => updateMarker(m.id, e.target.value)}
                                    readOnly={readOnly}
                                    placeholder="Nota técnica..."
                                    className={`w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-xs text-slate-300 focus:outline-none transition h-24 ${!readOnly ? 'focus:border-rose-500/30' : ''}`}
                                />
                                <button 
                                    onClick={() => { audioRef.current.currentTime = m.timestamp; audioRef.current.play(); setIsPlaying(true); }}
                                    className="flex items-center gap-2 text-[8px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition"
                                >
                                    <Play size={10} fill="currentColor" /> Escuchar este tramo
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
