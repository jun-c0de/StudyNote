import './App.scss'
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

// 💡 경로 통일: 역할별/기능별 폴더 구조 적용
import AuthPanel from './components/auth/AuthPanel' // 인증 모달 컴포넌트
import Header from './components/auth/Header' // 공통 헤더 컴포넌트
import ProtectRoute from './components/auth/ProtectedRoute' // 라우팅 보호 컴포넌트

// 페이지 컴포넌트 (파일 이름 대소문자 통일을 위해 UserDashboard, AdminDashboard로 수정했습니다.)
import Landing from './pages/Landing'
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

// API 클라이언트 임포트
import {
  fetchMe as apiFetchMe,
  logout as apiLogout,
  saveAuthToStorage,
  clearAuthStorage
} from "./api/axios"

function App() {

  // 로컬 스토리지를 사용하는 초기 상태 설정
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const location = useLocation()

  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [me, setMe] = useState(null) // /me 엔드포인트에서 가져온 사용자 상세 정보
  const isAuthed = !!token

  // 헤더를 숨길 경로 설정
  // 헤더는 인증된 상태에서만, 그리고 랜딩/로그인 페이지가 아닐 때만 표시
  const hideOn = new Set(['/', '/login'])
  const showHeader = isAuthed && !hideOn.has(location.pathname)

  // 1. 인증 성공 핸들러
  const handleAuthed = async ({ user, token }) => {
    try {
      // 받은 인증 정보를 상태 및 로컬 스토리지에 저장
      setUser(user)
      setToken(token ?? null)
      saveAuthToStorage({ user, token })
      // /me 정보를 즉시 조회
      handleFetchMe()
    } catch (error) {
      console.error("인증 처리 중 에러 발생:", error)
    }
  }

  // 2. 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error)
    } finally {
      // 상태 및 로컬 스토리지 클리어
      setUser(null)
      setToken(null)
      setMe(null)
      clearAuthStorage()
      // 로그아웃 후 Header 컴포넌트에서 navigate('/')를 통해 홈으로 이동합니다.
    }
  }

  // 3. 내 정보 조회 핸들러
  const handleFetchMe = async () => {
    try {
      const { user: fetchedMe } = await apiFetchMe()
      setMe(fetchedMe)
    } catch (error) {
      setMe({ error: '내 정보 조회 실패' })
      console.error("내 정보 조회 실패:", error)
      // 토큰은 있지만 유효하지 않은 경우, 강제 로그아웃 처리
      if (token) handleLogout()
    }
  }

  // 컴포넌트 마운트 및 인증 상태 변경 시 /me 정보 조회
  useEffect(() => {
    if (isAuthed) handleFetchMe()
  }, [isAuthed])


  return (
    <div className='page'>
      {/* 인증 상태일 때만, 그리고 숨김 경로가 아닐 때만 헤더 표시 */}
      {showHeader && <Header
        isAuthed={isAuthed}
        user={user}
        onLogout={handleLogout}
      />}

      <Routes>
        <Route path='/' element={<Landing />} />

        {/* 로그인/회원가입 페이지 (AuthPanel 렌더링) */}
        {/* 모든 인증 요청은 '/login'으로 통합하여 처리합니다. */}
        <Route
          path='/login'
          element={<AuthPanel
            isAuthed={isAuthed}
            user={user}
            me={me}
            onFetchMe={handleFetchMe}
            onLogout={handleLogout}
            onAuthed={handleAuthed}
          // 이 경로는 일반 로그인/가입용으로 사용되며, requiredRole을 전달하지 않습니다.
          />}
        />

        {/* 사용자 보호구역 (로그인만 필요) */}
        <Route
          path='/user'
          element={
            <ProtectRoute
              user={user}
              isAuthed={isAuthed}
              redirect='/login' // 비인증 시 로그인 페이지로 이동
            />
          }
        >
          {/* 하위 경로 */}
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path='dashboard' element={<UserDashboard />} />
        </Route>

        {/* 관리자 보호구역 (admin 권한 필요) */}
        <Route
          path='/admin'
          element={
            <ProtectRoute
              isAuthed={isAuthed}
              user={user}
              requiredRole="admin" // 관리자 권한 요구
              redirect='/login' // 비인증 시 로그인 페이지로 이동
            />
          }
        >
          {/* 하위 경로 */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path='dashboard' element={<AdminDashboard />} />
        </Route>

        {/* 404 처리: 정의되지 않은 모든 경로는 홈으로 리다이렉트 */}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
