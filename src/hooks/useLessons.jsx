import { useState, useEffect } from 'react';
import api from '../services/api';

export function useLessons(user) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshLessons = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await api.getLessons(user.id);
            setItems(data);
        } catch (error) {
            console.error("Error loading lessons:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshLessons();

        window.addEventListener('lesson-updated', refreshLessons);
        return () => {
            window.removeEventListener('lesson-updated', refreshLessons);
        };
    }, [user]);

    const addItem = async (newItem) => {
        let finalData = newItem;
        if (newItem instanceof FormData) {
            finalData.append('user_id', user.id);
        } else {
            finalData = { ...newItem, user_id: user.id };
        }
        const result = await api.addLesson(finalData);
        if (result.success) {
            refreshLessons();
        }
        return result;
    };

    const updateItem = async (updatedItem) => {
        const result = await api.updateLesson(updatedItem);
        if (result.success) {
            refreshLessons();
        }
        return result;
    };

    const deleteItem = async (id) => {
        const result = await api.deleteLesson(id);
        if (result.success) {
            refreshLessons();
        }
        return result;
    };

    return { items, loading, addItem, updateItem, deleteItem, refreshLessons };
}
