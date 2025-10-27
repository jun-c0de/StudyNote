import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// AuthPanel의 스타일은 이 파일에 정의된 클래스(.admin-wrap, .inner 등)에 의존합니다.
import './style/AuthPanel.scss'
import AuthModal from "./AuthModal"

const AuthPanel = ({
    // onClosePanel 제거됨
    isAuthed,
    user,
    me,
    onFetchMe,
    onLogout,
    onAuthed,
    requiredRole
}) => {

    // AuthModal 열림/닫힘 상태: 페이지에 들어왔을 때 기본적으로 닫아두고 버튼을 눌러 열도록 합니다.
    const [openModal, setOpenModal] = useState(false)

    const hasRequiredRole = !requiredRole || (user && user.role == requiredRole)
    const navigate = useNavigate()

    const isAdminPage = requiredRole === 'admin'
    const title = isAdminPage ? '관리자 인증' : '로그인'

    // 💡 중요: 인증 성공/권한 상태에 따른 리다이렉션 (페이지 이동 방식)
    useEffect(() => {
        // 이미 인증되었고, user 정보가 있을 경우 대시보드로 이동
        if (isAuthed && user) {

            if (isAdminPage) {
                // 관리자 인증 페이지에서, 실제 관리자 권한이 있는 경우
                if (user.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true })
                }
                // 관리자 인증 페이지에서, 일반 사용자 권한만 있는 경우
                else {
                    // 권한 없음 페이지 또는 일반 사용자 대시보드로 이동
                    navigate('/user/dashboard', { replace: true })
                }
            } else {
                // 일반 로그인 페이지 (이 라우트에서는 사용되지 않지만 예외 처리)
                navigate('/user/dashboard', { replace: true })
            }
        }

        // 의존성 배열에 isAuthed와 user가 포함되어야 상태 변경에 반응합니다.
    }, [isAuthed, user, isAdminPage, navigate])

    // AuthModal이 열려있다면 AuthModal을 오버레이로 렌더링
    // AuthModal이 닫히면 AuthPanel의 관리자 인증 화면이 아래에 깔리게 됩니다.
    if (openModal) {
        return (
            <AuthModal
                open={openModal}
                // AuthModal 닫기 시 AuthPanel 화면이 보이도록 false로 설정
                onClose={() => setOpenModal(false)}
                onAuthed={onAuthed}
            />
        )
    }

    // 💡 AuthModal이 닫히면 이 AuthPanel 화면이 나타납니다.
    // 이 화면이 스크린샷 3처럼 보이도록 CSS가 잘 적용되어 있어야 합니다.
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
                            <button className="btn" onClick={onLogout}>로그아웃</button>
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