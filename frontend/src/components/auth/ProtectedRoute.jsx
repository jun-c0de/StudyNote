import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// 이 컴포넌트는 사용자의 인증 상태와 역할에 따라 특정 경로에 대한 접근을 제어합니다.
// ProtectRoute는 라우팅 설정을 담당하는 부모 컴포넌트(예: App.jsx)에서 사용됩니다.
const ProtectRoute = ({
    isAuthed, // useAuth()에서 가져온 사용자의 인증 여부 (true/false)
    user,     // useAuth()에서 가져온 현재 사용자 객체 (role 정보 포함)
    requiredRole, // 이 경로에 접근하기 위해 필요한 역할 (예: 'admin', 'user')
    redirect = '/admin/login' // 비인증 시 리다이렉트할 기본 경로
}) => {

    const location = useLocation()

    // 1. 인증(로그인) 상태 확인
    if (!isAuthed) {
        // 로그인되어 있지 않다면 지정된 로그인 페이지로 리다이렉트합니다.
        // state에 현재 위치를 저장하여 로그인 후 원래 위치로 돌아올 수 있도록 합니다.
        return <Navigate to={redirect} replace state={{ from: location }} />
    }

    // 2. 역할(권한) 확인
    // 필수 역할(requiredRole)이 지정되었는데, 사용자 역할이 일치하지 않는 경우
    if (requiredRole && user?.role !== requiredRole) {
        // 권한이 없으므로 메인 페이지('/')로 리다이렉트하여 접근을 거부합니다.
        return <Navigate to='/' replace />
    }

    // 3. 모든 조건을 통과하면 요청된 페이지를 렌더링합니다.
    return <Outlet />
}

export default ProtectRoute
