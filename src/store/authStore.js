import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { db } from '../lib/firebase'
import { onValue, ref, set as dbSet } from 'firebase/database'
import { useDriverStore } from './driverStore'

const getUsers = () => storage.get(STORAGE_KEYS.users, [])
const getSession = () => storage.get(STORAGE_KEYS.session, null)

const normalizeUsername = (value) => value.trim().toLowerCase()
const usersRef = () => ref(db, 'users')

const usersObjectToArray = (users) =>
  Object.values(users || {})
    .filter(Boolean)
    .map((user) => ({
      ...user,
      username: normalizeUsername(user.username || ''),
    }))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))

const usersArrayToObject = (users) =>
  (Array.isArray(users) ? users : []).reduce((acc, user) => {
    if (!user?.username) return acc
    const normalizedUsername = normalizeUsername(user.username)
    acc[normalizedUsername] = {
      ...user,
      username: normalizedUsername,
    }
    return acc
  }, {})

let authSyncReady = false
let authUsersSeeded = false

export const useAuthStore = create((set, get) => ({
  users: getUsers(),
  session: getSession(),

  initSync: () => {
    if (authSyncReady || typeof window === 'undefined' || !db) return
    authSyncReady = true

    onValue(usersRef(), (snapshot) => {
      const remoteUsers = snapshot.val()

      if (!remoteUsers && !authUsersSeeded) {
        const legacyUsers = getUsers()
        if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
          authUsersSeeded = true
          dbSet(usersRef(), usersArrayToObject(legacyUsers))
          return
        }
      }

      set({ users: usersObjectToArray(remoteUsers), session: getSession() })
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
      createdAt: Date.now(),
    }

    const nextUsers = [newUser, ...users]

    if (db) {
      dbSet(usersRef(), usersArrayToObject(nextUsers))
    } else {
      storage.set(STORAGE_KEYS.users, nextUsers)
    }

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
    return { ok: true, role }
  },

  logout: () => {
    storage.remove(STORAGE_KEYS.session)
    set({ session: null })
  },
}))
