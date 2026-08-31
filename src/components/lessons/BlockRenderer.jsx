import React from 'react';
import VideoBlock from './blocks/VideoBlock';
import CalloutBlock from './blocks/CalloutBlock';
import PracticeBlock from './blocks/PracticeBlock';
import SeaTabBlock from './blocks/SeaTabBlock';
import GuitarProBlock from './blocks/GuitarProBlock';

const TextBlock = ({ content }) => (
    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg font-medium">
        {content.text}
    </div>
);

const BlockRenderer = ({ blocks, onPractice }) => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            {blocks.map((block, index) => {
                const key = block.id || `block-${index}`;
                switch (block.type) {
                    case 'text': return <TextBlock key={key} content={block.content} />;
                    case 'video': return <VideoBlock key={key} content={block.content} />;
                    case 'callout': return <CalloutBlock key={key} content={block.content} />;
                    case 'practice': return <PracticeBlock key={key} content={block.content} onPractice={onPractice} />;
                    case 'sea-tab': return <SeaTabBlock key={key} content={block.content} />;
                    case 'gp-tab': return <GuitarProBlock key={key} content={block.content} />;
                    case 'divider': return <div key={key} className="h-[1px] w-full bg-white/5 my-8"></div>;
                    default: return <div key={key} className="p-4 bg-red-500/10 text-red-500 rounded-xl">Bloque no soportado: {block.type}</div>;
                }
            })}
        </div>
    );
};

export default BlockRenderer;
