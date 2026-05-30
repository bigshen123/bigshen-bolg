import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';

/**
 * 用户认证Hook
 */
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('blog-user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('blog-token');
    });

    const isAuthenticated = !!token && !!user;

    const login = useCallback((userData: User, tokenStr: string) => {
        setUser(userData);
        setToken(tokenStr);
        localStorage.setItem('blog-user', JSON.stringify(userData));
        localStorage.setItem('blog-token', tokenStr);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('blog-user');
        localStorage.removeItem('blog-token');
    }, []);

    const updateUser = useCallback((userData: User) => {
        setUser(userData);
        localStorage.setItem('blog-user', JSON.stringify(userData));
    }, []);

    return {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUser,
    };
};
