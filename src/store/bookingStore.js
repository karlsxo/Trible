import { create } from 'zustand'
import { storage } from '../services/storage'
import { STORAGE_KEYS } from '../utils/constants'
import { emitSync, onSync } from '../utils/broadcast'
import { useDriverStore } from './driverStore'

const getBookings = () => storage.get(STORAGE_KEYS.bookings, [])

let bookingSyncReady = false

const asDriverCard = (driver) => {
  const seats = Number(driver.availableSeats) || 0
  return {
    id: driver.id,
    driver: driver.fullName,
    driverUsername: driver.username,
    driverId: driver.driverNumber || '',
    seats,
    terminal: driver.terminal || 'Campus Terminal',
    route: driver.destination || 'Campus Route',
    status: driver.online ? (seats > 0 ? 'Available' : 'Full') : 'Offline',
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
      if (
        message?.type === 'BOOKING_CREATED' ||
        message?.type === 'BOOKING_CANCELLED' ||
        message?.type === 'SEAT_UPDATED'
      ) {
        set({ bookings: getBookings() })
      }
    })
  },

  getTricycles: () => {
    const drivers = useDriverStore.getState().drivers
    return drivers.map(asDriverCard)
  },

  getTotalSeats: () => get().getTricycles().reduce((sum, item) => sum + item.seats, 0),

  bookSeat: (data) => {
    const driverStore = useDriverStore.getState()
    const driver = driverStore.getDriverByUsername(data.driverUsername)

    if (!driver) return { ok: false, message: 'Driver not found.' }
    if ((Number(driver.availableSeats) || 0) <= 0 || driver.online === false) {
      return { ok: false, message: 'Driver has no available seats.' }
    }

    const nextSeats = (Number(driver.availableSeats) || 0) - 1
    driverStore.updateDriverProfile(
      driver.username,
      { availableSeats: nextSeats },
      'SEAT_UPDATED',
    )

    const booking = {
      id: Date.now(),
      driver: driver.fullName,
      driverUsername: driver.username,
      route: driver.destination || data.route || 'Campus Route',
      terminal: driver.terminal || 'Campus Terminal',
      student: data.studentName || 'Student Rider',
      studentUsername: data.studentUsername || '',
      destination: data.route || driver.destination || 'Campus Route',
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
    emitSync('BOOKING_CREATED')

    return { ok: true, seatsLeft: nextSeats }
  },

  acceptBooking: (id) => {
    const nextBookings = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'Accepted' } : b,
    )
    storage.set(STORAGE_KEYS.bookings, nextBookings)
    set({ bookings: nextBookings })
    emitSync('BOOKING_CREATED')
  },

  cancelBooking: (bookingId, studentUsername) => {
    const booking = get().bookings.find((b) => b.id === bookingId)
    if (!booking || booking.studentUsername !== studentUsername) {
      return { ok: false, message: 'Booking not found.' }
    }

    const driverStore = useDriverStore.getState()
    const driver = driverStore.getDriverByUsername(booking.driverUsername)
    if (driver) {
      const nextSeats = (Number(driver.availableSeats) || 0) + (booking.seatCount || 1)
      driverStore.updateDriverProfile(
        driver.username,
        { availableSeats: nextSeats },
        'SEAT_UPDATED',
      )
    }

    const nextBookings = get().bookings.filter((b) => b.id !== bookingId)
    storage.set(STORAGE_KEYS.bookings, nextBookings)
    set({ bookings: nextBookings })
    emitSync('BOOKING_CANCELLED')
    return { ok: true }
  },

  setDriverOnline: (username, online) => {
    useDriverStore
      .getState()
      .updateDriverProfile(username, { online }, 'DRIVER_STATUS_CHANGED')
  },

  updateDriverSeats: (username, seats) => {
    useDriverStore
      .getState()
      .updateDriverProfile(username, { availableSeats: Math.max(0, Number(seats) || 0) }, 'SEAT_UPDATED')
  },

  updateDriverDestination: (username, destination) => {
    useDriverStore
      .getState()
      .updateDriverProfile(
        username,
        { destination: destination.trim() || 'Campus Route' },
        'DRIVER_UPDATED',
      )
  },

  updateDriverTerminal: (username, terminal) => {
    useDriverStore
      .getState()
      .updateDriverProfile(
        username,
        { terminal: terminal.trim() || 'Campus Terminal' },
        'DRIVER_UPDATED',
      )
  },
}))
