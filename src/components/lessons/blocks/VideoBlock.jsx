import React from 'react';
import UniversalVideoPlayer from '../../common/UniversalVideoPlayer';

const VideoBlock = ({ content }) => {
    const videoUrl = content?.url || content?.youtubeId || '';

    return (
        <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl relative">
            <UniversalVideoPlayer 
                mediaUrl={videoUrl} 
                title={content?.title || 'Video Block'} 
                className="w-full h-full"
            />
        </div>
    );
};

export default VideoBlock;
