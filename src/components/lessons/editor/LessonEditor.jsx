import React, { useState } from 'react';
import { 
    Plus, Type, Video, AlertCircle, 
    Music, Trash2, ChevronUp, ChevronDown, 
    Save, Eye, Settings 
} from 'lucide-react';
import api from '../../services/api';

const LessonEditor = ({ lessonId, initialBlocks = [], onSaveSuccess }) => {
    const [blocks, setBlocks] = useState(initialBlocks);
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const addBlock = (type) => {
        const newBlock = {
            type,
            content: type === 'text' ? { text: '' } :
                     type === 'video' ? { youtubeId: '' } :
                     type === 'callout' ? { title: '', text: '', style: 'tip' } :
                     type === 'practice' ? { title: '', description: '', targetBpm: 60 } : {}
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (index, content) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = { ...newBlocks[index].content, ...content };
        setBlocks(newBlocks);
    };

    const removeBlock = (index) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const moveBlock = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;
        
        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await api.request('save_lesson_blocks', 'POST', {
                lesson_id: lessonId,
                blocks: blocks
            });
            if (res.success) {
                alert("Lección guardada correctamente.");
                if (onSaveSuccess) onSaveSuccess();
            }
        } catch (error) {
            console.error("Error saving blocks:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen pb-40">
            {/* Editor Toolbar */}
            <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Editor de Lección</h2>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => setPreviewMode(false)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${!previewMode ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                        >
                            Editar
                        </button>
                        <button 
                            onClick={() => setPreviewMode(true)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${previewMode ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                        >
                            Vista Previa
                        </button>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                    <Save size={16} /> {isSaving ? 'Guardando...' : 'Publicar Cambios'}
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-6 mt-12">
                {blocks.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <Plus size={48} className="mx-auto text-slate-800 mb-4" />
                        <p className="text-slate-500 font-bold">Tu lección está vacía. Añade tu primer bloque.</p>
                    </div>
                )}

                <div className="space-y-6">
                    {blocks.map((block, index) => (
                        <div key={index} className="group relative bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all">
                            {/* Block Controls */}
                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveBlock(index, 'up')} className="p-2 text-slate-600 hover:text-white"><ChevronUp size={16} /></button>
                                <button onClick={() => moveBlock(index, 'down')} className="p-2 text-slate-600 hover:text-white"><ChevronDown size={16} /></button>
                                <button onClick={() => removeBlock(index)} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-950 rounded-lg text-blue-500">
                                    {block.type === 'text' && <Type size={16} />}
                                    {block.type === 'video' && <Video size={16} />}
                                    {block.type === 'callout' && <AlertCircle size={16} />}
                                    {block.type === 'practice' && <Music size={16} />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{block.type}</span>
                            </div>

                            {/* Block Editors */}
                            {block.type === 'text' && (
                                <textarea 
                                    className="w-full bg-transparent border-none text-white text-lg font-medium outline-none resize-none min-h-[100px] placeholder:text-slate-800"
                                    placeholder="Escribe el contenido de la lección aquí..."
                                    value={block.content.text}
                                    onChange={(e) => updateBlock(index, { text: e.target.value })}
                                />
                            )}

                            {block.type === 'video' && (
                                <div className="space-y-4">
                                    <input 
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500/50"
                                        placeholder="YouTube Video ID (ej: dQw4w9WgXcQ)"
                                        value={block.content.youtubeId}
                                        onChange={(e) => updateBlock(index, { youtubeId: e.target.value })}
                                    />
                                    {block.content.youtubeId && (
                                        <div className="aspect-video rounded-xl overflow-hidden border border-white/5 bg-black">
                                            <img src={`https://img.youtube.com/vi/${block.content.youtubeId}/hqdefault.jpg`} className="w-full h-full object-cover opacity-50" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {block.type === 'practice' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                                        placeholder="Título del Ejercicio"
                                        value={block.content.title}
                                        onChange={(e) => updateBlock(index, { title: e.target.value })}
                                    />
                                    <input 
                                        className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                                        type="number"
                                        placeholder="BPM Objetivo"
                                        value={block.content.targetBpm}
                                        onChange={(e) => updateBlock(index, { targetBpm: e.target.value })}
                                    />
                                    <textarea 
                                        className="col-span-2 bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none min-h-[60px]"
                                        placeholder="Instrucciones cortas..."
                                        value={block.content.description}
                                        onChange={(e) => updateBlock(index, { description: e.target.value })}
                                    />
                                </div>
                            )}

                            {block.type === 'callout' && (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        {['tip', 'warning', 'info'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => updateBlock(index, { style: s })}
                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition ${block.content.style === s ? 'bg-blue-600 text-white border-blue-500' : 'text-slate-500 border-white/5'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <input 
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                                        placeholder="Título del Callout"
                                        value={block.content.title}
                                        onChange={(e) => updateBlock(index, { title: e.target.value })}
                                    />
                                    <textarea 
                                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none min-h-[60px]"
                                        placeholder="Mensaje..."
                                        value={block.content.text}
                                        onChange={(e) => updateBlock(index, { text: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Block Selector */}
                <div className="mt-12 p-8 bg-slate-900/20 border border-dashed border-white/5 rounded-[3rem] flex flex-wrap items-center justify-center gap-4">
                    <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition"><Type size={14} /> Texto</button>
                    <button onClick={() => addBlock('video')} className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition"><Video size={14} /> Video</button>
                    <button onClick={() => addBlock('practice')} className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition"><Music size={14} /> Práctica</button>
                    <button onClick={() => addBlock('callout')} className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition"><AlertCircle size={14} /> Nota</button>
                </div>
            </div>
        </div>
    );
};

export default LessonEditor;
