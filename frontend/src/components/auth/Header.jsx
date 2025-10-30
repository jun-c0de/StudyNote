import React, { useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
// 경로를 현재 폴더 구조에 맞게 수정해주세요. (예: src/components/common/Header.jsx라면, ./style/Header.scss)
import "./style/Header.scss";

// 💡 경고: window.confirm은 캔버스 환경에서 사용할 수 없습니다. 
// 여기서는 단순성을 위해 확인 과정 없이 onLogout을 호출하도록 수정합니다.
// 실제 확인 메시지가 필요하다면, 커스텀 모달을 구현해야 합니다.

const Header = ({
    isAuthed, // useAuth()에서 가져온 인증 상태
    user,     // useAuth()에서 가져온 사용자 정보
    onLogout  // AuthContext에서 전달받은 로그아웃 함수
}) => {

    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false); // 로딩 상태 추가

    // 💡 로그아웃 처리 함수 (window.confirm 제거)
    const handleLogout = async () => {
        if (isLoggingOut) return;

        // 🚨 주의: 원래 여기에 window.confirm 로직이 있었으나,
        // 캔버스 환경 규정 상 커스텀 모달이 필요하며, 여기서는 편의상 즉시 로그아웃을 시도합니다.

        setIsLoggingOut(true);

        try {
            await onLogout();
            // 로그아웃 성공 후 메인 페이지로 이동
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
            // 에러 처리 (사용자에게 표시할 메시지 등)
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <header className='site-header'>
            <div className="inner">
                <h1 className='logo'>
                    {/* 메인 페이지로 이동 */}
                    <Link to="/">📷Photomemo</Link>
                </h1>

                {/* 메인 네비게이션 */}
                <nav className="main-nav">
                    <ul>
                        <li><NavLink to="/user/dashboard">내 메모</NavLink></li>
                        {user?.role === 'admin' && (
                            <li><NavLink to="/admin/dashboard">관리자 페이지</NavLink></li>
                        )}
                    </ul>
                </nav>

                <div className="auth-area">
                    {isAuthed ? (
                        <div className='auth-info'>
                            <span className='welcome'>
                                {/* 닉네임 또는 이메일 표시 */}
                                **{user?.displayName || user?.email || "사용자"}**님 환영합니다!
                            </span>
                            <button
                                className='btn logout'
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? '처리중...' : '로그아웃'}
                            </button>
                        </div>
                    ) : (
                        // 비인증 상태일 때 AuthPanel로 연결 (로그인/회원가입 모달을 띄울 페이지)
                        <button
                            className='btn login'
                            onClick={() => navigate('/login')}
                        >
                            로그인 / 가입
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header;
