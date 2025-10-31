import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 🚨 AuthContext 경로 오류가 지속되어도, React 구조상 이 경로가 올바르다고 가정하고 유지합니다.
// (일반적인 src/pages/ -> src/context/ 구조)
import { useAuth } from '../../context/AuthContext';

// 🚨 SCSS 경로 오류 수정: 현재 파일 시스템에서 찾을 수 없어 컴파일을 위해 임시로 주석 처리합니다.
import './style/AuthPanel.scss'; 

/**
 * AuthModal: 로그인/회원가입 기능을 처리하는 모달 컴포넌트
 * 이 컴포넌트는 단일 파일 제약 조건으로 인해 AuthPanel 내부에 포함됩니다.
 */
const AuthModal = ({ open, onClose, onAuthed }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 💡 인증 성공 시 토큰을 Context로 전달합니다.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            console.log(isLogin ? '로그인 시도 중...' : '회원가입 시도 중...');

            await new Promise(resolve => setTimeout(resolve, 1000));

            // 🚨 const 오류 수정: let을 사용하여 재할당 가능
            let fakeRole = 'user'; // 기본 역할
            if (email.includes('admin')) {
                fakeRole = 'admin'; // 'admin' 이메일 포함 시 관리자 역할 부여 (테스트용)
            }

            // 🚨 토큰을 포함한 응답을 시뮬레이션
            const fakeResponse = {
                user: { email, role: fakeRole, displayName: email.split('@')[0] },
                token: 'fake-jwt-' + Math.random().toString(36).substring(7)
            };

            onAuthed(fakeResponse); // Context 함수 호출
            onClose(); // 모달 닫기
        } catch (err) {
            console.error('인증 오류:', err);
            setError('인증에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        // 🎯 기존 SCSS 클래스명을 사용하도록 복구 (CSS가 없는 상태에서는 기본 스타일로 보입니다)
        <div className="auth-modal-overlay">
            <div className="auth-modal-content">
                <div className="auth-modal-header">
                    <h2>{isLogin ? '로그인' : '회원가입'}</h2>
                    <button onClick={onClose} className="close-button">
                        &times;
                    </button>
                </div>

                {isLoading && (
                    <div className="loading-indicator">처리 중...</div>
                )}

                {error && (
                    <div className="auth-error-message" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="이메일 (admin 포함 시 관리자)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="auth-input"
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="auth-input"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary" // 기존 스타일 클래스 사용
                    >
                        {isLoading ? '처리 중...' : isLogin ? '로그인 하기' : '회원가입 하기'}
                    </button>
                </form>
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="toggle-mode-button"
                    disabled={isLoading}
                >
                    {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                </button>
            </div>
        </div>
    );
};
// End of AuthModal

const AuthPanel = ({
    me,
    onFetchMe,
    requiredRole
}) => {
    // 💡 Context에서 상태와 함수를 직접 가져와 사용
    const { user, isAuthed, handleAuthed, handleLogout } = useAuth();

    // 💡 AuthModal의 열림 상태를 관리
    const [openModal, setOpenModal] = useState(false)
    const hasRequiredRole = !requiredRole || (user && user.role === requiredRole)
    const navigate = useNavigate()

    const isAdminPage = requiredRole === 'admin'
    const title = isAdminPage ? '관리자 인증' : '로그인'

    // 💡 무한 루프 방지 로직 유지
    useEffect(() => {
        if (isAuthed && user) {

            let destination = '/';
            if (isAdminPage && user.role === 'admin') {
                destination = '/admin/dashboard';
            } else if (!isAdminPage) {
                destination = '/user/dashboard';
            } else if (isAdminPage && user.role !== 'admin') {
                destination = '/'; // 권한이 없으면 메인으로
            }

            // setTimeout(0)을 사용하여 현재 렌더링 사이클에서 분리
            const timer = setTimeout(() => {
                navigate(destination, { replace: true });
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [isAuthed, user, isAdminPage, navigate])

    return (
        // 🎯 기존 SCSS 클래스명을 사용하도록 복구
        <section className='admin-wrap'>
            <div className="inner">

                <header className='admin-head'>
                    <h1 className='title'>{title}</h1>
                    <p>
                        로그인/회원가입을 진행하여 서비스를 시작하세요.
                    </p>
                </header>

                <button
                    type='button'
                    onClick={() => navigate(-1)}
                    className='close-btn' // 기존 스타일 클래스 사용
                    aria-label='닫기'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>


                {!isAuthed ? (
                    <div className="auth-row">
                        <button
                            onClick={() => setOpenModal(true)}
                            className="btn btn-primary" // 기존 스타일 클래스 사용
                        >
                            로그인 / 회원가입
                        </button>
                    </div>
                ) : (
                    <div className="auth-row">
                        <div className="user-info-display">
                            <span>안녕하세요 <b>{user?.displayName || user?.email}</b> </span>
                            <span
                                className={`badge ${hasRequiredRole ? 'badge-ok' : 'badge-warn'}`} // 기존 스타일 클래스 사용
                            >
                                {hasRequiredRole ? user.role : `권한없음 : ${requiredRole} 필요`}
                            </span>
                        </div>

                        <div className="auth-actions">

                            {hasRequiredRole && onFetchMe && (
                                <button
                                    className="btn btn-secondary" // 기존 스타일 클래스 사용
                                    onClick={onFetchMe}>
                                    /me 호출
                                </button>
                            )}
                            <button
                                className="btn btn-danger" // 기존 스타일 클래스 사용
                                onClick={handleLogout}>
                                로그아웃
                            </button>
                        </div>
                    </div>
                )}

                {/* 🎯 기존 .alert .alert-warn 스타일 복구 */}
                {!hasRequiredRole && isAuthed && (
                    <div className="alert alert-warn" role="alert">
                        현재 계정에는 관리자 권한이 없습니다. 관리자 승인이 필요합니다.
                    </div>
                )}

                {/* 사용자 정보 예시 */}
                {me && (
                    <div className="me-data-container">
                        <h3>서버에서 받은 사용자 정보 (/me)</h3>
                        <pre className="code">
                            {JSON.stringify(me, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* AuthModal 렌더링 */}
            <AuthModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onAuthed={handleAuthed}
            />

        </section>

    )
}

export default AuthPanel;
