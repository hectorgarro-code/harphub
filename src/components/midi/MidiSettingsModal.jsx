import React from 'react';
import { X, Piano } from 'lucide-react';
import MidiSettings from './MidiSettings';

const MidiSettingsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <Piano size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Configuración MIDI</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Conecta tu teclado físico al ecosistema HarpHub</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center hover:bg-rose-500 transition-all shadow-xl"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar bg-slate-950/20">
                    <MidiSettings />
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-center">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">
                        HarpHub MIDI Engine v2.0 • Baja Latencia • Soporte Multi-Dispositivo
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MidiSettingsModal;
