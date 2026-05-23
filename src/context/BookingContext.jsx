/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo } from 'react'
import { useBookingStore } from '../store/bookingStore'
import { useDriverStore } from '../store/driverStore'

const BookingContext = createContext(null)

export const BookingProvider = ({ children }) => {
  const bookings = useBookingStore((state) => state.bookings)
  const initSync = useBookingStore((state) => state.initSync)
  const getTotalSeats = useBookingStore((state) => state.getTotalSeats)
  const bookSeat = useBookingStore((state) => state.bookSeat)
  const acceptBooking = useBookingStore((state) => state.acceptBooking)
  const cancelBooking = useBookingStore((state) => state.cancelBooking)
  const setDriverOnline = useBookingStore((state) => state.setDriverOnline)
  const updateDriverSeats = useBookingStore((state) => state.updateDriverSeats)
  const updateDriverDestination = useBookingStore(
    (state) => state.updateDriverDestination,
  )
  const updateDriverTerminal = useBookingStore(
    (state) => state.updateDriverTerminal,
  )
  const drivers = useDriverStore((state) => state.drivers)
  const subscribeToDrivers = useDriverStore((state) => state.subscribeToDrivers)
  const initDriverSync = useDriverStore((state) => state.initSync)

  useEffect(() => {
    initSync()
  }, [initSync])
  useEffect(() => {
    initDriverSync()
    return subscribeToDrivers()
  }, [initDriverSync, subscribeToDrivers])

  const tricycles = useMemo(
    () =>
      drivers.map((driver) => {
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
      }),
    [drivers],
  )
  const totalSeats = getTotalSeats()

  const value = useMemo(
    () => ({
      tricycles,
      bookings,
      totalSeats,
      bookSeat,
      acceptBooking,
      cancelBooking,
      setDriverOnline,
      updateDriverSeats,
      updateDriverDestination,
      updateDriverTerminal,
      getDriverBookings: (driverUsername) =>
        bookings.filter((b) => b.driverUsername === driverUsername),
      refreshDrivers: () => {},
    }),
    [
      tricycles,
      bookings,
      totalSeats,
      bookSeat,
      acceptBooking,
      cancelBooking,
      setDriverOnline,
      updateDriverSeats,
      updateDriverDestination,
      updateDriverTerminal,
    ],
  )

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  )
}

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
