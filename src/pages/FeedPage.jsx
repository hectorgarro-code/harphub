import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PracticeCard from '../components/feed/PracticeCard';
import CommunityCard from '../components/feed/CommunityCard';
import ActivityCard from '../components/social/ActivityCard';
import ContinueLearningPanel from '../components/learning/ContinueLearningPanel';
import { 
    Users, Compass, TrendingUp, Trophy, 
    Filter, RefreshCw, Music2, Search 
} from 'lucide-react';
import { MOCK_ACTIVITIES } from '../utils/mockSocialData';

export default function FeedPage({
    setIsBluesMasterOpen,
    setIsPianoMasterOpen,
    setIsGuitarMasterOpen,
    setIsUkeleleMasterOpen
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchFeed(true);
    }, [activeTab]);

    useEffect(() => {
        const handleFeedAction = (e) => {
            const { action, activityId, activity } = e.detail;
            
            if (action === 'hide' || action === 'not_interested') {
                const hidden = JSON.parse(localStorage.getItem('hidden_activities') || '[]');
                localStorage.setItem('hidden_activities', JSON.stringify([...hidden, activityId]));
                setActivities(prev => prev.filter(a => a.id !== activityId));
            }

            if (action === 'watch_later') {
                const wl = JSON.parse(localStorage.getItem('watch_later') || '[]');
                if (!wl.find(item => item.id === activityId)) {
                    localStorage.setItem('watch_later', JSON.stringify([...wl, activity]));
                    alert('Agregado a "Ver más tarde"');
                }
            }

            if (action === 'pin') {
                const pinned = JSON.parse(localStorage.getItem('pinned_activities') || '[]');
                if (!pinned.includes(activityId)) {
                    localStorage.setItem('pinned_activities', JSON.stringify([...pinned, activityId]));
                    alert('Publicación fijada');
                    // Refetch or resort
                    fetchFeed(true);
                }
            }

            if (action === 'share') {
                navigator.clipboard.writeText(`${window.location.origin}/lesson/${activity.content_id || ''}`);
                alert('Enlace copiado al portapapeles');
            }
        };

        window.addEventListener('feed-action', handleFeedAction);
        return () => window.removeEventListener('feed-action', handleFeedAction);
    }, []);

    const handlePractice = (act) => {
        console.log("Practicing activity:", act);
        
        // 1. If has associated lesson
        if (act.content_id) {
            navigate(`/lesson/${act.content_id}`);
            return;
        }

        // 2. If has instrument
        const instr = act.metadata?.instrument?.toLowerCase();
        if (instr) {
            if (instr.includes('armónica') || instr.includes('blues')) {
                setIsBluesMasterOpen(true);
            } else if (instr.includes('piano')) {
                setIsPianoMasterOpen(true);
            } else if (instr.includes('guitar')) {
                setIsGuitarMasterOpen(true);
            } else if (instr.includes('ukelele')) {
                setIsUkeleleMasterOpen(true);
            }
            return;
        }

        // 3. Fallback to My Lessons (Library)
        navigate('/library');
    };

    const fetchFeed = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setPage(0);
        }
        try {
            const res = await api.getFeed(user?.id, activeTab, reset ? 0 : page);
            let rawActivities = [];
            
            if (res.success && res.activities?.length > 0) {
                rawActivities = res.activities;
            } else if (reset) {
                rawActivities = MOCK_ACTIVITIES;
            }

            if (reset) {
                setActivities(rawActivities);
            } else {
                setActivities(prev => [...prev, ...rawActivities]);
            }
        } catch (error) {
            console.error("Error fetching feed, using mock data:", error);
            if (reset) setActivities(MOCK_ACTIVITIES);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'all', label: 'Explorar', icon: Compass },
        { id: 'following', label: 'Siguiendo', icon: Users },
        { id: 'trending', label: 'Tendencias', icon: TrendingUp },
        { id: 'challenges', label: 'Desafíos', icon: Trophy }
    ];

    return (
        <div className="flex-1 bg-slate-950 min-h-screen pb-32">
            {/* Sticky Header with Tabs */}
            <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        {tabs.map(tab => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                        activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                                >
                                    <TabIcon size={14} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1 md:w-64">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar técnicas o músicos..." 
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-white outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-700"
                            />
                        </div>
                        <button className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition border border-white/5">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-12">
                <ContinueLearningPanel />
                {/* Motivation Banner */}
                <div className="mb-12 p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden shadow-2xl shadow-blue-900/20 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Comunidad de Práctica</h2>
                        <p className="text-indigo-100 font-medium text-sm max-w-md">
                            Observa cómo otros músicos evolucionan. No es competencia, es inspiración compartida.
                        </p>
                    </div>
                    <Music2 size={120} className="absolute -bottom-6 -right-6 text-white/10 rotate-12" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Sintonizando el feed...</p>
                    </div>
                ) : activities.length > 0 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activities.map(act => {
                            if (act.type === 'practice') {
                                return <PracticeCard key={act.id} activity={act} onPractice={() => handlePractice(act)} />;
                            }
                            // Default to CommunityCard for all other feed items (lesson_new, collection_new, follow, etc.)
                            return <CommunityCard key={act.id} activity={act} onPractice={() => handlePractice(act)} />;
                        })}
                        
                        <div className="flex justify-center pt-12">
                            <button 
                                onClick={() => { setPage(p => p + 1); fetchFeed(); }}
                                className="px-8 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-3"
                            >
                                <RefreshCw size={14} /> Cargar más actividad
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5">
                        <Users size={48} className="mx-auto text-slate-800 mb-6" />
                        <h3 className="text-xl font-black text-white mb-2">El feed está en silencio</h3>
                        <p className="text-slate-500 font-medium mb-8">Comienza a seguir a otros músicos o sube tu propia práctica.</p>
                        <button onClick={() => setActiveTab('all')} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition">Explorar Comunidad</button>
                    </div>
                )}
            </div>
        </div>
    );
}
