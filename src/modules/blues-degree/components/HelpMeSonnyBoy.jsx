import React from 'react';

const HelpMeSonnyBoy = () => {
    return (
        <div className="bg-[#f4f1ea] text-[#2c2c2c] min-h-screen pb-20 font-sans">
            <header className="bg-[#2d241e] text-[#e9d5a1] py-16 px-6 text-center border-b-8 border-[#8b4513] shadow-2xl">
                <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4 italic tracking-tight">
                    The Goat: Sonny Boy II
                </h1>
                <p className="uppercase tracking-[0.3em] text-xs font-black opacity-80">
                    Maestría en Tongue Blocking y Fraseo Hablado
                </p>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-16 mt-8">
                {/* Pillar 1: Tongue Blocking (El Secreto) */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <h2 className="font-serif text-3xl font-bold text-[#5d2e0a] border-l-4 border-[#8b4513] pl-4">
                            1. La Lengua como Percusión
                        </h2>
                        <p className="text-stone-600 leading-relaxed text-lg">
                            Sonny Boy casi nunca usaba "pucker" (fruncir labios). Usaba el <strong>bloqueo de lengua</strong> para tocar la nota en la comisura derecha mientras la lengua cubría las celdas de la izquierda. Esto le permitía hacer "slaps" rítmicos: notas que suenan con un golpe percusivo por detrás.
                        </p>
                        <div className="bg-[#e9d5a1]/30 p-6 rounded-2xl border border-[#8b4513]/20 shadow-inner">
                            <p className="text-sm font-bold text-[#8b4513] uppercase tracking-widest mb-2">Diferencia Clave:</p>
                            <p className="text-sm italic text-stone-700 font-medium">
                                "No es solo tocar la nota, es el golpe de la lengua al retirarse y volver lo que crea el swing."
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#2d241e] text-[#e9d5a1] p-8 rounded-2xl border-l-4 border-[#8b4513] font-mono text-sm leading-relaxed shadow-xl">
                        <p className="text-[#8b4513] font-black mb-4 uppercase tracking-tighter">[EJERCICIO DE SLAP]</p>
                        Boca cubre celdas 1-2-3-4.<br />
                        Lengua tapa 1-2-3.<br /><br />
                        1. Sopla 4 (suena limpio).<br />
                        2. Levanta lengua rápido y sopla.<br />
                        3. Vuelve a tapar.<br /><br />
                        Sonido: <span className="text-white font-bold">"TA-DAA"</span> (Acorde -{'>'} Nota)
                    </div>
                </section>

                {/* Pillar 2: El Repertorio (Help Me) */}
                <section className="space-y-8">
                    <h2 className="font-serif text-3xl font-bold text-[#5d2e0a] border-b border-stone-300 pb-2">
                        Análisis: "Help Me" (Rhumba Blues)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl border border-[#dcd7cc] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                            <h3 className="font-bold text-[#8b4513] mb-4 text-xl flex items-center gap-2">
                                <span>🌬️</span> Armónica (Bb en 2da Posición)
                            </h3>
                            <p className="text-xs text-stone-500 mb-6 font-medium uppercase tracking-wider italic">
                                Canción en Fa menor (Fm). Tono oscuro y rítmico.
                            </p>
                            <div className="bg-[#2d241e] text-[#e9d5a1] p-6 rounded-xl font-mono text-xs leading-relaxed border border-stone-800 shadow-inner overflow-x-auto">
                                <p className="text-amber-500/50 mb-2">RIFF PRINCIPAL:</p>
                                -2 -3' -4 -4' -4<br />
                                <span className="text-stone-500 text-[10px]">(Acentúa el -2 con mucho vibrato)</span><br /><br />
                                <p className="text-amber-500/50 mb-2">Corte de Solo:</p>
                                -4-5-6 (Acorde aspirado corto)<br />
                                +6 (Soplado largo con Wah-wah)
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-[#dcd7cc] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                            <h3 className="font-bold text-amber-800 mb-4 text-xl flex items-center gap-2">
                                <span>🎸</span> Guitarra (Estilo Matt Murphy)
                            </h3>
                            <p className="text-xs text-stone-500 mb-6 font-medium uppercase tracking-wider italic">
                                Ritmo Rhumba-Blues. Sofisticación pura.
                            </p>
                            <div className="bg-[#2d241e] text-[#e9d5a1] p-6 rounded-xl font-mono text-xs leading-relaxed border border-stone-800 shadow-inner overflow-x-auto">
                                <p className="text-amber-500/50 mb-2">ACORDES:</p>
                                Fm7: 1x111x<br />
                                Bb7: x1313x<br />
                                C7#9: x3234x <span className="text-stone-500">(Acorde Hendrix)</span><br /><br />
                                <p className="text-amber-500/50 mb-2">RITMO:</p>
                                Toca el bajo y luego dos<br />
                                golpes cortos al acorde.
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pillar 3: BandLab Vintage Hack */}
                <section className="bg-[#2d241e] p-10 rounded-[2.5rem] text-[#e9d5a1] shadow-2xl border-b-4 border-[#8b4513]">
                    <h2 className="font-serif text-3xl mb-8 flex items-center gap-3">
                        <span className="text-[#8b4513]">📻</span> BandLab: El Tono de Chess Records
                    </h2>
                    <p className="text-sm mb-10 opacity-80 leading-relaxed max-w-2xl">
                        Sonny Boy grababa en habitaciones con mucha madera. Para replicar esto en BandLab y obtener ese sonido "vintage" y orgánico:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-black/20 p-6 rounded-2xl border border-[#8b4513]/30 hover:bg-black/30 transition-colors">
                            <h4 className="font-black text-xs uppercase mb-3 text-amber-500 tracking-widest">1. El Micro 'Seco'</h4>
                            <p className="text-[11px] leading-relaxed text-stone-400">
                                No uses Reverb de entrada. Usa <strong>"Studio EQ"</strong> y sube los 400Hz. Queremos que la armónica suene nasal y presente.
                            </p>
                        </div>
                        <div className="bg-black/20 p-6 rounded-2xl border border-[#8b4513]/30 hover:bg-black/30 transition-colors">
                            <h4 className="font-black text-xs uppercase mb-3 text-amber-500 tracking-widest">2. Tape Echo</h4>
                            <p className="text-[11px] leading-relaxed text-stone-400">
                                Usa <strong>"Echo Latte"</strong>. Pon el Delay muy corto (70ms) para simular el rebote de la cinta vieja.
                            </p>
                        </div>
                        <div className="bg-black/20 p-6 rounded-2xl border border-[#8b4513]/30 hover:bg-black/30 transition-colors">
                            <h4 className="font-black text-xs uppercase mb-3 text-amber-500 tracking-widest">3. Compressor Pro</h4>
                            <p className="text-[11px] leading-relaxed text-stone-400">
                                Usa <strong>"BL 1176"</strong>. Sube el input para que cuando soples fuerte la nota se 'aplaste' un poco.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Challenge */}
                <section className="bg-white border-4 border-dashed border-[#8b4513] p-12 rounded-[3rem] text-center shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#8b4513]"></div>
                    <h3 className="font-serif text-4xl font-bold text-[#5d2e0a] mb-6 group-hover:scale-105 transition-transform duration-500">
                        EL DESAFÍO DE LA TAZA
                    </h3>
                    <p className="max-w-2xl mx-auto text-stone-600 mb-10 text-lg leading-relaxed">
                        Sonny Boy a veces grababa metiendo la armónica dentro de una <strong>taza de café</strong> para lograr un eco natural. <br />
                        <strong className="text-[#8b4513] block mt-4">Tu reto:</strong> Graba en BandLab una pista de armónica usando una taza real frente al micro de tu celular. No uses efectos digitales.
                    </p>
                    <div className="inline-block bg-[#8b4513] text-[#e9d5a1] px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl hover:bg-[#5d2e0a] transition-all cursor-default">
                        Objetivo: Tono 100% Acústico
                    </div>
                </section>
            </main>

            <footer className="text-center py-12 opacity-30 text-[10px] uppercase font-bold tracking-[0.5em]">
                Delta Blues Education // Sonny Boy II Study Unit
            </footer>
        </div>
    );
};

export default HelpMeSonnyBoy;
