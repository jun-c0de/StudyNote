import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const ProtectRoute = ({
    isAuthed,
    user,
    requiredRole,
    redirect = '/admin/login' // 비인증 시 리다이렉트 기본 경로
}) => {

    const location = useLocation()

    // 1. 인증(로그인) 여부 확인
    if (!isAuthed) {
        // 로그인 안 되었으면 지정된 로그인 페이지로 리다이렉트
        return <Navigate to={redirect} replace state={{ from: location }} />
    }

    // 2. 권한(Role) 확인
    // requiredRole이 지정되어 있는데, 사용자의 역할과 일치하지 않으면
    if (requiredRole && user?.role !== requiredRole) {
        // 권한이 일치하지 않으면 메인 페이지로 리다이렉트 (사용자님 로직)
        return <Navigate to='/' replace />
    }

    // 3. 통과: 인증 및 권한 확인 완료
    return <Outlet />
}

export default ProtectRoute