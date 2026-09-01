import React, { useState } from 'react';
import {
    GraduationCap,
    BookOpen,
    Music,
    Mic2,
    Guitar,
    Layout,
    ChevronLeft,
    ChevronRight,
    Monitor,
    Calendar,
    Clock,
    Award,
    Menu,
    X,
    Plus,
    Volume2,
    Play,
    Pause,
    Sliders,
    Zap,
    Trello,
    Search,
    Type,
    Settings,
    RotateCcw,
    Timer,
    LogOut
} from 'lucide-react';

import BluesDegreeMain from './components/BluesDegreeMain';
import BanlabBluesStudio from './components/BanlabBluesStudio';
import HelpMeSonnyBoy from './components/HelpMeSonnyBoy';
import PapposBluesII from './components/PapposBluesII';
import Semana17_20Nacional from './components/Semana17_20Nacional';
import Semana21_22Pappo from './components/Semana21_22Pappo';
import SonyBoyII from './components/SonyBoyII';

const PAGES = [
    { id: 'main', title: 'Blues Degree: 24 Semanas', icon: GraduationCap, component: BluesDegreeMain },
    { id: 'banlab', title: 'BandLab Blues Studio', icon: Monitor, component: BanlabBluesStudio },
    { id: 'sonnyboy', title: 'Sonny Boy II: Masterclass', icon: Mic2, component: SonyBoyII },
    { id: 'helpme', title: 'Help Me: Sonny Boy', icon: BookOpen, component: HelpMeSonnyBoy },
    { id: 'pappo', title: 'Pappos Blues II', icon: Guitar, component: PapposBluesII },
    { id: 'semana17-20', title: 'Semana 17-20: Nacional', icon: Calendar, component: Semana17_20Nacional },
    { id: 'semana21-22', title: 'Semana 21-22: Pappo', icon: Music, component: Semana21_22Pappo },
];



