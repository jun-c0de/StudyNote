import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Context 훅 임포트

// 💡 경로 수정: pages에서 src로 올라가 components/auth/style 폴더 참조
import './style/AuthPanel.scss';
// 💡 경로 수정: pages에서 src로 올라가 components/auth/AuthModal 참조
import AuthModal from "./AuthModal";

const AuthPanel = ({
    me, // App.jsx에서 전달받은 상세 사용자 정보 (필요시 사용)
    onFetchMe, // App.jsx에서 전달받은 /me 호출 함수 (버튼 액션용)
    requiredRole
}) => {

    // 💡 Context에서 상태와 함수를 직접 가져와 사용
    const { user, isAuthed, handleAuthed, handleLogout } = useAuth();

    // 💡 AuthModal의 열림 상태를 관리하며, 기본값은 false로 설정하여 버튼 클릭 시 열리도록 합니다.
    // 기존 코드의 AuthPanel 렌더링 방식에 맞춰 openModal 상태 관리
    const [openModal, setOpenModal] = useState(false)
    const hasRequiredRole = !requiredRole || (user && user.role === requiredRole)
    const navigate = useNavigate()

    const isAdminPage = requiredRole === 'admin'
    const title = isAdminPage ? '관리자 인증' : '로그인'

    // 💡 인증이 완료되면 메인 경로로 리다이렉트 (ProtectedRoute가 처리하지 않는 경우를 대비)
    // 이 AuthPanel 컴포넌트 자체가 인증이 안 됐을 때만 보여지는 페이지라면,
    // 인증 성공 후 대시보드로 이동하는 로직을 추가합니다.
    useEffect(() => {
        if (isAuthed && user) {
            // requiredRole이 'admin'이면 관리자 대시보드로, 아니면 사용자 대시보드로 이동
            if (isAdminPage && user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true })
            } else if (!isAdminPage) {
                navigate('/user/dashboard', { replace: true })
            }
            // 참고: 권한이 없는데 관리자 페이지에 접근하면 ProtectRoute에서 '/'로 보낼 것입니다.
        }
    }, [isAuthed, user, isAdminPage, navigate])

    // AuthModal이 열려있다면 AuthModal을 오버레이로 렌더링
    if (openModal) {
        return (
            <AuthModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onAuthed={handleAuthed} // Context 함수 사용
            />
        )
    }

    // AuthModal이 닫혔을 때 (AuthPanel 본체가 보일 때)
    return (
        <section className='admin-wrap'>
            <div className="inner">

                <header className='admin-head'>
                    <h1 className='title'>{title}</h1>
                    <p>
                        로그인/회원가입을 진행하여 서비스를 시작하세요.
                    </p>
                </header>

                {/* 닫기 버튼은 이전 페이지로 이동하도록 설정 */}
                <button type='button' onClick={() => navigate(-1)} className='close-btn btn' aria-label='닫기'>X</button>


                {!isAuthed ? (
                    <div className="auth-row">
                        {/* 로그인 전 - 버튼 클릭 시 AuthModal 열기 */}
                        <button
                            onClick={() => setOpenModal(true)}
                            className="btn btn-primary">
                            로그인 / 회원가입
                        </button>

                    </div>
                ) : (
                    <div className="auth-row">
                        {/* 로그인 후 (AuthModal이 닫혔을 때) */}
                        <span>안녕하세요 <b>{user?.displayName || user?.email}</b> </span>
                        <span
                            className={`badge ${hasRequiredRole ? 'badge-ok' : 'badge-warn'} `}>
                            {hasRequiredRole ? user.role : `권한없음 : ${requiredRole} 필요`}
                        </span>

                        <div className="auth-actions">

                            {hasRequiredRole && onFetchMe && (
                                <button className="btn" onClick={onFetchMe}>/me 호출</button>
                            )}
                            <button className="btn" onClick={handleLogout}>로그아웃</button>
                        </div>
                    </div>
                )}


                {/* 권한 없음 경고 */}
                {!hasRequiredRole && isAuthed && (
                    <div className="alert alert-warn">
                        현재 계정에는 관리자 권한이 없습니다. 관리자 승인이 필요합니다.
                    </div>
                )}

                {/* 사용자 정보 예시 */}
                {me && (
                    <pre className="code">
                        {JSON.stringify(me, null, 2)}
                    </pre>
                )}
            </div>
        </section>

    )
}

export default AuthPanel
