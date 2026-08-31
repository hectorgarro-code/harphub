import React from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';

const WorkspaceVideoPanel = ({ youtubeId, title }) => {
    // Basic YouTube embed for now, but in the future it should sync with AlphaTab
    const videoUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1`;

    return (
        <div className="h-full flex flex-col bg-black">
            <div className="flex-1 relative">
                <iframe 
                    src={videoUrl}
                    title={title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            
            {/* Quick Context Bar */}
            <div className="px-4 py-2 bg-slate-900 border-t border-white/5 flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[60%]">
                    {title}
                </h4>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-600 bg-black/40 px-2 py-0.5 rounded">YT Source</span>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceVideoPanel;
