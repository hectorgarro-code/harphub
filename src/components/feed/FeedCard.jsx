import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Play, Clock, Share2, Bookmark, 
    MoreHorizontal, Music, Award, Zap,
    Repeat, ChevronRight, EyeOff, Pin, Trash2, XCircle
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const FeedCard = ({ activity, children, onPractice }) => {
    const { username, type, created_at, avatar_url, full_name, metadata } = activity;

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'ahora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return new Date(date).toLocaleDateString();
    };

    const [showMenu, setShowMenu] = useState(false);
    const [isSaved, setIsSaved] = useState(activity.saved || false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action) => {
        console.log(`Action performed: ${action} on ${activity.id}`);
        setShowMenu(false);
        
        // Emit custom event for FeedPage to handle
        window.dispatchEvent(new CustomEvent('feed-action', { 
            detail: { action, activityId: activity.id, activity } 
        }));
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-slate-900/60 transition-all duration-500 group mb-6 shadow-2xl relative">
            <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link to={`/profile/${username}`} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-blue-500/10">
                            {avatar_url ? (
                                <img src={avatar_url} alt={username} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-black text-blue-500">{username.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-white tracking-tight">{full_name || username}</h3>
                                <span className="text-slate-600 font-bold">@</span>
                                <span className="text-slate-500 font-bold">{username}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                    {type === 'practice' && 'Sesión de Práctica'}
                                    {type === 'lesson_new' && 'Nueva Lección'}
                                    {type === 'lesson_fork' && 'Remix Musical'}
                                    {type === 'collection_new' && 'Colección'}
                                    {type === 'user_joined' && 'Nuevo Miembro'}
                                    {type === 'follow' && 'Conexión'}
                                    {type === 'save' && 'Guardado'}
                                </span>
                                <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{getTimeAgo(created_at)}</span>
                            </div>
                        </div>
                    </Link>
                    
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-3 bg-slate-950/50 rounded-xl text-slate-600 hover:text-white transition hover:bg-slate-800 border border-white/5"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 space-y-1">
                                    <button onClick={() => handleAction('not_interested')} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <EyeOff size={14} className="text-amber-500" /> No me interesa
                                    </button>
                                    <button onClick={() => handleAction('hide')} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <XCircle size={14} className="text-red-500" /> Ocultar publicación
                                    </button>
                                    <button onClick={() => handleAction('pin')} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <Pin size={14} className="text-blue-500" /> Fijar publicación
                                    </button>
                                    <div className="h-px bg-white/5 my-1 mx-2"></div>
                                    <button onClick={() => handleAction('watch_later')} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <Clock size={14} className="text-emerald-500" /> Ver más tarde
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="relative">
                    {children}
                </div>

                {/* Actions Footer */}
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onPractice}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3 shadow-lg shadow-blue-900/40"
                        >
                            <Play size={14} fill="currentColor" /> Practicar Ahora
                        </button>
                        <button 
                            onClick={() => handleAction('fork')}
                            className="p-3 bg-slate-800/50 text-slate-400 hover:text-white rounded-2xl transition group-hover:bg-slate-800"
                            title="Hacer un Remix"
                        >
                            <Repeat size={18} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setIsSaved(!isSaved);
                                handleAction('toggle_save');
                            }}
                            className="p-3 text-slate-500 hover:text-white transition flex items-center gap-2"
                            title="Guardar en favoritos"
                        >
                            <Bookmark size={18} className={isSaved ? 'fill-purple-500 text-purple-500' : ''} />
                        </button>
                        <button 
                            onClick={() => handleAction('share')}
                            className="p-3 text-slate-500 hover:text-white transition"
                            title="Compartir"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedCard;
