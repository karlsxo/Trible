import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { emitSync, onSync } from '../utils/broadcast'

const getUsers = () => storage.get(STORAGE_KEYS.users, [])
const getSession = () => storage.get(STORAGE_KEYS.session, null)

let authSyncReady = false

export const useAuthStore = create((set, get) => ({
  users: getUsers(),
  session: getSession(),

  initSync: () => {
    if (authSyncReady || typeof window === 'undefined') return
    authSyncReady = true

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.users) {
        set({ users: getUsers() })
      }
      if (event.key === STORAGE_KEYS.session) {
        set({ session: getSession() })
      }
    })

    onSync((message) => {
      if (message?.type === 'AUTH_UPDATED') {
        set({ users: getUsers(), session: getSession() })
      }
    })
  },

  login: (identifier, password, role) => {
    const users = get().users
    const user = users.find(
      (u) =>
        u.role === role &&
        u.username === identifier.trim() &&
        u.password === password,
    )

    if (!user) return { ok: false, message: 'Invalid credentials.' }

    const session = {
      id: user.id,
      role: user.role,
      name: user.fullName,
      username: user.username,
    }

    storage.set(STORAGE_KEYS.session, session)
    set({ session })
    emitSync('AUTH_UPDATED')
    return { ok: true, role: user.role }
  },

  signUp: (role, payload) => {
    const users = get().users
    const username = payload.username.trim()

    if (users.some((u) => u.username === username)) {
      return { ok: false, message: 'Username is already taken.' }
    }

    const seatValue = Number(payload.availableSeats)
    const newUser = {
      id: Date.now(),
      role,
      fullName: payload.fullName.trim(),
      username,
      password: payload.password,
      driverId: role === 'driver' ? (payload.driverId || '').trim() : '',
      route: role === 'driver' ? (payload.route || 'Campus Route').trim() : '',
      availableSeats:
        role === 'driver' && Number.isFinite(seatValue) ? Math.max(0, seatValue) : 0,
      online: role === 'driver',
    }

    const nextUsers = [newUser, ...users]
    storage.set(STORAGE_KEYS.users, nextUsers)

    const session = {
      id: newUser.id,
      role,
      name: newUser.fullName,
      username: newUser.username,
    }

    storage.set(STORAGE_KEYS.session, session)
    set({ users: nextUsers, session })
    emitSync('AUTH_UPDATED')
    return { ok: true, role }
  },

  logout: () => {
    storage.remove(STORAGE_KEYS.session)
    set({ session: null })
    emitSync('AUTH_UPDATED')
  },

  updateDriver: (username, partial) => {
    const nextUsers = get().users.map((user) =>
      user.username === username ? { ...user, ...partial } : user,
    )
    storage.set(STORAGE_KEYS.users, nextUsers)
    set({ users: nextUsers })
    emitSync('AUTH_UPDATED')
  },
}))
