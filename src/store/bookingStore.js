import { create } from 'zustand'
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

const bookingsRef = () => ref(db, 'bookings')
const driverRef = (driverId) => ref(db, `drivers/${driverId}`)

let bookingSyncReady = false
const normalizeId = (value) => String(value || '').trim().toLowerCase()

const asDriverCard = (driver) => {
  const seats = Number(driver.availableSeats) || 0
  return {
    id: driver.id,
    driver: driver.fullName,
    driverUsername: driver.username,
    driverId: driver.driverNumber || '',
    seats,
    terminal: driver.terminal ?? '',
    route: driver.destination || driver.route || '',
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

export const useBookingStore = create((set, get) => ({
  bookings: [],

  initSync: () => {
    if (bookingSyncReady || typeof window === 'undefined' || !db) return
    bookingSyncReady = true

    console.log('[Firebase] 📦 Subscribing to realtime booking updates...')
    onValue(bookingsRef(), (snapshot) => {
      const bookings = bookingsObjectToArray(snapshot.val())
      console.log('[Firebase] 📦 Bookings realtime update:', bookings.length, 'bookings')
      set({ bookings })
    })
  },

  getTricycles: () => {
    const drivers = useDriverStore.getState().drivers
    return drivers.map(asDriverCard)
  },

  getTotalSeats: () => get().getTricycles().reduce((sum, item) => sum + item.seats, 0),

  bookSeat: async (data) => {
    const driverUsername = normalizeId(data.driverUsername)
    if (!driverUsername) {
      return { ok: false, message: 'Driver not found.' }
    }

    const driverStore = useDriverStore.getState()
    const driver = driverStore.getDriverByUsername(driverUsername)

    if (!driver) {
      console.warn('[Firebase] ⚠️ Driver not found for booking:', data.driverUsername)
      return { ok: false, message: 'Driver not found.' }
    }
    if ((Number(driver.availableSeats) || 0) <= 0 || driver.online === false) {
      console.warn('[Firebase] ⚠️ Driver unavailable:', driver.username, '- seats:', driver.availableSeats, '- online:', driver.online)
      return { ok: false, message: 'Driver has no available seats.' }
    }

    let nextSeats = (Number(driver.availableSeats) || 0) - 1

    const booking = {
      id: Date.now(),
      driver: driver.fullName,
      driverUsername: driver.username,
      driverRecordId: driver.id,
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

    let seatDecremented = false
    try {
      if (db) {
        const seatTransaction = await runTransaction(
          ref(db, `drivers/${driver.id}/availableSeats`),
          (currentSeats) => {
            const seats = Number(currentSeats) || 0
            if (seats <= 0) return
            return seats - 1
          },
        )

        if (!seatTransaction.committed) {
          console.warn('[Firebase] ⚠️ Seat transaction failed for driver:', driver.username)
          return { ok: false, message: 'Driver has no available seats.' }
        }

        seatDecremented = true
        nextSeats = Number(seatTransaction.snapshot.val()) || 0
        await dbUpdate(driverRef(driver.id), { updatedAt: Date.now() })
      }

      const bookingRef = db ? push(bookingsRef()) : null
      const bookingId = bookingRef?.key || String(booking.id)
      const nextBooking = { ...booking, id: bookingId }
      const nextBookings = [nextBooking, ...get().bookings]
      set({ bookings: nextBookings })

      if (db && bookingRef) {
        try {
          await dbSet(bookingRef, nextBooking)
          console.log('[Firebase] ✅ Booking created:', bookingId, '- student:', data.studentName, '- driver:', driver.fullName)
        } catch (writeError) {
          set({ bookings: get().bookings.filter((b) => b.id !== bookingId) })
          if (seatDecremented) {
            await runTransaction(
              ref(db, `drivers/${driver.id}/availableSeats`),
              (currentSeats) => (Number(currentSeats) || 0) + 1,
            )
            await dbUpdate(driverRef(driver.id), { updatedAt: Date.now() })
          }
          throw writeError
        }
      }

      return { ok: true, seatsLeft: nextSeats }
    } catch (error) {
      console.error('[Firebase] ❌ Booking failed:', error)
      return { ok: false, message: 'Unable to complete booking. Please try again.' }
    }
  },

  acceptBooking: (id) => {
    const nextBookings = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'Accepted' } : b,
    )
    set({ bookings: nextBookings })

    if (db) {
      dbUpdate(ref(db, `bookings/${id}`), { status: 'Accepted' })
      console.log('[Firebase] ✅ Booking accepted:', id)
    }
  },

  cancelBooking: async (bookingId, studentUsername) => {
    const normalizedBookingId = String(bookingId || '')
    const normalizedStudentUsername = normalizeId(studentUsername)
    const booking = get().bookings.find((b) => String(b.id) === normalizedBookingId)
    if (!booking || normalizeId(booking.studentUsername) !== normalizedStudentUsername) {
      console.warn('[Firebase] ⚠️ Booking not found or unauthorized:', bookingId)
      return { ok: false, message: 'Booking not found.' }
    }

    const driverStore = useDriverStore.getState()
    const driver = driverStore.getDriverByUsername(normalizeId(booking.driverUsername))
    const driverId = booking.driverRecordId || driver?.id
    if (driverId && db) {
      await runTransaction(
        ref(db, `drivers/${driverId}/availableSeats`),
        (currentSeats) => (Number(currentSeats) || 0) + (booking.seatCount || 1),
      )
      await dbUpdate(driverRef(driverId), { updatedAt: Date.now() })
      console.log('[Firebase] ✅ Booking cancelled:', bookingId, '- returned', booking.seatCount, 'seats to driver')
    }

    const nextBookings = get().bookings.filter((b) => String(b.id) !== normalizedBookingId)
    set({ bookings: nextBookings })

    if (db) {
      await remove(ref(db, `bookings/${normalizedBookingId}`))
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