const BluesDegreeModule = ({ 
    isOpen, 
    onClose, 
    progress,
    onSaveProgress,
    metroProps, 
    onOpenRoutine, 
    onOpenAdd, 
    onOpenTabs, 
    onOpenTuner, 
    onOpenKeyTool, 
    onLogout 
}) => {
    const [activePageId, setActivePageId] = useState('main');
    const [isRepertorioOpen, setIsRepertorioOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    if (!isOpen) return null;

    const activePage = PAGES.find(p => p.id === activePageId) || PAGES[0];
    const ActiveComponent = activePage.component;

    const handlePageChange = (id) => {
        setActivePageId(id);
        setIsRepertorioOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0f18] text-white overflow-hidden font-sans">
            {/* Navigation Header (Desktop & Mobile) */}
            <nav className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 lg:px-8 flex items-center justify-between relative z-50">
                <div className="flex items-center gap-3 lg:gap-4">
                    <div className="lg:hidden">
                        <button 
                            onClick={() => setIsRepertorioOpen(true)}
                            className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center border border-blue-500/20"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                    <GraduationCap className="text-blue-500 hidden sm:block" size={24} />
                    <h1 className="text-sm lg:text-xl font-black tracking-tighter italic uppercase truncate max-w-[150px] lg:max-w-none">Blues Degree</h1>
                </div>

                <div className="flex gap-2 items-center">
                    <div className="hidden lg:flex gap-2" id="tour-blues-modules">
                        {PAGES.map(page => (
                            <button
                                key={page.id}
                                onClick={() => setActivePageId(page.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activePageId === page.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                {page.title}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all ml-2"
                    >
                        <X size={20} />
                    </button>
                </div>
            </nav>

            {/* Mobile Repertorio Menu (TODOS) */}
            <div className={`fixed inset-0 bg-[#0a0f18]/98 backdrop-blur-2xl z-[150] transition-all duration-500 ${isRepertorioOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col p-8 pt-12">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                <Layout size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">Repertorio</h2>
                        </div>
                        <button onClick={() => setIsRepertorioOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-12">
                        {PAGES.map(page => {
                            const PageIcon = page.icon;
                            return (
                                <button
                                    key={page.id}
                                    onClick={() => handlePageChange(page.id)}
                                    className={`flex items-center gap-6 p-6 rounded-3xl transition-all duration-300 border ${activePageId === page.id ? 'bg-blue-600 border-blue-400 shadow-xl' : 'bg-white/5 border-white/5 text-slate-300'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activePageId === page.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                        <PageIcon size={28} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-black tracking-tight text-white">{page.title}</p>
                                        <p className={`text-[10px] uppercase font-bold tracking-widest ${activePageId === page.id ? 'text-blue-200' : 'text-slate-500'}`}>HarpHub Module</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Tools Menu (MENÚ) */}
            <div className={`fixed inset-0 bg-[#070b14]/98 backdrop-blur-3xl z-[160] transition-all duration-500 ${isToolsOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col p-8 pt-12 max-w-lg mx-auto w-full">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-xl shadow-inner border border-white/5">H</div>
                            <div>
                                <h2 className="text-2xl font-black text-white leading-none mb-1">HarpHub</h2>
                                <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase">Master Menu</p>
                            </div>
                        </div>
                        <button onClick={() => setIsToolsOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400">
                            <X size={22} />
                        </button>
                    </div>

                    {/* Quick Link to Main Dashboard */}
                    <button 
                        onClick={onClose}
                        className="w-full bg-blue-600 p-5 rounded-[2rem] flex items-center gap-4 group active:scale-95 transition-all mb-8 shadow-lg shadow-blue-500/20"
                    >
                        <Layout className="text-white" size={24} />
                        <div className="text-left">
                            <p className="font-black text-white text-sm">BIBLIOTECA PRINCIPAL</p>
                            <p className="text-[9px] font-bold text-blue-100 uppercase tracking-wider">Volver al Inicio</p>
                        </div>
                    </button>

                    <div className="flex flex-col gap-3 overflow-y-auto pb-12 custom-scrollbar">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">HERRAMIENTAS GLOBALES</p>
                        
                        <button onClick={() => { onOpenRoutine(); setIsToolsOpen(false); }} className="flex items-center gap-6 p-6 rounded-3xl bg-[#141b2a] border border-white/5 hover:bg-[#1a2335] active:scale-[0.98] transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/10 shadow-inner group-hover:scale-110 transition-transform">
                                <Clock size={26} className="text-amber-500" />
                            </div>
                            <span className="text-sm font-black tracking-widest uppercase text-amber-500">RUTINA DIARIA</span>
                        </button>

                        <button onClick={() => { onOpenTabs(); setIsToolsOpen(false); }} className="flex items-center gap-6 p-6 rounded-3xl bg-[#141b2a] border border-white/5 hover:bg-[#1a2335] active:scale-[0.98] transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-500/10 shadow-inner group-hover:scale-110 transition-transform">
                                <Type size={26} className="text-blue-500" />
                            </div>
                            <span className="text-sm font-black tracking-widest uppercase text-blue-500">EDITOR DE TABS</span>
                        </button>

                        <button onClick={() => { onOpenKeyTool(); setIsToolsOpen(false); }} className="flex items-center gap-6 p-6 rounded-3xl bg-[#141b2a] border border-white/5 hover:bg-[#1a2335] active:scale-[0.98] transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 shadow-inner group-hover:scale-110 transition-transform">
                                <Search size={26} className="text-emerald-500" />
                            </div>
                            <span className="text-sm font-black tracking-widest uppercase text-emerald-500">DETECTOR TONOS</span>
                        </button>

                        <button onClick={() => { onOpenTuner(); setIsToolsOpen(false); }} className="flex items-center gap-6 p-6 rounded-3xl bg-[#141b2a] border border-white/5 hover:bg-[#1a2335] active:scale-[0.98] transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cyan-500/10 shadow-inner group-hover:scale-110 transition-transform">
                                <Zap size={26} className="text-cyan-500" />
                            </div>
                            <span className="text-sm font-black tracking-widest uppercase text-cyan-500">AFINADOR & BEND</span>
                        </button>
                        
                        <button onClick={onLogout} className="mt-8 w-full bg-slate-900/50 border border-slate-800 p-5 rounded-[2rem] flex items-center justify-center gap-3 group active:scale-95 transition-all text-slate-500 hover:text-white">
                            <LogOut size={20} />
                            <span className="font-black text-sm uppercase tracking-widest">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="h-full overflow-y-auto lg:h-[calc(100%-80px)] pb-12 lg:pb-0 relative z-10 custom-scrollbar">
                <ActiveComponent progress={progress} onSaveProgress={onSaveProgress} />
            </main>
        </div>
    );
};

export default BluesDegreeModule;
