import React, { useState } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { Save, Plus, Clock, FileText } from 'lucide-react';

const WorkspaceNotesPanel = () => {
    const { notes, addNote, isSaving } = useWorkspace();
    const [currentNote, setCurrentNote] = useState('');

    const handleAddNote = () => {
        if (!currentNote.trim()) return;
        addNote(currentNote);
        setCurrentNote('');
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/20">
            {/* Input Area */}
            <div className="p-4 border-b border-white/5">
                <div className="relative">
                    <textarea 
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                        placeholder="Escribe tus apuntes de estudio aquí..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:ring-2 ring-emerald-500/50 outline-none transition-all min-h-[100px] resize-none placeholder:text-slate-700"
                    />
                    <button 
                        onClick={handleAddNote}
                        disabled={!currentNote.trim()}
                        className="absolute bottom-4 right-4 bg-emerald-500 text-slate-950 font-black text-[10px] px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:grayscale"
                    >
                        <Plus size={14} /> GUARDAR NOTA
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                        <FileText size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.2em]">No hay notas personales</p>
                    </div>
                ) : (
                    notes.map((note, i) => (
                        <div key={note.id || i} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 group hover:border-emerald-500/20 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    <Clock size={10} />
                                    {new Date(note.created_at).toLocaleString()}
                                </div>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase">Nota {notes.length - i}</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {note.content}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Stats */}
            <div className="px-4 py-2 bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                    Total: {notes.length} notas
                </span>
                {isSaving && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 animate-pulse">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Auto-guardado
                    </span>
                )}
            </div>
        </div>
    );
};

export default WorkspaceNotesPanel;
