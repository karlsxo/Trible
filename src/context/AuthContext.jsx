import { createContext, useContext, useEffect, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const session = useAuthStore((state) => state.session)
  const login = useAuthStore((state) => state.login)
  const signUp = useAuthStore((state) => state.signUp)
  const logout = useAuthStore((state) => state.logout)
  const initSync = useAuthStore((state) => state.initSync)

  useEffect(() => {
    initSync()
  }, [initSync])

  const value = useMemo(
    () => ({ session, login, signUp, logout }),
    [session, login, signUp, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
