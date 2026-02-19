'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';

import { login as apiLogin, logout as apiLogout, register as apiRegister, me } from "@/lib/api";
import type { AuthUser, AuthContextValue } from "@/types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        me()
        .then((data) => {
            if (data.ok && data.name && data.role) {
                setError(null);
                setUser({ name: data.name, role: data.role });
            } 
            setLoading(false);
        })
        .catch((error) => {
            console.error(error);
            setError(error instanceof Error ? error.message : 'Failed to load user data');
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        try {
            const data = await apiLogin(email, password);
            if (data.name && data.role) {
                setError(null);
                setUser({ name: data.name, role: data.role });
                setSuccessMessage('Login successful');
            } else {
                setError(data.error || 'Failed to login');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to login');
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
            setError(null);
            setUser(null);
            setSuccessMessage('Logout successful');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to logout');
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setError(null);
        try {
            await apiRegister(name, email, password);
            setSuccessMessage('Registration successful');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register");
        }
    }, []);

    const value: AuthContextValue = {
        user,
        loading,
        login,
        logout,
        register,
        error,
        successMessage,
    };

    return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}