import React, { useState } from 'react';
import { useMidi } from '../../hooks/useMidi';
import { 
    Piano, 
    Settings2, 
    Activity, 
    RefreshCcw, 
    CheckCircle2, 
    AlertCircle, 
    Zap,
    Cpu,
    Bluetooth
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MidiSettings = () => {
    const midi = useMidi();
    const [testResult, setTestResult] = useState(null);

    const handleTestOutput = () => {
        if (!midi.selectedOutputId) return;
        
        // Play a simple C Major triad
        const notes = [60, 64, 67]; // C4, E4, G4
        notes.forEach((n, i) => {
            setTimeout(() => {
                midi.playNote(n, 1, { duration: 500, attack: 0.8 });
            }, i * 200);
        });
        
        setTestResult("Prueba enviada...");
        setTimeout(() => setTestResult(null), 2000);
    };

    if (!midi.isSupported) {
        return (
            <div className="p-8 bg-slate-900/50 border border-rose-500/30 rounded-[2.5rem] flex flex-col items-center gap-4 text-center">
                <AlertCircle size={48} className="text-rose-500 animate-pulse" />
                <h2 className="text-xl font-black text-white uppercase italic">Navegador No Compatible</h2>
                <p className="text-slate-400 text-sm max-w-md">
                    Tu navegador no soporta la API Web MIDI. Para una experiencia profesional de piano, utiliza 
                    <span className="text-blue-400 font-bold mx-1">Google Chrome, Microsoft Edge o Opera</span> 
                    en dispositivos compatibles.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Android</span>
                        <span className="text-xs text-emerald-500 font-bold">Compatible (Chrome)</span>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">iOS / iPadOS</span>
                        <span className="text-xs text-rose-500 font-bold">Limitado (Requiere WebBLE)</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Status Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${midi.isInitialized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Cpu size={24} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motor MIDI</h3>
                        <p className="text-sm font-black text-white">{midi.isInitialized ? 'ACTIVO' : 'INICIALIZANDO...'}</p>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${midi.selectedInputId ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Piano size={24} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dispositivo</h3>
                        <p className="text-sm font-black text-white truncate max-w-[150px]">
                            {midi.inputs.find(i => i.id === midi.selectedInputId)?.name || 'NO CONECTADO'}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latencia</h3>
                        <p className="text-sm font-black text-white">~2.4ms <span className="text-[8px] text-slate-500 font-bold ml-1">ULTRA LOW</span></p>
                    </div>
                </div>
            </div>

            {/* Main Config Panel */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Settings2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight uppercase italic">Configuración de Hardware</h2>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Gestión de entradas y salidas físicas</p>
                        </div>
                    </div>
                    <button 
                        onClick={midi.refreshDevices}
                        className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all group"
                    >
                        <RefreshCcw size={18} className="group-active:rotate-180 transition-transform duration-500" />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Selectors */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> MIDI Input
                            </label>
                            <select 
                                value={midi.selectedInputId}
                                onChange={(e) => midi.setInput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-200 outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Selecciona un teclado...</option>
                                {midi.inputs.map(input => (
                                    <option key={input.id} value={input.id}>{input.name}</option>
                                ))}
                            </select>
                            <p className="text-[9px] text-slate-500 font-medium px-2 italic">
                                * Se recomienda conectar el piano antes de abrir la aplicación.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> MIDI Output
                            </label>
                            <select 
                                value={midi.selectedOutputId}
                                onChange={(e) => midi.setOutput(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-200 outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Salida por defecto (Software)</option>
                                {midi.outputs.map(output => (
                                    <option key={output.id} value={output.id}>{output.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Instrumento (Patch)
                            </label>
                            <select 
                                value={midi.synthPreset}
                                onChange={(e) => midi.setSynthPreset(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-200 outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="grand_piano">Grand Piano (Estándar)</option>
                                <option value="blues_piano">Blues Piano (Brillante)</option>
                                <option value="blues_organ">Hammond Organ (Chorus)</option>
                                <option value="epiano">Electric Piano (Tremolo)</option>
                            </select>
                        </div>
                    </div>

                    {/* MIDI Monitor / Visualizer */}
                    <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between min-h-[200px]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">MIDI Monitor</span>
                            <div className={`w-2 h-2 rounded-full ${midi.lastEvent ? 'bg-blue-500 animate-ping' : 'bg-slate-800'}`} />
                        </div>

                        <AnimatePresence mode="wait">
                            {midi.lastEvent ? (
                                <motion.div 
                                    key={midi.lastEvent.timestamp}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-end gap-4">
                                        <span className="text-5xl font-black text-white italic tracking-tighter">
                                            {midi.lastEvent.name || '---'}
                                        </span>
                                        <div className="pb-2">
                                            <span className="text-[10px] font-black text-blue-500 uppercase block">Nota</span>
                                            <span className="text-xs font-bold text-slate-400">MIDI: {midi.lastEvent.note}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Velocity</span>
                                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1">
                                                <motion.div 
                                                    className="h-full bg-blue-500" 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${midi.lastEvent.velocity * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-white mt-1 block">
                                                {Math.round(midi.lastEvent.velocity * 127)}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Channel</span>
                                            <span className="text-lg font-black text-white">{midi.lastEvent.channel}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 text-slate-700 py-8">
                                    <Zap size={32} className="mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-tighter">Esperando actividad...</p>
                                </div>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <button 
                                onClick={handleTestOutput}
                                disabled={!midi.selectedOutputId && midi.outputs.length === 0}
                                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                    midi.outputs.length > 0 ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                                }`}
                            >
                                <Activity size={14} />
                                {testResult || 'Test de Salida MIDI'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="px-8 py-4 bg-blue-500/10 flex items-center gap-3">
                    <Bluetooth size={14} className="text-blue-400" />
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tight">
                        Soporte Bluetooth MIDI: Asegúrate de emparejar tu dispositivo en los ajustes del sistema antes de usarlo aquí.
                    </p>
                </div>
            </div>

            {/* Virtual Piano Display (Only if active) */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-2 mb-6">
                    <Piano size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Previa de Teclas Activas</span>
                </div>
                
                <div className="flex gap-0.5 h-32 justify-center overflow-x-auto pb-4 custom-scrollbar">
                    {Array.from({ length: 24 }).map((_, i) => {
                        const noteNum = 60 + i; // Middle C onwards
                        const isBlack = [1, 3, 6, 8, 10].includes(noteNum % 12);
                        const isActive = midi.activeNotes.has(noteNum);
                        
                        return (
                            <div 
                                key={noteNum}
                                className={`
                                    relative flex-shrink-0 transition-all duration-150 border-x border-slate-900/50
                                    ${isBlack ? 'w-6 h-20 -mx-3 z-10 rounded-b-md' : 'w-10 h-32 z-0 rounded-b-lg'}
                                    ${isActive 
                                        ? (isBlack ? 'bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]') 
                                        : (isBlack ? 'bg-slate-950' : 'bg-slate-800/40')
                                    }
                                `}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MidiSettings;
