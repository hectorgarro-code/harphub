import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCollections(user) {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshCollections = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.request('get_collections', 'GET', { user_id: user.id });
            if (res.success) {
                setCollections(res.collections);
            }
        } catch (error) {
            console.error("Error loading collections:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCollections();

        window.addEventListener('collections-updated', refreshCollections);
        window.addEventListener('lesson-updated', refreshCollections);
        return () => {
            window.removeEventListener('collections-updated', refreshCollections);
            window.removeEventListener('lesson-updated', refreshCollections);
        };
    }, [user]);

    return { collections, loading, refreshCollections };
}
