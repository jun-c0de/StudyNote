import React, { useEffect, useState } from 'react';
// api/auth.js 파일에서 인증 함수와 에러 유틸리티를 임포트합니다.
// 💡 경로 수정: api 폴더가 components 폴더의 형제 레벨(src/)에 있다고 가정하여 ../api/auth로 변경
import { login, register, getErrorMessage } from '../../api/axios';
// 💡 경로 수정: style 폴더가 components 폴더의 형제 레벨(src/)에 있다고 가정하여 ../../style/AuthModal.scss로 변경
import "./style/AuthModal.scss";


const AuthModal = ({ open, onClose, onAuthed }) => {

    // 모달 모드 (login 또는 register)
    const [mode, setMode] = useState('register');

    // 폼 상태 (로그인/회원가입 공통 필드 + 회원가입 전용 displayName)
    const [form, setForm] = useState({
        email: '',
        password: '',
        displayName: ''
    });

    // 인증 시도 정보 (로그인 실패 횟수, 차단 여부 등)
    const [attemptInfo, setAttemptInfo] = useState({
        attempts: null,
        remaining: null,
        locked: false
    });

    // UI 상태
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');


    // 모달이 열리거나 닫힐 때 상태 초기화
    useEffect(() => {
        if (!open) {
            setMode('register');
            setForm({
                email: '',
                password: '',
                displayName: ''
            });
            setLoading(false);
            setErr('');
            setAttemptInfo({ attempts: null, remaining: null, locked: false });
        }
    }, [open]);

    // ESC 키 입력 시 닫기 처리
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape' && !loading) onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, loading, onClose]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();

        // 로딩 중이거나 계정이 잠겨 있으면 요청 방지
        if (loading || attemptInfo.locked) return;

        setErr('');
        setLoading(true);

        try {
            // 1. 보낼 데이터 구성
            const payload = {
                email: form.email.trim(),
                password: form.password.trim(),
            };
            if (mode === 'register') {
                // register 함수는 displayname을 소문자로 받으므로, 필드명에 주의합니다.
                payload.displayname = form.displayName.trim();
            }

            let data;
            // 2. API 호출
            if (mode === 'register') {
                data = await register(payload);
            } else {
                data = await login(payload);
            }

            // 3. 성공 시 상태 초기화 및 부모 컴포넌트에 결과 전달
            setAttemptInfo({ attempts: null, remaining: null, locked: false });
            setErr('');

            onAuthed?.(data); // {user, token}
            onClose?.();

        } catch (error) {
            const d = error?.response?.data || {};

            let msg = getErrorMessage(error, mode === 'register' ? '회원가입 실패' : '로그인 실패');

            // 로그인 시도 정보 업데이트 (로그인 모드일 때만 적용)
            if (mode === 'login') {
                setAttemptInfo({
                    attempts: typeof d.loginAttempts === 'number' ? d.loginAttempts : null,
                    remaining: typeof d.remainingAttempts === 'number' ? d.remainingAttempts : null,
                    locked: !!d.locked
                });
            } else {
                // 회원가입 실패 시 시도 정보 초기화
                setAttemptInfo({ attempts: null, remaining: null, locked: false });
            }

            setErr(msg);
            console.log('Auth fail', error?.response?.status, error?.response?.data);

        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = () => {
        if (!loading) onClose?.();
    };


    return (
        <div className='am-backdrop' onClick={handleBackdropClick}>
            <div className="am-panel" onClick={(e) => e.stopPropagation()}>
                {/* 탭 */}
                <div className="am-tabs">
                    <button
                        type='button'
                        className={`btn ${mode === 'login' ? 'on' : ''}`}
                        onClick={() => setMode('login')}
                        disabled={loading}
                    >
                        로그인
                    </button>
                    <button
                        type='button'
                        onClick={() => setMode('register')}
                        className={`btn ${mode === 'register' ? 'on' : ''}`}
                        disabled={loading}
                    >
                        회원가입
                    </button>
                </div>

                {/* 폼 */}
                <form className='am-form' onSubmit={submit}>

                    {mode === 'register' && (
                        <input
                            type="text"
                            name='displayName'
                            value={form.displayName}
                            onChange={handleChange}
                            placeholder='닉네임'
                            required
                            disabled={loading}
                        />
                    )}
                    <input
                        type="email"
                        name='email'
                        onChange={handleChange}
                        value={form.email}
                        required
                        placeholder='이메일'
                        disabled={loading || (mode === 'login' && attemptInfo.locked)}
                    />
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder='비밀번호'
                        required
                        disabled={loading || (mode === 'login' && attemptInfo.locked)}
                    />

                    {/* 에러 메세지 출력 */}
                    {err && (
                        <div className={`am-msg ${mode === 'login' && attemptInfo.locked ? 'warn' : 'error'}`} role='alert'>
                            {err}
                        </div>
                    )}

                    {/* 로그인 시도 정보 (로그인 모드일 때만 표시) */}
                    {mode === 'login' && (attemptInfo.locked ? (
                        <div className="am-msg warn">
                            유효성 검증 실패로 로그인이 차단 되었습니다. 관리자에게 문의하세요.
                        </div>
                    ) : attemptInfo.attempts != null ? (
                        <div className='am-subtle'>
                            로그인 실패 횟수: {attemptInfo.attempts}/5
                            {typeof attemptInfo.remaining === 'number' && `(남은 시도: ${attemptInfo.remaining})`}
                        </div>
                    ) : null)}

                    <button
                        type='submit'
                        disabled={loading || (mode === 'login' && attemptInfo.locked)}
                        className="btn primary">
                        {loading ? '처리중...' : (mode === 'register' ? '가입하기' : '로그인')}
                    </button>
                </form>

                <button
                    type='button'
                    onClick={onClose}
                    className='am-close btn'
                    aria-label='닫기'
                    disabled={loading}
                >
                    X
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
