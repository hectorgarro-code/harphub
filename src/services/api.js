const API_URL = import.meta.env.MODE === 'development'
    ? 'http://localhost/harphub/backend/api_harphub.php'
    : './backend/api_harphub.php';

const api = {
    async request(action, method = 'GET', data = null) {
        const options = {
            method,
            headers: {},
        };

        let url = API_URL;
        
        if (method === 'GET') {
            const params = new URLSearchParams({ action, ...data });
            url += `?${params.toString()}`;
        } else {
            if (data instanceof FormData) {
                options.body = data;
                // No poner Content-Type, el navegador lo hará con el boundary correcto
            } else {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify({ action, ...data });
            }
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    // Lecciones
    getLessons(userId) {
        return this.request('lessons', 'GET', { user_id: userId });
    },
    
    addLesson(data) {
        return this.request('add_lesson', 'POST', data);
    },

    updateLesson(data) {
        return this.request('update_lesson', 'POST', data);
    },

    deleteLesson(id) {
        return this.request('delete_lesson', 'POST', { id });
    },

    // Usuario
    login(username, password) {
        return this.request('login', 'POST', { username, password });
    },

    register(username, password, email) {
        return this.request('register', 'POST', { username, password, email });
    },

    googleLogin(credential) {
        return this.request('google_login', 'POST', { credential });
    },

    // Backing Tracks
    getBackingTracks(userId) {
        return this.request('get_backing_tracks', 'GET', { user_id: userId });
    },

    uploadBackingTrack(formData) {
        return this.request('upload_backing_track', 'POST', formData);
    },

    // Perfiles y Social
    getProfile(username, currentUserId = null) {
        return this.request('get_profile', 'GET', { username, current_user_id: currentUserId });
    },

    updateProfile(data) {
        return this.request('update_profile', 'POST', data);
    },

    toggleFollow(followerId, followingId) {
        return this.request('toggle_follow', 'POST', { follower_id: followerId, following_id: followingId });
    },
    
    getFeed(userId, type = 'all', page = 0) {
        return this.request('get_feed', 'GET', { user_id: userId, type, page });
    },

    startPracticeSession(data) {
        return this.request('start_practice_session', 'POST', data);
    },

    endPracticeSession(data) {
        return this.request('end_practice_session', 'POST', data);
    },

    getActivities(userId, type = 'all') {
        return this.request('get_feed', 'GET', { user_id: userId, type });
    },

    getActivityCards(userId, type = 'all') {
        return this.request('get_activity_cards', 'GET', { user_id: userId, type });
    },

    logPractice(data) {
        return this.request('log_practice', 'POST', data);
    },

    // Social Graph New Actions
    getDiscovery(userId) {
        return this.request('get_discovery', 'GET', { user_id: userId });
    },

    toggleSave(userId, entityType, entityId) {
        return this.request('toggle_save', 'POST', { user_id: userId, entity_type: entityType, entity_id: entityId });
    },

    // Learning Paths
    getLearningPaths(userId, filter = 'all') {
        return this.request('get_learning_paths', 'GET', { user_id: userId, filter });
    },
    getLearningPath(id, userId) {
        return this.request('get_learning_path_detailed', 'GET', { id, user_id: userId });
    },
    saveLearningPath(data) {
        return this.request('save_learning_path', 'POST', data);
    },
    forkLearningPath(pathId, userId) {
        return this.request('fork_learning_path', 'POST', { path_id: pathId, user_id: userId });
    },
    updatePathProgress(pathId, userId, nodeId) {
        return this.request('update_path_progress', 'POST', { path_id: pathId, user_id: userId, node_id: nodeId });
    },

    forkLesson(userId, lessonId) {
        return this.request('fork_lesson', 'POST', { user_id: userId, lesson_id: lessonId });
    },

    getSavedItems(userId) {
        return this.request('get_saved_items', 'GET', { user_id: userId });
    },

    getPracticeStats(userId) {
        return this.request('get_practice_stats', 'GET', { user_id: userId });
    }
};

export default api;
