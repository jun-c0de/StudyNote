import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
    fetchMe as apiFetchMe,
    logout as apiLogout,
    saveAuthToStorage,
    clearAuthStorage
} from "../api/axios";

// 1. Context 생성
export const AuthContext = createContext(null);

// 초기 상태 로드 유틸리티
const loadUserFromStorage = () => {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
};
const loadTokenFromStorage = () => localStorage.getItem('token');

// 2. Custom Hook
export const useAuth = () => useContext(AuthContext);

// 3. Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadUserFromStorage);
    const [token, setToken] = useState(loadTokenFromStorage);
    const [me, setMe] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const isAuthed = !!token;

    // 상세 사용자 정보 조회 (/me)
    const handleFetchMe = async () => {
        if (!isAuthed) {
            setMe(null);
            setIsAuthReady(true);
            return;
        }

        try {
            const { user: detailedUser } = await apiFetchMe();
            setMe(detailedUser);
            // user 정보 업데이트 (role 등 최신화)
            setUser(prev => ({ ...prev, ...detailedUser }));
        } catch (error) {
            setMe({ error: '내 정보 조회 실패' });
            console.error("Fetch Me Failed, forcing local logout:", error);
            handleLogout();
        } finally {
            setIsAuthReady(true);
        }
    };

    // 로그인/회원가입 성공 시 처리
    const handleAuthed = async ({ user: userData, token: tokenData }) => {
        try {
            setUser(userData);
            setToken(tokenData ?? null);
            saveAuthToStorage({ user: userData, token: tokenData });

            await handleFetchMe();
        } catch (error) {
            console.error("Authentication success but failed to fetch detailed user info:", error);
        }
    };

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.warn("Logout API call failed but proceeding with local cleanup:", error);
        } finally {
            setUser(null);
            setToken(null);
            setMe(null);
            clearAuthStorage();
            setIsAuthReady(true);
        }
    };

    // 컴포넌트 마운트 시 최초 인증 상태 확인 및 /me 호출
    useEffect(() => {
        if (isAuthed) {
            handleFetchMe();
        } else {
            setIsAuthReady(true);
        }
    }, [isAuthed]);

    const contextValue = useMemo(() => ({
        user,
        token,
        me,
        isAuthed,
        isAuthReady,
        handleAuthed,
        handleLogout,
        handleFetchMe,
    }), [user, token, me, isAuthed, isAuthReady]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;