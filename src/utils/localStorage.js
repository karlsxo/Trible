import { storage } from '../services/storage'
import { STORAGE_KEYS } from './constants'

// ── Users ──────────────────────────────────────────
export const getUsers = () => storage.get(STORAGE_KEYS.users, [])

export const saveUser = (user) => {
  const users = getUsers()
  storage.set(STORAGE_KEYS.users, [user, ...users])
}

export const findUser = (username) =>
  getUsers().find((u) => u.username === username)

export const isUsernameTaken = (username) =>
  getUsers().some((u) => u.username === username)

// ── Drivers (users with role=driver mapped to tricycle format) ──
export const getOnlineDrivers = () => {
  const users = getUsers()
  const onlineStatuses = storage.get(STORAGE_KEYS.driverStatus, {})

  return users
    .filter((u) => u.role === 'driver')
    .map((u) => ({
      id: u.id,
      driver: u.fullName,
      driverUsername: u.username,
      driverId: u.driverId || '',
      seats: 3,
      terminal: 'Campus Terminal',
      route: 'Main Route',
      status: onlineStatuses[u.username] === false ? 'Offline' : 'Available',
    }))
}

export const setDriverOnline = (username, online) => {
  const statuses = storage.get(STORAGE_KEYS.driverStatus, {})
  statuses[username] = online
  storage.set(STORAGE_KEYS.driverStatus, statuses)
}

// ── Session ────────────────────────────────────────
export const getSession = () => storage.get(STORAGE_KEYS.session, null)

export const saveSession = (session) =>
  storage.set(STORAGE_KEYS.session, session)

export const clearSession = () => storage.remove(STORAGE_KEYS.session)

// ── Bookings ───────────────────────────────────────
export const getBookings = () => storage.get(STORAGE_KEYS.bookings, [])

export const saveBookings = (bookings) =>
  storage.set(STORAGE_KEYS.bookings, bookings)

// ── Tricycles (kept for backwards compat, managed dynamically now) ──
export const getTricycles = () => getOnlineDrivers()

export const saveTricycles = () => {
  // Tricycles are now derived from registered drivers — no-op
}