import React from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { 
    Check, Link as LinkIcon, FileText, ChevronRight, Music, Video, 
    Activity, FileJson, CheckCircle2, Zap, Flame, Trophy, RotateCcw, Sparkles 
} from 'lucide-react';
import SeaTabBlock from '../blocks/SeaTabBlock';

const STAGES = [
    {
        level: 25,
        name: 'Iniciada',
        stepLabel: 'Paso 1',
        desc: 'Primer contacto con el material. Notas base y estructura.',
        activeBg: 'bg-orange-500/15 hover:bg-orange-500/25',
        activeBorder: 'border-orange-500/70',
        activeText: 'text-orange-400',
        glow: 'shadow-[0_0_25px_rgba(249,115,22,0.35)]',
        colorBar: 'from-orange-500 to-amber-500',
        icon: Flame
    },
    {
        level: 50,
        name: 'En Práctica',
        stepLabel: 'Paso 2',
        desc: 'Memorizando frases, digitación y tempo moderado.',
        activeBg: 'bg-amber-500/15 hover:bg-amber-500/25',
        activeBorder: 'border-amber-400/70',
        activeText: 'text-amber-400',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
        colorBar: 'from-amber-500 to-yellow-400',
        icon: Zap
    },
    {
        level: 75,
        name: 'Avanzada',
        stepLabel: 'Paso 3',
        desc: 'Tocando a tempo real con fluidez, control y afinación.',
        activeBg: 'bg-cyan-500/15 hover:bg-cyan-500/25',
        activeBorder: 'border-cyan-400/70',
        activeText: 'text-cyan-400',
        glow: 'shadow-[0_0_25px_rgba(6,182,212,0.35)]',
        colorBar: 'from-cyan-500 to-blue-500',
        icon: Activity
    },
    {
        level: 100,
        name: 'Dominada',
        stepLabel: 'Paso 4',
        desc: '¡Lección dominada con maestría e incorporada al repertorio!',
        activeBg: 'bg-emerald-500/20 hover:bg-emerald-500/30',
        activeBorder: 'border-emerald-400/80',
        activeText: 'text-emerald-400',
        glow: 'shadow-[0_0_35px_rgba(16,185,129,0.45)]',
        colorBar: 'from-emerald-500 to-teal-400',
        icon: Trophy
    }
];

