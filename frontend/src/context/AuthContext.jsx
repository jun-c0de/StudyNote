import { createContext, useState, useEffect, useCallback } from "react";
import { fetchMe, saveAuthToStorage, clearAuthStorage } from "../api/axios";

export const AuthContext = createContext({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAdmin: false
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = useCallback((userData, token) => {
        setUser(userData);
        setToken(token);
        saveAuthToStorage({ user: userData, token });
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        clearAuthStorage();
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) return;

            try {
                const { user } = await fetchMe();
                setUser(user);
                setToken(storedToken);
            } catch {
                logout();
            }
        };
        initAuth();
    }, [logout]);

    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
