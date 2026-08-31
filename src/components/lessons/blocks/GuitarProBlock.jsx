import React from 'react';
import AlphaTabPlayer from '../../../AlphaTabPlayer';
import { ListMusic } from 'lucide-react';

export default function GuitarProBlock({ content }) {
    if (!content.fileUrl) return (
        <div className="p-12 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 text-red-500 flex flex-col items-center gap-4 text-center">
            <ListMusic size={48} className="opacity-40" />
            <p className="font-black uppercase tracking-widest text-sm">Error en Partitura</p>
            <p className="text-xs font-bold opacity-60">No se encontró el archivo Guitar Pro para esta sección.</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center justify-between px-8">
                <div className="flex items-center gap-3 text-slate-400">
                    <ListMusic size={20} />
                    <h4 className="text-sm font-black uppercase tracking-widest">{content.title || 'Partitura Interactiva'}</h4>
                </div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">AlphaTab Engine v1.5</span>
            </div>
            
            <div className="w-full aspect-video min-h-[600px]">
                <AlphaTabPlayer fileUrl={content.fileUrl} />
            </div>

            {content.notes && (
                <p className="px-8 text-slate-500 italic text-sm font-medium border-l-2 border-white/5 py-1">
                    {content.notes}
                </p>
            )}
        </div>
    );
}
