import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useMusic } from '../hooks/useMusic';
import { useLessons } from '../hooks/useLessons';
import { 
    ChevronLeft, Settings, 
    GitFork, Zap, Monitor, Save, Edit3, Bookmark,
    BookOpen, Mic2, MessageSquare
} from 'lucide-react';

import { WorkspaceProvider } from '../context/WorkspaceContext';
import WebLessonLayout from '../components/lessons/workspace/WebLessonLayout';
import WorkspaceVideoPanel from '../components/lessons/workspace/WorkspaceVideoPanel';
import AlphaTabPanel from '../components/lessons/workspace/AlphaTabPanel';
import WorkspaceNotesPanel from '../components/lessons/workspace/WorkspaceNotesPanel';
import WorkspaceBlocksPanel from '../components/lessons/workspace/WorkspaceBlocksPanel';
import PracticeTab from '../components/lessons/workspace/PracticeTab';
import ReviewsTab from '../components/lessons/workspace/ReviewsTab';
import { PracticeTrackerProvider, usePracticeTracker } from '../hooks/usePracticeTracker.jsx';

export default function LessonPage({ 
    setIsBluesMasterOpen,
    setIsPianoMasterOpen,
    setIsGuitarMasterOpen,
    setIsUkeleleMasterOpen,
    setIsAdding,
    setSelectedItem
}) {
    const { id } = useParams();
    const { user } = useAuth();
    const { bpm, setBpm } = useMusic();
    const { items, loading: lessonsLoading, updateItem, forkLesson } = useLessons(user);

    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [workspaceData, setWorkspaceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'practice' | 'reviews'

    useEffect(() => {
        fetchLesson();

        const handleUpdate = (e) => {
            if (e.detail.id == id) fetchLesson();
        };
        window.addEventListener('lesson-updated', handleUpdate);
        return () => window.removeEventListener('lesson-updated', handleUpdate);
    }, [id]);

    const fetchLesson = async () => {
        setLoading(true);
        try {
            const res = await api.request('get_lesson_detailed', 'GET', { id, user_id: user?.id });
            if (res.success) {
                setLesson(res.lesson);
                setBlocks(res.blocks);
                setIsCompleted(res.is_completed || false);
                setIsSaved(res.is_saved || false);
                setWorkspaceData(res.workspace);
            }
        } catch (error) {
            console.error("Error fetching lesson:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePractice = () => {
        setActiveTab('practice');
    };

    const handleFork = async () => {
        if (!user) return alert("Debes iniciar sesión para realizar un Fork");
        const confirmMsg = isCreator 
            ? "¿Quieres crear una copia (duplicar) esta lección?" 
            : "¿Quieres crear una copia personalizada de esta lección en tu estudio?";
            
        if (window.confirm(confirmMsg)) {
            try {
                const res = await api.request('fork_lesson', 'POST', { user_id: user.id, id });
                if (res.success) {
                    alert(isCreator ? "¡Lección duplicada con éxito!" : "¡Fork creado con éxito! Redirigiendo a tu copia...");
                    navigate(`/lesson/${res.lesson_id}`);
                }
            } catch (error) {
                console.error("Error forking lesson:", error);
            }
        }
    };

    const handleToggleSave = async () => {
        if (!user) return alert("Debes iniciar sesión para guardar lecciones");
        const newSavedStatus = !isSaved;
        setIsSaved(newSavedStatus);
        
        try {
            const res = await api.toggleSave(user.id, 'lesson', id);
            if (res.success) {
                window.dispatchEvent(new CustomEvent('collections-updated'));
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            setIsSaved(!newSavedStatus); // Rollback
        }
    };

    const toggleCompleted = async () => {
        if (!user) return;
        const newStatus = !isCompleted;
        setIsCompleted(newStatus);
        
        try {
            await api.request('toggle_completion', 'POST', {
                user_id: user.id,
                entity_id: id,
                entity_type: 'lesson'
            });
            window.dispatchEvent(new CustomEvent('lesson-updated', { detail: { id } }));
        } catch (e) {
            console.error("Error toggling completion:", e);
            setIsCompleted(!newStatus); // Rollback
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950">
            <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    if (!lesson) return <div className="h-screen w-full flex items-center justify-center text-white bg-slate-950">No se encontró la lección</div>;

    const isCreator = user?.id && lesson?.user_id && parseInt(user.id) === parseInt(lesson.user_id);

    return (
        <PracticeTrackerProvider user={user} lessonId={id} instrument={lesson?.instrument}>
            <BpmWatcher bpm={bpm} />
            <WorkspaceProvider 
                lessonId={id} 
                userId={user?.id} 
                initialData={workspaceData}
                lessonConfig={lesson.workspace_config}
            >
                <div className="w-full h-screen bg-slate-950 flex flex-col overflow-hidden">
                    {/* --- WORKSPACE TOP BAR --- */}
                    <header className="sticky top-0 h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-white/5 z-30">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-white transition">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex flex-col">
                                <h1 className="text-xs font-black text-white uppercase tracking-widest truncate max-w-[200px]">{lesson.title}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase">{lesson.artist || 'Traditional'}</span>
                                    <span className="text-[9px] text-slate-700">•</span>
                                    <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">{lesson.instrument}</span>
                                </div>
                            </div>
                        </div>

                        {/* --- TAB SELECTOR --- */}
                        <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setActiveTab('lesson')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'lesson' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <BookOpen size={12} /> <span className="hidden md:inline">Lección</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('practice')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'practice' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Mic2 size={12} /> <span className="hidden md:inline">Práctica</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('reviews')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <MessageSquare size={12} /> <span className="hidden md:inline">Reviews</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {isCreator && (
                                    <button 
                                        onClick={() => {
                                            setSelectedItem(lesson);
                                            setIsAdding(true);
                                        }}
                                        className="h-8 flex items-center gap-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest transition"
                                    >
                                        <Edit3 size={12} /> <span className="hidden md:inline">Editar</span>
                                    </button>
                                )}

                                <button 
                                    onClick={handleToggleSave}
                                    className={`h-8 flex items-center gap-2 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition border ${
                                        isSaved 
                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' 
                                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <Bookmark size={12} fill={isSaved ? "currentColor" : "none"} />
                                    <span className="hidden md:inline">{isSaved ? 'Guardado' : 'Guardar'}</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* --- CONTENT AREA --- */}
                    <main className="flex-1 overflow-y-auto">
                        {activeTab === 'lesson' && (
                            <WebLessonLayout 
                                videoComponent={<WorkspaceVideoPanel youtubeId={lesson.youtubeId} title={lesson.title} />}
                                tabComponent={<AlphaTabPanel gpFile={lesson.gpFile} />}
                                notesComponent={<WorkspaceNotesPanel />}
                                blocksComponent={<WorkspaceBlocksPanel blocks={blocks} />}
                                seaComponent={<div className="p-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">SEA Editor (En desarrollo)</div>}
                                linksComponent={<div className="p-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Recursos vinculados</div>}
                                attachmentsComponent={<div className="p-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Archivos de la lección</div>}
                                practiceComponent={<div className="p-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Herramientas de estudio</div>}
                                isCompleted={isCompleted}
                                toggleCompleted={toggleCompleted}
                            />
                        )}

                        {activeTab === 'practice' && (
                            <PracticeTab lesson={lesson} user={user} />
                        )}

                        {activeTab === 'reviews' && (
                            <ReviewsTab lesson={lesson} user={user} />
                        )}
                    </main>

                    {/* --- FOOTER --- */}
                    <footer className="h-8 bg-slate-900 border-t border-white/5 flex items-center justify-between px-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5"><Monitor size={10} /> {activeTab.toUpperCase()} MODE</span>
                            <span>User: {user?.username || 'Guest'}</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-blue-500">HarpHub Professional Practice Engine</span>
                            <span className="flex items-center gap-1.5"><Save size={10} /> Cloud Sync Active</span>
                        </div>
                    </footer>
                </div>
            </WorkspaceProvider>
        </PracticeTrackerProvider>
    );
}

function BpmWatcher({ bpm }) {
    const { trackBpm } = usePracticeTracker();
    useEffect(() => {
        if (bpm > 0) trackBpm(bpm);
    }, [bpm, trackBpm]);
    return null;
}
