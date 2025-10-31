import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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

    // 로그아웃 처리 함수를 먼저 useCallback으로 정의
    const handleLogout = useCallback(async () => {
        try {
            // 서버 측 로그아웃 호출 (실패해도 로컬 클린업 진행)
            await apiLogout();
        } catch (error) {
            console.warn("Logout API call failed but proceeding with local cleanup:", error);
        } finally {
            // 로컬 상태 클린업
            setUser(null);
            setToken(null);
            setMe(null);
            clearAuthStorage();
            // isAuthReady는 다음 isAuthed 변경 useEffect에서 처리되거나,
            // 이 로그아웃 자체가 인증 검증을 종료하므로 true로 설정
            setIsAuthReady(true);
        }
    }, []); // 💡 의존성: 변경되지 않으므로 빈 배열

    // 상세 사용자 정보 조회 (/me) 함수를 useCallback으로 정의
    const handleFetchMe = useCallback(async () => {
        // 이미 인증되지 않은 경우 바로 준비 완료
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
            // 에러 발생 시 로그아웃 함수 호출
            handleLogout();
        } finally {
            setIsAuthReady(true);
        }
    }, [isAuthed, handleLogout]); // 💡 의존성: isAuthed와 handleLogout 포함

    // 로그인/회원가입 성공 시 처리 함수를 useCallback으로 정의
    const handleAuthed = useCallback(async ({ user: userData, token: tokenData }) => {
        try {
            // 로컬 상태 및 스토리지 업데이트
            setUser(userData);
            setToken(tokenData ?? null);
            saveAuthToStorage({ user: userData, token: tokenData });

            // 상세 정보 조회는 토큰 상태 변경으로 useEffect에서 처리되도록 유도하거나,
            // 여기서 직접 호출 (직접 호출하는 경우, 위의 handleFetchMe의 로직에 따라 isAuthed 변경을 기다려야 할 수 있음)
            // 여기서는 상태를 변경하여 useEffect가 발동하도록만 처리 (클린한 방법)
            // handleFetchMe(); 
        } catch (error) {
            console.error("Authentication success but failed to fetch detailed user info:", error);
        }
    }, []); // 💡 의존성: 변경되지 않으므로 빈 배열

    // 컴포넌트 마운트 시 최초 인증 상태 확인 및 /me 호출
    useEffect(() => {
        if (isAuthed) {
            handleFetchMe(); // isAuthed가 true일 때만 호출
        } else {
            // 토큰이 없는 경우 바로 준비 완료
            setIsAuthReady(true);
        }
    }, [isAuthed, handleFetchMe]); // 💡 의존성: isAuthed와 메모이제이션된 handleFetchMe 포함

    // Provider Value를 useMemo로 감싸서 전달
    const contextValue = useMemo(() => ({
        user,
        token,
        me,
        isAuthed,
        isAuthReady,
        // useCallback으로 메모이제이션된 함수들을 전달
        handleAuthed,
        handleLogout,
        handleFetchMe,
    }), [user, token, me, isAuthed, isAuthReady, handleAuthed, handleLogout, handleFetchMe]);
    // 💡 의존성: 함수들도 useMemo의 의존성 배열에 포함하여, 함수 자체가 변경될 때만 contextValue가 갱신되도록 합니다.
    // (useCallback 덕분에 함수 자체는 불필요하게 변경되지 않습니다.)

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
