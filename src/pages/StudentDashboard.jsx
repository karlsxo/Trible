import { MessageSquareText, TicketCheck, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingModal from '../components/BookingModal'
import DashboardCard from '../components/DashboardCard'
import DriverCard from '../components/DriverCard'
import ToastNotification from '../components/ToastNotification'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useChat } from '../context/ChatContext'
import Button from '../components/Button'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { tricycles, totalSeats, bookSeat, bookings, cancelBooking } = useBooking()
  const { ensureConversation, conversations } = useChat()
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)
  
  // Log realtime updates
  useEffect(() => {
    console.log('[StudentDashboard] 🚗 Realtime drivers update:', tricycles.length, 'drivers available')
    tricycles.forEach(t => {
      const status = t.status === 'Available' ? '🟢' : t.status === 'Full' ? '🔴' : '⚫'
      console.log(`  ${status} ${t.driver} @ ${t.terminal}: ${t.seats} seats, ${t.route}`)
    })
  }, [tricycles])

  const myBookings = bookings.filter((b) => b.studentUsername === session?.username)
  const myChats = conversations.filter((c) => c.studentId === session?.username)
  const unreadMessages = myChats.reduce(
    (total, chat) => total + (chat.unreadBy?.[session?.username] || 0),
    0,
  )
  const activeTerminals = new Set(tricycles.map((t) => t.terminal)).size

  const handleBook = async (data) => {
    const result = await bookSeat({
      ...data,
      studentName: session?.name || 'Student Rider',
      studentUsername: session?.username || '',
    })

    if (!result.ok) {
      setToast({ title: 'Booking failed', message: result.message || 'Try another terminal.' })
      return
    }

    setModal({
      driver: data.driver,
      terminal: data.terminal,
      seats: Math.max(0, Number(result.seatsLeft) || 0),
    })
  }

  const handleChat = (data) => {
    const conversationId = ensureConversation({
      studentId: session?.username || 'student',
      studentName: session?.name || 'Student Rider',
      driverId: data.driverUsername,
      driverName: data.driver,
      terminal: data.terminal,
      route: data.route,
    })
    if (!conversationId) {
      setToast({ title: 'Chat unavailable', message: 'Unable to start a chat with this driver.' })
      return
    }
    navigate(`/chat?conversation=${encodeURIComponent(conversationId)}`)
  }

  const handleCancelBooking = async (bookingOrDriver) => {
    const booking =
      typeof bookingOrDriver === 'string'
        ? myBookings.find((b) => String(b.id) === bookingOrDriver)
        : myBookings.find((b) => b.driverUsername === bookingOrDriver.driverUsername)

    if (!booking) return

    const result = await cancelBooking(booking.id, session?.username)
    if (!result?.ok) {
      setToast({ title: 'Unable to cancel', message: result?.message || 'Try again.' })
      return
    }
    setToast({ title: 'Booking cancelled', message: 'Seat has been released.' })
  }

  return (
    <DashboardLayout
      heading="Student"
      title="Student Dashboard"
      subtitle="Available tricycles near you"
      showBack={false}
      actions={
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Users size={16} />
          {totalSeats} seats open
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Bookings"
          value={String(myBookings.length).padStart(2, '0')}
          caption="Your recent reservations"
          icon={TicketCheck}
        />
        <DashboardCard
          title="Live chats"
          value={String(myChats.length).padStart(2, '0')}
          caption="Drivers ready to respond"
          icon={MessageSquareText}
        />
        <DashboardCard
          title="Terminals"
          value={String(activeTerminals).padStart(2, '0')}
          caption="Active pickup points"
          icon={Users}
        />
      </div>

      {unreadMessages > 0 ? (
        <div className="glass mt-6 flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
              Messages
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              {unreadMessages} unread {unreadMessages === 1 ? 'message' : 'messages'}
            </p>
            <p className="text-sm text-slate-300">
              A driver has sent you a new update.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/chat')}
            className="w-full sm:w-auto"
          >
            <MessageSquareText size={16} />
            Open chats
          </Button>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            Available Tricycles
          </p>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Choose a driver and reserve your seat
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tricycles.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-slate-300">
            No Available Drivers
          </div>
        ) : (
          tricycles.map((item) => {
            const hasBooking = myBookings.some((b) => b.driverUsername === item.driverUsername)
            return (
              <DriverCard
                key={item.id}
                data={item}
                onBook={handleBook}
                onChat={handleChat}
                onCancel={handleCancelBooking}
                hasBooking={hasBooking}
              />
            )
          })
        )}
      </div>

      <div className="mt-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          Active Bookings
        </p>
        <div className="mt-4 space-y-3">
          {myBookings.length === 0 ? (
            <div className="glass rounded-3xl p-5 text-sm text-slate-300">
              No active bookings yet.
            </div>
          ) : (
            myBookings.map((booking) => (
              <div
                key={booking.id}
                className="glass flex flex-col justify-between gap-4 rounded-3xl p-5 md:flex-row md:items-center"
              >
                <div className="min-w-0 text-sm text-slate-300">
                  <p className="text-base font-semibold text-white">{booking.driver}</p>
                  <p className="break-words">Terminal: {booking.terminal}</p>
                  <p className="break-words">Destination: {booking.destination}</p>
                  <p>Status: {booking.status}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelBooking(booking)}
                  className="w-full md:w-auto"
                >
                  Cancel Booking
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <ToastNotification
        title={toast?.title}
        message={toast?.message}
        onClose={() => setToast(null)}
      />
      <BookingModal
        open={Boolean(modal)}
        details={modal}
        onClose={() => setModal(null)}
      />
    </DashboardLayout>
  )
}

export default StudentDashboard
