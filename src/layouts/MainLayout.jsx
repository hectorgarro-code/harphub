import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useMusic } from '../hooks/useMusic';
import { Play, Pause, Settings2, Info, Plus, Activity, Bell, Folder, Search, Layout, Menu, Map } from 'lucide-react';

export default function MainLayout({ 
    children, 
    setIsProMetroOpen, 
    setIsAdding, 
    setIsTourOpen, 
    setTourSteps, 
    MAIN_TOUR,
    stats,
    filter,
    setFilter,
    filterKey,
    setFilterKey,
    setIsRoutineOpen,
    setIsTabEditorOpen,
    setIsKeyToolOpen,
    setIsTunerOpen,
    setIsGuitarTunerOpen,
    setIsBluesDegreeOpen,
    setIsTutorialOpen,
    setIsBluesMasterOpen,
    setIsGuitarMasterOpen,
    setIsPianoMasterOpen,
    setIsUkeleleMasterOpen,
    setIsMidiSettingsOpen
}) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { bpm, setBpm, isMetroOn, setIsMetroOn, currentBeat } = useMusic();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarHovered, setIsSidebarHovered] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isMobileAddOpen, setIsMobileAddOpen] = React.useState(false);
    const [isDesktopAddOpen, setIsDesktopAddOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {/* MOBILE SIDEBAR OVERLAY */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className={`absolute inset-y-0 left-0 w-[80%] max-w-sm transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar 
                        user={user} 
                        handleLogout={logout}
                        stats={stats}
                        filter={filter}
                        setFilter={setFilter}
                        filterKey={filterKey}
                        setFilterKey={setFilterKey}
                        setIsRoutineOpen={setIsRoutineOpen}
                        setIsTabEditorOpen={setIsTabEditorOpen}
                        setIsKeyToolOpen={setIsKeyToolOpen}
                        setIsTunerOpen={setIsTunerOpen}
                        setIsGuitarTunerOpen={setIsGuitarTunerOpen}
                        setIsBluesDegreeOpen={setIsBluesDegreeOpen}
                        setIsTutorialOpen={setIsTutorialOpen}
                        setIsBluesMasterOpen={setIsBluesMasterOpen}
                        setIsGuitarMasterOpen={setIsGuitarMasterOpen}
                        setIsPianoMasterOpen={setIsPianoMasterOpen}
                        setIsUkeleleMasterOpen={setIsUkeleleMasterOpen}
                        setIsMidiSettingsOpen={setIsMidiSettingsOpen}
                        isSidebarOpen={true}
                        setIsSidebarOpen={setIsMobileMenuOpen}
                        setIsAdding={setIsAdding}
                    />
                </div>
            </div>

            {/* DESKTOP SIDEBAR */}
            <div 
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
                className={`hidden lg:block z-30 h-full transition-all duration-500 ease-in-out ${(isSidebarOpen || isSidebarHovered) ? 'w-72' : 'w-20'}`}
            >
                <Sidebar 
                    user={user} 
                    handleLogout={logout}
                    stats={stats}
                    filter={filter}
                    setFilter={setFilter}
                    filterKey={filterKey}
                    setFilterKey={setFilterKey}
                    setIsRoutineOpen={setIsRoutineOpen}
                    setIsTabEditorOpen={setIsTabEditorOpen}
                    setIsKeyToolOpen={setIsKeyToolOpen}
                    setIsTunerOpen={setIsTunerOpen}
                    setIsGuitarTunerOpen={setIsGuitarTunerOpen}
                    setIsBluesDegreeOpen={setIsBluesDegreeOpen}
                    setIsTutorialOpen={setIsTutorialOpen}
                    setIsBluesMasterOpen={setIsBluesMasterOpen}
                    setIsGuitarMasterOpen={setIsGuitarMasterOpen}
                    setIsPianoMasterOpen={setIsPianoMasterOpen}
                    setIsUkeleleMasterOpen={setIsUkeleleMasterOpen}
                    setIsMidiSettingsOpen={setIsMidiSettingsOpen}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isHovered={isSidebarHovered}
                    setIsAdding={setIsAdding}
                />
            </div>

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
                {/* Facebook-style Mobile Header */}
                <header className="lg:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-white/5 z-40 sticky top-0">
                    {/* Top Row: Logo & Metronome Controls */}
                    <div className="h-16 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                                <Activity size={16} />
                            </div>
                            <h1 className="font-black text-lg tracking-tight text-white">HarpHub</h1>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-full border border-white/5">
                            <button 
                                onClick={() => setIsMetroOn(!isMetroOn)} 
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isMetroOn ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}
                            >
                                {isMetroOn ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            </button>
                            <div className="flex flex-col items-center px-1">
                                <input 
                                    type="number" 
                                    value={bpm} 
                                    onChange={(e) => setBpm(Number(e.target.value))} 
                                    className="bg-transparent text-sm font-black w-10 text-white focus:outline-none text-center leading-none" 
                                />
                                <span className="text-[6px] font-black text-slate-500 uppercase tracking-tighter">BPM</span>
                            </div>
                            <button 
                                onClick={() => setIsProMetroOpen(true)}
                                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition"
                            >
                                <Settings2 size={14} />
                            </button>
                        </div>

                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition"
                        >
                            <Menu size={18} />
                        </button>
                    </div>

                    {/* Tab Row: Navigation Icons */}
                    <div className="h-14 flex items-center justify-around border-t border-white/5 px-2">
                        <Link to="/" className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${window.location.pathname === '/' ? 'text-blue-500 border-b-2 border-blue-500 h-full' : 'text-slate-500'}`}>
                            <Layout size={20} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Bóveda</span>
                        </Link>
                        <Link to="/feed" className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${window.location.pathname === '/feed' ? 'text-blue-500 border-b-2 border-blue-500 h-full' : 'text-slate-500'}`}>
                            <Activity size={20} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Feed</span>
                        </Link>
                        <div className="flex-1 flex items-center justify-center relative">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMobileAddOpen(!isMobileAddOpen);
                                }}
                                className={`flex flex-col items-center justify-center gap-1 transition-all ${isMobileAddOpen ? 'text-blue-500' : 'text-slate-500'}`}
                            >
                                <Plus size={22} strokeWidth={3} />
                                <span className="text-[7px] font-black uppercase tracking-widest">Añadir</span>
                            </button>
                            {isMobileAddOpen && (
                                <>
                                    <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsMobileAddOpen(false)}></div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button 
                                            onClick={() => { setIsAdding(true); setIsMobileAddOpen(false); }}
                                            className="w-full px-5 py-4 flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 transition text-left border-b border-white/5"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500"><Plus size={16} /></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Lección</span>
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                window.dispatchEvent(new CustomEvent('open-new-collection'));
                                                setIsMobileAddOpen(false); 
                                            }}
                                            className="w-full px-5 py-4 flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-500"><Folder size={16} /></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest">Colección</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500"
                        >
                            <Bell size={20} />
                            <span className="text-[7px] font-black uppercase tracking-widest">Avisos</span>
                        </button>
                    </div>
                </header>

                {/* Desktop Metronome Bar (Hidden on Mobile) */}
                <div className="hidden lg:flex h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/5 items-center justify-between px-8 z-30 shadow-lg shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsMetroOn(!isMetroOn)} className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg ${isMetroOn ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            {isMetroOn ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BPM</span>
                            <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="bg-transparent text-xl font-black w-14 text-white focus:outline-none border-b border-transparent focus:border-slate-700 text-center" />
                            <div className="flex gap-2 ml-4">
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} className={`w-3 h-3 rounded-full transition-all duration-75 ${currentBeat === i && isMetroOn ? 'bg-blue-400 scale-125 shadow-lg shadow-blue-400/50' : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                            <button onClick={() => setIsProMetroOpen(true)} className="ml-4 w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition" title="Ajustes Pro">
                                <Settings2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <p className="hidden xl:flex text-[10px] text-slate-500 font-medium uppercase tracking-widest italic items-center gap-2 shrink-0 mr-4">
                            <Activity size={12} className="text-blue-500" />
                            Maestría en Armónica
                        </p>
                        
                        <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 shadow-inner relative">
                            <div className="relative">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDesktopAddOpen(!isDesktopAddOpen);
                                    }} 
                                    className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-90 transition"
                                >
                                    <Plus size={20} strokeWidth={3} />
                                </button>

                                {isDesktopAddOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsDesktopAddOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl z-50 py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <button 
                                                onClick={() => { setIsAdding(true); setIsDesktopAddOpen(false); }}
                                                className="w-full px-6 py-4 flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 transition text-left border-b border-white/5"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500"><Plus size={16} /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Nueva Lección</span>
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    window.dispatchEvent(new CustomEvent('open-new-collection'));
                                                    setIsDesktopAddOpen(false); 
                                                }}
                                                className="w-full px-6 py-4 flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-500"><Folder size={16} /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Nueva Colección</span>
                                            </button>
                                            <button 
                                                onClick={() => { 
                                                    navigate('/path-builder');
                                                    setIsDesktopAddOpen(false); 
                                                }}
                                                className="w-full px-6 py-4 flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-500"><Map size={16} /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Crear Ruta</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="w-[1px] h-6 bg-white/10 mx-1" />
                            <button onClick={() => { setTourSteps(MAIN_TOUR); setIsTourOpen(true); }} className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all active:scale-90">
                                <Info size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
