import React from 'react';

const Semana17_20Nacional = () => {
    return (
        <div className="bg-[#0c0c0e] text-[#dcdcdc] min-h-screen font-sans selection:bg-amber-500 selection:text-black pb-20">
            <header className="bg-stone-900 py-16 px-6 border-b-4 border-amber-600 shadow-2xl relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-amber-500 mb-2 italic uppercase tracking-tighter">
                        Módulos <span className="text-white">Avanzados</span>
                    </h1>
                    <p className="text-xl text-stone-400 uppercase tracking-widest font-bold">Semanas 17-20: Blues Nacional (La Mississippi)</p>
                </div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl -mr-48 -mb-48"></div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-12 mt-10">
                {/* Intro Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white uppercase italic border-l-4 border-amber-600 pl-4">El Estilo "Mississippi"</h2>
                        <p className="text-stone-400 leading-relaxed text-lg">
                            A diferencia del blues rural, La Mississippi trajo el sonido de **vientos (brass)** y el **groove urbano** al blues nacional. La armónica aquí no solo hace licks, sino que funciona como una sección de caños completa.
                        </p>
                        <div className="bg-amber-900/10 p-5 rounded-2xl border border-amber-900/30 shadow-inner">
                            <p className="text-sm italic text-amber-200/80">
                                "El blues urbano es precisión rítmica. Cada nota tiene su lugar en el compás, ni antes ni después."
                            </p>
                        </div>
                    </div>
                    <div className="bg-stone-900 p-8 rounded-3xl border border-stone-800 shadow-xl">
                        <h4 className="text-amber-500 font-black text-xs uppercase mb-4 tracking-widest">Enfoque Técnico</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="flex items-center gap-3">
                                <span className="h-2 w-2 bg-amber-600 rounded-full"></span>
                                <span>Articulación de lengua (Tu-Ka-Tu-Ka)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="h-2 w-2 bg-amber-600 rounded-full"></span>
                                <span>Riffs de vientos adaptados a la guitarra</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="h-2 w-2 bg-amber-600 rounded-full"></span>
                                <span>Sincronización total con el Bajo</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Song Sections */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-black text-white uppercase italic border-b border-stone-800 pb-2">Análisis de Obra</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cafe Madrid */}
                        <div className="bg-[#1a1a1c] p-8 rounded-[2rem] border border-stone-800 shadow-lg hover:border-amber-500/50 transition-all duration-500">
                            <h4 className="text-2xl font-bold mb-1 text-white uppercase tracking-tight">Café Madrid</h4>
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-6 italic">Shuffle Rápido - Groove Implacable</p>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black text-amber-500 uppercase mb-2">🌬️ Armónica (A en 2da Posición)</p>
                                    <div className="bg-black/40 p-5 rounded-xl font-mono text-xs border border-white/5 text-amber-100/90 leading-relaxed shadow-inner">
                                        Lick de Vientos:<br />
                                        -3' -4 -5 +6 -6' -6<br />
                                        (Tocar corto y con mucho ataque)
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-blue-500 uppercase mb-2">🎸 Guitarra</p>
                                    <div className="bg-black/40 p-5 rounded-xl font-mono text-xs border border-white/5 text-blue-100/90 leading-relaxed shadow-inner">
                                        Acordes E9 y A13.<br />
                                        Usa cortes rítmicos percusivos en el 2 y 4.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mala Transa */}
                        <div className="bg-[#1a1a1c] p-8 rounded-[2rem] border border-stone-800 shadow-lg hover:border-amber-500/50 transition-all duration-500">
                            <h4 className="text-2xl font-bold mb-1 text-white uppercase tracking-tight">Mala Transa</h4>
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-6 italic">Blues Urbano - Estilo Shuffle Swing</p>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black text-amber-500 uppercase mb-2">🌬️ Armónica (C en 2da Posición)</p>
                                    <div className="bg-black/40 p-5 rounded-xl font-mono text-xs border border-white/5 text-amber-100/90 leading-relaxed shadow-inner">
                                        Fraseo melódico:<br />
                                        +4 -4 +5 -5 +6 -6'<br />
                                        (Usa vibrato de mano amplio)
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-blue-500 uppercase mb-2">🎸 Guitarra</p>
                                    <div className="bg-black/40 p-5 rounded-xl font-mono text-xs border border-white/5 text-blue-100/90 leading-relaxed shadow-inner">
                                        Solo pentatónico en Gm.<br />
                                        Usa estiradas de 1/2 tono con vibrato.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Challenge */}
                <section className="bg-amber-600 p-10 rounded-[3rem] text-black shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 text-center">
                        <h3 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">EL DESAFÍO DE LA SECCIÓN</h3>
                        <p className="text-lg font-bold mb-8 max-w-2xl mx-auto opacity-90">
                            Graba una base de 12 compases. Luego graba dos pistas de armónica haciendo el mismo riff pero una octava abajo. Mézclalas para simular una sección de vientos real.
                        </p>
                        <div className="inline-block bg-black text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-transform duration-300">
                            Objetivo: Sonido Big Band
                        </div>
                    </div>
                    {/* Visual noise background effect */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </section>
            </main>

            <footer className="text-center py-12 border-t border-stone-900/50 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">HarpHub // Módulo Nacional // La Mississippi Study</p>
            </footer>
        </div>
    );
};

export default Semana17_20Nacional;
