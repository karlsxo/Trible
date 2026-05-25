import { create } from 'zustand'
import { db } from '../lib/firebase'
import { onValue, ref, set as dbSet, update as dbUpdate } from 'firebase/database'

const driversRef = () => ref(db, 'drivers')
const onlineStatusRef = () => ref(db, 'onlineStatus')
const driverRef = (driverId) => ref(db, `drivers/${driverId}`)
const driverStatusRef = (driverId) => ref(db, `onlineStatus/${driverId}`)

const normalizeDriver = (driver) => {
  const destination =
    driver.destination === 'Campus Route'
      ? ''
      : driver.destination || driver.route || ''

  return {
    ...driver,
    destination,
    route: destination,
    terminal: driver.terminal === 'Campus Terminal' ? '' : driver.terminal || '',
    availableSeats: Number(driver.availableSeats) || 0,
    online: Boolean(driver.online ?? driver.isOnline),
  }
}

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
  route: driver.destination || driver.route || '',
  destination: driver.destination || driver.route || '',
  terminal: driver.terminal || '',
  availableSeats: Number(driver.availableSeats) || 0,
  isOnline: Boolean(driver.online),
  updatedAt: driver.updatedAt || Date.now(),
})

const writeDriverRecord = (driverId, partial, currentDriver) => {
  const nextDriver = normalizeDriver({
    ...currentDriver,
    ...partial,
    updatedAt: Date.now(),
  })

  console.log(`[Firebase] 🚗 Updating driver ${currentDriver.username}:`, partial)
  
  if (db) {
    dbUpdate(driverRef(driverId), toDriverRecord(nextDriver))
    dbSet(driverStatusRef(driverId), {
      id: nextDriver.id,
      username: nextDriver.username,
      isOnline: Boolean(nextDriver.online),
      updatedAt: nextDriver.updatedAt,
    })
    console.log(`[Firebase] ✅ Driver ${currentDriver.username} synced to Firebase`)
  }

  return nextDriver
}

export const useDriverStore = create((set, get) => ({
  drivers: [],
  onlineStatus: {},

  subscribeToDrivers: () => {
    if (typeof window === 'undefined' || !db) return () => {}

    if (driverSyncReady && driverUnsubscribe) {
      return driverUnsubscribe
    }

    driverSyncReady = true
    console.log('[Firebase] 🚗 Subscribing to realtime driver updates...')
    
    const unsubscribeDrivers = onValue(driversRef(), (snapshot) => {
      const drivers = driversObjectToArray(snapshot.val())
      console.log('[Firebase] 🚗 Drivers realtime update:', drivers.length, 'drivers')
      drivers.forEach(d => {
        console.log(`  - ${d.fullName} (${d.username}): ${d.online ? '🟢 online' : '🔴 offline'}, seats: ${d.availableSeats}, route: ${d.destination}`)
      })
      set({ drivers })
    })
    
    const unsubscribeOnlineStatus = onValue(onlineStatusRef(), (snapshot) => {
      const status = snapshot.val() || {}
      console.log('[Firebase] 🟢 Online status update:', Object.keys(status).length, 'statuses')
      set({ onlineStatus: status })
    })

    driverUnsubscribe = () => {
      console.log('[Firebase] 🚗 Unsubscribing from driver updates')
      unsubscribeDrivers()
      unsubscribeOnlineStatus()
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
      dbSet(driverRef(id), toDriverRecord(nextDriver))
      dbSet(driverStatusRef(id), {
        id,
        username,
        isOnline: Boolean(nextDriver.online),
        updatedAt: nextDriver.updatedAt,
      })
    }
  },

  updateDriverProfile: (username, partial) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) return
    const nextDriver = writeDriverRecord(currentDriver.id, partial, currentDriver)
    const next = get().drivers.map((driver) =>
      driver.username === username ? nextDriver : driver,
    )
    set({ drivers: next })
  },

  updateDriverRoute: (username, route) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) {
      console.warn(`[Firebase] ⚠️ Driver ${username} not found for route update`)
      return
    }
    console.log(`[Firebase] 🛣️  Updating route for ${username} to "${route}"`)
    const nextDriver = writeDriverRecord(
      currentDriver.id,
      { destination: route },
      currentDriver,
    )
    set({ drivers: get().drivers.map((driver) => (driver.username === username ? nextDriver : driver)) })
  },

  updateDriverSeats: (username, seats) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) {
      console.warn(`[Firebase] ⚠️ Driver ${username} not found for seat update`)
      return
    }
    const seatCount = Math.max(0, Number(seats) || 0)
    console.log(`[Firebase] 💺 Updating seats for ${username} to ${seatCount}`)
    const nextDriver = writeDriverRecord(
      currentDriver.id,
      { availableSeats: seatCount },
      currentDriver,
    )
    set({ drivers: get().drivers.map((driver) => (driver.username === username ? nextDriver : driver)) })
  },

  toggleDriverStatus: (username, online) => {
    const currentDriver = get().drivers.find((driver) => driver.username === username)
    if (!currentDriver) {
      console.warn(`[Firebase] ⚠️ Driver ${username} not found for status update`)
      return
    }
    console.log(`[Firebase] 🟢 Toggling driver ${username} status to ${online ? 'ONLINE' : 'OFFLINE'}`)
    const nextDriver = writeDriverRecord(currentDriver.id, { online }, currentDriver)
    set({ drivers: get().drivers.map((driver) => (driver.username === username ? nextDriver : driver)) })
  },

  getDriverByUsername: (username) => get().drivers.find((d) => d.username === username),
}))
