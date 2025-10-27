import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ProtectRoute를 ProtectedRoute로 리네임하고 Context를 사용하도록 수정
const ProtectedRoute = ({ requiredRole = null, redirect = '/admin/login', children }) => {
    const { user, isAuthReady, isAuthed } = useAuth();

    // Context 초기화 대기
    if (!isAuthReady) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>인증 상태 확인 중...</div>;
    }

    // 1. 인증되지 않은 경우, 지정된 리다이렉트 경로로 이동 (기본값: /admin/login)
    if (!isAuthed) {
        return <Navigate to={redirect} replace />;
    }

    // 2. 인증되었지만, 역할(Role) 요구 사항이 있는 경우 검사
    if (requiredRole) {
        const hasRequiredRole = user?.role === requiredRole;

        if (!hasRequiredRole) {
            // 권한이 없으면 일반 사용자 대시보드로 이동 (또는 권한 없음 페이지로)
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    // 3. 인증 및 권한 확인 완료
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
