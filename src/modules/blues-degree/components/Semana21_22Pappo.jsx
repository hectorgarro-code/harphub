import React, { useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const Semana21_22Pappo = () => {
    const chartData = {
        labels: ['Ataque', 'Velocidad', 'Saturación', 'Limpieza', 'Vibrato', 'Dinámica'],
        datasets: [{
            label: 'Estilo Pappo (Rock-Blues)',
            data: [100, 70, 95, 20, 95, 40],
            backgroundColor: 'rgba(225, 29, 72, 0.2)',
            borderColor: 'rgba(225, 29, 72, 1)',
            borderWidth: 3
        }, {
            label: 'Estilo Mississippi (Jazz-Blues)',
            data: [60, 90, 40, 95, 60, 100],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#333' },
                angleLines: { color: '#333' },
                pointLabels: { color: '#aaa', font: { size: 10 } },
                ticks: { display: false }
            }
        },
        plugins: {
            legend: { labels: { color: '#fff', font: { size: 12 } } }
        }
    };

    return (
        <div className="bg-[#111] text-[#eee] min-h-screen pb-20 font-sans selection:bg-red-600 selection:text-white">
            <header className="bg-stone-950 py-12 px-6 border-b-4 border-red-700 shadow-2xl relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10 font-bold uppercase">
                    <h1 className="text-6xl md:text-8xl text-red-600 mb-2 drop-shadow-lg italic font-black tracking-tighter">PAPPO'S BLUES</h1>
                    <p className="text-xl text-stone-400 tracking-widest">Intensivo: El Blues de Asfalto</p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-12">
                {/* Intro Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-10">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-white uppercase italic border-l-4 border-red-600 pl-4">El Concepto</h2>
                        <p className="text-stone-400 leading-relaxed text-lg">
                            A diferencia del estilo refinado, Pappo buscaba el **volumen** y el **vibrato agresivo**. En guitarra, es el dominio de la Pentatónica Menor con actitud de rock. En armónica, es un sonido saturado que compite con la distorsión de la guitarra.
                        </p>
                        <div className="bg-red-900/20 p-5 rounded-2xl border border-red-900/50 shadow-inner">
                            <p className="text-sm italic text-red-200/80">"El blues es un sentimiento que se lleva adentro, y yo lo llevo en la punta de los dedos." - El Carpo.</p>
                        </div>
                    </div>
                    <div className="h-[300px] bg-stone-900/40 p-6 rounded-3xl border border-stone-800 shadow-xl">
                        <Radar data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* Weekly Intensive Plan */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-black uppercase border-b border-stone-800 pb-2 text-white italic">Plan Semanal: El Sonido Pappo</h3>

                    <div className="space-y-6">
                        {/* Semana 21 */}
                        <div className="bg-stone-900/50 p-8 rounded-[2rem] border border-stone-800 shadow-lg hover:border-red-600/30 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="text-2xl font-black text-red-500 uppercase tracking-tighter">Semana 21: El Riff de Hierro</h4>
                                <span className="bg-stone-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-stone-400 border border-stone-700">ENFOQUE: RÍTMICA</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-stone-500 uppercase tracking-widest">Guitarra: Riff "El Viejo"</p>
                                    <div className="bg-black p-5 rounded-xl font-mono text-xs border border-white/5 text-green-500 leading-relaxed shadow-inner overflow-x-auto whitespace-pre">
                                        E|----------------------------|<br />
                                        B|----------------------------|<br />
                                        G|----------------------------|<br />
                                        D|-------5---7---5---7b-------|<br />
                                        A|---7-7---7---7---7----------|<br />
                                        E|---0-0----------------------|<br />
                                        (Acentúa el bajo en E)
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs font-black text-stone-500 uppercase tracking-widest">Armónica: Respuesta Rítmica</p>
                                    <div className="bg-black p-5 rounded-xl font-mono text-xs border border-white/5 text-blue-400 leading-relaxed shadow-inner overflow-x-auto whitespace-pre">
                                        -2 -2 -3' -4 -4' -4<br />
                                        -2 -2 -3' -4 -4' -4<br />
                                        (Toca con mucha fuerza de diafragma)<br />
                                        Usa armónica en LA (A)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Semana 22 --> */}
                        <div className="bg-stone-900/50 p-8 rounded-[2rem] border border-stone-800 shadow-lg hover:border-red-600/30 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="text-2xl font-black text-red-500 uppercase tracking-tighter">Semana 22: Pentatónica Diabólica</h4>
                                <span className="bg-stone-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-stone-400 border border-stone-700">ENFOQUE: SOLO</span>
                            </div>
                            <p className="text-sm text-stone-400 mb-6 font-medium leading-relaxed">Pappo usaba estiradas (bends) de un tono y medio. En armónica, esto se traduce en bends profundos en la celda -2 y -3.</p>
                            <div className="bg-black p-6 rounded-xl font-mono text-sm border border-white/5 text-red-400/90 leading-relaxed shadow-inner">
                                Solo "Adónde está la libertad":<br /><br />
                                -4 -4' -4 -3' -2 -2 (X2)<br />
                                -2 -3' -4 +6 -6' -6 (Subida explosiva)
                            </div>
                        </div>
                    </div>
                </section>

                {/* BandLab Pappo Setup --> */}
                <section className="bg-stone-900 p-10 rounded-[2.5rem] border border-red-900/30 shadow-2xl">
                    <h3 className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter">BandLab: El Tono de los 70s</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3 bg-black/30 p-6 rounded-2xl border border-white/5">
                            <p className="text-amber-500 font-black text-xs uppercase tracking-widest">1. El 'Fuzz' Oculto</p>
                            <p className="text-xs text-stone-400 leading-relaxed">Pappo grababa con el ampli al palo. En BandLab usa: <strong>Classic Drive</strong> (Drive: 70%, Tone: 40%).</p>
                        </div>
                        <div className="space-y-3 bg-black/30 p-6 rounded-2xl border border-white/5">
                            <p className="text-amber-500 font-black text-xs uppercase tracking-widest">2. La 'Saturación de Cinta'</p>
                            <p className="text-xs text-stone-400 leading-relaxed">Para la armónica, usa el efecto <strong>Exciter</strong>. Sube los armónicos para que la armónica 'muerda'.</p>
                        </div>
                        <div className="space-y-3 bg-black/30 p-6 rounded-2xl border border-white/5">
                            <p className="text-amber-500 font-black text-xs uppercase tracking-widest">3. Ambience</p>
                            <p className="text-xs text-stone-400 leading-relaxed">Usa <strong>Spring Reverb</strong> (Reverb de resortes). Es el sonido de los amplificadores viejos.</p>
                        </div>
                    </div>
                </section>

                {/* New Challenge --> */}
                <section className="bg-red-600 p-10 rounded-[3rem] text-white text-center shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-5xl font-black mb-6 italic italic uppercase tracking-tighter">NUEVO DESAFÍO: EL DUELO</h3>
                        <p className="text-xl font-bold mb-10 max-w-3xl mx-auto opacity-90 leading-relaxed">Graba 12 compases de un riff pesado de guitarra. Luego, graba 3 pistas de armónica haciendo lo mismo (mismo riff). Mézclalas para crear un muro de sonido.</p>
                        <div className="bg-black/30 p-6 rounded-3xl inline-block text-sm border border-white/10 shadow-xl">
                            <strong className="text-white block mb-1">Meta:</strong> Lograr que no se distinga dónde termina la guitarra y dónde empieza la armónica.
                        </div>
                    </div>
                    {/* Visual energy effect */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </section>
            </main>

            <footer className="text-center py-12 border-t border-stone-900/50 mt-12 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">HarpHub // Motor de Blues // Tribute to Carpo</p>
            </footer>
        </div>
    );
};

export default Semana21_22Pappo;
