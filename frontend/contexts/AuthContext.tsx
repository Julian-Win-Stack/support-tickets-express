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
type User = { name: string; role: string; };

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
  };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        me()
        .then((data) => {
            if (data.ok && data.name && data.role) {
                setUser({ name: data.name, role: data.role });
            } else {
                setUser(null);
            }
            setLoading(false);
        })
        .catch((error) => {
            console.error(error);
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await apiLogin(email, password);
        setUser({ name: data.name, role: data.role });
    }, []);

    const logout = useCallback(async () => {
        await apiLogout();
        setUser(null);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const data = await apiRegister(name, email, password);
    }, []);

    const value: AuthContextValue = {
        user,
        loading,
        login,
        logout,
        register,
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