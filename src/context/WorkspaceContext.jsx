import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children, lessonId, userId, initialData, lessonConfig }) => {
    const [workspaceId, setWorkspaceId] = useState(initialData?.id || null);
    
    // Configuración base de la lección (definida por el creador)
    const [config, setConfig] = useState(() => {
        try {
            const parsed = typeof lessonConfig === 'string' ? JSON.parse(lessonConfig) : (lessonConfig || {});
            
            // Si no tiene webBlocks, migrar o crear defaults
            if (!parsed.webBlocks) {
                parsed.layoutMode = 'vertical';
                parsed.webBlocks = [
                    { id: 'video_1', type: 'video', title: 'Video & Teoría', description: '', links: [], attachments: [] },
                    { id: 'tab_1', type: 'tab', title: 'Partitura Interactiva', description: '', links: [], attachments: [] },
                    { id: 'notes_1', type: 'notes', title: 'Mis Notas de Estudio', description: '', links: [], attachments: [] }
                ];
            }
            return parsed;
        } catch (e) {
            return {
                layoutMode: 'vertical',
                webBlocks: [
                    { id: 'video_1', type: 'video', title: 'Video & Teoría', description: '', links: [], attachments: [] },
                    { id: 'tab_1', type: 'tab', title: 'Partitura Interactiva', description: '', links: [], attachments: [] },
                    { id: 'notes_1', type: 'notes', title: 'Mis Notas de Estudio', description: '', links: [], attachments: [] }
                ]
            };
        }
    });

    const [layoutConfig, setLayoutConfig] = useState(initialData?.layout_config || {
        panels: [
            { id: 'video', type: 'VIEW', title: 'Video & Teoría', position: 'left', size: 50 },
            { id: 'tab', type: 'TOOL', title: 'Partitura Interactiva', position: 'right', size: 50 },
            { id: 'notes', type: 'WORK', title: 'Mis Notas', position: 'bottom', size: 30 }
        ]
    });
    
    const [settings, setSettings] = useState(initialData?.settings || {
        bpm: 100,
        syncVideoWithTab: true,
        showMetronome: false,
        zoom: 1,
        loopEnabled: false,
        playbackSpeed: 1
    });

    const [notes, setNotes] = useState(initialData?.notes || []);
    const [bookmarks, setBookmarks] = useState(initialData?.bookmarks || []);
    const [isSaving, setIsSaving] = useState(false);

    // Lógica de Bloques / Paneles Activos
    const activePanels = config.webBlocks ? config.webBlocks.map(b => b.type) : [];
    const webBlocks = config.webBlocks || [];

    // Auto-save state
    useEffect(() => {
        const timer = setTimeout(() => {
            saveState();
        }, 3000);
        return () => clearTimeout(timer);
    }, [layoutConfig, settings]);

    const saveState = async () => {
        if (!userId || !lessonId) return;
        setIsSaving(true);
        try {
            await fetch('/harphub/backend/api_harphub.php?action=save_workspace_state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    lesson_id: lessonId,
                    layout_config: layoutConfig,
                    settings: settings
                })
            });
        } catch (error) {
            console.error('Error saving workspace state:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const addNote = async (content, metadata = {}) => {
        if (!workspaceId) return;
        try {
            const resp = await fetch('/harphub/backend/api_harphub.php?action=save_workspace_note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspace_id: workspaceId, content, metadata })
            });
            const data = await resp.json();
            if (data.success) {
                setNotes([{ id: data.note_id, content, metadata, created_at: new Date().toISOString() }, ...notes]);
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const addBookmark = async (type, title, position, metadata = {}) => {
        if (!workspaceId) return;
        try {
            const resp = await fetch('/harphub/backend/api_harphub.php?action=add_workspace_bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspace_id: workspaceId, type, title, position, metadata })
            });
            const data = await resp.json();
            if (data.success) {
                setBookmarks([...bookmarks, { id: data.bookmark_id, type, title, position, metadata }]);
            }
        } catch (error) {
            console.error('Error adding bookmark:', error);
        }
    };

    const deleteBookmark = async (id) => {
        // Implementación futura
        setBookmarks(bookmarks.filter(b => b.id !== id));
    };

    return (
        <WorkspaceContext.Provider value={{
            workspaceId,
            config,
            webBlocks,
            activePanels,
            layoutConfig,
            setLayoutConfig,
            settings,
            setSettings,
            notes,
            addNote,
            bookmarks,
            addBookmark,
            deleteBookmark,
            isSaving
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
