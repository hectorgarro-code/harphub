import { useState, useCallback } from 'react';
import api from '../services/api';

export function useLearningPath(userId) {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const [pathNodes, setPathNodes] = useState([]);
    const [pathProgress, setPathProgress] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPaths = useCallback(async (filter = 'all') => {
        try {
            setLoading(true);
            const response = await api.request(`action=get_learning_paths&user_id=${userId}&filter=${filter}`);
            if (response.success) {
                setPaths(response.paths || []);
            }
        } catch (error) {
            console.error('Error fetching paths:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchPathDetails = useCallback(async (pathId) => {
        if (!pathId) return;
        try {
            setLoading(true);
            const response = await api.request(`action=get_learning_path_detailed&id=${pathId}&user_id=${userId}`);
            if (response.success) {
                setCurrentPath(response.path);
                setPathNodes(response.nodes || []);
                setPathProgress(response.progress);
            }
        } catch (error) {
            console.error('Error fetching path details:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const updateProgress = async (pathId, nodeId, action = 'complete') => {
        // Optimistic UI updates could go here
        try {
            const result = await api.request('action=update_path_progress', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    path_id: pathId,
                    node_id: nodeId,
                    action
                })
            });
            if (result.success) {
                // Refresh progress after updating
                await fetchPathDetails(pathId);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating path progress:', error);
            return false;
        }
    };

    return {
        paths,
        currentPath,
        pathNodes,
        pathProgress,
        loading,
        fetchPaths,
        fetchPathDetails,
        updateProgress
    };
}
