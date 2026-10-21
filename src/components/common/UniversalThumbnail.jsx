import React, { useState } from 'react';
import { getMediaInfo } from '../../utils/mediaEmbed';
import { Play, Music, Video, Sparkles } from 'lucide-react';

export default function UniversalThumbnail({ 
    mediaUrl, 
    coverImage, 
    title = '', 
    gpFile = null,
    className = 'w-full h-full' 
}) {
    const [imgFailed, setImgFailed] = useState(false);
    const media = getMediaInfo(mediaUrl);

    // If explicit cover image is provided and hasn't failed
    if (coverImage && !imgFailed) {
        const src = coverImage.startsWith('http') ? coverImage : `/backend/uploads/${coverImage}`;
        return (
            <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
                <img 
                    src={src} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    onError={() => setImgFailed(true)}
                />
            </div>
        );
    }

    // YOUTUBE (Standard & Shorts)
    if (media.type === 'youtube' && media.thumbnailUrl && !imgFailed) {
        return (
            <div className={`relative overflow-hidden bg-slate-950 ${className}`}>
                <img 
                    src={media.thumbnailUrl} 
                    alt={title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                    onError={() => setImgFailed(true)}
                />
                {media.isShorts && (
                    <div className="absolute top-2.5 right-2.5 bg-red-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase shadow-md flex items-center gap-1">
                        Shorts
                    </div>
                )}
            </div>
        );
    }

    // TIKTOK CARD
    if (media.type === 'tiktok') {
        return (
            <div className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col items-center justify-center p-4 border border-cyan-500/20 ${className}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-transparent to-pink-950/20" />
                
                {/* TikTok Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/80 border border-cyan-500/30 text-cyan-400 text-[8px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase shadow-md flex items-center gap-1.5 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    TikTok
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-center shadow-2xl text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                        <Play size={22} fill="currentColor" className="ml-0.5 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 tracking-tight line-clamp-1 max-w-[150px]">
                        {title || 'TikTok Video'}
                    </span>
                </div>
            </div>
        );
    }

    // INSTAGRAM REEL / POST CARD
    if (media.type === 'instagram') {
        return (
            <div className={`relative overflow-hidden bg-gradient-to-tr from-amber-950/40 via-purple-950/60 to-pink-950/60 flex flex-col items-center justify-center p-4 border border-pink-500/20 ${className}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-900/20 via-purple-900/30 to-pink-800/20" />
                
                {/* Instagram Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/80 border border-pink-500/30 text-pink-400 text-[8px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase shadow-md flex items-center gap-1.5 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    Reel
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl text-white mb-2 group-hover:scale-110 transition-transform">
                        <Play size={22} fill="currentColor" className="ml-0.5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-200 tracking-tight line-clamp-1 max-w-[150px]">
                        {title || 'Instagram Reel'}
                    </span>
                </div>
            </div>
        );
    }

    // GUITAR PRO FILE
    if (gpFile) {
        return (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors ${className}`}>
                <Music size={40} className="text-blue-500/40 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Partitura GP</span>
            </div>
        );
    }

    // LOCAL LESSON / UNKNOWN
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-900/70 group-hover:bg-slate-850 transition-colors p-4 ${className}`}>
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-slate-300 mb-1.5 shadow-md">
                <Play size={18} fill="currentColor" className="ml-0.5" />
            </div>
            <span className="text-[9px] font-bold text-slate-400 text-center line-clamp-1 max-w-[160px]">{title || 'Lección'}</span>
        </div>
    );
}
