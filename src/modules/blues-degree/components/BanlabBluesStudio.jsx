import React from 'react';

const BanlabBluesStudio = () => {
    return (
        <div className="bg-[#121212] text-[#e0e0e0] min-h-screen p-6 font-sans">
            <header className="max-w-4xl mx-auto mb-10 text-center pt-8">
                <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase italic tracking-tighter">
                    BandLab <span className="text-[#ff4500]">Blues</span> Studio
                </h1>
                <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
                    Optimización de audio para Guitarra y Armónica
                </p>
            </header>

            <main className="max-w-4xl mx-auto space-y-8 pb-16">
                {/* Physical Recording Hacks */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1e1e1e] border border-[#333] p-6 rounded-2xl transition-all hover:border-[#ff4500] hover:-translate-y-1">
                        <h2 className="text-amber-500 font-bold mb-3 flex items-center gap-2 text-xl">
                            <span>🎙️</span> El Micro del Celular
                        </h2>
                        <ul className="text-sm space-y-3 text-slate-400">
                            <li><strong className="text-white">Posición:</strong> No grabes de frente. Pon el celular a 45° de tu boca/ampli para evitar "popeos".</li>
                            <li><strong className="text-white">La "Copa":</strong> Si grabas armónica, pon el celular sobre una mesa y haz la copa con tus manos <strong>alrededor del micro del teléfono</strong>.</li>
                            <li><strong className="text-white">Distancia:</strong> Guitarra acústica a 20cm. Armónica a 10cm.</li>
                        </ul>
                    </div>
                    <div className="bg-[#1e1e1e] border border-[#333] p-6 rounded-2xl transition-all hover:border-[#ff4500] hover:-translate-y-1">
                        <h2 className="text-amber-500 font-bold mb-3 flex items-center gap-2 text-xl">
                            <span>🎧</span> Monitoreo
                        </h2>
                        <ul className="text-sm space-y-3 text-slate-400">
                            <li><strong className="text-white">Latencia:</strong> Usa auriculares con cable. Los Bluetooth tienen retraso y arruinarán tu Shuffle.</li>
                            <li><strong className="text-white">Metrónomo:</strong> Activa el "Count-in" de 2 compases en BandLab antes de empezar.</li>
                        </ul>
                    </div>
                </section>

                {/* FX Chain Presets */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-2 text-white italic">Configuración de FX (Efectos)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Armónica Mississippi Setup */}
                        <div className="bg-[#1e1e1e] border border-[#333] p-6 rounded-2xl border-l-4 border-l-orange-600 transition-all hover:border-orange-600/50 hover:-translate-y-1">
                            <h3 className="font-bold text-white mb-4 text-lg">🌬️ Cadena Armónica (Vocal)</h3>
                            <div className="space-y-4">
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">1. De-Esser / Noise Gate</p>
                                    <p className="text-xs text-slate-300 font-medium">Threshold: -25dB. Para quitar siseos entre frases.</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">2. Graphic EQ</p>
                                    <p className="text-xs text-slate-300 italic">400Hz: +3dB | 3kHz: -5dB | 6kHz: -8dB (Corta el brillo hiriente).</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">3. Digi-Delay (Slapback)</p>
                                    <p className="text-xs text-slate-300 font-medium">Time: 120ms | Feedback: 10% | Mix: 20%.</p>
                                </div>
                            </div>
                        </div>

                        {/* Guitarra Blues Setup */}
                        <div className="bg-[#1e1e1e] border border-[#333] p-6 rounded-2xl border-l-4 border-l-blue-600 transition-all hover:border-blue-600/50 hover:-translate-y-1">
                            <h3 className="font-bold text-white mb-4 text-lg">🎸 Cadena Guitarra (Electric)</h3>
                            <div className="space-y-4">
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">1. Blues Driver / Overdrive</p>
                                    <p className="text-xs text-slate-300 font-medium">Gain: 15% | Tone: 50%. Queremos un "crunch" suave.</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">2. Studio Reverb</p>
                                    <p className="text-xs text-slate-300 font-medium">Size: 40% | Damping: 60% | Mix: 25% (Sonido de club).</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1">3. FB Compressor</p>
                                    <p className="text-xs text-slate-300 font-medium">Ratio: 4:1 | Attack: 10ms. Para que el ritmo sea sólido.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The BandLab Workflow */}
                <section className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-inner shadow-black/50">
                    <h2 className="text-xl font-bold mb-6 text-white text-center">Flujo de Trabajo Semanal</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="p-6 border border-dashed border-slate-700 rounded-2xl bg-black/20 group hover:border-[#ff4500] transition-colors">
                            <span className="text-4xl font-black text-slate-700 group-hover:text-[#ff4500]">1</span>
                            <p className="text-xs mt-4 text-slate-400 italic">Graba la Guitarra con el Metrónomo de BandLab activo.</p>
                        </div>
                        <div className="p-6 border border-dashed border-slate-700 rounded-2xl bg-black/20 group hover:border-blue-500 transition-colors">
                            <span className="text-4xl font-black text-slate-700 group-hover:text-blue-500">2</span>
                            <p className="text-xs mt-4 text-slate-400 italic">Crea una nueva pista para la Armónica. Usa auriculares.</p>
                        </div>
                        <div className="p-6 border border-dashed border-slate-700 rounded-2xl bg-black/20 group hover:border-green-500 transition-colors">
                            <span className="text-4xl font-black text-slate-700 group-hover:text-green-500">3</span>
                            <p className="text-xs mt-4 text-slate-400 italic">Usa el 'Auto-Pitch' (muy leve, al 10%) si quieres un efecto moderno.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-8 mb-12 text-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">
                BANDLAB BLUES ENGINE // NIVEL AVANZADO // 2024
            </footer>
        </div>
    );
};

export default BanlabBluesStudio;
