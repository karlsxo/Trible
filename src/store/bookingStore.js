import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { emitSync, onSync } from '../utils/broadcast'
import { useAuthStore } from './authStore'

const getBookings = () => storage.get(STORAGE_KEYS.bookings, [])

let bookingSyncReady = false

const asDriverCard = (user) => {
  const seats = Number(user.availableSeats) || 0
  return {
    id: user.id,
    driver: user.fullName,
    driverUsername: user.username,
    driverId: user.driverId || '',
    seats,
    terminal: 'Campus Terminal',
    route: user.route || 'Campus Route',
    status: user.online ? (seats > 0 ? 'Available' : 'Full') : 'Offline',
  }
}

export const useBookingStore = create((set, get) => ({
  bookings: getBookings(),

  initSync: () => {
    if (bookingSyncReady || typeof window === 'undefined') return
    bookingSyncReady = true

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.bookings) {
        set({ bookings: getBookings() })
      }
    })

    onSync((message) => {
      if (message?.type === 'BOOKINGS_UPDATED' || message?.type === 'AUTH_UPDATED') {
        set({ bookings: getBookings() })
      }
    })
  },

  getTricycles: () => {
    const users = useAuthStore.getState().users
    return users.filter((u) => u.role === 'driver').map(asDriverCard)
  },

  getTotalSeats: () => {
    return get().getTricycles().reduce((sum, item) => sum + item.seats, 0)
  },

  getDriverBookings: (driverUsername) => {
    return get().bookings.filter((b) => b.driverUsername === driverUsername)
  },

  bookSeat: (data) => {
    const authState = useAuthStore.getState()
    const users = authState.users
    const driver = users.find((u) => u.username === data.driverUsername && u.role === 'driver')

    if (!driver) return { ok: false, message: 'Driver not found.' }
    if ((Number(driver.availableSeats) || 0) <= 0 || driver.online === false) {
      return { ok: false, message: 'Driver has no available seats.' }
    }

    const nextSeats = (Number(driver.availableSeats) || 0) - 1
    authState.updateDriver(driver.username, { availableSeats: nextSeats })

    const booking = {
      id: Date.now(),
      driver: driver.fullName,
      driverUsername: driver.username,
      route: driver.route || data.route || 'Campus Route',
      student: data.studentName || 'Student Rider',
      studentUsername: data.studentUsername || '',
      destination: data.route || driver.route || 'Campus Route',
      seatCount: 1,
      status: 'Pending',
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }

    const nextBookings = [booking, ...get().bookings]
    storage.set(STORAGE_KEYS.bookings, nextBookings)
    set({ bookings: nextBookings })
    emitSync('BOOKINGS_UPDATED')

    return { ok: true, seatsLeft: nextSeats }
  },

  acceptBooking: (id) => {
    const nextBookings = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'Accepted' } : b,
    )
    storage.set(STORAGE_KEYS.bookings, nextBookings)
    set({ bookings: nextBookings })
    emitSync('BOOKINGS_UPDATED')
  },

  setDriverOnline: (username, online) => {
    useAuthStore.getState().updateDriver(username, { online })
    emitSync('BOOKINGS_UPDATED')
  },

  updateDriverSeats: (username, seats) => {
    useAuthStore
      .getState()
      .updateDriver(username, { availableSeats: Math.max(0, Number(seats) || 0) })
    emitSync('BOOKINGS_UPDATED')
  },
}))
