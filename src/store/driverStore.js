import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { safeFirebaseKey } from '../utils/firebaseKey'
import { db } from '../lib/firebase'
import { onValue, ref, set as dbSet, update as dbUpdate } from 'firebase/database'

const getDrivers = () => storage.get(STORAGE_KEYS.drivers, [])

const driversRef = () => ref(db, 'drivers')
const driverKey = (username) => safeFirebaseKey(username)
const driverRef = (username) => ref(db, `drivers/${driverKey(username)}`)

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

let driverSyncReady = false
let driverUnsubscribe = null

const toDriverRecord = (driver) => ({
  id: driver.id,
  fullName: driver.fullName,
  username: driver.username,
  driverNumber: driver.driverNumber || '',
  route: driver.destination || '',
  terminal: driver.terminal || '',
  availableSeats: Number(driver.availableSeats) || 0,
  isOnline: Boolean(driver.online),
  updatedAt: driver.updatedAt || Date.now(),
})

const writeDriverRecord = (username, partial, currentDriver) => {
  const nextDriver = normalizeDriver({
    ...currentDriver,
    ...partial,
    updatedAt: Date.now(),
  })

  if (db) {
    dbUpdate(driverRef(username), toDriverRecord(nextDriver))
  } else {
    const fallbackDrivers = getDrivers().map((driver) =>
      driver.username === username ? nextDriver : driver,
    )
    storage.set(STORAGE_KEYS.drivers, fallbackDrivers)
  }

  return nextDriver
}

export const useDriverStore = create((set, get) => ({
  drivers: db ? [] : getDrivers(),

  subscribeToDrivers: () => {
    if (typeof window === 'undefined' || !db) return () => {}

    if (driverSyncReady && driverUnsubscribe) {
      return driverUnsubscribe
    }

    driverSyncReady = true
    const unsubscribe = onValue(driversRef(), (snapshot) => {
      set({ drivers: driversObjectToArray(snapshot.val()) })
    })

    driverUnsubscribe = () => {
      unsubscribe()
      driverUnsubscribe = null
      driverSyncReady = false
    }

    return driverUnsubscribe
  },

  initSync: () => get().subscribeToDrivers(),

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
      dbSet(driverRef(username), toDriverRecord(nextDriver))
    } else {
      storage.set(STORAGE_KEYS.drivers, next)
    }
  },

  updateDriverProfile: (username, partial) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) return

    const nextDriver = writeDriverRecord(username, partial, currentDriver)
    const next = get().drivers.map((driver) =>
      driver.username === username ? nextDriver : driver,
    )
    set({ drivers: next })
  },

  updateDriverRoute: (username, route) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) return
    const nextDriver = writeDriverRecord(username, { destination: route }, currentDriver)
    set({ drivers: get().drivers.map((driver) => (driver.username === username ? nextDriver : driver)) })
  },

  updateDriverSeats: (username, seats) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) return
    const nextDriver = writeDriverRecord(
      username,
      { availableSeats: Math.max(0, Number(seats) || 0) },
      currentDriver,
    )
    set({ drivers: get().drivers.map((driver) => (driver.username === username ? nextDriver : driver)) })
  },

  toggleDriverStatus: (username, online) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) return
    const nextDriver = writeDriverRecord(username, { online }, currentDriver)
    set({ drivers: get().drivers.map((driver) => (driver.username === username ? nextDriver : driver)) })
  },

  getDriverByUsername: (username) => get().drivers.find((d) => d.username === username),
}))
