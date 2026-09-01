import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useReminders(userId) {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReminders = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const response = await api.request('get_smart_reminders', 'GET', { user_id: userId });
            if (response && response.success && response.reminders) {
                setReminders(response.reminders);
            }
        } catch (error) {
            console.error('Error fetching smart reminders:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    const updateReminder = async (reminderId, status, snoozedUntil = null) => {
        try {
            const result = await api.request('update_reminder_status', 'POST', {
                user_id: userId,
                reminder_id: reminderId,
                status,
                snoozed_until: snoozedUntil
            });

            if (result && result.success) {
                // Optimistic UI update
                setReminders(prev => prev.filter(r => r.id !== reminderId));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating reminder status:', error);
            return false;
        }
    };

    return {
        reminders,
        loading,
        fetchReminders,
        dismissReminder: (id) => updateReminder(id, 'dismissed'),
        snoozeReminder: (id, until) => updateReminder(id, 'snoozed', until),
        archiveReminder: (id) => updateReminder(id, 'archived')
    };
}
