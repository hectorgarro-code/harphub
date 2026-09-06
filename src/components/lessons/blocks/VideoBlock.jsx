import React from 'react';
import { getYouTubeId } from '../../../utils/constants';

const VideoBlock = ({ content }) => {
    const ytId = getYouTubeId(content?.youtubeId || content?.url || '');
    return (
        <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
            {ytId ? (
                <iframe 
                    src={`https://www.youtube.com/embed/${ytId}`} 
                    className="w-full h-full"
                    allowFullScreen
                ></iframe>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                    Sin URL de video válida
                </div>
            )}
        </div>
    );
};

export default VideoBlock;
