import { Activity, CircleDot, TicketCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import DashboardCard from '../components/DashboardCard'
import DashboardLayout from '../layouts/DashboardLayout'
import PassengerCard from '../components/PassengerCard'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useChat } from '../context/ChatContext'

const DriverDashboard = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { bookings, acceptBooking, setDriverOnline, updateDriverSeats, tricycles } =
    useBooking()
  const { ensureConversation } = useChat()
  const [online, setOnline] = useState(true)
  const myDriver = tricycles.find((d) => d.driverUsername === session?.username)
  const waiting = bookings.filter((b) => b.driverUsername === session?.username)
  const seats = myDriver?.seats ?? 0
  const statusIsOnline = myDriver?.status !== 'Offline'

  // Sync online status whenever it changes
  const toggleOnline = () => {
    const next = !online
    setOnline(next)
    if (session?.username) {
      setDriverOnline(session.username, next)
    }
  }

  useEffect(() => {
    setOnline(statusIsOnline)
  }, [statusIsOnline])

  const handleChat = (student) => {
    ensureConversation({
      studentId: student.studentUsername || student.studentId || 'student',
      studentName: student.student || 'Student',
      driverId: session?.username || 'driver',
      driverName: session?.name || 'Driver',
      terminal: 'Terminal',
      route: student.destination || 'Campus Gate',
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
      actions={
        <button
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
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
      <div className="grid gap-4 md:grid-cols-3">
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

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            Seat Manager
          </p>
          <h2 className="text-xl font-semibold text-white">
            Adjust available seats
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateDriverSeats(session?.username, seats - 1)}
            >
              -
            </Button>
            <span className="text-lg font-semibold text-white">{seats}</span>
            <Button size="sm" onClick={() => updateDriverSeats(session?.username, seats + 1)}>
              +
            </Button>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
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
