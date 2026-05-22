import { storage } from '../services/storage'
import { STORAGE_KEYS } from './constants'

export const getUsers = () => storage.get(STORAGE_KEYS.users, [])

export const saveUsers = (users) => storage.set(STORAGE_KEYS.users, users)

export const getSession = () => storage.get(STORAGE_KEYS.session, null)

export const saveSession = (session) => storage.set(STORAGE_KEYS.session, session)

export const clearSession = () => storage.remove(STORAGE_KEYS.session)

export const getBookings = () => storage.get(STORAGE_KEYS.bookings, [])

export const saveBookings = (bookings) =>
  storage.set(STORAGE_KEYS.bookings, bookings)
