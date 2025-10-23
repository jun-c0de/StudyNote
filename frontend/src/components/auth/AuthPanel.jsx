import React, { useState } from 'react';
import AuthModal from './AuthModal';

const AuthPanel = ({ user, onAuthed, onLogout }) => {
    const [open, setOpen] = useState(false);

    return (
        <section className='auth-panel'>
            {!user ? (
                <button className='btn btn-primary' onClick={() => setOpen(true)}>로그인 / 회원가입</button>
            ) : (
                <div>
                    <span>{user.displayName}님 환영합니다!</span>
                    <button className='btn' onClick={onLogout}>로그아웃</button>
                </div>
            )}

            {open && <AuthModal open={open} onClose={() => setOpen(false)} onAuthed={onAuthed} />}
        </section>
    );
};

export default AuthPanel;
