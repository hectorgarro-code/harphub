import React from 'react';
import { Music, Layers, Zap, Target, Keyboard } from 'lucide-react';

const PIANO_GAME_MODES = [
    {
        id: 'chord_builder',
        title: 'Maestro de Acordes',
        desc: 'Construye acordes complejos desde cero. Aprende la estructura interna de tríadas y séptimas.',
        icon: <Music size={28} />,
        color: 'orange',
        points: '50pts/acorde',
        time: '60s'
    },
    {
        id: 'intervals',
        title: 'Gimnasia de Intervalos',
        desc: 'Entrena la distancia entre notas. La base para entender escalas y melodías profesionales.',
        icon: <Target size={28} />,
        color: 'purple',
        points: '20pts/intervalo',
        time: '60s'
    },
    {
        id: 'ear_training',
        title: 'Entrenamiento Auditivo',
        desc: 'Escucha el acorde o intervalo y selecciona la opción correcta.',
        icon: <Music size={28} />,
        color: 'blue',
        points: '40pts/acierto',
        time: '60s'
    },
    {
        id: 'progression_player',
        title: 'Maestro de Progresiones',
        desc: 'Toca una progresión completa de acordes en el orden correcto.',
        icon: <Layers size={28} />,
        color: 'pink',
        points: '100pts/prog',
        time: '90s'
    },
    {
        id: 'inversions',
        title: 'Entrenador de Inversiones',
        desc: 'Domina las inversiones. Toca el acorde pedido con el bajo correcto.',
        icon: <Target size={28} />,
        color: 'indigo',
        points: '30pts/acorde',
        time: '60s'
    },
    {
        id: 'detect_mode',
        title: 'Detección Libre',
        desc: 'Toca acordes libremente y gana puntos si el sistema los reconoce. ¡Puntos extra por acordes complejos!',
        icon: <Keyboard size={28} />,
        color: 'emerald',
        points: 'Variable',
        time: 'Libre'
    },
];

const COLOR_MAP = {
    blue: {
        bg: 'bg-blue-500/10', border: 'border-blue-500/30',
        icon: 'bg-blue-500/20 text-blue-400',
        btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
        badge: 'bg-blue-500/20 text-blue-400',
    },
    emerald: {
        bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
        icon: 'bg-emerald-500/20 text-emerald-400',
        btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20',
        badge: 'bg-emerald-500/20 text-emerald-400',
    },
    purple: {
        bg: 'bg-purple-500/10', border: 'border-purple-500/30',
        icon: 'bg-purple-500/20 text-purple-400',
        btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20',
        badge: 'bg-purple-500/20 text-purple-400',
    },
    orange: {
        bg: 'bg-orange-500/10', border: 'border-orange-500/30',
        icon: 'bg-orange-500/20 text-orange-400',
        btn: 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20',
        badge: 'bg-orange-500/20 text-orange-400',
    },
    pink: {
        bg: 'bg-pink-500/10', border: 'border-pink-500/30',
        icon: 'bg-pink-500/20 text-pink-400',
        btn: 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20',
        badge: 'bg-pink-500/20 text-pink-400',
    },
    indigo: {
        bg: 'bg-indigo-500/10', border: 'border-indigo-500/30',
        icon: 'bg-indigo-500/20 text-indigo-400',
        btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20',
        badge: 'bg-indigo-500/20 text-indigo-400',
    },
};

const PianoGamePanel = ({ startGame }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                    <Zap size={12} /> Piano Training Lab
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Elige tu Desafío</h2>
                <p className="text-slate-500 font-medium">Entrena tu oído y lectura musical con ejercicios interactivos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PIANO_GAME_MODES.map(mode => {
                    const c = COLOR_MAP[mode.color];
                    return (
                        <div key={mode.id} className={`${c.bg} border ${c.border} p-8 rounded-3xl flex flex-col gap-6 hover:scale-[1.02] transition-transform duration-300`}>
                            <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center`}>
                                {mode.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-white text-lg mb-2">{mode.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{mode.desc}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${c.badge}`}>{mode.points}</span>
                                    <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-800 text-slate-400">{mode.time}</span>
                                </div>
                                <button
                                    onClick={() => startGame(mode.id)}
                                    className={`px-5 py-2.5 ${c.btn} text-white font-black rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-xl`}
                                >
                                    Jugar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PianoGamePanel;
