import React, { useState, useEffect } from 'react';
import { Radar } from 'react-chartjs-2';
import { 
    Music, GraduationCap, Wind, Layers, Youtube, ChevronRight, Check
} from 'lucide-react';
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

const courseData = {
    1: {
        title: "Pulso y Respiración",
        desc: "Bases rítmicas y el motor del Mississippi.",
        month: "Mes 1",
        skills: [90, 20, 30, 80, 20, 40],
        exercises: [
            { inst: "Armónica", name: "Chugging Básico", goal: "Respiración diafragmática", tab: "+1+2+3 (Uuu)\n-1-2-3 (Haa)", source: "Adam Gussow Chugging" },
            { inst: "Guitarra", name: "Shuffle en Mi", goal: "Mano derecha constante", tab: "E|-------------------|\nA|--2-2-4-4-2-2-4-4--|\nE|--0-0-0-0-0-0-0-0--|", source: "JustinGuitar Blues Rhythm" }
        ],
        links: [{ name: "Técnica Chugging", query: "blues harmonica chugging basics" }]
    },
    2: {
        title: "Notas Limpias y Acordes 7",
        desc: "Precisión en celdas individuales y armonía dominante.",
        month: "Mes 1",
        skills: [80, 25, 50, 85, 30, 50],
        exercises: [
            { inst: "Armónica", name: "Salto de Celdas", goal: "Notas sin aire residual", tab: "+1...-2...+3...-4", source: "David Barrett single notes" },
            { inst: "Guitarra", name: "Acordes Dominantes", goal: "Cambios I-IV-V7", tab: "E7: 020100\nA7: x02020\nB7: x21202", source: "Marty Music Blues Chords" }
        ],
        links: [{ name: "Single Notes Pucker", query: "harmonica pucker method notes" }]
    },
    3: {
        title: "El Inicio del Bending",
        desc: "Entonando el lamento del blues en la celda 4.",
        month: "Mes 1",
        skills: [70, 50, 55, 80, 40, 55],
        exercises: [
            { inst: "Armónica", name: "Bending en Celda 4", goal: "Bajar medio tono (-4')", tab: "-4 (Nota natural)\n-4' (Bend)", source: "Annie Raines Bending" },
            { inst: "Guitarra", name: "Shuffle con 5ta y 6ta", goal: "Estilo boogie", tab: "A|--2-2-4-4-5-5-4-4--|\nE|--0-0-0-0-0-0-0-0--|", source: "Blues Guitar Shuffle Pattern" }
        ],
        links: [{ name: "Mastering Bending", query: "harmonica bending for beginners" }]
    },
    4: {
        title: "Turnarounds Básicos",
        desc: "Como cerrar las frases y volver al inicio.",
        month: "Mes 1",
        skills: [75, 55, 60, 85, 50, 65],
        exercises: [
            { inst: "Armónica", name: "Turnaround de Riff", goal: "Frase de cierre", tab: "-2 -3' -4 +4 -3' -2", source: "Sonny Boy Williamson Licks" },
            { inst: "Guitarra", name: "Turnaround Cromático", goal: "Resolución al V", tab: "D|-------2-3-4-5-----|\nA|--2-3-4-5----------|", source: "Standard Blues Turnarounds" }
        ],
        links: [{ name: "Blues Turnaround Guide", query: "guitar blues turnaround licks" }]
    },
    5: {
        title: "Quick Change Blues",
        desc: "Variación estructural para romper la monotonía.",
        month: "Mes 2",
        skills: [85, 60, 65, 80, 55, 70],
        exercises: [
            { inst: "Armónica", name: "Acompañando el IV", goal: "Notas de la escala de A", tab: "+4... -3'... -2", source: "Harmonica Second Position" },
            { inst: "Guitarra", name: "Rítmica Quick Change", goal: "Cambio al IV en Compás 2", tab: "C1: E7 | C2: A7\nC3: E7 | C4: E7", source: "Quick Change Blues rhythm" }
        ],
        links: [{ name: "12 Bar Variations", query: "quick change blues explanation" }]
    },
    6: {
        title: "Vibrato de Mano",
        desc: "Dinámica y efectos de resonancia física.",
        month: "Mes 2",
        skills: [80, 65, 85, 75, 60, 60],
        exercises: [
            { inst: "Armónica", name: "Efecto Wah-Wah", goal: "Apertura de manos rítmica", tab: "-2 (Copa cerrada -> abierta)", source: "Hand vibrato harmonica" },
            { inst: "Guitarra", name: "Dynamic Comping", goal: "Uso del volumen de mano", tab: "Toca suave en estrofa\nToca fuerte en breaks", source: "Guitar dynamic playing blues" }
        ],
        links: [{ name: "Hand Effects Harp", query: "sonny boy williamson hand effects" }]
    },
    7: {
        title: "Bending Profundo (-2 y -3)",
        desc: "Dominando las notas más difíciles del peine.",
        month: "Mes 2",
        skills: [70, 85, 70, 70, 65, 65],
        exercises: [
            { inst: "Armónica", name: "Double Bend en 2", goal: "Llegar al -2''", tab: "-2 -> -2' -> -2''", source: "Jason Ricci Bend Exercise" },
            { inst: "Guitarra", name: "Slow Blues 12/8", goal: "Ritmo ternario", tab: "E|-------9-------9---|\nB|-----7-------7-----|", source: "Slow blues guitar rhythm" }
        ],
        links: [{ name: "The -2 Double Bend", query: "how to play -2 double bend harmonica" }]
    },
    8: {
        title: "El 'Blue Note' y el Soul",
        desc: "Expresión melódica y lamentos.",
        month: "Mes 2",
        skills: [75, 80, 80, 70, 75, 70],
        exercises: [
            { inst: "Armónica", name: "La Escala de Blues", goal: "Uso de la blue note (-4')", tab: "-2 -3' 4 -4' -4 5 6", source: "Harmonica Blues Scale" },
            { inst: "Guitarra", name: "Acordes de 9na", goal: "Color Stormy Monday", tab: "E9: x7677x", source: "9th chords for blues guitar" }
        ],
        links: [{ name: "Blues Scale Harp", query: "blues scale harmonica 2nd position" }]
    },
    9: {
        title: "Vibrato de Garganta",
        desc: "El sonido profesional y 'sucio' del Chicago Blues.",
        month: "Mes 3",
        skills: [75, 75, 90, 75, 80, 65],
        exercises: [
            { inst: "Armónica", name: "Garganta vs Diafragma", goal: "Oscilación tonal constante", tab: "-2~~~~ (Ondulación)", source: "Throat vibrato technique" },
            { inst: "Guitarra", name: "Riffs como Ritmo", goal: "Estilo Muddy Waters", tab: "A|-----0-3-0---|\nE|-0-0-3-----3-|", source: "Muddy Waters guitar riffs" }
        ],
        links: [{ name: "Vibrato Mastery", query: "harmonica throat vibrato lesson" }]
    },
    10: {
        title: "Articulación y 'Slaps'",
        desc: "Uso de la lengua para atacar notas.",
        month: "Mes 3",
        skills: [85, 70, 85, 80, 70, 75],
        exercises: [
            { inst: "Armónica", name: "Articulación T-K", goal: "Notas rápidas y claras", tab: "Ta-Ka-Ta-Ka (-2-3-4)", source: "Harmonica articulation" },
            { inst: "Guitarra", name: "Palm Muting Avanzado", goal: "Percusión en cuerdas", tab: "Mutea solo cuerdas graves", source: "Palm muting blues guitar" }
        ],
        links: [{ name: "Tongue Articulation", query: "harmonica articulation syllables" }]
    },
    11: {
        title: "Velocidad y Precisión",
        desc: "Drills técnicos para agilidad.",
        month: "Mes 3",
        skills: [95, 75, 80, 70, 85, 60],
        exercises: [
            { inst: "Armónica", name: "Escalas de 3 octavas", goal: "Recorrer todo el peine", tab: "+1 a +10", source: "Harmonica scale exercises" },
            { inst: "Guitarra", name: "Alternated Picking", goal: "Velocidad en riffs", tab: "Púa arriba/abajo constante", source: "Speed picking blues guitar" }
        ],
        links: [{ name: "Speed Building", query: "harmonica speed drills" }]
    },
    12: {
        title: "Tongue Block Avanzado",
        desc: "Octavas y texturas masivas.",
        month: "Mes 3",
        skills: [70, 75, 95, 80, 85, 80],
        exercises: [
            { inst: "Armónica", name: "Octavas (1-4)", goal: "Sonido de Hammond", tab: "Bloquea 2-3\nSuena 1 y 4", source: "Jason Ricci Tongue Block" },
            { inst: "Guitarra", name: "Acordes de 13va", goal: "Finales de Jazz Blues", tab: "A13: 5x567x", source: "13th chords blues guitar" }
        ],
        links: [{ name: "Tongue Block Octaves", query: "harmonica octaves tongue block" }]
    },
    // Week 13-24: Advanced Modules
    13: {
        title: "Sonny Boy II: Tongue Blocking",
        desc: "Dominando el ataque percusivo y el tono gordo.",
        month: "Mes 4",
        skills: [70, 95, 90, 80, 85, 75],
        exercises: [
            { inst: "Armónica", name: "El 'Slap' Rítmico", goal: "Percusión con la lengua", tab: "Bloquea 1-2-3\nSuena 4 con golpe rítmico", source: "Sonny Boy Williamson technique" },
            { inst: "Guitarra", name: "Comping Swing", goal: "Acordes con aire de Big Band", tab: "G7: 353433\nC9: x32333", source: "Jump blues guitar chords" }
        ],
        links: [{ name: "Tongue Block Masterclass", query: "sonny boy williamson tongue blocking lesson" }]
    },
    14: {
        title: "Rhumba Blues: 'Help Me'",
        desc: "Sincronía rítmica y fraseo oscuro en Fa menor.",
        month: "Mes 4",
        skills: [85, 80, 85, 90, 80, 80],
        exercises: [
            { inst: "Armónica", name: "Riff de Help Me", goal: "Acentuar el -2 con vibrato", tab: "-2 -3' -4 -4' -4", source: "Sonny Boy II Help Me harmonica" },
            { inst: "Guitarra", name: "Ritmo Rhumba Fm", goal: "Independencia de pulgar", tab: "Fm7: 1x111x\nBb7: x1313x", source: "Help Me blues guitar lesson" }
        ],
        links: [{ name: "Rhumba Blues Feel", query: "how to play rhumba blues transition" }]
    },
    15: {
        title: "Delta Blues & Fingerpicking",
        desc: "Raíces acústicas de Robert Johnson.",
        month: "Mes 4",
        skills: [90, 70, 75, 75, 85, 95],
        exercises: [
            { inst: "Armónica", name: "Acompañamiento Acústico", goal: "Lamentos y trenes", tab: "+1+2+3... -1-2-3 (Haa)", source: "Delta blues harmonica style" },
            { inst: "Guitarra", name: "Monotonic Bass", goal: "Pulgar rítmico constante", tab: "E|--0-0-0-0--| (Bajo constante)", source: "Robert Johnson fingerpicking basics" }
        ],
        links: [{ name: "Delta Roots", query: "robert johnson guitar style lesson" }]
    },
    16: {
        title: "Slow Blues y Espacios",
        desc: "El arte de no tocar y dejar respirar la nota.",
        month: "Mes 4",
        skills: [70, 85, 95, 70, 95, 85],
        exercises: [
            { inst: "Armónica", name: "Vibrato de Garganta", goal: "Sostener notas 12 segundos", tab: "-2~~~~ (Ondulación lenta)", source: "Slow blues harmonica phrasing" },
            { inst: "Guitarra", name: "Bends de 1 y 1/2 tono", goal: "Expresión extrema", tab: "E|--15b(17)--| (Estirada)", source: "Slow blues guitar solo techniques" }
        ],
        links: [{ name: "Dramatic Phrasing", query: "blues phrasing silence importance" }]
    },
    17: {
        title: "El Blues del Equipaje",
        desc: "Estilo La Mississippi: Shuffle Tradicional.",
        month: "Mes 5",
        skills: [90, 80, 80, 85, 80, 75],
        exercises: [
            { inst: "Armónica", name: "Riff Mississippi", goal: "Notas de paso rápidas", tab: "-3' -4 -4' -4 -3' -2", source: "La Mississippi El Blues del Equipaje tab" },
            { inst: "Guitarra", name: "Rítmica Piano-Style", goal: "Acompañamiento tipo piano", tab: "A7: x02020 (Staccato)", source: "Blues guitar piano style comping" }
        ],
        links: [{ name: "Blues Nacional", query: "La Mississippi blues tutorial" }]
    },
    18: {
        title: "Café Madrid: Jump Blues",
        desc: "Velocidad y riffs de sección de vientos.",
        month: "Mes 5",
        skills: [85, 90, 85, 80, 90, 70],
        exercises: [
            { inst: "Armónica", name: "Intro Frenética", goal: "Octavas rítmicas", tab: "+6 +6 -6' -6 +6 -5 -4", source: "Cafe Madrid harmonica lick" },
            { inst: "Guitarra", name: "Comping Jazz-Blues", goal: "Acordes de 9na y 13va", tab: "E9: x7677x\nA13: 5x567x", source: "Jump blues guitar tutorial" }
        ],
        links: [{ name: "Jump Blues Phrasing", query: "jump blues harmonica lessons" }]
    },
    19: {
        title: "Mala Transa: Funk-Blues",
        desc: "Groove urbano y síncopa agresiva.",
        month: "Mes 5",
        skills: [95, 75, 85, 85, 85, 80],
        exercises: [
            { inst: "Armónica", name: "Fraseo en Graves", goal: "Bends profundos rítmicos", tab: "-1 -2'' -2 -3' -4", source: "Harmonica funk blues licks" },
            { inst: "Guitarra", name: "Riff Hipnótico", goal: "Acento en el contratiempo", tab: "A|----5---7---5-7----|", source: "Mala Transa guitar riff" }
        ],
        links: [{ name: "Funk Blues Groove", query: "funk blues guitar lesson" }]
    },
    20: {
        title: "Un Poco Más: Soul-Blues",
        desc: "Mezcla de blues con soul y silencios dramáticos.",
        month: "Mes 5",
        skills: [75, 80, 90, 80, 90, 90],
        exercises: [
            { inst: "Armónica", name: "Fraseo Vocal", goal: "Notas sopladas con aire", tab: "+6... -5 +5 -4", source: "Soul blues harmonica style" },
            { inst: "Guitarra", name: "Acordes Maj7", goal: "Color Soul", tab: "Cmaj7: x35453", source: "Soul blues guitar chords" }
        ],
        links: [{ name: "Soul Feeling", query: "soul blues guitar phrasing" }]
    },
    21: {
        title: "El Riff de Hierro: Pappo",
        desc: "Volumen y actitud de rock nacional.",
        month: "Mes 6",
        skills: [100, 70, 95, 60, 95, 50],
        exercises: [
            { inst: "Armónica", name: "Respuesta Agresiva", goal: "Fuerza de diafragma", tab: "-2 -2 -3' -4 -4' -4", source: "Pappo's Blues harmonica style" },
            { inst: "Guitarra", name: "Riff 'El Viejo'", goal: "Acento bajo en Mi", tab: "D|-------5---7---5---7b-------|", source: "Pappo El Viejo guitar riff" }
        ],
        links: [{ name: "El Carpo Style", query: "Pappo's Blues guitar tutorial" }]
    },
    22: {
        title: "Pentatónica Diabólica",
        desc: "Duelos de solo entre guitarra y armónica.",
        month: "Mes 6",
        skills: [95, 85, 90, 70, 100, 60],
        exercises: [
            { inst: "Armónica", name: "Solo Explosivo", goal: "Subida rápida a agudos", tab: "-2 -3' -4 +6 -6' -6", source: "Adónde está la libertad harmonica" },
            { inst: "Guitarra", name: "Vibrato de Rock", goal: "Sostener la nota al límite", tab: "Bend de 1 tono y medio", source: "Pappo guitar solo techniques" }
        ],
        links: [{ name: "Blues de Asfalto", query: "Pappo guitar style analysis" }]
    },
    23: {
        title: "3ra Posición: Blues Menor",
        desc: "Tocar sobre acordes menores con aire melancólico.",
        month: "Mes 6",
        skills: [85, 85, 85, 95, 85, 90],
        exercises: [
            { inst: "Armónica", name: "Escala Menor", goal: "3ra posición (Armónica C en Dm)", tab: "-4 -5 +6 -6' -7 +8", source: "Harmonica 3rd position lesson" },
            { inst: "Guitarra", name: "Arpegios Menores", goal: "Acompañar sin molestar", tab: "Dm7: x5756x", source: "Minor blues guitar accompaniment" }
        ],
        links: [{ name: "Minor Blues Mastery", query: "3rd position harmonica tunes" }]
    },
    24: {
        title: "Solo Final: Graduación",
        desc: "Integración de todas las técnicas y ensamble total.",
        month: "Mes 6",
        skills: [100, 100, 100, 100, 100, 100],
        exercises: [
            { inst: "Armónica", name: "Solo de Grado", goal: "Improvisación 12 compases", tab: "Usa todas las posiciones", source: "Advanced blues harmonica soloing" },
            { inst: "Guitarra", name: "Ensamble Total", goal: "Intercambio de licks", tab: "Trading Fours", source: "Blues ensemble interaction" }
        ],
        links: [{ name: "Blues Master Certification", query: "advanced blues jam sessions" }]
    }
};

