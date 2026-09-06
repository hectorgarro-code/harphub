import React from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { getYouTubeId } from '../../../utils/constants';

const WorkspaceVideoPanel = ({ youtubeId, title }) => {
    const cleanId = getYouTubeId(youtubeId) || youtubeId;
    const videoUrl = cleanId ? `https://www.youtube.com/embed/${cleanId}?rel=0&modestbranding=1&enablejsapi=1` : '';

    return (
        <div className="h-full flex flex-col bg-black">
            <div className="flex-1 relative">
                {cleanId ? (
                    <iframe 
                        src={videoUrl}
                        title={title}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-bold p-6 text-center">
                        <p className="text-sm">Sin video de YouTube asignado</p>
                    </div>
                )}
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
