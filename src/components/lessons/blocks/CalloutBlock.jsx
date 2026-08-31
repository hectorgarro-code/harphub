import React from 'react';
import { AlertCircle, Lightbulb, Zap } from 'lucide-react';

const CalloutBlock = ({ content }) => (
    <div className={`p-8 rounded-[2rem] flex gap-6 ${
        content.style === 'tip' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
        content.style === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
        'bg-slate-800/40 border-white/5 text-slate-300'
    } border`}>
        <div className="shrink-0">
            {content.style === 'tip' && <Lightbulb size={28} />}
            {content.style === 'warning' && <AlertCircle size={28} />}
            {content.style === 'info' && <Zap size={28} />}
        </div>
        <div>
            <h5 className="font-black uppercase tracking-widest text-[10px] mb-2 opacity-80">{content.title || 'Nota Importante'}</h5>
            <p className="text-base font-bold leading-relaxed">{content.text}</p>
        </div>
    </div>
);

export default CalloutBlock;
