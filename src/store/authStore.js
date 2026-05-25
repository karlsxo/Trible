import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { get as dbGet, onValue, ref, set as dbSet } from 'firebase/database'
import { auth, db, firebaseConfigStatus } from '../lib/firebase'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { useDriverStore } from './driverStore'

const getSession = () => storage.get(STORAGE_KEYS.session, null)
const normalizeEmail = (value) => value.trim().toLowerCase()
const normalizeUsername = (value) => value.trim().toLowerCase()
const usersRef = () => ref(db, 'users')
const userRef = (uid) => ref(db, `users/${uid}`)

const usersObjectToArray = (users) =>
  Object.values(users || {})
    .filter(Boolean)
    .map((user) => ({
      ...user,
      username: normalizeUsername(user.username || ''),
    }))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))

const toSession = (profile) => ({
  id: profile.id,
  uid: profile.id,
  role: profile.role,
  name: profile.fullName,
  fullName: profile.fullName,
  username: profile.username,
  email: profile.email,
})

const getAuthMessage = (error, fallback = 'Authentication failed.') => {
  const code = error?.code || ''
  if (code.includes('configuration-not-found')) {
    return 'Enable Email/Password in Firebase Console → Authentication → Sign-in method, then redeploy with the correct Firebase project settings.'
  }
  if (code.includes('unauthorized-domain')) {
    return 'Add this site to Firebase Console → Authentication → Settings → Authorized domains.'
  }
  if (code.includes('email-already-in-use')) return 'Email is already registered.'
  if (code.includes('invalid-email')) return 'Enter a valid email address.'
  if (code.includes('invalid-credential')) return 'Invalid email or password.'
  if (code.includes('weak-password')) return 'Password must be at least 6 characters.'
  if (code.includes('network-request-failed')) return 'Network error. Check your connection.'
  return error?.message || fallback
}

const getConfigMessage = () => {
  const missing = firebaseConfigStatus.missingRequiredEnvKeys
  if (!missing.length) return 'Firebase Authentication is not configured.'
  return `Firebase is missing Vercel environment variables: ${missing.join(', ')}. Add them, then redeploy.`
}

let authSyncReady = false
let authUnsubscribe = null
let usersUnsubscribe = null

export const useAuthStore = create((set, get) => ({
  users: [],
  session: getSession(),
  authReady: false,

  fetchUsers: async () => {
    if (!db) return []
    const snapshot = await dbGet(usersRef())
    const users = usersObjectToArray(snapshot.val())
    set({ users })
    return users
  },

  initSync: () => {
    if (authSyncReady || typeof window === 'undefined') return () => {}
    authSyncReady = true

    if (!auth || !db) {
      storage.remove(STORAGE_KEYS.session)
      set({ users: [], session: null, authReady: true })
      return () => {}
    }

    usersUnsubscribe = onValue(usersRef(), (snapshot) => {
      set({ users: usersObjectToArray(snapshot.val()) })
    })

    authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        storage.remove(STORAGE_KEYS.session)
        set({ session: null, authReady: true })
        return
      }

      const profileSnapshot = await dbGet(userRef(firebaseUser.uid))
      const profile = profileSnapshot.val()

      if (!profile) {
        storage.remove(STORAGE_KEYS.session)
        set({ session: null, authReady: true })
        return
      }

      const session = toSession(profile)
      storage.set(STORAGE_KEYS.session, session)
      set({ session, authReady: true })
    })

    return () => {
      authUnsubscribe?.()
      usersUnsubscribe?.()
      authUnsubscribe = null
      usersUnsubscribe = null
      authSyncReady = false
    }
  },

  signupUser: async (role, payload) => {
    if (!auth || !db) {
      return { ok: false, message: getConfigMessage() }
    }

    const email = normalizeEmail(payload.email || '')
    const username = normalizeUsername(payload.username || '')

    if (!email || !username || !payload.password?.trim()) {
      return { ok: false, message: 'Email, username, and password are required.' }
    }

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        payload.password.trim(),
      )
      const now = Date.now()
      const profile = {
        id: credential.user.uid,
        username,
        email,
        fullName: payload.fullName.trim(),
        role,
        driverNumber: role === 'driver' ? (payload.driverNumber || '').trim() : '',
        createdAt: now,
      }

      try {
        const users = await get().fetchUsers()
        if (users.some((user) => user.username === username)) {
          await deleteUser(credential.user)
          await signOut(auth)
          return { ok: false, message: 'Username is already taken.' }
        }

        await dbSet(userRef(credential.user.uid), profile)

        if (role === 'driver') {
          useDriverStore.getState().registerDriverProfile({
            id: profile.id,
            fullName: profile.fullName,
            username: profile.username,
            driverNumber: profile.driverNumber,
          })
        }

        const session = toSession(profile)
        storage.set(STORAGE_KEYS.session, session)
        set({ session, users: [profile, ...users], authReady: true })
        return { ok: true, role }
      } catch (error) {
        await deleteUser(credential.user).catch(() => {})
        await signOut(auth).catch(() => {})
        throw error
      }
    } catch (error) {
      console.error('FULL SIGNUP ERROR:', error)
      console.error('ERROR CODE:', error?.code)
      console.error('ERROR MESSAGE:', error?.message)
      return { ok: false, message: getAuthMessage(error, 'Unable to create account.') }
    }
  },

  loginUser: async (email, password, role) => {
    if (!auth || !db) {
      return { ok: false, message: getConfigMessage() }
    }

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        normalizeEmail(email || ''),
        password.trim(),
      )
      const profileSnapshot = await dbGet(userRef(credential.user.uid))
      const profile = profileSnapshot.val()

      if (!profile || profile.role !== role) {
        await signOut(auth)
        return { ok: false, message: `This account is not registered as a ${role}.` }
      }

      // CRITICAL FIX: Register driver on login if not already registered
      if (role === 'driver') {
        const driverStore = useDriverStore.getState()
        const existingDriver = driverStore.getDriverByUsername(profile.username)
        if (!existingDriver) {
          console.log(`[Auth] 🚗 Registering driver on login: ${profile.username}`)
          driverStore.registerDriverProfile({
            id: profile.id,
            fullName: profile.fullName,
            username: profile.username,
            driverNumber: profile.driverNumber,
          })
        }
      }

      const session = toSession(profile)
      storage.set(STORAGE_KEYS.session, session)
      set({ session, authReady: true })
      return { ok: true, role: profile.role }
    } catch (error) {
      console.error('FULL LOGIN ERROR:', error)
      console.error('ERROR CODE:', error?.code)
      console.error('ERROR MESSAGE:', error?.message)
      return { ok: false, message: getAuthMessage(error, 'Invalid email or password.') }
    }
  },

  logoutUser: async () => {
    storage.remove(STORAGE_KEYS.session)
    set({ session: null })
    if (auth) {
      await signOut(auth)
    }
  },

  login: (...args) => get().loginUser(...args),
  signUp: (...args) => get().signupUser(...args),
  logout: () => get().logoutUser(),
}))
