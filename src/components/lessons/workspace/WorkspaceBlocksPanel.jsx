import React from 'react';
import BlockRenderer from '../BlockRenderer';

const WorkspaceBlocksPanel = ({ blocks }) => {
    return (
        <div className="h-full bg-slate-900/10 p-6">
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
                {blocks && blocks.length > 0 ? (
                    blocks.map((block, i) => (
                        <div key={block.id || i} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                            <BlockRenderer block={block} />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 opacity-30 italic text-sm text-slate-500">
                        Esta lección no contiene bloques de teoría adicionales.
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceBlocksPanel;
