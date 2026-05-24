/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const session = useAuthStore((state) => state.session)
  const authReady = useAuthStore((state) => state.authReady)
  const login = useAuthStore((state) => state.login)
  const signUp = useAuthStore((state) => state.signUp)
  const logout = useAuthStore((state) => state.logout)
  const loginUser = useAuthStore((state) => state.loginUser)
  const signupUser = useAuthStore((state) => state.signupUser)
  const logoutUser = useAuthStore((state) => state.logoutUser)
  const fetchUsers = useAuthStore((state) => state.fetchUsers)
  const initSync = useAuthStore((state) => state.initSync)

  useEffect(() => {
    return initSync()
  }, [initSync])

  const value = useMemo(
    () => ({
      session,
      authReady,
      login,
      signUp,
      logout,
      loginUser,
      signupUser,
      logoutUser,
      fetchUsers,
    }),
    [
      session,
      authReady,
      login,
      signUp,
      logout,
      loginUser,
      signupUser,
      logoutUser,
      fetchUsers,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
