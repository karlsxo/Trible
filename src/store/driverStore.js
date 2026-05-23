import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { emitSync, onSync } from '../utils/broadcast'

const getDrivers = () => {
  const raw = storage.get(STORAGE_KEYS.drivers, [])
  if (!Array.isArray(raw)) return []
  const normalized = raw.map((d) => ({
    ...d,
    // migrate legacy placeholders to empty so placeholders show
    destination: d.destination === 'Campus Route' ? '' : d.destination || '',
    terminal: d.terminal === 'Campus Terminal' ? '' : d.terminal || '',
  }))
  // persist normalization if it changed
  try {
    const same = JSON.stringify(normalized) === JSON.stringify(raw)
    if (!same) storage.set(STORAGE_KEYS.drivers, normalized)
  } catch (e) {}
  return normalized
}

let driverSyncReady = false

export const useDriverStore = create((set, get) => ({
  drivers: getDrivers(),

  initSync: () => {
    if (driverSyncReady || typeof window === 'undefined') return
    driverSyncReady = true

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.drivers) {
        set({ drivers: getDrivers() })
      }
    })

    onSync((message) => {
      if (
        message?.type === 'USER_UPDATED' ||
        message?.type === 'DRIVER_STATUS_CHANGED' ||
        message?.type === 'SEAT_UPDATED' ||
        message?.type === 'DRIVER_UPDATED'
      ) {
        set({ drivers: getDrivers() })
      }
    })
  },

  registerDriverProfile: ({ id, fullName, username, driverNumber }) => {
    const drivers = get().drivers
    const existing = drivers.find((d) => d.username === username)
    if (existing) return

    const next = [
      {
        id,
        fullName,
        username,
        driverNumber,
        terminal: '',
        // start with an empty destination so placeholder is shown
        destination: '',
        availableSeats: 3,
        online: true,
      },
      ...drivers,
    ]

    storage.set(STORAGE_KEYS.drivers, next)
    set({ drivers: next })
    emitSync('USER_UPDATED')
  },

  updateDriverProfile: (username, partial, eventType = 'DRIVER_STATUS_CHANGED') => {
    const next = get().drivers.map((driver) =>
      driver.username === username ? { ...driver, ...partial } : driver,
    )
    storage.set(STORAGE_KEYS.drivers, next)
    set({ drivers: next })
    emitSync(eventType)
  },

  getDriverByUsername: (username) => get().drivers.find((d) => d.username === username),
}))
