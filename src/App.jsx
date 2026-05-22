import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import Auth from './pages/Auth.jsx'
import Chat from './pages/Chat.jsx'
import DriverDashboard from './pages/DriverDashboard.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import Settings from './pages/Settings.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import Welcome from './pages/Welcome.jsx'
import { useThemeStore } from './store/themeStore'

function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <div className="min-h-screen bg-night-950 text-slate-100">
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth/:role" element={<Auth />} />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/driver"
          element={
            <ProtectedRoute role="driver">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
