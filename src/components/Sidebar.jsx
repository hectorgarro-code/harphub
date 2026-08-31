import React from 'react';
import {
    Mic2, LogOut, Zap, Timer, Trophy, Layout, Edit3,
    Search, Gauge, Layers, Square, Circle, Plus, ChevronLeft, ChevronRight, Menu, Headphones, Disc, GraduationCap, X, Info, Hash, Music, Piano, Activity, Folder, Compass, Map
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({
    stats = { streak: 0, practiceHours: 0, points: 0 },
    filter,
    setFilter,
    filterKey,
    setFilterKey,
    setIsRoutineOpen,
    setIsTabEditorOpen,
    setIsKeyToolOpen,
    setIsTunerOpen,
    setIsGuitarTunerOpen,
    toggleRecording,
    isRecording,
    setIsAdding,
    setSelectedItem,
    isSidebarOpen,
    setIsSidebarOpen,
    isHovered,
    recordings,
    setIsBluesDegreeOpen,
    setIsTutorialOpen,
    setIsBluesMasterOpen,
    setIsGuitarMasterOpen,
    setIsPianoMasterOpen,
    setIsUkeleleMasterOpen,
    setIsMidiSettingsOpen
}) => {
    const { user, logout } = useAuth();
    const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);

    if (!user) return null;

    const isExpanded = isSidebarOpen || isHovered;

    return (
        <aside 
            className={`${isExpanded ? 'w-full lg:w-72' : 'w-20'} h-full transition-all duration-500 ease-in-out bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl relative group/sidebar`}
        >
            {/* Toggle Button - Only show on Desktop, move to bottom like IG if needed, but keeping original position for now */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 z-[60] shadow-md transition transform group-hover/sidebar:scale-110"
            >
                {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            <div className={`p-6 border-b border-slate-800 flex items-center transition-all duration-500 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                <Link to="/" className="flex items-center gap-4 group" title="HarpHub Dashboard">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform duration-500">
                        <Mic2 size={22} strokeWidth={2.5} />
                    </div>
                    <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isExpanded ? 'w-40 opacity-100' : 'w-0 opacity-0'}`}>
                        <h1 className="font-black text-xl tracking-tight text-white whitespace-nowrap leading-none uppercase">HarpHub</h1>
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 opacity-70">Studio v0.5.0</span>
                    </div>
                </Link>
                {/* Close button for mobile overlay */}
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                    <X size={20} />
                </button>
            </div>

            {/* User Profile Info */}
            <div className={`p-5 border-b border-slate-800 bg-slate-950/40 flex items-center transition-all duration-500 ${isExpanded ? 'justify-between px-6' : 'justify-center'}`}>
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shrink-0 border-2 border-slate-800 shadow-xl">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
                        <span className="text-sm font-black text-white leading-tight truncate uppercase tracking-tight">{user.username}</span>
                        <Link 
                            to={`/profile/${user.username}`}
                            className="text-[9px] text-blue-400 uppercase tracking-[0.15em] font-black leading-tight truncate hover:text-white transition flex items-center gap-1 mt-0.5"
                        >
                            Perfil <ChevronRight size={8} />
                        </Link>
                    </div>
                </div>
                {isExpanded && (
                    <button onClick={logout} className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0 animate-in fade-in duration-500" title="Cerrar Sesión">
                        <LogOut size={14} />
                    </button>
                )}
            </div>

            {/* Gamification Stats Block - Instagram-style: hide text labels when collapsed */}
            <div className={`p-5 grid gap-3 border-b border-slate-800 bg-slate-950/20 transition-all duration-500 ${isExpanded ? 'grid-cols-3' : 'grid-cols-1'}`}>
                <div className="flex flex-col items-center justify-center bg-slate-800/20 rounded-2xl p-2.5 border border-white/5 group/stat hover:bg-slate-800/40 transition">
                    <Zap className="text-amber-500 mb-0.5 group-hover/stat:scale-110 transition" size={16} />
                    <span className="text-sm font-black text-white leading-none">{stats.streak}</span>
                    <span className={`text-[7px] text-slate-500 uppercase tracking-widest font-black transition-all duration-500 overflow-hidden ${isExpanded ? 'h-auto mt-1 opacity-100' : 'h-0 opacity-0'}`}>Racha</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-slate-800/20 rounded-2xl p-2.5 border border-white/5 group/stat hover:bg-slate-800/40 transition">
                    <Timer className="text-blue-500 mb-0.5 group-hover/stat:scale-110 transition" size={16} />
                    <span className="text-sm font-black text-white leading-none">{Math.floor(stats.practiceHours || 0)}h</span>
                    <span className={`text-[7px] text-slate-500 uppercase tracking-widest font-black transition-all duration-500 overflow-hidden ${isExpanded ? 'h-auto mt-1 opacity-100' : 'h-0 opacity-0'}`}>Horas</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-slate-800/20 rounded-2xl p-2.5 border border-white/5 group/stat hover:bg-slate-800/40 transition">
                    <Trophy className="text-emerald-500 mb-0.5 group-hover/stat:scale-110 transition" size={16} />
                    <span className="text-sm font-black text-white leading-none">{stats.points || 0}</span>
                    <span className={`text-[7px] text-slate-500 uppercase tracking-widest font-black transition-all duration-500 overflow-hidden ${isExpanded ? 'h-auto mt-1 opacity-100' : 'h-0 opacity-0'}`}>Puntos</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24">
                <NavItem to="/library" icon={Layout} label="Mis Lecciones" color="slate" isExpanded={isExpanded} />
                <NavItem to="/learning-paths" icon={Map} label="Rutas" color="purple" isExpanded={isExpanded} />
                <NavItem to="/discovery" icon={Compass} label="Explorar" color="emerald" isExpanded={isExpanded} />
                <NavItem to="/review-center" icon={GraduationCap} label="Revisión" color="rose" isExpanded={isExpanded} />
                <NavItem to="/" icon={Activity} label="Comunidad" color="blue" isExpanded={isExpanded} />

                <div className="pt-4 mt-2 border-t border-slate-800 space-y-2">
                    <NavButton onClick={() => setIsBluesMasterOpen(true)} icon={Layers} label="Blues Master" color="indigo" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsGuitarMasterOpen(true)} icon={Hash} label="Guitar Master" color="blue" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsPianoMasterOpen(true)} icon={Music} label="Piano Master" color="purple" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsUkeleleMasterOpen(true)} icon={Music} label="Ukelele Master" color="emerald" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsMidiSettingsOpen(true)} icon={Piano} label="Config MIDI" color="blue" isExpanded={isExpanded} />

                    <NavButton onClick={() => setIsBluesDegreeOpen(true)} icon={GraduationCap} label="Blues Degree" color="rose" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsRoutineOpen(true)} icon={Timer} label="Rutina Diaria" color="amber" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsTabEditorOpen(true)} icon={Edit3} label="Editor Tabs" color="blue" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsKeyToolOpen(true)} icon={Search} label="Detector" color="emerald" isExpanded={isExpanded} />
                    <NavButton onClick={() => setIsTunerOpen(true)} icon={Gauge} label="Afinador" color="blue" isExpanded={isExpanded} />
                </div>

                {recordings && recordings.length > 0 && (
                    <div className="pt-4 mt-2 border-t border-slate-800">
                        {isExpanded && <label className="text-[9px] uppercase font-black tracking-[0.25em] text-slate-600 mb-3 block px-3 animate-in fade-in">Grabaciones</label>}
                        <div className="space-y-2">
                            {recordings.map((rec, i) => (
                                <a
                                    key={i}
                                    href={rec.url}
                                    download={rec.filename}
                                    className={`w-full flex items-center transition-all duration-500 rounded-2xl overflow-hidden ${isExpanded ? 'gap-4 px-4 h-14' : 'justify-center h-12'} bg-slate-950 border border-slate-800 hover:bg-slate-800 transition group/rec`}
                                >
                                    <Headphones size={18} className="text-rose-500 shrink-0 group-hover/rec:scale-110 transition" />
                                    <div className={`flex flex-col transition-all duration-500 overflow-hidden ${isExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
                                        <span className="truncate w-full font-bold text-[10px] text-white uppercase tracking-tight">{rec.filename.replace('.webm', '')}</span>
                                        <span className="text-[7px] text-slate-600 font-black tracking-widest">{new Date(rec.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Instagram-style footer */}
            <div className={`p-6 border-t border-slate-800 flex flex-col items-center gap-1 transition-all duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 p-0'}`}>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">HarpHub Studio</span>
                <span className="text-[7px] font-black text-slate-800 uppercase tracking-widest">© 2026 Engine</span>
            </div>
        </aside>
    );
};

// Helper Components for cleaner code
const NavItem = ({ to, icon: Icon, label, color, isExpanded }) => (
    <Link 
        to={to} 
        title={label}
        className={`w-full flex items-center transition-all duration-500 rounded-2xl group/nav ${isExpanded ? 'gap-4 px-4 h-14 bg-slate-800/10' : 'justify-center h-12 bg-transparent'} border border-white/0 hover:border-white/5 hover:bg-slate-800/30 text-slate-400 hover:text-white`}
    >
        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-transparent' : 'bg-slate-800/30 group-hover/nav:bg-slate-800'}`}>
            <Icon size={20} className={`transition-transform duration-500 group-hover/nav:scale-110 text-${color}-400`} />
        </div>
        <span className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-500 whitespace-nowrap overflow-hidden ${isExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
            {label}
        </span>
    </Link>
);

const NavButton = ({ onClick, icon: Icon, label, color, isExpanded }) => (
    <button 
        onClick={onClick}
        title={label}
        className={`w-full flex items-center transition-all duration-500 rounded-2xl group/nav ${isExpanded ? 'gap-4 px-4 h-14 bg-slate-800/10' : 'justify-center h-12 bg-transparent'} border border-white/0 hover:border-white/5 hover:bg-slate-800/30 text-slate-400 hover:text-white`}
    >
        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-transparent' : 'bg-slate-800/30 group-hover/nav:bg-slate-800'}`}>
            <Icon size={20} className={`transition-transform duration-500 group-hover/nav:scale-110 text-${color}-400`} />
        </div>
        <span className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-500 whitespace-nowrap overflow-hidden ${isExpanded ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
            {label}
        </span>
    </button>
);

export default Sidebar;
