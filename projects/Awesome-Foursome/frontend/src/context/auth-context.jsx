import { createContext, useContext, useState } from "react";

const AuthContext = createContext();
const STORAGE_KEY = "auth_session";

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(loadFromStorage);

    // session shape: { token: string, user: { uid, username, email, role } }
    const login = (sessionData) => {
        setSession(sessionData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const user = session?.user ?? null;
    const isAdmin = user?.role === "admin";

    const authHeaders = session?.token
        ? { Authorization: `Bearer ${session.token}` }
        : {};

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, authHeaders }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
