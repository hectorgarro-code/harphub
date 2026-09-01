import React from 'react';
import { Link } from 'react-router-dom';
import FeedCard from './FeedCard';
import { 
    Zap, Music, BookOpen, Layers, 
    UserPlus, Heart, Bookmark, Play,
    ArrowRight, ExternalLink, MessageSquare
} from 'lucide-react';

const CommunityCard = ({ activity, onPractice }) => {
    const { type, user_id, username, avatar_url, lesson_title, content_id, created_at, metadata } = activity;
    const meta = typeof metadata === 'string' ? JSON.parse(metadata || '{}') : metadata;

    const config = {
        lesson_new: {
            icon: Play,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            title: 'ha publicado una nueva lección',
            showContent: true
        },
        lesson_fork: {
            icon: Zap,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            title: 'ha realizado un Fork de una lección',
            showContent: true
        },
        collection_new: {
            icon: Layers,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            title: 'ha creado una nueva colección',
            showContent: true
        },
        user_joined: {
            icon: UserPlus,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            title: 'se ha unido a la comunidad de HarpHub',
            showContent: false
        },
        follow: {
            icon: UserPlus,
            color: 'text-pink-500',
            bg: 'bg-pink-500/10',
            title: 'ha comenzado a seguir a un músico',
            showContent: false
        },
        save: {
            icon: Bookmark,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            title: `ha guardado una ${meta?.entity_type || 'lección'}`,
            showContent: true
        }
    };

    const CurrentIcon = current.icon;

    return (
        <FeedCard activity={activity} hideDefaultHeader={false} onPractice={onPractice}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${current.bg} ${current.color}`}>
                        <CurrentIcon size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white leading-tight">
                            <span className="text-slate-400 font-bold text-sm block mb-0.5">{current.title}</span>
                            {lesson_title || 'Música Conectada'}
                        </h4>
                    </div>
                </div>

                {current.showContent && (
                    <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 group-hover:border-blue-500/20 transition-all">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-slate-900 rounded-xl text-slate-500">
                                    <Music size={18} />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block mb-0.5">Entidad conectada</span>
                                    <span className="text-sm font-bold text-slate-300">{lesson_title || 'Ver detalles del conocimiento'}</span>
                                </div>
                            </div>
                            <Link 
                                to={`/lesson/${content_id}`} 
                                className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white hover:bg-blue-600 transition"
                            >
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                )}

                {type === 'user_joined' && (
                    <div className="flex items-center gap-2 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <Zap size={14} className="text-emerald-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">¡Démosle la bienvenida al estudio!</p>
                    </div>
                )}
            </div>
        </FeedCard>
    );
};

export default CommunityCard;
