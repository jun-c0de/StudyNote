import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
    fetchMe as apiFetchMe,
    logout as apiLogout,
    saveAuthToStorage,
    clearAuthStorage
} from "../api/axios"; // ⬅️ axios.js에서 API 함수 임포트

// 1. Context 생성
export const AuthContext = createContext(null);

// 사용자 정보를 localStorage에서 로드하는 초기 함수
const loadUserFromStorage = () => {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
};

// 토큰 정보를 localStorage에서 로드하는 초기 함수
const loadTokenFromStorage = () => localStorage.getItem('token');

// 2. Custom Hook
export const useAuth = () => useContext(AuthContext);

// 3. Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(loadUserFromStorage);
    const [token, setToken] = useState(loadTokenFromStorage);
    const [me, setMe] = useState(null); // /me 응답으로 받은 상세 사용자 정보
    const [isAuthReady, setIsAuthReady] = useState(!!token); // 최초 인증 상태 확인 완료 여부

    const isAuthed = !!token;

    // 인증 완료 처리 (로그인, 회원가입 성공 시)
    const handleAuthed = async ({ user: userData, token: tokenData }) => {
        try {
            setUser(userData);
            setToken(tokenData ?? null);
            saveAuthToStorage({ user: userData, token: tokenData });

            // 상세 사용자 정보 (me)를 즉시 가져옴
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
            console.warn("Logout API call failed but proceeding with local logout:", error);
        } finally {
            setUser(null);
            setToken(null);
            setMe(null);
            clearAuthStorage();
            setIsAuthReady(false); // 로그아웃 후 다시 로그인해야 함
        }
    };

    // 사용자 상세 정보 조회
    const handleFetchMe = async () => {
        try {
            const { user } = await apiFetchMe();
            setMe(user);
        } catch (error) {
            // 토큰이 유효하지 않거나 만료된 경우
            setMe({ error: '내 정보 조회 실패' });
            console.error("Fetch Me Failed, forcing local logout:", error);
            handleLogout(); // 강제 로그아웃
        }
    };

    // 컴포넌트 마운트 시 토큰이 있다면 /me 정보를 가져와 상태를 동기화
    useEffect(() => {
        if (isAuthed && !me) {
            handleFetchMe();
        } else if (!isAuthed) {
            setIsAuthReady(true);
        }
    }, [isAuthed]); // me가 null일 때만 호출되도록 의존성 배열 조정

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

    // isAuthReady가 false일 때 로딩 스피너를 보여줄 수 있지만, 여기서는 null 반환
    if (!isAuthReady && isAuthed) {
        // 토큰이 있지만 아직 /me 정보를 못 가져왔다면 로딩 중으로 간주 (UI에 맞게 조정 필요)
        return <div>로딩 중...</div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
