import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getBookings, saveBookings, getOnlineDrivers } from '../utils/localStorage'

const BookingContext = createContext(null)

export const BookingProvider = ({ children }) => {
  const [tricycles, setTricycles] = useState(() => getOnlineDrivers())
  const [bookings, setBookings] = useState(() => getBookings())

  // Refresh tricycles from registered drivers whenever bookmarks/state changes
  useEffect(() => {
    setTricycles(getOnlineDrivers())
  }, [])

  useEffect(() => {
    saveBookings(bookings)
  }, [bookings])

  const totalSeats = useMemo(
    () => tricycles.reduce((sum, t) => sum + t.seats, 0),
    [tricycles],
  )

  const refreshDrivers = () => {
    setTricycles(getOnlineDrivers())
  }

  const bookSeat = (data) => {
    if (data.seats <= 0) return { ok: false, message: 'Fully booked.' }

    setTricycles((prev) =>
      prev.map((item) => {
        if (item.id !== data.id) return item
        const next = item.seats - 1
        return {
          ...item,
          seats: next,
          status: next <= 0 ? 'Full' : next <= 1 ? 'Almost Full' : 'Available',
        }
      }),
    )

    setBookings((prev) => [
      {
        id: Date.now(),
        driver: data.driver,
        terminal: data.terminal,
        route: data.route,
        student: data.studentName || 'Student Rider',
        studentUsername: data.studentUsername || '',
        destination: data.route,
        seatCount: 1,
        status: 'Pending',
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
      ...prev,
    ])

    return { ok: true }
  }

  const acceptBooking = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Accepted' } : b)),
    )
  }

  const value = useMemo(
    () => ({
      tricycles,
      bookings,
      totalSeats,
      bookSeat,
      acceptBooking,
      setBookings,
      refreshDrivers,
    }),
    [tricycles, bookings, totalSeats],
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