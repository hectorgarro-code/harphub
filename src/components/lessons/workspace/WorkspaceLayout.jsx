import React, { useState } from 'react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import WorkspacePanel from './WorkspacePanel';
import { Video, Music, FileText, Share2, Activity } from 'lucide-react';

const WorkspaceLayout = ({ videoComponent, tabComponent, notesComponent, blocksComponent, seaComponent, linksComponent, attachmentsComponent, practiceComponent }) => {
    const { layoutConfig, activePanels } = useWorkspace();
    const [fullPanel, setFullPanel] = useState(null);

    const iconMap = {
        video: Video,
        tab: Music,
        notes: FileText,
        blocks: Activity,
        social: Share2,
        links: Share2, // Generic for now
        attachments: FileText,
        sea: Music,
        practice: Activity
    };

    // Filter panels that are in the layoutConfig AND are active
    const activeLayoutPanels = layoutConfig.panels.filter(p => activePanels.includes(p.id));

    // If a panel is active but not in layoutConfig (newly enabled), add it to a default position
    const missingPanels = activePanels.filter(id => !layoutConfig.panels.some(p => p.id === id));
    
    const finalPanels = [
        ...activeLayoutPanels,
        ...missingPanels.map(id => ({ id, position: 'right', title: id.toUpperCase(), type: 'TOOL' }))
    ];

    const leftPanels = finalPanels.filter(p => p.position === 'left');
    const rightPanels = finalPanels.filter(p => p.position === 'right');
    const bottomPanels = finalPanels.filter(p => p.position === 'bottom');

    const renderPanelContent = (id) => {
        switch (id) {
            case 'video': return videoComponent;
            case 'tab': return tabComponent;
            case 'notes': return notesComponent;
            case 'blocks': return blocksComponent;
            case 'sea': return seaComponent;
            case 'links': return linksComponent;
            case 'attachments': return attachmentsComponent;
            case 'practice': return practiceComponent;
            default: return <div className="p-4 text-slate-500">Contenido no disponible</div>;
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] w-full flex flex-col gap-4 p-4 overflow-hidden bg-slate-950">
            {/* Top Section (Left and Right Columns) */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Left Column */}
                <div className="flex-[3] flex flex-col gap-4 min-w-0">
                    {leftPanels.map(panel => (
                        <WorkspacePanel
                            key={panel.id}
                            id={panel.id}
                            title={panel.title}
                            type={panel.type}
                            icon={iconMap[panel.id]}
                            isFull={fullPanel === panel.id}
                            onToggleFull={() => setFullPanel(fullPanel === panel.id ? null : panel.id)}
                        >
                            {renderPanelContent(panel.id)}
                        </WorkspacePanel>
                    ))}
                </div>

                {/* Right Column */}
                <div className="flex-[2] flex flex-col gap-4 min-w-0">
                    {rightPanels.map(panel => (
                        <WorkspacePanel
                            key={panel.id}
                            id={panel.id}
                            title={panel.title}
                            type={panel.type}
                            icon={iconMap[panel.id]}
                            isFull={fullPanel === panel.id}
                            onToggleFull={() => setFullPanel(fullPanel === panel.id ? null : panel.id)}
                        >
                            {renderPanelContent(panel.id)}
                        </WorkspacePanel>
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            {bottomPanels.length > 0 && (
                <div className="h-1/3 flex gap-4 min-h-0">
                    {bottomPanels.map(panel => (
                        <WorkspacePanel
                            key={panel.id}
                            id={panel.id}
                            title={panel.title}
                            type={panel.type}
                            icon={iconMap[panel.id]}
                            className="flex-1"
                            isFull={fullPanel === panel.id}
                            onToggleFull={() => setFullPanel(fullPanel === panel.id ? null : panel.id)}
                        >
                            {renderPanelContent(panel.id)}
                        </WorkspacePanel>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkspaceLayout;
