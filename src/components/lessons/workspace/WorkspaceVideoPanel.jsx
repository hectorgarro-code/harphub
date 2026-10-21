import React from 'react';
import UniversalVideoPlayer from '../../common/UniversalVideoPlayer';
import { getMediaInfo } from '../../../utils/mediaEmbed';

const WorkspaceVideoPanel = ({ youtubeId, title }) => {
    const media = getMediaInfo(youtubeId);

    return (
        <div className="h-full flex flex-col bg-black">
            <div className="flex-1 relative overflow-hidden">
                <UniversalVideoPlayer 
                    mediaUrl={youtubeId} 
                    title={title} 
                    autoplay={true}
                    className="absolute inset-0 w-full h-full"
                />
            </div>
            
            {/* Quick Context Bar */}
            <div className="px-4 py-2 bg-slate-900 border-t border-white/5 flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[60%]">
                    {title}
                </h4>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-400 bg-black/60 border border-white/10 px-2 py-0.5 rounded">
                        {media.platformName || 'Video'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceVideoPanel;
