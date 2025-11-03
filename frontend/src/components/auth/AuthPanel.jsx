import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import './style/AuthPanel.scss';

const AuthPanel = ({ isAuthed, user, me, onFetchMe, onLogout, onAuthed, requiredRole }) => {
    const [openModal, setOpenModal] = useState(false);
    const navigate = useNavigate();

    const isAdminPage = requiredRole === 'admin';
    const hasRequiredRole = !requiredRole || (user && user.role === requiredRole);

    useEffect(() => {
        if (!isAuthed || !user) return;

        if (isAdminPage) {
            if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
            else navigate('/user/dashboard', { replace: true });
        } else {
            navigate('/user/dashboard', { replace: true });
        }
    }, [isAuthed, user, isAdminPage, navigate]);

    return (
        <section className="admin-wrap">
            <div className="inner">
                <header className="admin-head">
                    <h1 className="title">{isAdminPage ? '관리자인증' : '로그인'}</h1>
                    <p>버튼 → 모달에서 로그인/회원가입 → 토큰 저장 → /me 호출</p>
                </header>

                <div className="admin-card">
                    {!isAuthed ? (
                        <div className="auth-row">
                            <button onClick={() => setOpenModal(true)} className="btn btn-primary">로그인 / 회원가입</button>
                        </div>
                    ) : (
                        <div className="auth-row">
                            <span>안녕하세요 <b>{user?.displayName || user?.email}</b></span>
                            <span className={`badge ${hasRequiredRole ? 'badge-ok' : 'badge-warn'}`}>
                                {hasRequiredRole ? user.role : `권한없음: ${requiredRole} 필요`}
                            </span>
                            <div className="auth-actions">
                                {hasRequiredRole && onFetchMe && (
                                    <button className="btn btn-secondary" onClick={onFetchMe}>/me 호출</button>
                                )}
                                <button className="btn btn-danger" onClick={onLogout}>로그아웃</button>
                            </div>
                        </div>
                    )}

                    {!hasRequiredRole && isAuthed && (
                        <div className="alert alert-warn">현재 계정에는 관리자 권한이 없습니다.</div>
                    )}

                    {me && <pre className="code">{JSON.stringify(me, null, 2)}</pre>}
                </div>
            </div>

            <AuthModal open={openModal} onClose={() => setOpenModal(false)} onAuthed={onAuthed} />
        </section>
    );
};

export default AuthPanel;
