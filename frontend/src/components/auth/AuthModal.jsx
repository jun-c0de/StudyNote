// /frontend/src/components/auth/AuthModal.jsx

import React, { useEffect, useState } from 'react';
import "./style/AuthModal.scss";
import api from '../../api/axios'; // ⬅️ axios 인스턴스 임포트

const AuthModal = ({ open, onClose, onAuthed }) => {
    const [mode, setMode] = useState('register');
    const [attemptInfo, setAttemptInfo] = useState({ attempts: null, remaining: null, locked: false });
    // isplayName 오타 수정 (이전에 주신 코드에 있었던 오타를 displayName으로 수정합니다.)
    const [form, setForm] = useState({ email: '', password: '', displayName: '' });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        if (!open) {
            setMode('register');
            setForm({ email: '', password: '', displayName: '' });
            setLoading(false);
            setErr('');
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose?.(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, loading, onClose]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setErr('');
        setLoading(true);

        try {
            const payload = mode === 'register'
                ? { email: form.email.trim(), password: form.password.trim(), displayName: form.displayName.trim() }
                : { email: form.email.trim(), password: form.password.trim() };

            // 백엔드 API 호출
            const url = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
            const { data } = await api.post(url, payload); // data: {user, token}

            setAttemptInfo({ attempts: null, remaining: null, locked: false });
            setErr('');
            onAuthed?.(data); // { user, token }
            onClose?.();
        } catch (error) {
            const d = error?.response?.data || {};
            const msg = error?.response?.data?.message || (mode === 'register' ? '회원가입 실패' : '로그인 실패');

            // 백엔드에서 받은 로그인 시도 정보를 상태에 저장
            setAttemptInfo({
                attempts: typeof d.loginAttempts === 'number' ? d.loginAttempts : null,
                remaining: typeof d.remainingAttempts === 'number' ? 5 - d.loginAttempts : null, // 백엔드 로직에 맞춰 남은 시도 횟수 계산
                locked: !!d.locked
            });

            setErr(msg);
            console.log('auth fail', error?.response?.status, error?.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = () => { if (!loading) onClose?.(); };

    return (
        <div className='am-backdrop' onClick={handleBackdropClick}>
            <div className="am-panel" onClick={(e) => e.stopPropagation()}>
                <div className="am-tabs">
                    <button type='button' className={`btn ${mode === 'login' ? 'on' : ''}`} onClick={() => setMode('login')}>로그인</button>
                    <button type='button' className={`btn ${mode === 'register' ? 'on' : ''}`} onClick={() => setMode('register')}>회원가입</button>
                </div>

                <form className='am-form' onSubmit={submit}>
                    {mode === 'register' && <input type="text" name='displayName' value={form.displayName} onChange={handleChange} placeholder='닉네임' />}
                    <input type="email" name='email' value={form.email} onChange={handleChange} required placeholder='이메일' />
                    <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder='비밀번호' />

                    {err && <div className={`am-msg ${attemptInfo.locked ? 'warn' : 'error'}`} role='alert'>{err}</div>}

                    {attemptInfo.locked
                        ? <div className="am-msg warn">유효성 검증 실패로 로그인이 차단 되었습니다. 관리자에게 문의하세요.</div>
                        : attemptInfo.attempts != null
                            ? <div className='am-subtle'>로그인 실패 횟수: {attemptInfo.attempts}/5 {typeof attemptInfo.remaining === 'number' && `(남은 시도: ${attemptInfo.remaining})`}</div>
                            : null
                    }

                    <button type='submit' disabled={loading || attemptInfo.locked} className="btn primary">
                        {loading ? '처리중...' : (mode === 'register' ? '가입하기' : '로그인')}
                    </button>
                </form>

                <button type='button' onClick={onClose} className='am-close btn' aria-label='닫기'>X</button>
            </div>
        </div>
    );
};

// 📌 Default Export를 명시하여 임포트 오류를 방지합니다.
export default AuthModal;