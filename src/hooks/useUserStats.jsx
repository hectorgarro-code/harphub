import { useState, useEffect } from 'react';
import api from '../services/api';

export function useUserStats(user) {
    const [stats, setStats] = useState({ points: 0, streak: 0, practiceHours: 0 });
    const [achievements, setAchievements] = useState([]);

    const fetchStats = async () => {
        if (!user) return;
        try {
            const data = await api.request('get_user_stats', 'GET', { user_id: user.id });
            if (data.stats) setStats(data.stats);
            if (data.achievements) setAchievements(data.achievements);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    const addPoints = async (pts) => {
        if (!user) return;
        try {
            await api.request('add_points', 'POST', { user_id: user.id, points: pts });
            fetchStats();
        } catch (error) {
            console.error("Error adding points:", error);
        }
    };

    const unlockAchievement = async (slug) => {
        if (!user) return;
        try {
            await api.request('unlock_achievement', 'POST', { user_id: user.id, achievement_slug: slug });
            fetchStats();
        } catch (error) {
            console.error("Error unlocking achievement:", error);
        }
    };

    return { stats, achievements, addPoints, unlockAchievement, refreshStats: fetchStats };
}
