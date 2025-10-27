import React, { useState } from 'react';
import { login as apiLogin } from '../../api/axios'; // ⬅️ API 함수 임포트

const Login = ({ onAuthed, onClose, setParentLoading }) => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [err, setErr] = useState('');
    const [attemptInfo, setAttemptInfo] = useState({ attempts: null, remaining: null, locked: false });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setParentLoading(true); // 부모(AuthModal)의 로딩 상태를 업데이트
        setErr('');

        try {
            const payload = { email: form.email.trim(), password: form.password.trim() };

            // 백엔드 API 호출
            const data = await apiLogin(payload); // data: {user, token}

            setAttemptInfo({ attempts: null, remaining: null, locked: false });
            setErr('');
            onAuthed?.(data); // Context에 인증 정보 전달
            onClose?.(); // 모달 닫기
        } catch (error) {
            const d = error?.response?.data || {};
            const msg = d.message || '로그인 실패';

            // 백엔드에서 받은 로그인 시도 정보를 상태에 저장
            setAttemptInfo({
                attempts: typeof d.loginAttempts === 'number' ? d.loginAttempts : null,
                remaining: typeof d.remainingAttempts === 'number' ? 5 - d.loginAttempts : null,
                locked: !!d.locked
            });

            setErr(msg);
            console.log('Login fail', error?.response?.status, error?.response?.data);
        } finally {
            setParentLoading(false); // 부모 로딩 상태 해제
        }
    };

    const isLoading = false; // 부모 컴포넌트에서 로딩 상태를 받지 않는다면 여기서 로컬 상태를 사용할 수 있습니다.

    return (
        <form className='am-form' onSubmit={submit}>
            <input type="email" name='email' value={form.email} onChange={handleChange} required placeholder='이메일' />
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder='비밀번호' />

            {err && <div className={`am-msg ${attemptInfo.locked ? 'warn' : 'error'}`} role='alert'>{err}</div>}

            {attemptInfo.locked
                ? <div className="am-msg warn">유효성 검증 실패로 로그인이 차단 되었습니다. 관리자에게 문의하세요.</div>
                : attemptInfo.attempts != null
                    ? <div className='am-subtle'>로그인 실패 횟수: {attemptInfo.attempts}/5 {typeof attemptInfo.remaining === 'number' && `(남은 시도: ${attemptInfo.remaining})`}</div>
                    : null
            }

            <button type='submit' disabled={isLoading || attemptInfo.locked} className="btn primary">
                {isLoading ? '처리중...' : '로그인'}
            </button>
        </form>
    );
};

export default Login;
