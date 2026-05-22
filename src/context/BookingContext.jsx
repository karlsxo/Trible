import { createContext, useContext, useEffect, useMemo } from 'react'
import { useBookingStore } from '../store/bookingStore'

const BookingContext = createContext(null)

export const BookingProvider = ({ children }) => {
  const bookings = useBookingStore((state) => state.bookings)
  const initSync = useBookingStore((state) => state.initSync)
  const getTricycles = useBookingStore((state) => state.getTricycles)
  const getTotalSeats = useBookingStore((state) => state.getTotalSeats)
  const bookSeat = useBookingStore((state) => state.bookSeat)
  const acceptBooking = useBookingStore((state) => state.acceptBooking)
  const setDriverOnline = useBookingStore((state) => state.setDriverOnline)
  const updateDriverSeats = useBookingStore((state) => state.updateDriverSeats)

  useEffect(() => {
    initSync()
  }, [initSync])

  const tricycles = getTricycles()
  const totalSeats = getTotalSeats()

  const value = useMemo(
    () => ({
      tricycles,
      bookings,
      totalSeats,
      bookSeat,
      acceptBooking,
      setDriverOnline,
      updateDriverSeats,
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
      setDriverOnline,
      updateDriverSeats,
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
