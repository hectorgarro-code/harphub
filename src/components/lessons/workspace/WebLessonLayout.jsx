import React from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { Check, Link as LinkIcon, FileText, ChevronRight, Music, Video, Activity, FileJson } from 'lucide-react';

const WebLessonLayout = ({ 
    videoComponent, 
    tabComponent, 
    notesComponent, 
    blocksComponent, 
    seaComponent, 
    linksComponent, 
    attachmentsComponent, 
    practiceComponent,
    isCompleted,
    toggleCompleted
}) => {
    const { webBlocks } = useWorkspace();

    const renderBlockContent = (type) => {
        switch (type) {
            case 'video': return videoComponent;
            case 'tab': return tabComponent;
            case 'notes': return notesComponent;
            case 'blocks': return blocksComponent;
            case 'sea': return seaComponent;
            case 'links': return linksComponent;
            case 'attachments': return attachmentsComponent;
            case 'practice': return practiceComponent;
            default: return null;
        }
    };

    const getBlockIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={14} />;
            case 'tab': return <Music size={14} />;
            case 'notes': return <FileText size={14} />;
            case 'blocks': return <Activity size={14} />;
            case 'sea': return <Music size={14} />;
            case 'practice': return <Activity size={14} />;
            default: return <FileJson size={14} />;
        }
    };

    return (
        <div className="bg-slate-950 scroll-smooth">
            <div className="max-w-5xl mx-auto px-4 py-20 space-y-32">
                {webBlocks.map((block, idx) => (
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
                            
                            <div className={`relative bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl ring-1 ring-white/5 ${block.type === 'video' ? 'aspect-video' : block.type === 'tab' ? 'min-h-[600px] h-[600px]' : ''}`}>
                                {renderBlockContent(block.type)}
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
                ))}

                {/* Final Completion Block */}
                <section className="py-32 border-t border-white/5 flex flex-col items-center text-center animate-in fade-in zoom-in duration-1000 delay-300">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-700 ${isCompleted ? 'bg-emerald-500 text-slate-950 rotate-[360deg] shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'bg-blue-600/10 text-blue-500 border border-blue-500/20'}`}>
                        <Check size={isCompleted ? 48 : 40} strokeWidth={4} />
                    </div>
                    <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                        {isCompleted ? '¡Misión Cumplida!' : '¿Completaste el contenido?'}
                    </h2>
                    <p className="text-slate-400 text-xl mb-14 max-w-2xl leading-relaxed">
                        {isCompleted 
                            ? 'Has finalizado esta lección con éxito. ¡Sigue así para convertirte en un maestro de la música!'
                            : 'Marca la lección como finalizada para registrar tu progreso y mantener tu racha de estudio activa.'}
                    </p>
                    <button 
                        onClick={toggleCompleted}
                        className={`px-16 py-6 rounded-[2rem] text-xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl hover:-translate-y-1 active:scale-95 ${isCompleted ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/30'}`}
                    >
                        {isCompleted ? 'Volver a Estudiar' : 'Marcar como Finalizada'}
                    </button>
                    
                    {isCompleted && (
                        <div className="mt-8 flex items-center gap-3 animate-bounce">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">¡Excelente trabajo!</span>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default WebLessonLayout;
