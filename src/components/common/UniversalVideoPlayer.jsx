import React, { useState } from 'react';
import { getMediaInfo } from '../../utils/mediaEmbed';
import { Video, ExternalLink, Play, AlertCircle } from 'lucide-react';

export default function UniversalVideoPlayer({ 
    mediaUrl, 
    title = 'Video de Lección', 
    autoplay = false,
    className = 'w-full h-full'
}) {
    const [loadError, setLoadError] = useState(false);
    const media = getMediaInfo(mediaUrl);

    if (!mediaUrl || media.type === 'none') {
        return (
            <div className={`flex flex-col items-center justify-center bg-slate-950 text-slate-500 p-8 text-center ${className}`}>
                <Video size={48} className="mb-3 text-slate-700" />
                <p className="text-sm font-bold text-slate-400">Sin video asignado</p>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">Agrega un enlace de YouTube, TikTok o Instagram para visualizar el contenido multimedia.</p>
            </div>
        );
    }

    // YOUTUBE
    if (media.type === 'youtube') {
        const autoParam = autoplay ? '&autoplay=1' : '';
        return (
            <div className={`relative bg-black overflow-hidden flex items-center justify-center ${className}`}>
                <iframe
                    src={`${media.embedUrl}${autoParam}`}
                    title={title}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        );
    }

    // TIKTOK
    if (media.type === 'tiktok') {
        return (
            <div className={`relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden ${className}`}>
                <div className="w-full h-full max-w-[420px] aspect-[9/16] relative bg-black shadow-2xl rounded-2xl overflow-hidden border border-white/5 my-auto">
                    <iframe
                        src={media.embedUrl}
                        title={title}
                        className="w-full h-full border-0 absolute inset-0"
                        allow="encrypted-media; fullscreen"
                        onError={() => setLoadError(true)}
                    />
                </div>
                
                {/* External link helper in case of browser cross-origin cookie restrictions */}
                <div className="absolute bottom-2 right-2 z-10">
                    <a
                        href={media.rawUrl.startsWith('http') ? media.rawUrl : `https://${media.rawUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-[11px] font-bold border border-white/10 backdrop-blur-md shadow-lg transition"
                    >
                        <span>TikTok</span>
                        <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        );
    }

    // INSTAGRAM
    if (media.type === 'instagram') {
        return (
            <div className={`relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden ${className}`}>
                <div className="w-full h-full max-w-[420px] aspect-[9/16] relative bg-black shadow-2xl rounded-2xl overflow-hidden border border-white/5 my-auto">
                    <iframe
                        src={media.embedUrl}
                        title={title}
                        className="w-full h-full border-0 absolute inset-0"
                        allowTransparency="true"
                        allow="encrypted-media"
                        frameBorder="0"
                        scrolling="no"
                    />
                </div>

                <div className="absolute bottom-2 right-2 z-10">
                    <a
                        href={media.rawUrl.startsWith('http') ? media.rawUrl : `https://${media.rawUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/90 to-pink-900/90 hover:from-purple-800 hover:to-pink-800 text-white text-[11px] font-bold border border-white/10 backdrop-blur-md shadow-lg transition"
                    >
                        <span>Instagram Reel</span>
                        <ExternalLink size={12} />
                    </a>
                </div>
            </div>
        );
    }

    // DIRECT VIDEO
    if (media.type === 'direct') {
        return (
            <div className={`relative bg-black flex items-center justify-center ${className}`}>
                <video
                    src={media.rawUrl}
                    controls
                    className="w-full h-full object-contain"
                />
            </div>
        );
    }

    // UNKNOWN / WEB FALLBACK
    return (
        <div className={`flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-8 text-center ${className}`}>
            <AlertCircle size={40} className="mb-3 text-amber-500" />
            <p className="text-sm font-bold text-white mb-1">Enlace multimedia externo</p>
            <p className="text-xs text-slate-500 mb-4 max-w-sm truncate">{media.rawUrl}</p>
            <a
                href={media.rawUrl.startsWith('http') ? media.rawUrl : `https://${media.rawUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg"
            >
                <span>Abrir video en ventana externa</span>
                <ExternalLink size={14} />
            </a>
        </div>
    );
}
