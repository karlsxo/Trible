import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { emitSync, onSync } from '../utils/broadcast'
import { useDriverStore } from './driverStore'

const getUsers = () => storage.get(STORAGE_KEYS.users, [])
const getSession = () => storage.get(STORAGE_KEYS.session, null)

const normalizeUsername = (value) => value.trim().toLowerCase()

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
      if (message?.type === 'USER_UPDATED') {
        set({ users: getUsers(), session: getSession() })
      }
    })
  },

  login: (identifier, password, role) => {
    const username = normalizeUsername(identifier)
    const sanitizedPassword = password.trim()

    const user = get().users.find(
      (u) =>
        u.role === role &&
        u.username === username &&
        u.password === sanitizedPassword,
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
    emitSync('USER_UPDATED')
    return { ok: true, role: user.role }
  },

  signUp: (role, payload) => {
    const users = get().users
    const username = normalizeUsername(payload.username)

    if (users.some((u) => u.username === username)) {
      return { ok: false, message: 'Username is already taken.' }
    }

    const newUser = {
      id: Date.now(),
      role,
      fullName: payload.fullName.trim(),
      username,
      password: payload.password.trim(),
      driverNumber: role === 'driver' ? (payload.driverNumber || '').trim() : '',
    }

    const nextUsers = [newUser, ...users]
    storage.set(STORAGE_KEYS.users, nextUsers)

    if (role === 'driver') {
      useDriverStore.getState().registerDriverProfile({
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        driverNumber: newUser.driverNumber,
      })
    }

    const session = {
      id: newUser.id,
      role,
      name: newUser.fullName,
      username: newUser.username,
    }

    storage.set(STORAGE_KEYS.session, session)
    set({ users: nextUsers, session })
    emitSync('USER_UPDATED')
    return { ok: true, role }
  },

  logout: () => {
    storage.remove(STORAGE_KEYS.session)
    set({ session: null })
    emitSync('USER_UPDATED')
  },
}))
