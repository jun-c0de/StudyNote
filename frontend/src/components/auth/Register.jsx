import React, { useState } from 'react';
import { register as apiRegister } from '../../api/axios'; // ⬅️ API 함수 임포트

const Register = ({ onAuthed, onClose, setParentLoading }) => {
    const [form, setForm] = useState({ email: '', password: '', displayName: '' });
    const [err, setErr] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setParentLoading(true);
        setErr('');

        try {
            const payload = {
                email: form.email.trim(),
                password: form.password.trim(),
                displayName: form.displayName.trim()
            };

            // 백엔드 API 호출
            const data = await apiRegister(payload); // data: {user, token}

            setErr('');
            onAuthed?.(data); // Context에 인증 정보 전달
            onClose?.(); // 모달 닫기
        } catch (error) {
            const msg = error?.response?.data?.message || '회원가입 실패';
            setErr(msg);
            console.log('Register fail', error?.response?.status, error?.response?.data);
        } finally {
            setParentLoading(false);
        }
    };

    const isLoading = false;

    return (
        <form className='am-form' onSubmit={submit}>
            <input type="text" name='displayName' value={form.displayName} onChange={handleChange} placeholder='닉네임' required />
            <input type="email" name='email' value={form.email} onChange={handleChange} required placeholder='이메일' />
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder='비밀번호' />

            {err && <div className="am-msg error" role='alert'>{err}</div>}

            <button type='submit' disabled={isLoading} className="btn primary">
                {isLoading ? '처리중...' : '가입하기'}
            </button>
        </form>
    );
};

export default Register;
