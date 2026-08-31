import React, { useState, useEffect } from 'react';
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

const SonyBoyII = () => {
    const [activeTab, setActiveTab] = useState('tecnica');

    const chartData = {
        labels: ['Vibrato de Mano', 'Tongue Blocking', 'Fraseo Vocal', 'Espacios/Silencio', 'Tono Acústico', 'Independencia Rítmica'],
        datasets: [{
            label: 'Perfil Sonny Boy II',
            data: [100, 95, 100, 90, 95, 85],
            backgroundColor: 'rgba(197, 160, 89, 0.2)',
            borderColor: 'rgba(197, 160, 89, 1)',
            borderWidth: 3,
            pointBackgroundColor: '#1a1412'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { display: false },
                grid: { color: '#e5e0d8' },
                pointLabels: { color: '#444', font: { size: 10, weight: '700' } }
            }
        },
        plugins: { legend: { display: false } }
    };

    return (
        <div className="bg-[#fcfaf7] text-[#333] min-h-screen font-sans selection:bg-[#c5a059] selection:text-white pb-20">
            <header className="bg-[#1a1412] text-[#fcfaf7] py-20 px-6 relative overflow-hidden border-b-8 border-[#c5a059] shadow-2xl">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                    <div>
                        <h1 className="font-serif text-6xl md:text-9xl italic font-bold tracking-tighter">Sonny Boy II</h1>
                        <p className="font-mono text-[#c5a059] uppercase tracking-[0.5em] text-sm mt-4 font-black">The Chess Records Masterclass</p>
                    </div>
                    <div className="text-right text-stone-500 max-w-xs text-xs italic font-medium leading-relaxed">
                        "No toques la armónica, deja que la armónica hable por ti."
                    </div>
                </div>
                {/* Vintage overlay effect */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
            </header>

            <nav className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto flex overflow-x-auto space-x-12 px-6 custom-scrollbar">
                    {[
                        { id: 'tecnica', label: 'LA TÉCNICA FÍSICA' },
                        { id: 'repertorio', label: 'OBRA MAESTRA (TABS)' },
                        { id: 'tono', label: 'EL SONIDO (BANDLAB)' },
                        { id: 'videos', label: 'ARCHIVO HISTÓRICO' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-5 whitespace-nowrap text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 border-b-4 ${activeTab === tab.id
                                    ? 'border-[#c5a059] text-[#1a1412]'
                                    : 'border-transparent text-stone-400 hover:text-stone-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 mt-12 animate-in fade-in duration-700">
                {/* Sección Técnica */}
                {activeTab === 'tecnica' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-8">
                            <h2 className="font-serif text-5xl text-stone-900 font-bold italic border-l-8 border-[#c5a059] pl-6">La Física del Bloqueo</h2>
                            <p className="text-stone-600 leading-relaxed text-xl">
                                Sonny Boy fue el maestro del <strong>Tongue Blocking (TB)</strong>. A diferencia del estilo "Pucker" (fruncir labios), él mantenía la boca abierta cubriendo 4 celdas y usaba la lengua para tapar las 3 de la izquierda.
                            </p>

                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 space-y-4 hover:shadow-2xl transition-shadow duration-500">
                                <h3 className="font-black text-[#1a1412] text-sm uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#c5a059]">01.</span> El 'Slap' Rítmico
                                </h3>
                                <p className="text-sm text-stone-500 leading-relaxed font-medium">Es el sonido percusivo que escuchas antes de la nota. Tapas las celdas con la lengua y la retiras un milisegundo antes de soplar/aspirar.</p>
                                <div className="bg-[#1a1412] text-[#c5a059] p-5 rounded-2xl font-mono text-xs leading-relaxed border-l-4 border-[#c5a059] shadow-inner">
                                    Ej: [1-2-3-4] -{'>'} Bloquea 1-2-3 -{'>'} Suena 4<br />
                                    Acción: Slap en el tiempo 2 y 4 de cada compás.
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 space-y-4 hover:shadow-2xl transition-shadow duration-500">
                                <h3 className="font-black text-[#1a1412] text-sm uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-[#c5a059]">02.</span> Hand Vibrato (El Efecto 'Wah')
                                </h3>
                                <p className="text-sm text-stone-500 leading-relaxed font-medium">Sus manos eran enormes. Cerraba herméticamente la armónica para crear una cámara de resonancia oscura y luego abría solo un poco.</p>
                            </div>
                        </div>

                        <div className="sticky top-32">
                            <div className="h-[350px] bg-white p-8 rounded-[3rem] shadow-2xl border border-stone-100">
                                <Radar data={chartData} options={chartOptions} />
                            </div>
                            <div className="mt-8 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-200/50 shadow-inner relative overflow-hidden">
                                <h4 className="font-black text-amber-900 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                                    <span>💡</span> Debate de Experto
                                </h4>
                                <p className="text-sm text-amber-800 leading-relaxed font-medium relative z-10">
                                    Muchos creen que Sonny Boy usaba solo 2da posición. Pero su maestría real estaba en la **1ra posición** para blues acústicos lentos, logrando notas agudas que parecen gritos humanos.
                                </p>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección Repertorio */}
                {activeTab === 'repertorio' && (
                    <div className="space-y-12">
                        <h2 className="font-serif text-5xl text-stone-900 font-bold italic text-center mb-12">Análisis de Repertorio</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-[#c5a059] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <h3 className="font-serif text-3xl mb-1 font-bold text-[#1a1412]">Bye Bye Bird</h3>
                                <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] mb-6">Solo de Armónica & Taconeo</p>
                                <div className="bg-[#1a1412] text-[#c5a059] p-6 rounded-2xl font-mono text-xs leading-relaxed mb-6 shadow-inner border border-stone-800 whitespace-pre">
                                    Intro (Ritmo de Tren):<br />
                                    +1+2+3 ... -1-2-3 (Haaaaa)<br />
                                    +1+2+3 ... -1-2-3 (Haaaaa)<br />
                                    Lick Clave: -2 -3' -4 +5 -4 -3' -2
                                </div>
                                <p className="text-sm italic text-stone-500 font-medium">En este tema, Sonny Boy marca el ritmo con el pie. Es un ejercicio de independencia total.</p>
                            </div>

                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-[#1a1412] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <h3 className="font-serif text-3xl mb-1 font-bold text-[#1a1412]">Nine Below Zero</h3>
                                <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] mb-6">Slow Blues Dramático</p>
                                <div className="bg-[#1a1412] text-[#c5a059] p-6 rounded-2xl font-mono text-xs leading-relaxed mb-6 shadow-inner border border-stone-800 whitespace-pre">
                                    Lick de Entrada:<br />
                                    -4 (Bend profundo) -{'>'} -4 (Natural)<br />
                                    -3' (Sostenido con vibrato de mano)<br />
                                    -2 -2 -2 (Golpes rítmicos)
                                </div>
                                <p className="text-sm italic text-stone-500 font-medium">Usa el silencio. Sonny Boy esperaba hasta 2 segundos entre frases para generar tensión.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sección Tono */}
                {activeTab === 'tono' && (
                    <div className="bg-[#1a1412] text-stone-300 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border-b-8 border-[#c5a059]">
                        <h2 className="font-serif text-5xl text-white mb-10 font-bold italic">BandLab Vintage Hack</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                            <div className="space-y-8">
                                <h3 className="text-[#c5a059] font-black uppercase tracking-[0.3em] text-xs">Cadena de Efectos (Chain)</h3>
                                <ul className="space-y-6">
                                    {[
                                        { id: '01', title: 'Graphic EQ', desc: 'Corta todo por debajo de 100Hz y por encima de 5kHz. El sonido Chess es puro medio.' },
                                        { id: '02', title: '1176 Compressor', desc: 'Ratio 4:1. Esto ayuda a que los \'Slaps\' de lengua no saturen el micro del celular.' },
                                        { id: '03', title: 'Spring Reverb', desc: 'Mix al 15%. Da la sensación de espacio de los estudios de los años 50.' },
                                    ].map(item => (
                                        <li key={item.id} className="flex items-start gap-6 group">
                                            <span className="text-[#c5a059] font-black text-xl group-hover:scale-125 transition-transform">{item.id}.</span>
                                            <div>
                                                <p className="text-white font-bold text-lg mb-1">{item.title}</p>
                                                <p className="text-sm opacity-70 leading-relaxed font-medium">{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 shadow-inner flex flex-col justify-center items-center text-center">
                                <div className="text-5xl mb-6">☕</div>
                                <h3 className="text-white font-bold text-2xl mb-4">Físico: El truco de la taza</h3>
                                <p className="text-sm leading-relaxed opacity-80 font-medium max-w-sm">
                                    Para BandLab, no grabes directo al micro. Consigue una **taza de cerámica**. Mete la armónica y el micro del celular dentro de la taza. El rebote crea el tono metálico de forma natural.
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    </div>
                )}

                {/* Sección Videos */}
                {activeTab === 'videos' && (
                    <div className="space-y-12">
                        <h2 className="font-serif text-5xl text-stone-900 font-bold italic text-center mb-12">Archivo de Referencia</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { id: 1, title: 'Bye Bye Bird (Live 1963)', desc: 'Observa cómo sus manos cubren totalmente la armónica. No se ve el instrumento.', query: 'sonny+boy+williamson+bye+bye+bird+live' },
                                { id: 2, title: 'Keep It To Yourself', desc: 'Análisis de articulación vocal. Escucha cómo parece que está hablando.', query: 'sonny+boy+williamson+keep+it+to+yourself' },
                                { id: 3, title: 'The American Folk Blues Festival', desc: 'Su interacción con Otis Spann y Matt Murphy. Ensamble puro.', query: 'sonny+boy+williamson+american+folk+blues+festival' },
                            ].map(video => (
                                <div key={video.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
                                    <h4 className="font-bold text-xl text-[#1a1412] mb-3">{video.title}</h4>
                                    <p className="text-sm text-stone-500 mb-8 flex-grow font-medium leading-relaxed">{video.desc}</p>
                                    <a
                                        href={`https://www.youtube.com/results?search_query=${video.query}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block py-3 px-6 rounded-full bg-stone-100 text-[#c5a059] text-xs font-black uppercase tracking-widest hover:bg-[#c5a059] hover:text-white transition-all duration-300 text-center"
                                    >
                                        BUSCAR VIDEO →
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Challenge */}
                <section className="mt-24 bg-[#c5a059] p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <h3 className="font-serif text-5xl italic font-bold mb-6">Nuevo Desafío: El Control de las manos</h3>
                        <p className="text-xl opacity-90 mb-10 leading-relaxed font-medium">
                            Toca el riff de "Keep it to Yourself" pero **sin usar la garganta**. Debes generar todo el vibrato exclusivamente abriendo y cerrando las manos rítmicamente.
                        </p>
                        <div className="inline-block bg-[#1a1412] text-white px-12 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl">
                            Objetivo: Maestría Acústica
                        </div>
                    </div>
                    {/* Visual texture */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
                </section>
            </main>

            <footer className="text-center py-12 opacity-20 text-[10px] uppercase font-black tracking-[0.5em] mt-20">
                Chess Records Education // Deep Blues Masterclass Series
            </footer>
        </div>
    );
};

export default SonyBoyII;
