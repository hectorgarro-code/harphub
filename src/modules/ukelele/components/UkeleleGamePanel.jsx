import React from 'react';

/**
 * Panel del sistema de minijuegos de Guitar Master.
 * Muestra solo el estado idle (selección de juego).
 * Los estados countdown/playing/finished se manejan sobre el diapasón.
 */
const UkeleleGamePanel = ({ startGame }) => (
    <div className="animate-in fade-in zoom-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto py-10">
            <div
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center text-center group cursor-pointer"
                onClick={() => startGame('identifier')}
            >
                <h3 className="text-lg font-black text-white mb-2 uppercase">El Identificador</h3>
                <p className="text-slate-500 text-xs mb-4">¿Qué nota es esta?</p>
                <button className="mt-auto w-full py-3 bg-slate-800 rounded-xl font-black text-white group-hover:bg-blue-600 transition-colors uppercase text-[10px]">
                    Comenzar
                </button>
            </div>

            <div
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center text-center group cursor-pointer"
                onClick={() => startGame('collector')}
            >
                <h3 className="text-lg font-black text-white mb-2 uppercase">El Colector</h3>
                <p className="text-slate-500 text-xs mb-4">Encuentra todas las posiciones</p>
                <button className="mt-auto w-full py-3 bg-slate-800 rounded-xl font-black text-white group-hover:bg-orange-600 transition-colors uppercase text-[10px]">
                    Cazar
                </button>
            </div>

            <div
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center text-center group cursor-pointer"
                onClick={() => startGame('spelling')}
            >
                <h3 className="text-lg font-black text-white mb-2 uppercase">Deletreo</h3>
                <p className="text-slate-500 text-xs mb-4">Escribe palabras con notas</p>
                <button className="mt-auto w-full py-3 bg-slate-800 rounded-xl font-black text-white group-hover:bg-emerald-600 transition-colors uppercase text-[10px]">
                    Deletrear
                </button>
            </div>

            <div
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center text-center group cursor-pointer"
                onClick={() => startGame('intervals')}
            >
                <h3 className="text-lg font-black text-white mb-2 uppercase">Intervalos</h3>
                <p className="text-slate-500 text-xs mb-4">Encuentra el intervalo exacto</p>
                <button className="mt-auto w-full py-3 bg-slate-800 rounded-xl font-black text-white group-hover:bg-amber-600 transition-colors uppercase text-[10px]">
                    Entrenar
                </button>
            </div>
        </div>
    </div>
);

export default UkeleleGamePanel;
