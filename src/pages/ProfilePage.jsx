import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
    User, MapPin, Link2, Calendar, Users, 
    Music, Award, Clock, ArrowLeft, Edit2, 
    Check, X, Camera, MessageSquare, Share2,
    BookOpen, Layers, Bookmark, Zap, Play,
    ExternalLink, MoreHorizontal, Settings, Plus, Activity
} from 'lucide-react';
import PracticeContributionGraph from '../components/profile/PracticeContributionGraph';
import PracticeCard from '../components/feed/PracticeCard';
import CommunityCard from '../components/feed/CommunityCard';
import ActivityCard from '../components/social/ActivityCard';
function AssetCard({ type, data }) {
    return (
        <div className="group bg-slate-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-slate-900/50 hover:border-blue-500/30 transition duration-500 flex flex-col">
            <div className="h-40 bg-slate-800 relative overflow-hidden">
                {data.cover_image ? (
                    <img src={data.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                ) : (type === 'collection' && data.sample_youtube_id) ? (
                    <img 
                        src={`https://img.youtube.com/vi/${data.sample_youtube_id}/hqdefault.jpg`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-60 group-hover:opacity-100" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        {type === 'lesson' ? <Play size={40} className="text-slate-700" /> : <Layers size={40} className="text-slate-700" />}
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    {type === 'path' && <BookOpen size={10} className="text-blue-500" />}
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{data.instrument || 'Varios'}</span>
                </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">{type}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[9px] font-bold text-slate-600">
                            {type === 'path' ? `${data.node_count || 0} pasos` : `Nivel ${data.difficulty || 1}`}
                        </span>
                        {type === 'path' && data.estimated_duration && (
                            <>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span className="text-[9px] font-bold text-slate-600">{data.estimated_duration}</span>
                            </>
                        )}
                    </div>
                    <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition mb-2 leading-tight">
                        {data.title}
                    </h4>
                    {data.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4 italic">
                            {data.description}
                        </p>
                    )}
                </div>
                <Link to={`/${type}/${data.id}`} className="w-full py-3 bg-slate-800/50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-blue-600 hover:text-white transition text-center mt-4">
                    Explorar {type === 'lesson' ? 'Lección' : type === 'path' ? 'Ruta' : 'Colección'}
                </Link>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/10 rounded-[3rem] border border-dashed border-white/5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-slate-800 mb-4">
                <Icon size={32} />
            </div>
            <p className="text-slate-600 font-bold text-sm tracking-wide">{message}</p>
        </div>
    );
}

export default function ProfilePage() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [activeTab, setActiveTab] = useState('activity');
    const [savedItems, setSavedItems] = useState([]);
    const [practiceStats, setPracticeStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, [username]);

    useEffect(() => {
        if (activeTab === 'saved' && isOwnProfile) {
            fetchSavedItems();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await api.getProfile(username, currentUser?.id);
            if (data.error) {
                console.error(data.error);
                navigate('/');
            } else {
                setProfile(data);
                setEditData(data);
                fetchExtraData(data.id);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchExtraData = async (userId) => {
        try {
            const [stats, actRes] = await Promise.all([
                api.getPracticeStats(userId),
                api.getActivityCards(userId, 'mine')
            ]);
            if (stats.success) setPracticeStats(stats);
            if (actRes.success) setActivities(actRes.activities);
        } catch (err) {
            console.error("Error fetching extra profile data:", err);
        }
    };

    const fetchSavedItems = async () => {
        try {
            const res = await api.getSavedItems(currentUser.id);
            if (res.success) setSavedItems(res.items);
        } catch (error) {
            console.error("Error fetching saved items:", error);
        }
    };

    const handleToggleFollow = async () => {
        if (!currentUser) return alert("Debes iniciar sesión para seguir a alguien");
        try {
            const res = await api.toggleFollow(currentUser.id, profile.id);
            if (res.success) {
                setProfile(prev => ({
                    ...prev,
                    is_following: res.following,
                    followers_count: res.following ? prev.followers_count + 1 : prev.followers_count - 1
                }));
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await api.updateProfile({
                user_id: currentUser.id,
                full_name: editData.full_name,
                bio: editData.bio,
                musical_level: editData.musical_level,
                instruments: editData.instruments,
                genres: editData.genres,
                featured_skills: editData.featured_skills,
                avatar_url: editData.avatar_url
            });
            if (res.success) {
                setProfile(prev => ({ ...prev, ...editData }));
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!profile) return null;

    const isOwnProfile = currentUser?.username === username;

    const tabs = [
        { id: 'activity', label: 'Actividad', icon: Zap },
        { id: 'library', label: 'Biblioteca Pública', icon: Music },
        { id: 'paths', label: 'Rutas', icon: BookOpen },
        ...(isOwnProfile ? [{ id: 'saved', label: 'Guardado', icon: Bookmark }] : []),
        { id: 'achievements', label: 'Logros', icon: Award }
    ];

    return (
        <div className="flex-1 bg-slate-950 text-slate-100 min-h-screen pb-20 overflow-x-hidden">
            {/* Minimalist Studio Header */}
            <div className="h-64 bg-gradient-to-b from-blue-600/10 to-slate-950 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-6 left-6 p-2 bg-slate-900/60 backdrop-blur-xl rounded-full text-white hover:bg-slate-800 transition z-10"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative -mt-32">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-8 pb-12">
                    {/* Avatar with dynamic shape */}
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[3rem] bg-slate-900 border-4 border-slate-950 overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {isOwnProfile && isEditing && (
                            <div className="absolute inset-0 bg-black/60 rounded-[3rem] flex items-center justify-center cursor-pointer group-hover:opacity-100 opacity-0 transition">
                                <Camera size={24} className="text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                {isEditing ? (
                                    <input 
                                        value={editData.full_name || ''} 
                                        onChange={e => setEditData({...editData, full_name: e.target.value})}
                                        className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-1 text-3xl w-full max-w-sm"
                                        placeholder="Tu nombre artístico"
                                    />
                                ) : (
                                    profile.full_name || profile.username
                                )}
                            </h1>
                            {!isEditing && profile.musical_level && (
                                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-blue-500/20">
                                    {profile.musical_level}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold">
                            <span>@{profile.username}</span>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-white">{profile.followers_count}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-600">Seguidores</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-white">{profile.following_count}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-600">Siguiendo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isOwnProfile ? (
                            isEditing ? (
                                <>
                                    <button 
                                        onClick={() => navigate('/path-builder')}
                                        className="px-6 py-3.5 bg-slate-900 text-blue-500 border border-blue-500/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500/10 transition flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Crear Nueva Ruta
                                    </button>
                                    <button onClick={handleSaveProfile} className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition shadow-xl shadow-blue-900/20 flex items-center gap-2">
                                        <Check size={16} /> Finalizar Edición
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="p-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition">
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-8 py-3.5 bg-slate-800/80 backdrop-blur text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition flex items-center gap-2 border border-white/5">
                                    <Settings size={16} /> Configurar Estudio
                                </button>
                            )
                        ) : (
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleToggleFollow}
                                    className={`px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-xl flex items-center gap-2 ${profile.is_following ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white shadow-blue-900/40 hover:bg-blue-500'}`}
                                >
                                    {profile.is_following ? 'Siguiendo' : 'Seguir Artista'}
                                </button>
                                <button className="p-3.5 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition border border-white/5">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Studio Meta (Genres, Bio) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 border-t border-white/5 pt-12">
                    <div className="lg:col-span-1 space-y-10">
                        <div>
                            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-5">Biografía Musical</h3>
                            {isEditing ? (
                                <textarea 
                                    value={editData.bio || ''} 
                                    onChange={e => setEditData({...editData, bio: e.target.value})}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 min-h-[150px] focus:border-blue-500/50 outline-none transition"
                                    placeholder="Define tu camino en la música..."
                                />
                            ) : (
                                <p className="text-slate-400 leading-relaxed text-sm italic font-medium">
                                    "{profile.bio || "Este artista está concentrado en su música..."}"
                                </p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-5">Arsenal & Estilos</h3>
                            <div className="space-y-6">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-3">Instrumentos</span>
                                    <div className="flex flex-wrap gap-2">
                                        {isEditing ? (
                                            <input 
                                                value={editData.instruments || ''} 
                                                onChange={e => setEditData({...editData, instruments: e.target.value})}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                                                placeholder="Ej: Armónica, Guitarra..."
                                            />
                                        ) : (
                                            (profile.instruments || "Armónica").split(',').map(ins => (
                                                <div key={ins} className="px-3 py-2 bg-blue-500/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/10">
                                                    {ins.trim()}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block mb-3">Géneros</span>
                                    <div className="flex flex-wrap gap-2">
                                        {isEditing ? (
                                            <input 
                                                value={editData.genres || ''} 
                                                onChange={e => setEditData({...editData, genres: e.target.value})}
                                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300"
                                                placeholder="Ej: Blues, Jazz, Rock..."
                                            />
                                        ) : (
                                            (profile.genres || "Blues").split(',').map(g => (
                                                <div key={g} className="px-3 py-2 bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/5">
                                                    {g.trim()}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Studio Content Tabs */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* Automated Progress Engine Visualization */}
                        <div className="animate-in fade-in slide-in-from-right-4 duration-1000">
                            <PracticeContributionGraph dailyData={practiceStats?.daily} />
                        </div>

                        <div>
                            <div className="flex items-center gap-8 mb-10 border-b border-white/5 pb-1">
                            {tabs.map(tab => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2.5 pb-4 px-1 text-xs font-black uppercase tracking-[0.2em] transition relative ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        <TabIcon size={16} />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                                        )}
                                    </button>
                                );
                            })}
                            </div>
                        </div>

                        {/* Tab Content Rendering */}
                        <div className="min-h-[400px]">
                            {activeTab === 'activity' && (
                                <div className="space-y-6">
                                    {activities.length > 0 ? (
                                        activities.map(act => {
                                            const handlePractice = (a) => {
                                                if (a.content_id) navigate(`/lesson/${a.content_id}`);
                                                else navigate('/library');
                                            };
                                            if (act.type === 'practice') {
                                                return <PracticeCard key={act.id} activity={act} onPractice={() => handlePractice(act)} />;
                                            }
                                            return <CommunityCard key={act.id} activity={act} onPractice={() => handlePractice(act)} />;
                                        })
                                    ) : (
                                        <EmptyState icon={Zap} message="Sin actividad musical registrada" />
                                    )}
                                </div>
                            )}

                            {activeTab === 'library' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile.public_lessons?.length > 0 || profile.public_collections?.length > 0 ? (
                                        <>
                                            {profile.public_lessons.map(lesson => (
                                                <AssetCard key={lesson.id} type="lesson" data={lesson} />
                                            ))}
                                            {profile.public_collections.map(col => (
                                                <AssetCard key={col.id} type="collection" data={col} />
                                            ))}
                                        </>
                                    ) : (
                                        <div className="col-span-full">
                                            <EmptyState icon={Music} message="Este estudio aún no tiene obras públicas" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'paths' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile.public_paths?.length > 0 ? (
                                        profile.public_paths.map(path => (
                                            <AssetCard key={path.id} type="path" data={path} />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 bg-slate-900/10 rounded-[3rem] border border-dashed border-white/5">
                                            <EmptyState icon={BookOpen} message="Este estudio aún no ha trazado rutas de aprendizaje" />
                                            {isOwnProfile && (
                                                <button 
                                                    onClick={() => navigate('/path-builder')}
                                                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition"
                                                >
                                                    Crear Mi Primera Ruta
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'saved' && (
                                <div className="space-y-4">
                                    {savedItems.length > 0 ? (
                                        savedItems.map(item => (
                                            <div key={`${item.entity_type}-${item.entity_id}`} className="bg-slate-900/30 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <Bookmark size={18} />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-white">{item.title}</h5>
                                                        <span className="text-[10px] uppercase font-black text-slate-600 tracking-widest">{item.entity_type}</span>
                                                    </div>
                                                </div>
                                                <Link to={`/${item.entity_type}/${item.entity_id}`} className="text-blue-500 hover:text-blue-400 font-black text-[10px] uppercase tracking-widest">
                                                    Ver ahora
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState icon={Bookmark} message="No has guardado conocimiento aún" />
                                    )}
                                </div>
                            )}

                            {activeTab === 'achievements' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="group relative">
                                            <div className="aspect-square rounded-3xl bg-slate-900/40 border border-white/5 flex items-center justify-center grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition duration-500 overflow-hidden">
                                                <Award size={40} className="text-slate-800 group-hover:text-blue-500 group-hover:scale-110 transition duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                                            </div>
                                            <div className="mt-3 text-center">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-700 group-hover:text-slate-400">Bloqueado</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
