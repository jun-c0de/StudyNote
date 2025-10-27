import React, { useEffect, useState } from 'react';
import Login from './Login'; // ⬅️ 분리된 Login 컴포넌트 임포트
import Register from './Register'; // ⬅️ 분리된 Register 컴포넌트 임포트
import "./style/AuthModal.scss";
// import api from '../../api/axios'; // ⬅️ API 호출 로직이 Login/Register로 분리되어 필요 없음

const AuthModal = ({ open, onClose, onAuthed }) => {
    const [mode, setMode] = useState('register');
    const [loading, setLoading] = useState(false); // AuthModal에서 로딩 상태를 관리 (Login/Register와 동기화)

    useEffect(() => {
        if (!open) {
            setMode('register');
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose?.(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, loading, onClose]);

    if (!open) return null;

    return (
        <div className='am-backdrop' onClick={onClose}>
            <div className="am-panel" onClick={(e) => e.stopPropagation()}>
                <div className="am-tabs">
                    <button type='button' className={`btn ${mode === 'login' ? 'on' : ''}`} onClick={() => setMode('login')} disabled={loading}>로그인</button>
                    <button type='button' className={`btn ${mode === 'register' ? 'on' : ''}`} onClick={() => setMode('register')} disabled={loading}>회원가입</button>
                </div>

                {/* 폼 로직을 Login 또는 Register 컴포넌트에 위임 */}
                {mode === 'login' && (
                    <Login
                        onAuthed={onAuthed}
                        onClose={onClose}
                        setParentLoading={setLoading} // 로딩 상태 동기화
                    />
                )}
                {mode === 'register' && (
                    <Register
                        onAuthed={onAuthed}
                        onClose={onClose}
                        setParentLoading={setLoading} // 로딩 상태 동기화
                    />
                )}

                <button type='button' onClick={onClose} className='am-close btn' aria-label='닫기' disabled={loading}>X</button>
            </div>
        </div>
    );
};

export default AuthModal;
