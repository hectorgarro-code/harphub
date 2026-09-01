import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('harphub_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password, isRegistering = false, email = null) => {
        console.log("Auth hook login/register called", { username, isRegistering });
        setLoading(true);
        try {
            const result = isRegistering 
                ? await api.register(username, password, email)
                : await api.login(username, password);
                
            console.log("Auth API result", result);
            if (result.success) {
                const userObj = {
                    id: result.user_id || result.id,
                    username: result.username,
                    email: result.email,
                    stats: result.stats
                };
                setUser(userObj);
                localStorage.setItem('harphub_user', JSON.stringify(userObj));
            } else if (result.error || result.details) {
                alert(result.details || result.error);
            }
            return result;
        } catch (err) {
            console.error("Auth error", err);
            alert("Error de conexión con el servidor: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = async (credential) => {
        const result = await api.googleLogin(credential);
        if (result.success) {
            const userObj = {
                id: result.user_id,
                username: result.username,
                stats: result.stats
            };
            setUser(userObj);
            localStorage.setItem('harphub_user', JSON.stringify(userObj));
        }
        return result;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('harphub_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
