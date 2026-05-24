import { storage } from '../services/storage'
import { STORAGE_KEYS } from './constants'

export const getSession = () => storage.get(STORAGE_KEYS.session, null)

export const saveSession = (session) => storage.set(STORAGE_KEYS.session, session)

export const clearSession = () => storage.remove(STORAGE_KEYS.session)
