import React from 'react';
import { Maximize2, Minimize2, Settings, X } from 'lucide-react';

const WorkspacePanel = ({ 
    id, 
    title, 
    type, 
    icon: Icon, 
    children, 
    onClose, 
    onToggleFull, 
    isFull = false,
    className = ""
}) => {
    // DAW-inspired border and header styles
    const typeColors = {
        VIEW: 'border-blue-500/20 text-blue-400',
        WORK: 'border-emerald-500/20 text-emerald-400',
        TOOL: 'border-amber-500/20 text-amber-400',
        SHARED: 'border-purple-500/20 text-purple-400'
    };

    return (
        <div className={`flex flex-col bg-slate-900/40 border ${typeColors[type] || 'border-slate-800'} rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl transition-all duration-300 ${isFull ? 'fixed inset-4 z-50' : 'h-full'} ${className}`}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/40 border-b border-white/5">
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={14} className="opacity-70" />}
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        {title}
                    </h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-bold">
                        {type}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                        <Settings size={12} />
                    </button>
                    <button 
                        onClick={onToggleFull}
                        className="p-1.5 text-slate-500 hover:text-white transition-colors"
                    >
                        {isFull ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    </button>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {children}
            </div>
            
            {/* Panel Footer (Subtle) */}
            <div className="h-1 bg-white/5 w-full opacity-30" />
        </div>
    );
};

export default WorkspacePanel;
