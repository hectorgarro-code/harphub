import React from 'react';
import { UKELELE_CHORD_SHAPES } from '../data/chordShapes';
import { getIntervalLabel } from '../../../music/theory';

/**
 * Panel de control dinámico del GuitarMasterModal.
 * Renderiza los controles correspondientes a cada vista (scales, chords, arpeggios, triads, explore).
 */
const UkeleleControls = ({
    view,
    notes,
    // Musical state
    rootNote, setRootNote,
    scaleType, setScaleType,
    triadType, setTriadType,
    chordType, setChordType,
    arpeggioType, setArpeggioType,
    selectedVoicing, setSelectedVoicing,
    selectedStringSet, setSelectedStringSet,
    selectedNote, setSelectedNote,
    // Definitions (for keys)
    scaleDefinitions, triadDefinitions, chordDefinitions, arpeggioDefinitions,
    stringSets,
    dynamicVoicings, generateSuggestions,
    activeNotes
}) => (
    <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner">

        {/* ── ESCALAS ─────────────────────────────────────── */}
        {view === 'scales' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Tonalidad & Escala</p>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-1.5">
                        {notes.map(n => {
                            const isRoot = rootNote === n;
                            const isScaleNote = activeNotes.scales.includes(n);
                            const interval = isScaleNote ? getIntervalLabel(n, rootNote) : null;

                            return (
                                <button 
                                    key={n} 
                                    onClick={() => setRootNote(n)}
                                    className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                                        isRoot ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 scale-105 z-10' : 
                                        isScaleNote ? 'bg-slate-800 border-blue-500/30 text-blue-400' :
                                        'bg-slate-900/50 border-transparent text-slate-600 opacity-60 hover:opacity-100 hover:bg-slate-800'
                                    }`}
                                >
                                    <span className="text-sm font-black tracking-tight">{n}</span>
                                    {isScaleNote && (
                                        <span className={`text-[10px] font-black mt-1 uppercase ${isRoot ? 'text-blue-200' : 'text-slate-500'}`}>
                                            {interval}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(scaleDefinitions).map(s => (
                            <button key={s} onClick={() => setScaleType(s)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${scaleType === s ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ── ACORDES ─────────────────────────────────────── */}
        {view === 'chords' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-8">
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Nota Raíz</p>
                        <div className="flex flex-wrap gap-1.5">
                            {notes.map(n => {
                                const isRoot = rootNote === n;
                                const isChordNote = activeNotes.chords.includes(n);
                                const interval = isChordNote ? getIntervalLabel(n, rootNote) : null;
                                return (
                                    <button key={n} onClick={() => setRootNote(n)}
                                        className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                                            isRoot ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/30 scale-105 z-10' : 
                                            isChordNote ? 'bg-slate-800 border-amber-500/30 text-amber-400' :
                                            'bg-slate-900/50 border-transparent text-slate-600 opacity-60 hover:opacity-100 hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="text-sm font-black tracking-tight">{n}</span>
                                        {isChordNote && (
                                            <span className={`text-[10px] font-black mt-1 uppercase ${isRoot ? 'text-amber-200' : 'text-slate-500'}`}>
                                                {interval}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Tipo de Acorde</p>
                        <div className="flex flex-wrap gap-2">
                            {/* Tríadas primero */}
                            {Object.keys(triadDefinitions).map(c => (
                                <button key={c} onClick={() => { setChordType(c); setSelectedVoicing(null); }}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${chordType === c ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                    {c}
                                </button>
                            ))}
                            {/* Separador visual */}
                            <div className="w-px bg-slate-700 self-stretch mx-1" />
                            {/* Acordes extendidos */}
                            {Object.keys(chordDefinitions).map(c => (
                                <button key={c} onClick={() => { setChordType(c); setSelectedVoicing(null); }}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${chordType === c ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CAGED Shapes */}
                    <div className="lg:col-span-2 pt-6 border-t border-slate-800/50">
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                Digitaciones Sugeridas (Sistema CAGED)
                            </p>
                            {selectedVoicing && (
                                <span className="text-[10px] text-slate-500 font-bold">
                                    {UKELELE_CHORD_SHAPES[chordType]?.[selectedVoicing]
                                        ? `Forma ${selectedVoicing} — traspone automáticamente`
                                        : 'Forma no disponible para este tipo de acorde'}
                                </span>
                            )}
                        </div>

                        {!UKELELE_CHORD_SHAPES[chordType] && (
                            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
                                <span className="text-xl">⚠️</span>
                                <div>
                                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Aviso de Visualización</p>
                                    <p className="text-[10px] text-orange-400/80 font-bold">Este acorde no tiene digitaciones CAGED definidas. Mostrando mapa de notas distribuido.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {['C', 'A', 'G', 'F', 'D'].map(shape => {
                                const available = !!UKELELE_CHORD_SHAPES[chordType]?.[shape];
                                return (
                                    <button
                                        key={shape}
                                        disabled={!available}
                                        onClick={() => available && setSelectedVoicing(selectedVoicing === shape ? null : shape)}
                                        className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                                            !available ? 'opacity-20 cursor-not-allowed bg-slate-900 text-slate-600 border-slate-900' :
                                            selectedVoicing === shape ? 'bg-white text-slate-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' :
                                            'bg-slate-900 text-slate-500 border-slate-800 hover:border-orange-500/50 hover:text-orange-400'
                                        }`}
                                    >
                                        FORMA {shape}
                                    </button>
                                );
                            })}
                            
                            {(() => {
                                const hasShapes = !!UKELELE_CHORD_SHAPES[chordType];
                                return (
                                    <button 
                                        onClick={generateSuggestions}
                                        disabled={hasShapes}
                                        title={hasShapes 
                                            ? "Este acorde ya tiene formas estándar." 
                                            : "🤖 Sugerencia IA:&#10;1. Busca posiciones de cada nota del acorde en el diapasón.&#10;2. Genera combinaciones usando máximo 4 cuerdas.&#10;3. Mantiene notas dentro de un rango de 4 trastes."}
                                        className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border-2 ${
                                            hasShapes 
                                                ? 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-40' 
                                                : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white'
                                        }`}
                                    >
                                        <span>🤖 SUGERIR DIGITACIÓN</span>
                                    </button>
                                );
                            })()}

                            {selectedVoicing && (
                                <button onClick={() => setSelectedVoicing(null)}
                                    className="px-6 py-3 rounded-2xl text-xs font-black text-slate-500 hover:text-white border-2 border-transparent hover:border-slate-700 transition-all">
                                    ✕ LIMPIAR
                                </button>
                            )}
                        </div>

                        {dynamicVoicings.length > 0 && (
                            <div className="mt-6 p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 animate-in zoom-in-95 duration-300">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Digitaciones Sugeridas por IA</p>
                                <div className="flex flex-wrap gap-3">
                                    {dynamicVoicings.map((v, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setSelectedVoicing(v)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                                                selectedVoicing === v ? 'bg-blue-500 text-white border-blue-400 shadow-lg' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white'
                                            }`}
                                        >
                                            OPCIÓN {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!selectedVoicing && UKELELE_CHORD_SHAPES[chordType] && (
                            <p className="mt-4 text-xs text-slate-600">
                                💡 Selecciona una forma para ver la digitación exacta. Sin forma, se muestra todo el acorde.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* ── ARPEGIOS ─────────────────────────────────────── */}
        {view === 'arpeggios' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-8">
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Tonalidad del Arpegio</p>
                        <div className="flex flex-wrap gap-1.5">
                            {notes.map(n => {
                                const isRoot = rootNote === n;
                                const isArpNote = activeNotes.arpeggios.includes(n);
                                const interval = isArpNote ? getIntervalLabel(n, rootNote) : null;
                                return (
                                    <button key={n} onClick={() => setRootNote(n)}
                                        className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                                            isRoot ? 'bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/30 scale-105 z-10' : 
                                            isArpNote ? 'bg-slate-800 border-violet-500/30 text-violet-400' :
                                            'bg-slate-900/50 border-transparent text-slate-600 opacity-60 hover:opacity-100 hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="text-sm font-black tracking-tight">{n}</span>
                                        {isArpNote && (
                                            <span className={`text-[10px] font-black mt-1 uppercase ${isRoot ? 'text-violet-200' : 'text-slate-500'}`}>
                                                {interval}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Estructura del Arpegio</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(arpeggioDefinitions).map(a => (
                                <button key={a} onClick={() => setArpeggioType(a)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${arpeggioType === a ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── TRÍADAS ─────────────────────────────────────── */}
        {view === 'triads' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-8">
                    <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Nota Raíz de la Tríada</p>
                        <div className="flex flex-wrap gap-1.5">
                            {notes.map(n => {
                                const isRoot = rootNote === n;
                                const isTriadNote = activeNotes.triads.includes(n);
                                const interval = isTriadNote ? getIntervalLabel(n, rootNote) : null;
                                return (
                                    <button key={n} onClick={() => setRootNote(n)}
                                        className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                                            isRoot ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-105 z-10' : 
                                            isTriadNote ? 'bg-slate-800 border-emerald-500/30 text-emerald-400' :
                                            'bg-slate-900/50 border-transparent text-slate-600 opacity-60 hover:opacity-100 hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="text-sm font-black tracking-tight">{n}</span>
                                        {isTriadNote && (
                                            <span className={`text-[10px] font-black mt-1 uppercase ${isRoot ? 'text-emerald-200' : 'text-slate-500'}`}>
                                                {interval}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Estructura</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(triadDefinitions).map(t => (
                                    <button key={t} onClick={() => setTriadType(t)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${triadType === t ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">Grupo de Cuerdas</p>
                            <div className="flex flex-wrap gap-2">
                                {stringSets.map(set => (
                                    <button key={set.id} onClick={() => setSelectedStringSet(set.id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedStringSet === set.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                                        {set.label.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── EXPLORAR ─────────────────────────────────────── */}
        {view === 'explore' && (
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-black text-xl text-white uppercase tracking-tighter">Explorador Libre</h3>
                    <p className="text-slate-500 text-sm">Selecciona una nota para verla en todo el mástil</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                    {notes.map(n => (
                        <button key={n} onClick={() => setSelectedNote(n)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${selectedNote === n ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export default UkeleleControls;
