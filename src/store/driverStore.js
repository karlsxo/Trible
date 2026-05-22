import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { emitSync, onSync } from '../utils/broadcast'

const getDrivers = () => storage.get(STORAGE_KEYS.drivers, [])

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
        terminal: 'Campus Terminal',
        destination: 'Campus Route',
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