const WebLessonLayout = ({ 
    lesson,
    videoComponent, 
    tabComponent, 
    notesComponent, 
    blocksComponent, 
    seaComponent, 
    linksComponent, 
    attachmentsComponent, 
    practiceComponent,
    isCompleted = false,
    progressLevel = 0,
    onProgressChange,
    toggleCompleted
}) => {
    const { webBlocks, notes } = useWorkspace();

    const hasBlockContent = (block) => {
        if (!block) return false;

        const type = block.type;
        switch (type) {
            case 'tab':
            case 'gp-tab': {
                // AlphaTab / GP: solo si tiene partitura asignada
                const gp = (lesson?.gpFile || block.content?.url || block.content?.file || '').trim();
                return Boolean(gp);
            }
            case 'text': {
                // Texto estático: solo si tiene contenido
                const text = (block.content?.text || '').trim();
                return Boolean(text);
            }
            case 'video': {
                // Video: solo si tiene enlace
                const yt = (lesson?.youtubeId || block.content?.url || '').trim();
                return Boolean(yt);
            }
            // Bloques interactivos para el estudiante (sea-tab, notes, attachments, links, checkpoints, practice):
            // Deben mostrarse siempre si están en la plantilla para que el estudiante interactúe o complete
            default:
                return true;
        }
    };

    const renderBlockContent = (block) => {
        const type = block.type;
        switch (type) {
            case 'video': {
                if (React.isValidElement(videoComponent)) {
                    return React.cloneElement(videoComponent, {
                        lessonBookmarks: lesson?.video_bookmarks || block.content?.bookmarks
                    });
                }
                return videoComponent;
            }
            case 'tab':
            case 'gp-tab': return tabComponent;
            case 'notes': return notesComponent;
            case 'blocks': return blocksComponent;
            case 'sea':
            case 'sea-tab': {
                const tabCode = block.content?.code || block.content?.tab || lesson?.practiceTab || '';
                if (seaComponent) {
                    return React.cloneElement(seaComponent, {
                        content: { ...(seaComponent.props?.content || {}), tab: tabCode, code: tabCode, title: block.title },
                        lesson: lesson
                    });
                }
                return <SeaTabBlock content={{ tab: tabCode, title: block.title }} lesson={lesson} />;
            }
            case 'links': return linksComponent;
            case 'attachments': return attachmentsComponent;
            case 'practice': return practiceComponent;
            case 'checkpoints': {
                const items = Array.isArray(block.content?.items) ? block.content.items : [];
                return (
                    <div className="p-8 space-y-4">
                        <div className="space-y-3">
                            {items.map((item, i) => (
                                <div key={item.id || i} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${item.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'}`}>
                                        {item.done && <CheckCircle2 size={14} />}
                                    </div>
                                    <span className="text-sm font-bold text-slate-200">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            case 'text': {
                return (
                    <div className="p-8 text-slate-300 whitespace-pre-wrap leading-relaxed text-base">
                        {block.content?.text}
                    </div>
                );
            }
            default: return null;
        }
    };

    const getBlockIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={14} />;
            case 'tab':
            case 'gp-tab': return <Music size={14} />;
            case 'notes': return <FileText size={14} />;
            case 'blocks': return <Activity size={14} />;
            case 'sea':
            case 'sea-tab': return <Music size={14} />;
            case 'practice': return <Activity size={14} />;
            default: return <FileJson size={14} />;
        }
    };

    const visibleBlocks = (webBlocks || []).filter(hasBlockContent);

    return (
        <div className="bg-slate-950 scroll-smooth">
            <div className="max-w-5xl mx-auto px-4 py-20 space-y-32">
                {visibleBlocks.length === 0 ? (
                    <div className="text-center py-24 px-4 bg-slate-900/30 border border-white/5 rounded-[3rem] max-w-xl mx-auto backdrop-blur-xl">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center text-slate-500">
                            <Music size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Lección en preparación</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Esta lección aún no tiene recursos ni partituras asignadas.
                        </p>
                    </div>
                ) : (
                    visibleBlocks.map((block, idx) => (
                        <section key={block.id || idx} className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
                            {/* Block Header */}
                            <div className="mb-10 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                                        <span className="text-blue-500">{getBlockIcon(block.type)}</span>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
                                            Módulo {idx + 1}
                                        </span>
                                    </div>
                                    <div className="hidden md:block h-[1px] flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                                    {block.title}
                                </h2>
                                {block.description && (
                                    <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-3xl">
                                        {block.description}
                                    </p>
                                )}
                            </div>

                            {/* Block Content Container */}
                            <div className="relative group">
                                {/* Decorative Background Elements */}
                                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/5 via-transparent to-indigo-500/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                
                                <div className={`relative bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl ring-1 ring-white/5 ${(block.type === 'tab' || block.type === 'gp-tab') ? 'min-h-[600px] h-[600px]' : ''}`}>
                                    {renderBlockContent(block)}
                                </div>
                            </div>

                            {/* Extra Resources (Links/Attachments) */}
                            {(block.links?.length > 0 || block.attachments?.length > 0) && (
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {block.links?.map((link, i) => (
                                        <a 
                                            key={i} 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-6 bg-slate-900/20 border border-white/5 rounded-3xl hover:bg-slate-800/40 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <LinkIcon size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-black text-white uppercase tracking-wider mb-0.5">{link.title}</span>
                                                    <span className="block text-[10px] text-slate-500 font-bold uppercase truncate max-w-[200px]">{link.url}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                                        </a>
                                    ))}
                                    {block.attachments?.map((file, i) => (
                                        <div 
                                            key={i} 
                                            className="flex items-center justify-between p-6 bg-slate-900/20 border border-white/5 rounded-3xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-black text-white uppercase tracking-wider mb-0.5">{file.title}</span>
                                                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Archivo adjunto</span>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 rounded-xl bg-emerald-500/10 text-[10px] font-black uppercase text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 tracking-widest transition-all">
                                                Descargar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))
                )}

                {/* Energy Bar / Mastery Semáforo Block */}
                {(() => {
                    const currentLevel = typeof progressLevel === 'number' ? progressLevel : (isCompleted ? 100 : 0);
                    const activeStage = STAGES.slice().reverse().find(s => currentLevel >= s.level);
                    const isMastered = currentLevel >= 100;

                    const handleSelectLevel = (level) => {
                        if (onProgressChange) {
                            if (currentLevel === level) {
                                const prev = level === 25 ? 0 : level === 50 ? 25 : level === 75 ? 50 : 75;
                                onProgressChange(prev);
                            } else {
                                onProgressChange(level);
                            }
                        } else if (toggleCompleted && level === 100) {
                            toggleCompleted();
                        }
                    };

                    return (
                        <section className="py-24 border-t border-white/5 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-black uppercase tracking-widest mb-8">
                                <Zap size={14} className="text-amber-400 animate-pulse" />
                                <span>Semáforo de Dominio y Avance</span>
                            </div>

                            {/* Dynamic Icon Badge */}
                            <div className={`w-24 h-24 rounded-[2.2rem] flex items-center justify-center mb-8 transition-all duration-700 ${
                                isMastered 
                                    ? 'bg-emerald-500 text-slate-950 rotate-[360deg] shadow-[0_0_55px_rgba(16,185,129,0.45)]' 
                                    : activeStage 
                                        ? `${activeStage.activeBg} ${activeStage.activeText} border ${activeStage.activeBorder} ${activeStage.glow}`
                                        : 'bg-slate-900/80 text-slate-500 border border-white/10'
                            }`}>
                                {isMastered ? (
                                    <Trophy size={46} strokeWidth={2.5} />
                                ) : activeStage ? (
                                    <activeStage.icon size={42} strokeWidth={2.5} />
                                ) : (
                                    <Zap size={38} strokeWidth={2} />
                                )}
                            </div>

                            {/* Headline */}
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                                {isMastered 
                                    ? '¡Lección Dominada al 100%!' 
                                    : activeStage 
                                        ? `${activeStage.name} (${currentLevel}%)` 
                                        : '¿Cuál es tu grado de avance?'}
                            </h2>

                            <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
                                {isMastered 
                                    ? '¡Felicitaciones! Has conquistado esta lección por completo según tu criterio y ya forma parte de tu repertorio activo.'
                                    : activeStage 
                                        ? activeStage.desc 
                                        : 'Tú marcas tu propio criterio. Selecciona un bloque de la barra de energía conforme avances hasta marcarla dominada.'}
                            </p>

                            {/* 4-Stage Energy Bar / Semáforo Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl mb-10 px-4">
                                {STAGES.map((stage) => {
                                    const isFilled = currentLevel >= stage.level;
                                    const isCurrent = activeStage?.level === stage.level;
                                    const IconComp = stage.icon;

                                    return (
                                        <button
                                            key={stage.level}
                                            onClick={() => handleSelectLevel(stage.level)}
                                            className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center cursor-pointer group active:scale-95 ${
                                                isFilled 
                                                    ? `${stage.activeBg} ${stage.activeBorder} ${stage.glow} scale-[1.02]` 
                                                    : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/80 hover:scale-[1.01]'
                                            }`}
                                        >
                                            {/* Top label & Icon */}
                                            <div className="flex items-center justify-between w-full mb-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isFilled ? stage.activeText : 'text-slate-500'}`}>
                                                    {stage.stepLabel}
                                                </span>
                                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                                                    isFilled ? `bg-white/10 ${stage.activeText}` : 'bg-slate-800 text-slate-600'
                                                }`}>
                                                    <IconComp size={14} />
                                                </div>
                                            </div>

                                            {/* Energy segment bar */}
                                            <div className="w-full h-2 rounded-full bg-slate-950/80 border border-white/5 overflow-hidden mb-3">
                                                <div className={`h-full rounded-full transition-all duration-500 ${
                                                    isFilled ? `bg-gradient-to-r ${stage.colorBar} w-full` : 'w-0'
                                                }`} />
                                            </div>

                                            {/* Level % */}
                                            <div className="text-2xl font-black text-white tracking-tight mb-1">
                                                {stage.level}%
                                            </div>
                                            <div className={`text-[11px] font-bold uppercase tracking-wider ${isFilled ? stage.activeText : 'text-slate-400'}`}>
                                                {stage.name}
                                            </div>

                                            {/* Active badge */}
                                            {isCurrent && (
                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-lg">
                                                    Actual
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Main Action Buttons */}
                            <div className="flex flex-col items-center gap-4">
                                <button 
                                    onClick={() => handleSelectLevel(isMastered ? 0 : 100)}
                                    className={`px-12 md:px-16 py-5 rounded-[2rem] text-lg font-black uppercase tracking-[0.2em] transition-all shadow-2xl hover:-translate-y-1 active:scale-95 flex items-center gap-3 ${
                                        isMastered 
                                            ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 hover:bg-emerald-400' 
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'
                                    }`}
                                >
                                    {isMastered ? (
                                        <>
                                            <CheckCircle2 size={22} />
                                            <span>¡Dominada! Volver a Estudiar</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trophy size={20} />
                                            <span>Marcar como Dominada (100%)</span>
                                        </>
                                    )}
                                </button>

                                {currentLevel > 0 && (
                                    <button
                                        onClick={() => onProgressChange && onProgressChange(0)}
                                        className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 py-2 px-4 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-white/5"
                                    >
                                        <RotateCcw size={13} />
                                        <span>Reiniciar avance (0%)</span>
                                    </button>
                                )}
                            </div>
                        </section>
                    );
                })()}
            </div>
        </div>
    );
};

export default WebLessonLayout;
