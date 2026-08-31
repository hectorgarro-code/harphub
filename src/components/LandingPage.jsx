import React, { useState } from 'react';
import {
    ChevronRight, BookOpen, Share2, GraduationCap,
    Zap, Music, Search, Layout, ArrowRight,
    Youtube, Clock, Network, BrainCircuit, Folders,
    Mic2, Play, Library, Guitar, Piano, ListMusic,
    Star, Quote, FileText, AlertCircle, FileQuestion, Target
} from 'lucide-react';

const HarpHubLanding = ({ onEnter = () => console.log("Enter") }) => {
    const [isOrdered, setIsOrdered] = useState(false);

    return (
        <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-[100] h-20 bg-[#030712]/70 backdrop-blur-md border-b border-white/5 px-6 lg:px-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Music className="text-white w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">HarpHub</span>
                </div>
                <button
                    onClick={onEnter}
                    className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-200 text-[#030712] font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
                >
                    Ingresar <ArrowRight size={16} />
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 -z-10 overflow-hidden bg-[#030712]">
                    <img
                        src="/assets/hero-bg.png"
                        alt="HarpHub Professional Background"
                        className="w-full h-full object-cover object-center opacity-[0.35] scale-105"
                    />
                    {/* Vignette Gradients for better text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]"></div>
                    <div className="absolute inset-0 bg-[#030712]/40 backdrop-blur-[2px]"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>

                <div className="text-center max-w-4xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        El fin del caos en tu estudio musical
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6 text-white">
                        Tu conocimiento musical, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                            finalmente tiene sentido.
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                        Internet está lleno de tabs, videos y teoría suelta. HarpHub es el espacio para centralizar, organizar y transformar esos favoritos perdidos en un mapa de aprendizaje real.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onEnter}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center gap-2"
                        >
                            Crear mi mapa musical
                        </button>
                    </div>
                </div>

                {/* Dashboard Preview - Bento Style */}
                <div className="mt-20 relative z-10 mx-auto max-w-5xl rounded-[2rem] p-4 bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[400px]">
                        <div className="col-span-1 md:col-span-2 row-span-2 bg-[#0A0F1C] rounded-2xl border border-white/5 p-6 relative overflow-hidden group min-h-[300px]">
                            <div className="relative z-20 max-w-[60%]">
                                <h3 className="text-xl font-bold text-white mb-2">Tu Ecosistema</h3>
                                <p className="text-slate-400 text-sm">Organiza tu repertorio, rutinas y jams en un solo lugar.</p>
                            </div>

                            {/* App UI Preview CSS Mockup */}
                            <div className="absolute -bottom-2 -right-2 w-[85%] h-[80%] bg-[#030712] rounded-tl-2xl border-t border-l border-white/10 shadow-2xl overflow-hidden transform group-hover:-translate-y-3 group-hover:-translate-x-3 transition-transform duration-500 flex z-10">

                                {/* Sidebar Mockup */}
                                <div className="w-1/4 min-w-[110px] border-r border-white/5 p-4 hidden sm:flex flex-col gap-4 bg-[#050810]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0"></div>
                                        <div className="h-2 w-12 bg-white/20 rounded"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-8 w-full bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center px-2 gap-2">
                                            <Layout size={12} className="text-blue-400" />
                                            <div className="h-1.5 w-12 bg-blue-400 rounded"></div>
                                        </div>
                                        <div className="h-8 w-full bg-transparent hover:bg-white/5 rounded-lg flex items-center px-2 gap-2 transition-colors">
                                            <Clock size={12} className="text-slate-400" />
                                            <div className="h-1.5 w-16 bg-slate-400 rounded"></div>
                                        </div>
                                        <div className="h-8 w-full bg-transparent hover:bg-white/5 rounded-lg flex items-center px-2 gap-2 transition-colors">
                                            <Zap size={12} className="text-slate-400" />
                                            <div className="h-1.5 w-10 bg-slate-400 rounded"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Area Mockup */}
                                <div className="flex-1 p-5 bg-[#0a0f1c]">
                                    {/* Search bar */}
                                    <div className="h-8 w-full bg-[#030712] border border-white/5 rounded-full mb-6 flex items-center px-4 shadow-inner">
                                        <Search size={12} className="text-slate-500 mr-2" />
                                        <div className="h-1.5 w-32 bg-slate-600/50 rounded"></div>
                                    </div>

                                    {/* Content list */}
                                    <div className="space-y-3">
                                        <div className="h-14 w-full bg-[#111827] rounded-xl border border-white/5 flex items-center justify-between px-4 hover:bg-[#1f2937] transition-colors cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center"><Clock size={14} className="text-blue-400" /></div>
                                                <div>
                                                    <div className="text-sm font-bold text-white mb-0.5">PRÁCTICA DIARIA</div>
                                                    <div className="text-[10px] text-slate-500 font-bold">5 LECCIONES</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-600" />
                                        </div>

                                        <div className="h-14 w-full bg-[#111827] rounded-xl border border-white/5 flex items-center justify-between px-4 hover:bg-[#1f2937] transition-colors cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><Music size={14} className="text-emerald-400" /></div>
                                                <div>
                                                    <div className="text-sm font-bold text-white mb-0.5">JAMS (TEMAS)</div>
                                                    <div className="text-[10px] text-slate-500 font-bold">13 LECCIONES</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-1 row-span-1 bg-gradient-to-br from-indigo-900/40 to-[#0A0F1C] rounded-2xl border border-indigo-500/20 p-6 flex flex-col justify-center">
                            <Folders className="text-indigo-400 mb-3" size={28} />
                            <h4 className="text-white font-bold">Biblioteca Central</h4>
                            <p className="text-xs text-slate-400 mt-1">Tabs, escalas y videos en un solo lugar.</p>
                        </div>
                        <div className="col-span-1 row-span-1 bg-gradient-to-br from-cyan-900/40 to-[#0A0F1C] rounded-2xl border border-cyan-500/20 p-6 flex flex-col justify-center">
                            <Search className="text-cyan-400 mb-3" size={28} />
                            <h4 className="text-white font-bold">Búsqueda Rápida</h4>
                            <p className="text-xs text-slate-400 mt-1">Encuentra ese riff que guardaste hace meses.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Switch: Caos vs Orden */}
            <section className="py-24 px-6 lg:px-12 max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                        El problema de <span className="text-slate-500 line-through decoration-red-500 decoration-4">acumular</span> <span className="text-blue-400">aprender</span>
                    </h2>

                    {/* Toggle Switch */}
                    <div className="inline-flex bg-white/5 p-1.5 rounded-full border border-white/10 relative z-20">
                        <button
                            onClick={() => setIsOrdered(false)}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${!isOrdered ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'text-slate-400 hover:text-white'}`}
                        >
                            El Caos Habitual
                        </button>
                        <button
                            onClick={() => setIsOrdered(true)}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isOrdered ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${isOrdered ? 'bg-white animate-pulse' : 'bg-transparent'}`}></div>
                            Con HarpHub
                        </button>
                    </div>
                </div>

                {/* Interactive Display Area */}
                <div className="relative h-[450px] w-full bg-[#0A0F1C] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-700">

                    {/* View 1: El Caos */}
                    <div className={`absolute inset-0 p-8 transition-opacity duration-700 ${!isOrdered ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>

                        {/* Messy scattered items */}
                        <div className="absolute top-12 left-10 p-4 bg-slate-900 border border-slate-700 rotate-[-8deg] rounded-xl shadow-lg flex gap-3 w-64 grayscale opacity-80 hover:grayscale-0 hover:z-20 transition-all">
                            <Youtube className="text-red-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-white mb-1">Tutorial Bending Parte 1</p>
                                <p className="text-[10px] text-red-400">Video no disponible</p>
                            </div>
                        </div>

                        <div className="absolute top-40 right-16 p-4 bg-slate-800 border border-amber-900 rotate-[12deg] rounded-xl shadow-lg flex gap-3 w-56 opacity-90 hover:z-20 transition-all">
                            <FileText className="text-amber-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-white mb-1">Tabs_Blues_Final_v3.txt</p>
                                <p className="text-[10px] text-slate-400">Guardado hace 2 años</p>
                            </div>
                        </div>

                        <div className="absolute bottom-20 left-1/4 p-4 bg-slate-800/80 border border-slate-700 rotate-[-15deg] rounded-xl shadow-lg flex gap-3 w-48 opacity-70 hover:z-20 transition-all">
                            <FileQuestion className="text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-slate-300">¿En qué tono estaba esto?</p>
                            </div>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full h-full pointer-events-none z-0">
                            <AlertCircle size={48} className="text-red-500/20 mb-4" />
                            <h3 className="text-xl font-bold text-slate-600">Conocimiento fragmentado</h3>
                            <p className="text-sm text-slate-500 max-w-xs text-center mt-2">Acumulás información pero perdés el hilo conductor.</p>
                        </div>
                    </div>

                    {/* View 2: Orden (HarpHub) */}
                    <div className={`absolute inset-0 p-8 bg-gradient-to-br from-blue-900/10 to-indigo-900/10 transition-opacity duration-700 ${isOrdered ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Central Node */}
                            <div className="relative z-20 w-48 h-48 rounded-full bg-[#0A0F1C] border border-blue-500/30 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                                <Mic2 className="text-blue-400 mb-2" size={32} />
                                <span className="font-bold text-white">Ruta de Blues</span>
                                <span className="text-xs text-blue-400 mt-1">Armónica en C</span>
                            </div>

                            {/* Connected Nodes */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 p-3 bg-blue-900/40 border border-blue-500/30 rounded-xl backdrop-blur-sm flex items-center gap-3">
                                <BookOpen size={16} className="text-blue-300" />
                                <span className="text-xs font-bold text-slate-200">Escala de Blues (2da Pos)</span>
                            </div>
                            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-blue-500/50 to-transparent"></div>

                            <div className="absolute bottom-16 left-12 w-48 p-3 bg-indigo-900/40 border border-indigo-500/30 rounded-xl backdrop-blur-sm flex items-center gap-3">
                                <Play size={16} className="text-indigo-300" />
                                <span className="text-xs font-bold text-slate-200">Backing Track Shuffle</span>
                            </div>
                            {/* SVG Line connecting */}
                            <svg className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 10 }}>
                                <path d="M 200 320 Q 300 320 400 250" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                                <path d="M 600 320 Q 500 320 400 250" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="4 4" />
                            </svg>

                            <div className="absolute bottom-16 right-12 w-48 p-3 bg-emerald-900/40 border border-emerald-500/30 rounded-xl backdrop-blur-sm flex items-center gap-3">
                                <Target size={16} className="text-emerald-300" />
                                <span className="text-xs font-bold text-slate-200">Práctica: Lick #42</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Diferencial / Core */}
            <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl lg:text-5xl font-black mb-6 text-white leading-tight">
                            De favoritos desordenados a <br />
                            <span className="text-blue-400">conocimiento útil.</span>
                        </h2>
                        <div className="space-y-6">
                            {[
                                { icon: Network, title: 'Relaciona conceptos', desc: 'Entiende cómo interactúa una escala con un backing track específico.' },
                                { icon: BrainCircuit, title: 'Crea rutas progresivas', desc: 'No copies patrones a ciegas. Desarrolla memoria musical real.' },
                                { icon: Share2, title: 'Comparte con la comunidad', desc: 'El mejor avance aparece cuando alguien conecta una idea que no habías visto.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex-shrink-0 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-3xl -z-10 rounded-full"></div>
                        <div className="bg-[#0A0F1C] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">El Ecosistema HarpHub</h3>
                            <div className="space-y-3">
                                {['Tabs & Partituras', 'Ejercicios de Bending', 'Teoría & Modos', 'Videos y TikToks', 'Ideas propias'].map((tag, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                        <span className="text-slate-200 font-medium">{tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Instrumentos - Armónica y Más */}
            <section className="py-24 px-6 lg:px-12 bg-slate-900/50 border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">Pensado desde la <span className="text-indigo-400">lógica real</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Herramientas que entienden tu instrumento, no solo papel pautado genérico.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Armónica Focus */}
                        <div className="bg-gradient-to-br from-[#0A0F1C] to-slate-900 p-8 rounded-3xl border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-colors">
                            {/* Imagen estable Unsplash (Instrumentos/Música) */}
                            <img
                                src="https://images.unsplash.com/photo-1493225457224-ca2e21c333a3?auto=format&fit=crop&w=800&q=80"
                                alt="Música macro"
                                className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-[0.15] transition-opacity duration-500 grayscale mix-blend-luminosity"
                            />
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 mb-6 relative z-10">
                                <ListMusic size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 relative z-10">Especializado en Armónica</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed relative z-10">
                                La mayoría de las plataformas son genéricas. Nosotros incluimos lógicas reales de armoniquistas: posiciones, bending, overblows y relaciones armónicas. No más "anotar agujeros en un papel perdido".
                            </p>
                            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300 font-medium relative z-10">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Posiciones</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Entrenamiento Bending</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Detector de Tonos</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Escalas Específicas</li>
                            </ul>
                        </div>

                        {/* Otros Instrumentos */}
                        <div className="bg-gradient-to-br from-[#0A0F1C] to-slate-900 p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
                            <Guitar size={120} className="absolute -bottom-10 -right-10 text-indigo-500/5 group-hover:scale-110 transition-transform duration-500" />
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 mb-6">
                                <Library size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">Mucho más que armónica</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Ideal para músicos que quieren entender la música de verdad. Incorpora herramientas de teoría aplicada, armonía funcional y análisis para integrar tu instrumento con el resto de la banda.
                            </p>
                            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300 font-medium">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Armonía Funcional</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Progresiones y Modos</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Guitarra & Piano</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Composición</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Testimonials */}
            <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">Músicos que ya <span className="text-blue-400">encontraron el rumbo</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Dejaron de saltar entre mil pestañas de YouTube y armaron su propia bóveda musical.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            name: "Martín S.",
                            role: "Armónica Diatónica",
                            img: "https://i.pravatar.cc/150?img=11",
                            quote: "Antes tenía decenas de links de YouTube guardados que nunca volvía a abrir. Ahora tengo mis rutinas de bending y licks organizados por tonalidad. Me cambió la vida."
                        },
                        {
                            name: "Lucía M.",
                            role: "Guitarra & Armonía",
                            img: "https://i.pravatar.cc/150?img=47",
                            quote: "La posibilidad de conectar un track backing con la escala exacta y mis notas personales hace que estudiar deje de ser frustrante y empiece a ser un juego."
                        },
                        {
                            name: "Diego R.",
                            role: "Estudiante Autodidacta",
                            img: "https://i.pravatar.cc/150?img=33",
                            quote: "HarpHub entendió que no se trata solo de acumular partituras, sino de crear rutas lógicas. Por fin entiendo cómo se relaciona lo que toco."
                        }
                    ].map((testimonial, i) => (
                        <div key={i} className="bg-[#0A0F1C] border border-white/5 p-8 rounded-3xl relative group hover:border-blue-500/20 transition-colors">
                            <Quote className="absolute top-6 right-6 text-white/5 w-12 h-12 group-hover:text-blue-500/10 transition-colors" />
                            <div className="flex gap-1 text-blue-500 mb-6">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed mb-8 relative z-10">"{testimonial.quote}"</p>
                            <div className="flex items-center gap-4">
                                <img src={testimonial.img} alt={testimonial.name} className="w-12 h-12 rounded-full border border-white/10" />
                                <div>
                                    <h4 className="text-white font-bold text-sm">{testimonial.name}</h4>
                                    <p className="text-slate-500 text-xs font-medium">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Slogan Final CTA */}
            <section className="py-32 px-6 lg:px-12 text-center relative bg-gradient-to-t from-blue-900/10 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tight">
                        <span className="block mb-2 text-slate-500">Menos tiempo buscando.</span>
                        <span className="block mb-2 text-slate-300">Más tiempo entendiendo.</span>
                        <span className="block text-blue-400">Más tiempo tocando.</span>
                    </h2>

                    <button
                        onClick={onEnter}
                        className="px-10 py-5 rounded-2xl bg-white text-[#030712] font-black text-lg transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] hover:shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto"
                    >
                        Empezar mi biblioteca gratis <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Music className="text-blue-500 w-5 h-5" />
                    <span className="text-lg font-bold text-white">HarpHub</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">© 2026 HarpHub. Hecho por y para músicos.</p>
            </footer>
        </div>
    );
};

export default HarpHubLanding;