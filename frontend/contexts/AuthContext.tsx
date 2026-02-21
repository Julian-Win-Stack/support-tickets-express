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
    const [loginError, setLoginError] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);
    const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        me()
        .then((data) => {
            if (data.ok && data.name && data.role) {
                setLoginError(null);
                setRegisterError(null);
                setUser({ name: data.name, role: data.role });
            }
            setLoading(false);
        })
        .catch((error) => {
            console.error(error);
            setLoginError(error instanceof Error ? error.message : 'Failed to load user data');
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoginError(null);
        setLoginSuccessMessage(null);
        try {
            const data = await apiLogin(email, password);
            if (data.name && data.role) {
                setLoginError(null);
                setUser({ name: data.name, role: data.role });
                setLoginSuccessMessage('Login successful');
            } else {
                setLoginError(data.error || 'Failed to login');
            }
        } catch (err) {
            setLoginError(err instanceof Error ? err.message : 'Failed to login');
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
            setLoginError(null);
            setRegisterError(null);
            setLoginSuccessMessage(null);
            setRegisterSuccessMessage(null);
            setUser(null);
        } catch (error) {
            setLoginError(error instanceof Error ? error.message : 'Failed to logout');
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setRegisterError(null);
        setRegisterSuccessMessage(null);
        try {
            await apiRegister(name, email, password);
            setRegisterSuccessMessage('Registration successful');
        } catch (err) {
            setRegisterError(err instanceof Error ? err.message : "Failed to register");
        }
    }, []);

    const value: AuthContextValue = {
        user,
        loading,
        login,
        logout,
        register,
        loginError,
        registerError,
        loginSuccessMessage,
        registerSuccessMessage,
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