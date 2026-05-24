import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { db } from '../lib/firebase'
import {
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  set as dbSet,
  update as dbUpdate,
} from 'firebase/database'
import { useDriverStore } from './driverStore'
import { safeFirebaseKey } from '../utils/firebaseKey'

const getBookings = () => storage.get(STORAGE_KEYS.bookings, [])
const bookingsRef = () => ref(db, 'bookings')
const driverRef = (username) => ref(db, `drivers/${safeFirebaseKey(username)}`)

let bookingSyncReady = false
let bookingSeeded = false

const asDriverCard = (driver) => {
  const seats = Number(driver.availableSeats) || 0
  return {
    id: driver.id,
    driver: driver.fullName,
    driverUsername: driver.username,
    driverId: driver.driverNumber || '',
    seats,
    terminal: driver.terminal ?? '',
    route: driver.destination ?? '',
    status: driver.online ? (seats > 0 ? 'Available' : 'Full') : 'Offline',
  }
}

const bookingsObjectToArray = (bookings) =>
  Object.entries(bookings || {})
    .map(([id, booking]) => ({
      ...booking,
      id: booking.id || id,
    }))
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))

const bookingsArrayToObject = (bookings) =>
  (Array.isArray(bookings) ? bookings : []).reduce((acc, booking) => {
    if (!booking?.id) return acc
    acc[String(booking.id)] = booking
    return acc
  }, {})

export const useBookingStore = create((set, get) => ({
  bookings: db ? [] : getBookings(),

  initSync: () => {
    if (bookingSyncReady || typeof window === 'undefined' || !db) return
    bookingSyncReady = true

    onValue(bookingsRef(), (snapshot) => {
      const remoteBookings = snapshot.val()

      if (!remoteBookings && !bookingSeeded) {
        const legacyBookings = getBookings()
        if (Array.isArray(legacyBookings) && legacyBookings.length > 0) {
          bookingSeeded = true
          dbSet(bookingsRef(), bookingsArrayToObject(legacyBookings))
          return
        }
      }

      set({ bookings: bookingsObjectToArray(remoteBookings) })
    })
  },

  getTricycles: () => {
    const drivers = useDriverStore.getState().drivers
    return drivers.map(asDriverCard)
  },

  getTotalSeats: () => get().getTricycles().reduce((sum, item) => sum + item.seats, 0),

  bookSeat: async (data) => {
    const driverStore = useDriverStore.getState()
    const driver = driverStore.getDriverByUsername(data.driverUsername)

    if (!driver) return { ok: false, message: 'Driver not found.' }
    if ((Number(driver.availableSeats) || 0) <= 0 || driver.online === false) {
      return { ok: false, message: 'Driver has no available seats.' }
    }

    let nextSeats = (Number(driver.availableSeats) || 0) - 1

    if (db) {
      const seatTransaction = await runTransaction(
        ref(db, `drivers/${safeFirebaseKey(driver.username)}/availableSeats`),
        (currentSeats) => {
          const seats = Number(currentSeats) || 0
          if (seats <= 0) return
          return seats - 1
        },
      )

      if (!seatTransaction.committed) {
        return { ok: false, message: 'Driver has no available seats.' }
      }

      nextSeats = Number(seatTransaction.snapshot.val()) || 0
      dbUpdate(driverRef(driver.username), { updatedAt: Date.now() })
    } else {
      driverStore.updateDriverProfile(driver.username, { availableSeats: nextSeats })
    }

    const booking = {
      id: Date.now(),
      driver: driver.fullName,
      driverUsername: driver.username,
      route: driver.destination || data.route || '',
      terminal: driver.terminal || '',
      student: data.studentName || 'Student Rider',
      studentUsername: data.studentUsername || '',
      destination: data.route || driver.destination || '',
      seatCount: 1,
      status: 'Pending',
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      createdAt: Date.now(),
    }

    const bookingRef = db ? push(bookingsRef()) : null
    const bookingId = bookingRef?.key || String(booking.id)
    const nextBooking = { ...booking, id: bookingId }
    const nextBookings = [nextBooking, ...get().bookings]
    set({ bookings: nextBookings })

    if (db && bookingRef) {
      await dbSet(bookingRef, nextBooking)
    } else {
      storage.set(STORAGE_KEYS.bookings, nextBookings)
    }

    return { ok: true, seatsLeft: nextSeats }
  },

  acceptBooking: (id) => {
    const nextBookings = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'Accepted' } : b,
    )
    set({ bookings: nextBookings })

    if (db) {
      dbUpdate(ref(db, `bookings/${id}`), { status: 'Accepted' })
    } else {
      storage.set(STORAGE_KEYS.bookings, nextBookings)
    }
  },

  cancelBooking: async (bookingId, studentUsername) => {
    const booking = get().bookings.find((b) => b.id === bookingId)
    if (!booking || booking.studentUsername !== studentUsername) {
      return { ok: false, message: 'Booking not found.' }
    }

    const driverStore = useDriverStore.getState()
    const driver = driverStore.getDriverByUsername(booking.driverUsername)
    if (driver) {
      const nextSeats = (Number(driver.availableSeats) || 0) + (booking.seatCount || 1)
      if (db) {
        await runTransaction(
          ref(db, `drivers/${safeFirebaseKey(driver.username)}/availableSeats`),
          (currentSeats) => (Number(currentSeats) || 0) + (booking.seatCount || 1),
        )
        dbUpdate(driverRef(driver.username), { updatedAt: Date.now() })
      } else {
        driverStore.updateDriverProfile(driver.username, { availableSeats: nextSeats })
      }
    }

    const nextBookings = get().bookings.filter((b) => b.id !== bookingId)
    set({ bookings: nextBookings })

    if (db) {
      remove(ref(db, `bookings/${bookingId}`))
    } else {
      storage.set(STORAGE_KEYS.bookings, nextBookings)
    }
    return { ok: true }
  },

  setDriverOnline: (username, online) => {
    useDriverStore.getState().toggleDriverStatus(username, online)
  },

  updateDriverSeats: (username, seats) => {
    useDriverStore.getState().updateDriverSeats(username, seats)
  },

  updateDriverDestination: (username, destination) => {
    useDriverStore.getState().updateDriverRoute(username, destination)
  },

  updateDriverTerminal: (username, terminal) => {
    useDriverStore.getState().updateDriverProfile(username, {
      terminal,
    })
  },
}))
