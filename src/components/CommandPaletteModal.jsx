import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, Music, Compass, BookOpen, Layers, 
    Zap, Mic2, Flame, HelpCircle, X, ChevronRight
} from 'lucide-react';

const CommandPaletteModal = ({ 
    isOpen, 
    onClose, 
    setIsProMetroOpen, 
    setIsTunerOpen, 
    setIsGuitarTunerOpen, 
    setIsBluesDegreeOpen,
    setIsTutorialOpen,
    setIsAdding
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const commands = [
        {
            id: 'metro',
            title: 'Abrir Metrónomo Pro',
            subtitle: 'Entrenador de velocidad y ritmos shuffle',
            icon: Zap,
            color: 'text-amber-500 bg-amber-500/10',
            action: () => { setIsProMetroOpen(true); onClose(); }
        },
        {
            id: 'tuner_harp',
            title: 'Afinador de Armónica',
            subtitle: 'Afinación de celdas, notas y bending',
            icon: Mic2,
            color: 'text-blue-500 bg-blue-500/10',
            action: () => { setIsTunerOpen(true); onClose(); }
        },
        {
            id: 'tuner_guitar',
            title: 'Afinador de Guitarra / Ukelele',
            subtitle: 'Detector de frecuencias para cuerdas',
            icon: Music,
            color: 'text-indigo-500 bg-indigo-500/10',
            action: () => { setIsGuitarTunerOpen(true); onClose(); }
        },
        {
            id: 'new_lesson',
            title: 'Crear Nueva Lección',
            subtitle: 'Abrir el editor unificado de lecciones',
            icon: BookOpen,
            color: 'text-emerald-500 bg-emerald-500/10',
            action: () => { setIsAdding(true); onClose(); }
        },
        {
            id: 'blues_degree',
            title: 'Módulo Grado en Blues',
            subtitle: 'Entrenamiento auditivo y teoría blues',
            icon: Flame,
            color: 'text-rose-500 bg-rose-500/10',
            action: () => { setIsBluesDegreeOpen(true); onClose(); }
        },
        {
            id: 'nav_library',
            title: 'Ir a Bóveda de Lecciones',
            subtitle: 'Explorar lecciones organizadas por colecciones',
            icon: Layers,
            color: 'text-purple-500 bg-purple-500/10',
            action: () => { navigate('/library'); onClose(); }
        },
        {
            id: 'nav_discovery',
            title: 'Ir a Descubrimiento',
            subtitle: 'Explorar creadores y rutas populares',
            icon: Compass,
            color: 'text-pink-500 bg-pink-500/10',
            action: () => { navigate('/discovery'); onClose(); }
        },
        {
            id: 'nav_paths',
            title: 'Ir a Rutas de Aprendizaje',
            subtitle: 'Ver mapas conceptuales de estudio',
            icon: Compass,
            color: 'text-cyan-500 bg-cyan-500/10',
            action: () => { navigate('/learning-paths'); onClose(); }
        },
        {
            id: 'help',
            title: 'Ver Centro de Ayuda y Tutoriales',
            subtitle: 'Guías de uso rápido de HarpHub',
            icon: HelpCircle,
            color: 'text-slate-400 bg-slate-800',
            action: () => { setIsTutorialOpen(true); onClose(); }
        }
    ];

    const filteredCommands = commands.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase()) || 
        c.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
            e.preventDefault();
            filteredCommands[selectedIndex].action();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
            <div 
                className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                onKeyDown={handleKeyDown}
            >
                {/* Search Bar Input */}
                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-slate-950/50">
                    <Search size={22} className="text-slate-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        placeholder="Escribe un comando o herramienta... (ej. Metrónomo, Afinador, Lección)"
                        className="w-full bg-transparent text-lg font-bold text-white placeholder-slate-600 outline-none"
                    />
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase">Esc</span>
                        <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Commands List */}
                <div className="max-h-96 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {filteredCommands.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 font-bold">
                            No se encontraron comandos coincidentes.
                        </div>
                    ) : (
                        filteredCommands.map((cmd, idx) => {
                            const Icon = cmd.icon;
                            const isSelected = idx === selectedIndex;
                            return (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition text-left ${
                                        isSelected ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cmd.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-sm">{cmd.title}</h4>
                                            <p className="text-[11px] font-medium text-slate-400">{cmd.subtitle}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={isSelected ? 'text-blue-400' : 'text-slate-700'} />
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-6 py-3 bg-slate-950 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <span>Navega con ↑ ↓ • Presiona Enter para seleccionar</span>
                    <span>HarpHub Command Palette</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPaletteModal;
