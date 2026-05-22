import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getSession,
  saveSession,
  clearSession,
  getUsers,
  isUsernameTaken,
  saveUser,
} from '../utils/localStorage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(getSession)

  useEffect(() => {
    if (session) {
      saveSession(session)
    } else {
      clearSession()
    }
  }, [session])

  const login = (identifier, password, role) => {
    const users = getUsers()
    const user = users.find(
      (u) =>
        u.role === role &&
        u.password === password &&
        u.username === identifier,
    )

    if (!user) {
      return { ok: false, message: 'Invalid credentials.' }
    }

    const nextSession = {
      id: user.id,
      role: user.role,
      name: user.fullName,
      username: user.username,
    }

    setSession(nextSession)
    return { ok: true, role: user.role }
  }

  const signUp = (role, payload) => {
    const taken = isUsernameTaken(payload.username)
    if (taken) {
      return { ok: false, message: 'Username is already taken.' }
    }

    const newUser = {
      id: Date.now(),
      role,
      fullName: payload.fullName,
      username: payload.username,
      password: payload.password,
      driverId: payload.driverId || '',
    }

    saveUser(newUser)

    const nextSession = {
      id: newUser.id,
      role,
      name: payload.fullName,
      username: payload.username,
    }

    setSession(nextSession)
    return { ok: true, role }
  }

  const logout = () => setSession(null)

  const value = useMemo(
    () => ({ session, login, signUp, logout }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}