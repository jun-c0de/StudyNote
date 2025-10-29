import './App.scss'
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AuthPanel from './components/auth/AuthPanel'
import Landing from './pages/Landing'
import Header from './components/Header'
import ProtectRoute from './components/common/ProtectedRoute'
import UserDashboard from './pages/user/userDashboard'
import AdminDashboard from './pages/admin/adminDashboard'
import {
  fetchMe as apiFetchMe,
  logout as apiLogout,
  saveAuthToStorage,
  clearAuthStorage
} from "./api/axios" // <-- 파일명을 axios로 수정했습니다.
function App() {

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const location = useLocation()

  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [me, setMe] = useState(null)
  const isAuthed = !!token


  const hideOn = new Set(['/', '/admin/login'])
  const showHeader = isAuthed && !hideOn.has(location.pathname)


  const handleAuthed = async ({ user, token }) => {
    try {

      setUser(user)
      setToken(token ?? null)
      saveAuthToStorage({ user, token })
      handleFetchMe()
    } catch (error) {
      console.error(error)
    }

  }

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (error) {

    } finally {
      setUser(null)
      setToken(null)
      setMe(null)
      clearAuthStorage()
    }

  }

  const handleFetchMe = async () => {
    try {
      const { user } = await apiFetchMe()
      setMe(user)

    } catch (error) {
      setMe({ error: '내 정보 조회 실패' })
      console.error(error)
    }
  }

  useEffect(() => {
    if (isAuthed) handleFetchMe()
  }, [isAuthed])

  return (
    <div className='page'>
      {showHeader && <Header
        isAuthed={isAuthed}
        user={user}
        onLogout={handleLogout}
      />}

      <Routes>
        <Route path='/' element={<Landing />} />
        {/* 로그인 회원가입 */}
        <Route
          path='/admin/login'
          element={<AuthPanel
            isAuthed={isAuthed}
            user={user}
            me={me}
            onFetchMe={handleFetchMe}
            onLogout={handleLogout}
            onAuthed={handleAuthed}
            requiredRole="admin"
          />}
        />
        {/* 사용자 보호구역 (로그인만 필요) */}
        <Route
          path='/user'
          element={
            <ProtectRoute
              user={user}
              isAuthed={isAuthed}
              redirect='/'
            // requiredRole이 없으므로 로그인 여부만 확인합니다.
            />
          }
        >
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
              requiredRole="admin" // <-- 관리자 권한 요구
              redirect='/'
            />
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path='dashboard' element={<AdminDashboard />} />
        </Route>
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App