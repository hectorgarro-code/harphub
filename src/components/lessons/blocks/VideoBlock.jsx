import React from 'react';

const VideoBlock = ({ content }) => (
    <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
        <iframe 
            src={`https://www.youtube.com/embed/${content.youtubeId}`} 
            className="w-full h-full"
            allowFullScreen
        ></iframe>
    </div>
);

export default VideoBlock;
