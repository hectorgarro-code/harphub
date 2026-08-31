import React, { useEffect, useRef, useState } from 'react';
import * as alphaTab from '@coderline/alphatab';
import { Play, Pause, Square, Loader2, Activity, ZoomIn, ZoomOut, Repeat, Layout, ListMusic, Volume2, VolumeX, Flame, Maximize, Minimize } from 'lucide-react';

// Math curve for WaveShaperNode distortion
function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180;
    let i = 0, x;
    if (k === 0) {
        for (; i < n_samples; ++i) { curve[i] = (i * 2) / n_samples - 1; }
    } else {
        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
    }
    return curve;
}

export default function AlphaTabPlayer({ fileUrl, onReady, settings: externalSettings }) {
    const containerRef = useRef(null);
    const cursorRef = useRef(null);
    const apiRef = useRef(null);
    const wrapperRef = useRef(null);

    // Playback State
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    // Advanced Controls State
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [zoom, setZoom] = useState(1.0);
    const [layoutMode, setLayoutMode] = useState('page'); // 'page', 'horizontal'
    const [isLooping, setIsLooping] = useState(false);
    const [tracks, setTracks] = useState([]);
    const [mutedTracks, setMutedTracks] = useState(new Set());
    const [showMixer, setShowMixer] = useState(false);
    const [loopRange, setLoopRange] = useState(null); // { startTick, endTick }
    const [isOverdriveActive, setIsOverdriveActive] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullScreenRef = useRef(null);

    // Audio Effects Refs
    const customAudioCtxRef = useRef(null);
    const overdrivePedalRef = useRef(null);
    const animationRef = useRef(null);
    const micStreamRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        setLoading(true);

        // Robust path resolution for XAMPP/Vite/Production
        let absoluteFileUrl = fileUrl;
        if (fileUrl && !fileUrl.startsWith('http')) {
            // Remove leading slashes or project prefixes if present
            let cleanPath = fileUrl;
            if (cleanPath.startsWith('/harphub/')) {
                cleanPath = cleanPath.replace('/harphub/', '');
            } else if (cleanPath.startsWith('/')) {
                cleanPath = cleanPath.substring(1);
            }
            
            // In development (Vite), we might need to go to the backend port/path
            // In XAMPP, it's usually relative to the root of the app
            absoluteFileUrl = `./${cleanPath}`;
        }

        const settings = {
            file: absoluteFileUrl,
            core: {
                fontDirectory: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/font/',
                // Use CDN to avoid local MIME type issues with workers in Vite
                scriptFile: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/alphaTab.js'
            },
            player: {
                enablePlayer: true,
                soundFont: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2', 
                scrollElement: wrapperRef.current,
                outputMode: 1 
            },
            display: {
                padding: [20, 20, 20, 20],
                layoutMode: layoutMode,
                staveProfile: 'scoretab',
                scale: zoom
            }
        };

        // --- WEB AUDIO API INTERCEPTION HACK ---
        // We temporarily proxy window.AudioContext so AlphaTab uses our context wrapper
        // and its master output falls securely into our WaveShaperNode.
        const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;

        class PatchedAudioContext extends OriginalAudioContext {
            constructor() {
                super();
                customAudioCtxRef.current = this;

                // 1. Create Overdrive Pedal
                const overdriveNode = this.createWaveShaper();
                overdriveNode.curve = makeDistortionCurve(0);
                overdriveNode.oversample = '4x';
                overdrivePedalRef.current = overdriveNode;

                // 2. Studio Master / Guitar Cabinet Simulator (4-band EQ)
                const eqLowCut = this.createBiquadFilter();
                eqLowCut.type = 'highpass';
                eqLowCut.frequency.value = 60; // cut mud

                const eqWarmth = this.createBiquadFilter();
                eqWarmth.type = 'peaking';
                eqWarmth.frequency.value = 250;
                eqWarmth.Q.value = 1.0;
                eqWarmth.gain.value = 2; // warmth

                const eqPresence = this.createBiquadFilter();
                eqPresence.type = 'peaking';
                eqPresence.frequency.value = 3500;
                eqPresence.Q.value = 0.8;
                eqPresence.gain.value = 3; // bite and clarity

                const eqHighCut = this.createBiquadFilter();
                eqHighCut.type = 'lowpass';
                eqHighCut.frequency.value = 7500; // cut MIDI digital fizz

                // 3. Room Ambience (Mathematical Impulse Response for Convolution Reverb)
                const convolver = this.createConvolver();
                const duration = 0.4; // Short studio room
                const decay = 6.0;
                const sampleRate = this.sampleRate || 44100;
                const length = sampleRate * duration;
                const impulse = this.createBuffer(2, length, sampleRate);
                for (let i = 0; i < length; i++) {
                    const multiplier = Math.pow(1 - i / length, decay);
                    impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * multiplier;
                    impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * multiplier;
                }
                convolver.buffer = impulse;

                // Wet/Dry mix for Reverb
                const dryGain = this.createGain();
                const wetGain = this.createGain();
                dryGain.gain.value = 0.85; // 85% transparent signal
                wetGain.gain.value = 0.15; // 15% room space

                // 4. Connect the signal chain: Overdrive -> EQ Network -> Reverb Split -> Real Destination
                overdriveNode.connect(eqLowCut);
                eqLowCut.connect(eqWarmth);
                eqWarmth.connect(eqPresence);
                eqPresence.connect(eqHighCut);

                // Split signal for reverb
                eqHighCut.connect(dryGain);
                eqHighCut.connect(convolver);
                convolver.connect(wetGain);

                // Sum dry and wet
                dryGain.connect(super.destination);
                wetGain.connect(super.destination);

                // 5. Overwrite "destination" so alphaTab blindly connects to the start of our Pedal Chain
                Object.defineProperty(this, 'destination', {
                    get: () => overdriveNode
                });
            }
        }

        window.AudioContext = PatchedAudioContext;
        if (window.webkitAudioContext) window.webkitAudioContext = PatchedAudioContext;

        const api = new alphaTab.AlphaTabApi(containerRef.current, settings);
        apiRef.current = api;

        // Restore immediately after instantiation so we don't pollute React globally
        window.AudioContext = OriginalAudioContext;
        if (window.webkitAudioContext) window.webkitAudioContext = OriginalAudioContext;

        api.soundFontLoad.on((e) => {
            console.log(`[AlphaTab] Descargando SoundFont... ${Math.round((e.loaded / e.total) * 100)}%`);
        });

        api.soundFontLoaded.on(() => {
            console.log('[AlphaTab] SoundFont ChoriumRevA cargado y listo para rugir.');
        });

        api.scoreLoaded.on((score) => {
            setLoading(false);
            setTracks(score.tracks);
            if (onReady) onReady(api);
            setIsReady(true);
        });

        // Loop Selection via Clicking Beats
        api.beatMouseDown.on((args) => {
            if (!args || !args.beat) return;
            const startTick = args.beat.playbackStart;
            const duration = args.beat.playbackDuration;
            const endTick = startTick + duration;

            apiRef.current.playbackRange = {
                startTick: startTick,
                endTick: apiRef.current.score.masterBars[args.beat.voice.bar.masterBar.index + 1]
                    ? apiRef.current.score.masterBars[args.beat.voice.bar.masterBar.index + 1].start
                    : endTick * 2 // Default end of bar if possible, or just the beat
            };

            // Or better: just select the clicked measure/bar for looping!
            const bar = args.beat.voice.bar;
            const masterBar = bar.masterBar;
            const nextMasterBar = masterBar.nextMasterBar;

            const range = {
                startTick: masterBar.start,
                endTick: nextMasterBar ? nextMasterBar.start : masterBar.start + masterBar.calculateDuration()
            };

            apiRef.current.playbackRange = range;
            setLoopRange(range);

            // Auto-enable repeat if not active
            if (!apiRef.current.isLooping) {
                apiRef.current.isLooping = true;
                setIsLooping(true);
            }
        });

        api.playerReady.on(() => {
            setIsReady(true);
        });

        api.playerStateChanged.on((e) => {
            setIsPlaying(e.state === 1);
            if (e.state === 0 && cursorRef.current) {
                cursorRef.current.style.display = 'none';
            }
        });

        api.playedBeatChanged.on((beat) => {
            if (!beat || !cursorRef.current) return;
            const bounds = beat.bounds;
            // The bounds are relative to the rendered SVG
            // We adjust the cursor position to float exactly over it
            cursorRef.current.style.left = bounds.x + 'px';
            cursorRef.current.style.top = bounds.y + 'px';
            cursorRef.current.style.width = bounds.w + 'px';
            cursorRef.current.style.height = bounds.h + 'px';
            cursorRef.current.style.display = 'block';
        });

        return () => {
            if (apiRef.current) {
                apiRef.current.destroy();
                apiRef.current = null;
            }
        };
    }, [fileUrl, layoutMode, zoom]); // Re-initialize if URL, layout or zoom changes


    // Update local playback speed independent of system metronome
    useEffect(() => {
        if (!apiRef.current || !isReady) return;
        apiRef.current.playbackSpeed = playbackSpeed;
    }, [playbackSpeed, isReady]);

    // We removed the generic useEffect for zoom and layout mode because 
    // AlphaTab does not rebuild the bounding boxes reliably without a full re-init.

    // --- Fullscreen API ---
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (fullScreenRef.current?.requestFullscreen) {
                fullScreenRef.current.requestFullscreen().catch(err => console.error(err));
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            // Give layout time to shift then resize canvas correctly
            setTimeout(() => apiRef.current?.resize(), 100);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Handlers
    const handlePlayPause = async () => {
        if (!apiRef.current || !isReady) return;

        // Ensure AudioContext is resumed on user gesture
        if (customAudioCtxRef.current && customAudioCtxRef.current.state === 'suspended') {
            await customAudioCtxRef.current.resume();
        }

        apiRef.current.playPause();
    };

    const handleStop = () => {
        if (!apiRef.current || !isReady) return;
        apiRef.current.stop();
        if (cursorRef.current) cursorRef.current.style.display = 'none';
    };

    // Handle the Dynamic Overdrive Pedal Microphone input
    useEffect(() => {
        if (!isOverdriveActive) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (overdrivePedalRef.current) overdrivePedalRef.current.curve = makeDistortionCurve(0);
            if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach(t => t.stop());
                micStreamRef.current = null;
            }
            return;
        }

        let analyserNode = null;
        let dataArray = null;

        const startMic = async () => {
            try {
                if (!customAudioCtxRef.current) return;

                // WebAudio requires resume if suspended
                if (customAudioCtxRef.current.state === 'suspended') {
                    await customAudioCtxRef.current.resume();
                }

                micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = customAudioCtxRef.current.createMediaStreamSource(micStreamRef.current);
                analyserNode = customAudioCtxRef.current.createAnalyser();
                analyserNode.fftSize = 512;
                source.connect(analyserNode);

                dataArray = new Float32Array(analyserNode.frequencyBinCount);
                let currentDistortion = 0;

                const modulateLoop = () => {
                    if (!analyserNode || !overdrivePedalRef.current) return;

                    analyserNode.getFloatTimeDomainData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i] * dataArray[i];
                    const rms = Math.sqrt(sum / dataArray.length);

                    // Intensity Math: trigger drive only if RMS passes threshold
                    let target = 0;
                    if (rms > 0.04) {
                        target = Math.min(600, (rms - 0.04) * 6000);
                    }

                    // Smooth envelope
                    currentDistortion += (target - currentDistortion) * 0.25;

                    // Assign distortion curve
                    if (Math.abs(currentDistortion - target) > 1 || currentDistortion > 1) {
                        overdrivePedalRef.current.curve = makeDistortionCurve(Math.floor(currentDistortion));
                    } else if (currentDistortion <= 1 && overdrivePedalRef.current.curve?.length > 0) {
                        overdrivePedalRef.current.curve = makeDistortionCurve(0);
                    }

                    animationRef.current = requestAnimationFrame(modulateLoop);
                };
                modulateLoop();
            } catch (err) {
                console.error("Mic access denied for Overdrive Pedal", err);
                setIsOverdriveActive(false);
            }
        };

        startMic();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach(t => t.stop());
                micStreamRef.current = null;
            }
        };
    }, [isOverdriveActive]);

    const toggleLoop = () => {
        if (!apiRef.current) return;
        const newState = !isLooping;
        setIsLooping(newState);
        apiRef.current.isLooping = newState;
        if (!newState) {
            apiRef.current.playbackRange = null; // Clear range on disable
            setLoopRange(null);
        }
    };

    const toggleMuteTrack = (trackIndex) => {
        if (!apiRef.current || !tracks[trackIndex]) return;

        const newMuted = new Set(mutedTracks);
        const isMuting = !newMuted.has(trackIndex);

        if (isMuting) newMuted.add(trackIndex);
        else newMuted.delete(trackIndex);

        setMutedTracks(newMuted);
        apiRef.current.changeTrackMute([tracks[trackIndex]], isMuting);
    };

    return (
        <div ref={fullScreenRef} className={`flex flex-col bg-slate-100 overflow-hidden relative text-slate-900 transition-all duration-300 w-full min-w-0 ${isFullscreen ? 'h-screen w-screen' : 'h-full border border-slate-800 shadow-2xl min-h-[600px] rounded-[2.5rem]'}`}>
            {loading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={56} />
                    <p className="font-black tracking-widest uppercase">Motor AlphaTab</p>
                    <p className="text-xs font-bold text-slate-400 mt-2">Sintetizando Lengüetas e Instrumentos...</p>
                </div>
            )}

            {/* Top Toolbar (Controls + Extras) */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between p-4 px-6 bg-slate-900 border-b border-indigo-500/20 text-white z-20 shrink-0 gap-4 overflow-x-auto custom-scrollbar">

                {/* Main Playback */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handlePlayPause}
                        disabled={!isReady}
                        className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center transition shadow-xl ${isPlaying ? 'bg-amber-500 text-slate-900 shadow-amber-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={!isReady || !isPlaying}
                        className="w-14 h-14 rounded-[1.2rem] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Square size={20} fill="currentColor" />
                    </button>

                    <div className="h-8 w-px bg-slate-700 mx-2"></div>

                    {/* A/B Loop Control */}
                    <button
                        onClick={toggleLoop}
                        disabled={!isReady}
                        title="A/B Looping"
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${isLooping ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'} disabled:opacity-50`}
                    >
                        <Repeat size={18} />
                    </button>

                    {/* Dynamic Overdrive Pedal */}
                    <button
                        onClick={() => setIsOverdriveActive(!isOverdriveActive)}
                        disabled={!isReady}
                        title="Pedal de Overdrive Dinámico (Ducking Distortion según Micrófono)"
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition shadow-lg ${isOverdriveActive ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'} disabled:opacity-50`}
                    >
                        <Flame size={18} className={isOverdriveActive ? 'animate-pulse' : ''} />
                    </button>
                </div>

                {/* Advanced Tools */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">

                    {/* Playback Speed Control */}
                    <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 overflow-hidden px-2 h-10 gap-2" title="Velocidad de Reproducción">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">VEL</span>
                        <input
                            type="range"
                            min="0.25"
                            max="1.5"
                            step="0.05"
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-300 w-10 text-right select-none">{Math.round(playbackSpeed * 100)}%</span>
                    </div>

                    <button
                        onClick={() => setShowMixer(!showMixer)}
                        disabled={!isReady}
                        className={`px-4 h-10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition ${showMixer ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
                    >
                        <ListMusic size={14} /> Mixer ({tracks.length})
                    </button>

                    <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} disabled={!isReady} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs font-bold text-slate-300 w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3.0, z + 0.2))} disabled={!isReady} className="w-8 md:w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition">
                            <ZoomIn size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLayoutMode(prev => prev === 'page' ? 'horizontal' : 'page')}
                            disabled={!isReady}
                            title="Cambiar Vista"
                            className={`w-10 h-10 rounded-xl bg-slate-800 border transition flex items-center justify-center ${layoutMode === 'horizontal' ? 'border-amber-500 text-amber-500 hover:bg-slate-700' : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            <Layout size={16} />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            title="Pantalla Completa"
                            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                        >
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Interactive Mixer Panel */}
            {showMixer && (
                <div className="bg-slate-900 border-b border-indigo-500/30 p-4 px-6 z-10 shrink-0 flex gap-4 overflow-x-auto custom-scrollbar shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mr-4 whitespace-nowrap">
                        <ListMusic size={14} /> Pistas:
                    </div>
                    {tracks.map((track, idx) => (
                        <div key={idx} className={`flex items-center gap-3 px-4 py-2 rounded-xl border whitespace-nowrap transition cursor-pointer select-none ${mutedTracks.has(idx) ? 'bg-slate-800 border-slate-700/50 text-slate-500 opacity-60' : 'bg-slate-800/80 border-slate-600 text-slate-200 hover:border-indigo-400 hover:bg-slate-700'}`} onClick={() => toggleMuteTrack(idx)}>
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900/50 text-slate-400">
                                {mutedTracks.has(idx) ? <VolumeX size={12} className="text-rose-500" /> : <Volume2 size={12} className="text-emerald-400" />}
                            </div>
                            <span className="text-xs font-bold truncate max-w-[120px]">{track.name || `Pista ${idx + 1}`}</span>
                        </div>
                    ))}
                    {tracks.length === 0 && <span className="text-xs text-slate-500 italic">No hay pistas aislables en este archivo.</span>}
                </div>
            )}

            {/* Score Container */}
            <div ref={wrapperRef} className="flex-1 overflow-auto bg-white custom-scrollbar w-full h-full relative min-w-0 min-h-0">
                <div className="relative w-max min-w-full drop-shadow-sm min-h-full p-6">
                    <div ref={containerRef} className="w-full"></div>
                    <div
                        ref={cursorRef}
                        className="absolute bg-blue-500/20 border-2 border-blue-500/50 rounded pointer-events-none transition-all duration-75 mix-blend-multiply shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        style={{ display: 'none', zIndex: 10 }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
