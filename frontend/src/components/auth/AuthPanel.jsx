import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext' // ⬅️ Context 훅 임포트
import './style/AuthPanel.scss' // ⬅️ 스타일 경로 유지
import AuthModal from "./AuthModal"

const AuthPanel = ({
    me, // App.jsx에서 전달받은 상세 사용자 정보
    onFetchMe, // App.jsx에서 전달받은 /me 호출 함수
    requiredRole
}) => {

    // 💡 Context에서 상태와 함수를 직접 가져와 사용
    const { user, isAuthed, handleAuthed, handleLogout } = useAuth();

    const [openModal, setOpenModal] = useState(false)
    const hasRequiredRole = !requiredRole || (user && user.role == requiredRole)
    const navigate = useNavigate()

    const isAdminPage = requiredRole === 'admin'
    const title = isAdminPage ? '관리자 인증' : '로그인'

    // 💡 인증 성공/권한 상태에 따른 리다이렉션 (AuthContext가 대신 처리)
    // AuthContext가 준비된 후, App.jsx의 ProtectedRoute가 리다이렉션을 담당하므로, 
    // 여기서는 AuthPanel이 AuthModal을 닫고 로딩 상태를 관리하는 역할만 수행합니다.

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
                <button type='button' onClick={() => navigate('/')} className='close-btn btn' aria-label='닫기'>X</button>


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
                            {hasRequiredRole ? 'admin' : `권한없음 : ${requiredRole} 필요`}
                        </span>

                        <div className="auth-actions">

                            {hasRequiredRole && (
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
