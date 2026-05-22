import { MessageSquareText, TicketCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingModal from '../components/BookingModal'
import DashboardCard from '../components/DashboardCard'
import DriverCard from '../components/DriverCard'
import ToastNotification from '../components/ToastNotification'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useChat } from '../context/ChatContext'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { tricycles, totalSeats, bookSeat } = useBooking()
  const { ensureConversation } = useChat()
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)

  const handleBook = (data) => {
    const result = bookSeat({
      ...data,
      studentName: session?.name || 'Student Rider',
      studentUsername: session?.username || '',
    })

    if (!result.ok) {
      setToast({ title: 'Fully booked', message: 'Try another terminal.' })
      return
    }

    setModal({
      driver: data.driver,
      terminal: data.terminal,
      seats: Math.max(0, data.seats - 1),
    })
  }

  const handleChat = (data) => {
    ensureConversation({
      studentId: session?.username || 'student',
      studentName: session?.name || 'Student Rider',
      driverId: data.driverUsername,
      driverName: data.driver,
      terminal: data.terminal,
      route: data.route,
    })
    navigate('/chat')
  }

  return (
    <DashboardLayout
      heading="Student"
      title="Student Dashboard"
      subtitle="Available tricycles near you"
      actions={
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Users size={16} />
          {totalSeats} seats open
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Bookings"
          value="04"
          caption="Your recent reservations"
          icon={TicketCheck}
        />
        <DashboardCard
          title="Live chats"
          value="02"
          caption="Drivers ready to respond"
          icon={MessageSquareText}
        />
        <DashboardCard
          title="Terminals"
          value="06"
          caption="Active pickup points"
          icon={Users}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            Available Tricycles
          </p>
          <h2 className="text-xl font-semibold text-white">
            Choose a driver and reserve your seat
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tricycles.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-slate-300">
            No Available Drivers
          </div>
        ) : (
          tricycles.map((item) => (
            <DriverCard
              key={item.id}
              data={item}
              onBook={handleBook}
              onChat={handleChat}
            />
          ))
        )}
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
