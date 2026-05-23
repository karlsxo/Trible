import { Activity, CircleDot, MessageSquareText, TicketCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import DashboardCard from '../components/DashboardCard'
import DashboardLayout from '../layouts/DashboardLayout'
import PassengerCard from '../components/PassengerCard'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useChat } from '../context/ChatContext'

const DriverDashboard = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const {
    bookings,
    acceptBooking,
    setDriverOnline,
    updateDriverSeats,
    updateDriverDestination,
    updateDriverTerminal,
    tricycles,
  } = useBooking()
  const { ensureConversation, conversations } = useChat()
  const myDriver = tricycles.find((d) => d.driverUsername === session?.username)
  const waiting = bookings.filter((b) => b.driverUsername === session?.username)
  const myChats = conversations.filter((c) => c.driverId === session?.username)
  const unreadMessages = myChats.reduce(
    (total, chat) => total + (chat.unreadBy?.[session?.username] || 0),
    0,
  )
  const seats = myDriver?.seats ?? 0
  const terminal = myDriver?.terminal ?? 'Campus Terminal'
  const destination = myDriver?.route ?? 'Campus Route'
  const statusIsOnline = myDriver?.status !== 'Offline'
  const online = statusIsOnline

  // Sync online status whenever it changes
  const toggleOnline = () => {
    const next = !statusIsOnline
    if (session?.username) {
      setDriverOnline(session.username, next)
    }
  }

  const handleChat = (student) => {
    ensureConversation({
      studentId: student.studentUsername || student.studentId || 'student',
      studentName: student.student || 'Student',
      driverId: session?.username || 'driver',
      driverName: session?.name || 'Driver',
      terminal: terminal || student.terminal || 'Campus Terminal',
      route: student.destination || destination || 'Campus Route',
    })
    navigate('/chat')
  }

  const handleAccept = (booking) => {
    acceptBooking(booking.id)
  }

  return (
    <DashboardLayout
      heading="Driver"
      title="Driver Console"
      subtitle="Manage seats and ride requests"
      showBack={false}
      actions={
        <button
          className={`flex min-h-10 w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition sm:w-auto ${
            online
              ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
              : 'border-slate-500/40 bg-white/5 text-slate-300'
          }`}
          onClick={toggleOnline}
        >
          <CircleDot size={14} />
          {online ? 'Online' : 'Offline'}
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          title="Seats"
          value={`${seats} left`}
          caption="Live availability"
          icon={TicketCheck}
        />
        <DashboardCard
          title="Bookings"
          value={`${waiting.length}`}
          caption="Pending pickups"
          icon={Activity}
        />
        <DashboardCard
          title="Status"
          value={online ? 'Active' : 'Offline'}
          caption="Visibility in student view"
          icon={CircleDot}
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
              A student is waiting for your reply.
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

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="glass min-w-0 rounded-3xl p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            Seat Manager
          </p>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Adjust available seats
          </h2>
          <div className="mt-4">
            <Input
              label="Waiting Terminal"
              value={terminal}
              onChange={(event) =>
                updateDriverTerminal(session?.username, event.target.value)
              }
            />
          </div>
          <div className="mt-4">
            <Input
              label="Destination"
              value={destination}
              onChange={(event) =>
                updateDriverDestination(session?.username, event.target.value)
              }
            />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateDriverSeats(session?.username, seats - 1)}
              className="h-11 w-11 px-0"
            >
              -
            </Button>
            <span className="text-lg font-semibold text-white">{seats}</span>
            <Button
              size="sm"
              onClick={() => updateDriverSeats(session?.username, seats + 1)}
              className="h-11 w-11 px-0"
            >
              +
            </Button>
          </div>
        </div>
        <div className="glass min-w-0 rounded-3xl p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            Current student passengers
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {waiting.length === 0 ? (
              <p>No Current Passengers</p>
            ) : (
              waiting.slice(0, 4).map((booking) => (
                <PassengerCard
                  key={booking.id}
                  data={booking}
                  onChat={handleChat}
                  onAccept={handleAccept}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DriverDashboard
