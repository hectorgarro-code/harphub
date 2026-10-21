import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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

    useEffect(() => {
        if (initialData?.id) setWorkspaceId(initialData.id);
        if (initialData?.bookmarks) {
            setBookmarks(initialData.bookmarks);
        } else if (lessonId) {
            try {
                const cached = localStorage.getItem(`harphub_bookmarks_${lessonId}_${userId || 'guest'}`);
                if (cached) setBookmarks(JSON.parse(cached));
            } catch (e) {}
        }
    }, [initialData, lessonId, userId]);

    const [notes, setNotes] = useState(initialData?.notes || []);
    const [bookmarks, setBookmarks] = useState(() => {
        if (initialData?.bookmarks && initialData.bookmarks.length > 0) return initialData.bookmarks;
        if (lessonId) {
            try {
                const cached = localStorage.getItem(`harphub_bookmarks_${lessonId}_${userId || 'guest'}`);
                if (cached) return JSON.parse(cached);
            } catch (e) {}
        }
        return [];
    });
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
            await api.request('save_workspace_state', 'POST', {
                user_id: userId,
                lesson_id: lessonId,
                layout_config: layoutConfig,
                settings: settings
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
            const data = await api.request('save_workspace_note', 'POST', {
                workspace_id: workspaceId,
                content,
                metadata
            });
            if (data && data.success) {
                setNotes([{ id: data.note_id, content, metadata, created_at: new Date().toISOString() }, ...notes]);
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const addBookmark = async (type, title, position, metadata = {}) => {
        const newBookmark = {
            id: Date.now(),
            type,
            title,
            position: String(position || ''),
            metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata
        };

        const updated = [...bookmarks, newBookmark];
        setBookmarks(updated);

        if (lessonId) {
            try {
                localStorage.setItem(`harphub_bookmarks_${lessonId}_${userId || 'guest'}`, JSON.stringify(updated));
            } catch (e) {}
        }

        try {
            const data = await api.request('add_workspace_bookmark', 'POST', {
                workspace_id: workspaceId,
                user_id: userId,
                lesson_id: lessonId,
                type,
                title,
                position: String(position || ''),
                metadata
            });
            if (data && data.success) {
                if (data.workspace_id && !workspaceId) {
                    setWorkspaceId(data.workspace_id);
                }
                if (data.bookmark_id) {
                    newBookmark.id = data.bookmark_id;
                    const synced = updated.map(b => b === newBookmark ? { ...b, id: data.bookmark_id } : b);
                    setBookmarks(synced);
                    if (lessonId) {
                        try {
                            localStorage.setItem(`harphub_bookmarks_${lessonId}_${userId || 'guest'}`, JSON.stringify(synced));
                        } catch (e) {}
                    }
                }
            }
        } catch (error) {
            console.error('Error adding bookmark to backend:', error);
        }
        return newBookmark;
    };

    const deleteBookmark = async (id) => {
        const updated = bookmarks.filter(b => b.id !== id);
        setBookmarks(updated);
        if (lessonId) {
            try {
                localStorage.setItem(`harphub_bookmarks_${lessonId}_${userId || 'guest'}`, JSON.stringify(updated));
            } catch (e) {}
        }
        try {
            await api.request('delete_workspace_bookmark', 'POST', { id });
        } catch (error) {
            console.error('Error deleting bookmark from backend:', error);
        }
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
