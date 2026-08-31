import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const PracticeTrackerContext = createContext();

export function PracticeTrackerProvider({ children, user, lessonId, instrument = 'harmonica' }) {
    const [sessionId, setSessionId] = useState(null);
    const statsRef = useRef({
        maxBpm: 0,
        loopsUsed: 0,
        bookmarksUsed: 0,
        startTime: Date.now()
    });

    useEffect(() => {
        if (!user || !lessonId) return;

        const startSession = async () => {
            try {
                const res = await api.startPracticeSession({
                    user_id: user.id,
                    lesson_id: lessonId,
                    instrument
                });
                if (res.success) {
                    setSessionId(res.session_id);
                }
            } catch (err) {
                console.error("Failed to start practice session:", err);
            }
        };

        startSession();

        return () => {
            if (sessionId) endSession(sessionId, statsRef.current);
        };
    }, [user, lessonId]);

    const endSession = async (sid, stats) => {
        const durationMinutes = Math.round((Date.now() - stats.startTime) / 60000);
        if (durationMinutes < 1) return;

        try {
            await api.endPracticeSession({
                session_id: sid,
                duration_minutes: durationMinutes,
                max_bpm: stats.maxBpm,
                loops_used: stats.loopsUsed,
                metadata: {
                    bookmarks_used: stats.bookmarksUsed
                }
            });
        } catch (err) {
            console.error("Failed to end practice session:", err);
        }
    };

    const trackBpm = (bpm) => {
        if (bpm > statsRef.current.maxBpm) {
            statsRef.current.maxBpm = bpm;
        }
    };

    const trackLoop = () => {
        statsRef.current.loopsUsed += 1;
    };

    const trackBookmark = () => {
        statsRef.current.bookmarksUsed += 1;
    };

    return (
        <PracticeTrackerContext.Provider value={{ trackBpm, trackLoop, trackBookmark }}>
            {children}
        </PracticeTrackerContext.Provider>
    );
}

export const usePracticeTracker = () => {
    const context = useContext(PracticeTrackerContext);
    if (!context) return { trackBpm: () => {}, trackLoop: () => {}, trackBookmark: () => {} };
    return context;
};
