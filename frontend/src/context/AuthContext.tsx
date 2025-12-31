/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../config/api';

interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    updateProfile: (name: string, avatarUrl?: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load token and user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Verify token is still valid by fetching profile
            fetchProfile(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async (authToken: string) => {
        try {
            const response = await apiClient.get('/auth/profile', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setUser(response.data);
            setLoading(false);
        } catch (err) {
            // Token invalid, clear auth
            logout();
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.post('/auth/login', { email, password });
            const { user: userData, token: authToken } = response.data;

            setUser(userData);
            setToken(authToken);

            // Store in localStorage
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setLoading(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Login failed';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.post('/auth/register', { email, password, name });
            const { user: userData, token: authToken } = response.data;

            setUser(userData);
            setToken(authToken);

            // Store in localStorage
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setLoading(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Registration failed';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    };

    const updateProfile = async (name: string, avatarUrl?: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.patch('/auth/profile', { name, avatarUrl });
            const updatedUser = response.data;

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setLoading(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Profile update failed';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            setLoading(true);
            setError(null);

            await apiClient.post('/auth/change-password', { currentPassword, newPassword });

            setLoading(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Password change failed';
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    };

    const clearError = () => setError(null);

    const value = React.useMemo(() => ({
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        clearError
    }), [user, token, loading, error]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
