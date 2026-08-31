import React, { useState } from 'react';

const songDetails = {
    "El Viejo": {
        guitarra: "Riff en E: 0-0-3-4-0... Usa cuerdas entorchadas para ese tono sucio.",
        armonica: "Acompañamiento en La (A). Segunda posición. Mucho uso de la celda -2.",
        tecnica: "Estiradas graduales de un tono completo."
    },
    "Adónde está la libertad": {
        guitarra: "Solo pentatónico en Am. Traste 5 y 12.",
        armonica: "Tocar en Re (D). Tercera posición para un toque más oscuro.",
        tecnica: "Vibrato de garganta intenso."
    },
    "Sucio y Desprolijo": {
        guitarra: "Riff principal: 7-7-10-7-9 en cuerda E y A.",
        armonica: "Segunda posición. Notas cortas y percusivas.",
        tecnica: "Ataque de lengua fuerte (Tu-Tu-Tu)."
    },
    "Ruta 66": {
        guitarra: "Shuffle rápido en A. Acordes 7 y 9.",
        armonica: "Solo explosivo. Uso de octavas (1-4).",
        tecnica: "Velocidad y control del aire."
    }
};

const PapposBluesII = () => {
    const [selectedSong, setSelectedSong] = useState("El Viejo");

    return (
        <div className="bg-[#0a0a0a] text-[#f2f2f2] min-h-screen font-sans selection:bg-red-600 selection:text-white pb-20">
            <header className="bg-stone-900 py-12 px-6 border-b-4 border-red-700 shadow-2xl relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">
                    <h1 className="text-6xl md:text-8xl font-black text-red-600 mb-2 drop-shadow-xl italic uppercase tracking-tighter">
                        Pappo's <span className="text-white">Blues</span>
                    </h1>
                    <p className="text-xl text-stone-400 uppercase tracking-widest font-bold">Vol. II: El Blues de Asfalto</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </header>

            <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-6">Lista de Temas (Tabs Corregidas)</h3>
                    {Object.keys(songDetails).map(song => (
                        <button
                            key={song}
                            onClick={() => setSelectedSong(song)}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${selectedSong === song
                                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20 translate-x-2'
                                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-600 hover:text-white'
                                }`}
                        >
                            <span className="text-sm font-bold uppercase">{song}</span>
                        </button>
                    ))}

                    <div className="mt-12 p-6 bg-stone-900/50 border border-stone-800 rounded-3xl">
                        <h4 className="text-red-500 font-black text-xs uppercase mb-3 tracking-widest">Tip de El Carpo</h4>
                        <p className="text-xs text-stone-400 italic leading-relaxed">
                            "Para que el blues suene, tenés que pegarle a las cuerdas como si te debieran plata. El volumen es parte del tono."
                        </p>
                    </div>
                </aside>

                {/* Content Area */}
                <section className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-stone-900 p-8 rounded-[2rem] border border-stone-800 shadow-inner">
                        <h2 className="text-3xl font-black mb-6 border-b border-stone-800 pb-4 text-white uppercase italic">
                            {selectedSong}
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-3">🎸 Guitarra</h4>
                                <div className="bg-black/50 p-6 rounded-2xl font-mono text-sm border border-stone-800 text-green-500 leading-relaxed shadow-lg">
                                    {songDetails[selectedSong].guitarra}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-3">🌬️ Armónica</h4>
                                <div className="bg-black/50 p-6 rounded-2xl font-mono text-sm border border-stone-800 text-blue-400 leading-relaxed shadow-lg">
                                    {songDetails[selectedSong].armonica}
                                </div>
                            </div>

                            <div className="bg-stone-800/30 p-6 rounded-2xl border border-stone-800">
                                <h4 className="text-xs font-black text-stone-500 uppercase tracking-[0.2em] mb-2">💡 Técnica Clave</h4>
                                <p className="text-sm text-stone-300 font-medium">{songDetails[selectedSong].tecnica}</p>
                            </div>
                        </div>
                    </div>

                    {/* BandLab Setup for Pappo Tone */}
                    <div className="bg-red-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-4 uppercase italic">BandLab: El Tono de los 70s</h3>
                            <p className="text-sm text-white/90 mb-6 max-w-lg leading-relaxed">
                                Pappo usaba amplis valvulares al límite. Para replicar ese "muro de sonido" en BandLab:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                                    <p className="font-bold text-xs uppercase mb-1">Preset Guitarra</p>
                                    <p className="text-[11px] opacity-80 italic">Overdrive: 60% | Cabinets: 4x12 Vintage | Reverb: Room 15%</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                                    <p className="font-bold text-xs uppercase mb-1">Preset Armónica</p>
                                    <p className="text-[11px] opacity-80 italic">Distortion: 20% | EQ: Medios al 70% | Delay: Slapback</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </section>
            </main>

            <footer className="text-center py-12 border-t border-stone-900 mt-12">
                <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.5em]">HarpHub // Tributo al Carpo // 2024</p>
            </footer>
        </div>
    );
};

export default PapposBluesII;
