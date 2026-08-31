import React, { useState, useRef, useEffect } from 'react';
import AlphaTabPlayer from '../../../AlphaTabPlayer';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX, Gauge, Layers, List, Maximize } from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

const AlphaTabPanel = ({ gpFile }) => {
    const { settings, setSettings } = useWorkspace();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentMeasure, setCurrentMeasure] = useState(1);
    const [tracks, setTracks] = useState([]);
    const [activeTracks, setActiveTracks] = useState([]);
    const playerRef = useRef(null);

    // Sync with AlphaTab Player
    const handlePlayerReady = (playerApi) => {
        playerRef.current = playerApi;
        // Fetch tracks once ready
        // Note: AlphaTabPlayer needs to expose its API
    };

    const togglePlayback = () => {
        if (playerRef.current) {
            if (isPlaying) playerRef.current.pause();
            else playerRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTempoChange = (newBpm) => {
        setSettings({ ...settings, bpm: newBpm });
        if (playerRef.current) {
            playerRef.current.playbackSpeed = newBpm / 100; // AlphaTab uses speed factor
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-300">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <button onClick={togglePlayback} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-105 transition shadow-lg shadow-blue-500/20">
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Measure</span>
                        <span className="text-sm font-mono font-bold text-blue-400">{currentMeasure}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Tempo / Speed */}
                    <div className="flex items-center gap-3 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-white/5">
                        <Gauge size={14} className="text-amber-500" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-slate-500">Tempo %</span>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="range" min="50" max="150" value={settings.bpm}
                                    onChange={(e) => handleTempoChange(parseInt(e.target.value))}
                                    className="w-24 accent-amber-500 h-1 rounded-full bg-slate-700"
                                />
                                <span className="text-xs font-mono font-bold text-amber-400">{settings.bpm}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Track Selection */}
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white transition">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase">Tracks</span>
                    </button>
                </div>
            </div>

            {/* Main Player Area */}
            <div className="flex-1 relative overflow-hidden">
                <AlphaTabPlayer 
                    file={gpFile} 
                    onReady={handlePlayerReady}
                    settings={{
                        playbackSpeed: settings.bpm / 100,
                        // Other AlphaTab specific settings
                    }}
                />
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-1.5 bg-slate-950 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                <div className="flex gap-4">
                    <span>Engine: AlphaTab v1.8</span>
                    <span>Format: Guitar Pro</span>
                </div>
                <div className="flex gap-4">
                    <span className={isPlaying ? "text-emerald-500" : ""}>{isPlaying ? "● Playing" : "○ Idle"}</span>
                    <span>Loop: Off</span>
                </div>
            </div>
        </div>
    );
};

export default AlphaTabPanel;
