import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        const avatarUrl = localStorage.getItem('avatarUrl');
        if (token && username) {
            setUser({ username, token, role, avatarUrl });
        }
    }, []);

    const login = async (username, password) => {
        const response = await authService.login(username, password);
        const { token, role, avatarUrl } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        if (avatarUrl) localStorage.setItem('avatarUrl', avatarUrl);
        setUser({ username, token, role, avatarUrl });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('avatarUrl');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
