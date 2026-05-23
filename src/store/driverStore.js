import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { db } from '../lib/firebase'
import { onValue, ref, set as dbSet } from 'firebase/database'

const getDrivers = () => storage.get(STORAGE_KEYS.drivers, [])

const driversRef = () => ref(db, 'drivers')

const normalizeDriver = (driver) => ({
  ...driver,
  destination:
    driver.destination === 'Campus Route' ? '' : driver.destination || driver.route || '',
  terminal: driver.terminal === 'Campus Terminal' ? '' : driver.terminal || '',
  availableSeats: Number(driver.availableSeats) || 0,
  online: Boolean(driver.online ?? driver.isOnline),
})

const driversObjectToArray = (drivers) =>
  Object.values(drivers || {})
    .filter(Boolean)
    .map(normalizeDriver)
    .sort(
      (a, b) =>
        Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0),
    )

const driversArrayToObject = (drivers) =>
  (Array.isArray(drivers) ? drivers : []).reduce((acc, driver) => {
    const normalized = normalizeDriver(driver)
    const key = normalized.username || normalized.id
    if (!key) return acc
    acc[key] = {
      id: normalized.id,
      fullName: normalized.fullName,
      username: normalized.username,
      driverNumber: normalized.driverNumber || '',
      route: normalized.destination || '',
      terminal: normalized.terminal || '',
      availableSeats: normalized.availableSeats,
      isOnline: normalized.online,
      updatedAt: normalized.updatedAt || Date.now(),
    }
    return acc
  }, {})

let driverSyncReady = false
let driverSeeded = false

export const useDriverStore = create((set, get) => ({
  drivers: getDrivers(),

  initSync: () => {
    if (driverSyncReady || typeof window === 'undefined' || !db) return
    driverSyncReady = true

    onValue(driversRef(), (snapshot) => {
      const remoteDrivers = snapshot.val()

      if (!remoteDrivers && !driverSeeded) {
        const legacyDrivers = getDrivers()
        if (Array.isArray(legacyDrivers) && legacyDrivers.length > 0) {
          driverSeeded = true
          dbSet(driversRef(), driversArrayToObject(legacyDrivers))
          return
        }
      }

      set({ drivers: driversObjectToArray(remoteDrivers) })
    })
  },

  registerDriverProfile: ({ id, fullName, username, driverNumber }) => {
    const drivers = get().drivers
    const existing = drivers.find((driver) => driver.username === username)
    if (existing) return

    const nextDriver = {
      id,
      fullName,
      username,
      driverNumber,
      terminal: '',
      destination: '',
      availableSeats: 3,
      online: true,
      updatedAt: Date.now(),
    }

    const next = [nextDriver, ...drivers]
    set({ drivers: next })

    if (db) {
      dbSet(driversRef(), {
        ...driversArrayToObject(drivers),
        [username]: {
          id,
          fullName,
          username,
          driverNumber,
          route: '',
          terminal: '',
          availableSeats: 3,
          isOnline: true,
          updatedAt: Date.now(),
        },
      })
    } else {
      storage.set(STORAGE_KEYS.drivers, next)
    }
  },

  updateDriverProfile: (username, partial) => {
    const next = get().drivers.map((driver) =>
      driver.username === username
        ? normalizeDriver({ ...driver, ...partial, updatedAt: Date.now() })
        : driver,
    )
    set({ drivers: next })

    if (db) {
      const current = next.find((driver) => driver.username === username)
      if (current) {
        dbSet(ref(db, `drivers/${username}`), {
          id: current.id,
          fullName: current.fullName,
          username: current.username,
          driverNumber: current.driverNumber || '',
          route: current.destination || '',
          terminal: current.terminal || '',
          availableSeats: Number(current.availableSeats) || 0,
          isOnline: Boolean(current.online),
          updatedAt: current.updatedAt || Date.now(),
        })
      }
    } else {
      storage.set(STORAGE_KEYS.drivers, next)
    }
  },

  getDriverByUsername: (username) => get().drivers.find((d) => d.username === username),
}))
