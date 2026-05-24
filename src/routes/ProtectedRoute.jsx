import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleRedirect = {
  student: '/dashboard/student',
  driver: '/dashboard/driver',
}

const ProtectedRoute = ({ children, role }) => {
  const { session, authReady } = useAuth()

  if (!authReady) {
    return null
  }

  if (!session) {
    return <Navigate to="/welcome" replace />
  }

  if (role && session.role !== role) {
    return <Navigate to={roleRedirect[session.role] || '/welcome'} replace />
  }

  return children
}

export default ProtectedRoute