const BluesDegreeMain = ({ progress, onSaveProgress }) => {
    const [activeWeek, setActiveWeek] = useState(1);
    
    // Fallback if progress is not yet loaded or empty
    const completedWeeks = progress?.weeks || [];
    const completedExercises = progress?.exercises || {};

    const toggleWeekCompletion = (weekId) => {
        const newWeeks = completedWeeks.includes(weekId) 
            ? completedWeeks.filter(id => id !== weekId) 
            : [...completedWeeks, weekId];
        
        onSaveProgress({
            weeks: newWeeks,
            exercises: completedExercises
        });
    };

    const toggleExerciseCompletion = (weekId, exerciseIdx) => {
        const weekExs = completedExercises[weekId] || [];
        const newWeekExs = weekExs.includes(exerciseIdx) 
            ? weekExs.filter(i => i !== exerciseIdx) 
            : [...weekExs, exerciseIdx];
        
        onSaveProgress({
            weeks: completedWeeks,
            exercises: { ...completedExercises, [weekId]: newWeekExs }
        });
    };

    const calculateTotalProgress = () => {
        let totalItems = 24; // 24 weeks
        let completedItems = completedWeeks.length;
        
        Object.keys(courseData).forEach(w => {
            totalItems += courseData[w].exercises.length;
            if (completedExercises[w]) {
                completedItems += completedExercises[w].length;
            }
        });
        
        return Math.round((completedItems / totalItems) * 100);
    };

    const data = courseData[activeWeek];
    const isWeekCompleted = completedWeeks.includes(activeWeek);
    const totalProgress = calculateTotalProgress();

    const chartData = {
        labels: ['Ritmo', 'Bending', 'Tono', 'Acordes', 'Solo', 'Teoría'],
        datasets: [{
            label: 'Enfoque de la Semana',
            data: data.skills,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { display: false, stepSize: 20 },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: {
                    color: '#94a3b8',
                    font: { size: 10, weight: 'bold', family: 'Inter' }
                }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 font-sans">
            {/* Week Selector - Responsive Sidebar */}
            <aside id="tour-blues-weeks" className="w-full lg:w-80 bg-slate-900/50 lg:h-screen lg:sticky lg:top-0 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col shrink-0">
                <div className="p-6 hidden lg:block border-b border-white/5">
                    <h2 className="text-xl font-black text-white">Progreso</h2>
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest font-black mt-1">Intensivo 24 Semanas</p>
                </div>

                {/* Week Selection - Desktop: Vertical Scroll / Mobile: Horizontal Scroll */}
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-4 lg:p-4 gap-2 custom-scrollbar no-scrollbar">
                    {Object.keys(courseData).map((num) => {
                        const i = parseInt(num);
                        const isActive = activeWeek === i;
                        const isCompleted = completedWeeks.includes(i);
                        return (
                            <button
                                key={i}
                                onClick={() => setActiveWeek(i)}
                                className={`
                                    min-w-[120px] lg:min-w-0 lg:w-full 
                                    flex flex-col lg:flex-row items-center lg:justify-between 
                                    p-3 lg:p-4 rounded-2xl transition-all duration-300 relative
                                    ${isActive 
                                        ? 'bg-blue-600/20 border border-blue-500/50 text-white shadow-lg lg:shadow-blue-600/10' 
                                        : isCompleted 
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                            : 'bg-white/5 border border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                                    }
                                `}
                            >
                                <div className="text-center lg:text-left overflow-hidden">
                                    <div className={`text-[8px] lg:text-[10px] uppercase font-black mb-0.5 tracking-tighter ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-500' : 'text-slate-500'}`}>
                                        Semana {i}
                                    </div>
                                    <div className={`text-xs lg:text-sm font-black truncate max-w-[80px] lg:max-w-[160px] ${isActive ? 'text-white' : isCompleted ? 'text-emerald-200' : 'text-slate-300'}`}>
                                        {courseData[i].title}
                                    </div>
                                </div>
                                <div className={`hidden lg:block h-2.5 w-2.5 rounded-full shrink-0 ml-4 transition-all duration-500 border-2 ${
                                    isActive 
                                        ? 'bg-blue-400 border-blue-200 scale-125 shadow-[0_0_8px_rgba(96,165,250,0.8)]' 
                                        : isCompleted 
                                            ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                            : 'bg-slate-700 border-transparent'
                                }`}></div>
                                {isCompleted && !isActive && <Check size={10} className="absolute top-2 right-2 text-emerald-500" />}
                            </button>
                        );
                    })}
                </div>

                <div className="hidden lg:block p-6 border-t border-white/5 mt-auto bg-slate-950/20">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase">Progreso Total</span>
                        <span className="text-sm font-black text-blue-400">{totalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                        <div 
                            className="bg-gradient-to-r from-blue-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                            style={{ width: `${totalProgress}%` }}
                        ></div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow p-6 lg:p-12 overflow-y-auto bg-slate-950">
                <header className="max-w-4xl mx-auto mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">
                                    {data.month}
                                </span>
                                {isWeekCompleted && (
                                    <span className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none flex items-center gap-1">
                                        <Check size={10} /> Finalizada
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-tight italic">
                                S{activeWeek}: {data.title}
                            </h2>
                            <p className="text-slate-400 text-sm lg:text-lg max-w-2xl font-medium">{data.desc}</p>
                        </div>
                        <button 
                            onClick={() => toggleWeekCompletion(activeWeek)}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                isWeekCompleted 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                            }`}
                        >
                            {isWeekCompleted ? <><Check size={16} /> Semana Completada</> : 'Marcar Semana como Finalizada'}
                        </button>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto space-y-10 pb-20">
                    {/* Visual Emphasis Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Skill Radar */}
                        <div className="lg:col-span-2 premium-card p-8 group">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-black uppercase text-blue-400 tracking-[0.2em]">Enfoque Técnico</h3>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => <div key={i} className="h-1 w-4 rounded-full bg-blue-500/20"></div>)}
                                </div>
                            </div>
                            <div className="h-72 lg:h-80 relative">
                                <Radar data={chartData} options={chartOptions} />
                            </div>
                        </div>

                        {/* Quick Stats/Summary Card */}
                        <div className="premium-card p-8 bg-gradient-to-br from-blue-600/10 to-transparent flex flex-col justify-center border-blue-500/20">
                            <h3 className="text-xs font-black uppercase text-slate-500 mb-6 italic tracking-widest">Resumen Semanal</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                                        <Music size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg leading-none">2 Ejercicios</p>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-1">Armónica + Guitarra</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg leading-none">Curado</p>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mt-1">Material Especializado</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Exercises */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.3em] ml-2 italic">Ejercicios de Práctica</h3>
                        <div className="grid grid-cols-1 gap-6">
                            {data.exercises.map((ex, idx) => {
                                const isExCompleted = (completedExercises[activeWeek] || []).includes(idx);
                                return (
                                    <div key={idx} className={`premium-card p-8 flex flex-col md:flex-row gap-8 group transition-all duration-500 shadow-xl overflow-hidden relative ${
                                        isExCompleted ? 'border-emerald-500/40 bg-emerald-500/5' : 'hover:border-blue-500/40'
                                    }`}>
                                        {/* Accent Decoration */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl transition-colors ${
                                            isExCompleted ? 'bg-emerald-500/10' : 'bg-blue-500/5 group-hover:bg-blue-500/10'
                                        }`}></div>
                                        
                                        <div className="md:w-1/3 shrink-0 relative z-10">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                                                        ex.inst === 'Armónica' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                        {ex.inst}
                                                    </span>
                                                    {ex.inst === 'Armónica' ? <Wind size={14} className="text-blue-400" /> : <Layers size={14} className="text-amber-400" />}
                                                </div>
                                                <button 
                                                    onClick={() => toggleExerciseCompletion(activeWeek, idx)}
                                                    title={isExCompleted ? "Marcar como pendiente" : "Marcar como completado"}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                        isExCompleted ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 border border-white/5'
                                                    }`}
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                            <h4 className={`text-2xl font-black italic tracking-tighter transition-colors ${isExCompleted ? 'text-emerald-400' : 'text-white group-hover:text-blue-400'}`}>{ex.name}</h4>
                                            <div className="p-4 mt-4 bg-slate-900/80 rounded-2xl border border-white/5 shadow-inner">
                                                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Objetivo del Grado</p>
                                                <p className={`${isExCompleted ? 'text-emerald-200/80' : 'text-blue-200/80'} text-sm font-medium leading-relaxed italic`}>"{ex.goal}"</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow relative z-10">
                                            <div className="relative group/tab">
                                                <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover/tab:opacity-10 blur transition duration-1000 ${isExCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                                <div className={`relative bg-slate-900/90 rounded-2xl p-6 font-mono text-sm leading-relaxed border shadow-2xl overflow-x-auto whitespace-pre-wrap ${isExCompleted ? 'border-emerald-500/20' : 'border-white/5'}`}>
                                                    <code className={`${isExCompleted ? 'text-emerald-400' : 'text-blue-400'} font-bold`}>{ex.tab}</code>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex justify-end">
                                                <a
                                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.source)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 transition-all group/link"
                                                >
                                                    <Youtube size={16} className="text-slate-500 group-hover/link:text-red-500 transition-colors" />
                                                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover/link:text-white tracking-widest">{ex.source}</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reference Resources */}
                    <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-500">
                                    <Youtube size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter">Recursos de Inmersión</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.links.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(link.query)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center p-4 bg-slate-800/40 rounded-2xl hover:bg-blue-600 hover:translate-x-1 transition-all duration-300 border border-white/5 shadow-md group/res"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center mr-4 group-hover/res:bg-white/20 transition-colors">
                                            <Youtube size={16} className="text-slate-500 group-hover/res:text-white" />
                                        </div>
                                        <span className="text-sm font-black text-slate-300 group-hover/res:text-white transition-colors">{link.name}</span>
                                        <ChevronRight size={16} className="ml-auto text-slate-600 group-hover/res:text-white" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BluesDegreeMain;
