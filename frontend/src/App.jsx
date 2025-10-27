import './App.scss'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPanel from './components/auth/AuthPanel'
import Landing from './pages/Landing'
import Header from './components/Header'
import ProtectedRoute from './components/common/ProtectedRoute' // ⬅️ 경로 변경: common 폴더
import UserDashboard from './pages/user/UserDashboard' // ⬅️ 경로 변경 및 주석 해제
import AdminDashboard from './pages/admin/AdminDashboard'


// AuthProvider 내부에 위치하여 Context를 사용하는 메인 컴포넌트
const MainApp = () => {
  // Context에서 필요한 상태와 함수를 가져옴
  const { user, isAuthed, handleLogout, handleFetchMe, me } = useAuth()
  const location = useLocation()

  // 헤더 표시 로직은 Context 상태를 사용하도록 유지
  const hideOn = new Set(['/', '/admin/login'])
  const showHeader = isAuthed && !hideOn.has(location.pathname)

  return (
    <div className='page'>
      {/* Header는 Context에서 가져온 상태와 함수를 사용 */}
      {showHeader && <Header
        isAuthed={isAuthed}
        user={user}
        onLogout={handleLogout}
      />}

      <Routes>
        <Route path='/' element={<Landing />} />

        {/* 로그인/회원가입/관리자 인증 페이지 - AuthPanel */}
        <Route
          path='/admin/login'
          element={<AuthPanel
            requiredRole="admin"
            // AuthPanel은 이제 Context에서 모든 상태를 가져와야 하지만, 
            // 레거시 코드 호환성을 위해 me와 onFetchMe, onLogout을 props로 넘겨줄 수도 있습니다.
            // AuthPanel 내부에서 useAuth()를 호출하는 것이 더 깔끔합니다. 
            // 여기서는 최소한의 props만 넘기거나, AuthPanel을 수정하여 useAuth()를 사용하도록 합니다.
            me={me} // /me 상세 정보를 보여주기 위해 전달
            onFetchMe={handleFetchMe} // /me 강제 호출을 위해 전달
          />}
        />

        {/* 사용자 보호구역 */}
        <Route
          path='/user'
          element={
            <ProtectedRoute
              // Context의 user, isAuthed, requiredRole을 사용하도록 ProtectedRoute가 수정됨
              // redirect prop만 남깁니다.
              redirect='/'
            />
          }
        >
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path='dashboard' element={<UserDashboard />} />
        </Route>

        {/* 관리자 보호구역 */}
        <Route
          path='/admin'
          element={
            <ProtectedRoute
              requiredRole="admin"
            // redirect prop이 없으면 ProtectedRoute는 기본적으로 /admin/login으로 리다이렉트합니다.
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


// 앱의 최상위에서 AuthProvider로 감싸줍니다.
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}

export default App
