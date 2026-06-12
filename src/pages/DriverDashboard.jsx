import { Activity, CircleDot, MessageSquareText, TicketCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import DashboardCard from '../components/DashboardCard'
import DashboardLayout from '../layouts/DashboardLayout'
import PassengerCard from '../components/PassengerCard'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useChat } from '../context/ChatContext'

const DRIVER_PROFILE_KEY = 'driver_profile_'
const normalizeId = (value) => String(value || '').trim().toLowerCase()

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
  const terminal = myDriver?.terminal ?? ''
  const destination = myDriver?.route ?? ''
  const statusIsOnline = myDriver?.status !== 'Offline'
  const online = statusIsOnline

  // Local state for form inputs with localStorage persistence
  const [localRoute, setLocalRoute] = useState('')
  const [localTerminal, setLocalTerminal] = useState('')
  const [saved, setSaved] = useState(false)
  const [chatError, setChatError] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    if (!session?.username) return
    const key = DRIVER_PROFILE_KEY + session.username
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const { route, terminal } = JSON.parse(stored)
        queueMicrotask(() => {
          setLocalRoute(route || '')
          setLocalTerminal(terminal || '')
        })
        console.log(`[LocalStorage] ✅ Loaded driver profile for ${session.username}`)
      }
    } catch (err) {
      console.warn('[LocalStorage] ⚠️ Failed to load from localStorage:', err)
    }
  }, [session?.username])

  // Sync Firebase state to local state
  useEffect(() => {
    queueMicrotask(() => {
      if (destination) {
        setLocalRoute(destination)
      }
      if (terminal) {
        setLocalTerminal(terminal)
      }
    })
  }, [destination, terminal])

  // Save to localStorage whenever route or terminal changes
  const saveToLocalStorage = (route, terminalVal) => {
    if (!session?.username) return
    const key = DRIVER_PROFILE_KEY + session.username
    try {
      localStorage.setItem(key, JSON.stringify({ route, terminal: terminalVal }))
      console.log(`[LocalStorage] 💾 Saved driver profile for ${session.username}`)
    } catch (err) {
      console.warn('[LocalStorage] ⚠️ Failed to save to localStorage:', err)
    }
  }

  // Sync online status whenever it changes
  const toggleOnline = () => {
    const next = !statusIsOnline
    if (session?.username) {
      console.log(`[DriverDashboard] 🟢 Toggling online status to ${next}`)
      setDriverOnline(session.username, next)
    }
  }

  // Save both route and terminal with single button
  const handleSave = () => {
    if (session?.username) {
      console.log(`[DriverDashboard] 💾 Saving - Terminal: "${localTerminal}", Route: "${localRoute}"`)
      
      // Update Firebase
      if (localTerminal.trim()) {
        updateDriverTerminal(session.username, localTerminal.trim())
      }
      if (localRoute.trim()) {
        updateDriverDestination(session.username, localRoute.trim())
      }
      
      // Save to localStorage
      saveToLocalStorage(localRoute, localTerminal)
      
      // Show feedback
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleChat = (student) => {
    const conversationId = ensureConversation({
      studentId: normalizeId(student.studentUsername || student.studentId || 'student'),
      studentName: student.student || 'Student',
      driverId: normalizeId(session?.username || 'driver'),
      driverName: session?.name || 'Driver',
      terminal: localTerminal || student.terminal || '',
      route: student.destination || localRoute || '',
    })
    if (!conversationId) {
      setChatError('Unable to start chat with this student.')
      return
    }
    setChatError('')
    navigate(`/chat?conversation=${encodeURIComponent(conversationId)}`)
  }

  const handleAccept = (booking) => {
    acceptBooking(booking.id)
  }

  // Handle seat adjustment with immediate persistence
  const handleSeatChange = (newSeats) => {
    const seatCount = Math.max(0, newSeats)
    console.log(`[DriverDashboard] 💺 Adjusting seats to ${seatCount}`)
    updateDriverSeats(session?.username, seatCount)
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
            Trip Details
          </p>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Configure your ride
          </h2>

          <div className="mt-6 space-y-4">
            <Input
              label="Waiting Terminal"
              placeholder="e.g., Campus Terminal, Terminal A..."
              value={localTerminal}
              onChange={(e) => setLocalTerminal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />

            <Input
              label="Destination / Route"
              placeholder="e.g., Shopping Center, Main Campus..."
              value={localRoute}
              onChange={(e) => setLocalRoute(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />

            <Button
              size="sm"
              variant={saved ? 'default' : 'ghost'}
              onClick={handleSave}
              className="w-full"
            >
              {saved ? '✓ Saved' : 'Save Trip Details'}
            </Button>
          </div>

          <div className="mt-8">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-emerald-300/70">
              Available Seats
            </p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSeatChange(Math.max(0, seats - 1))}
                className="h-11 w-11 px-0 text-xl"
                type="button"
              >
                −
              </Button>
              <span className="flex-1 text-center text-3xl font-bold text-white">
                {seats}
              </span>
              <Button
                size="sm"
                onClick={() => handleSeatChange(seats + 1)}
                className="h-11 w-11 px-0 text-xl"
                type="button"
              >
                +
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Seats update instantly. Changes are saved automatically.
            </p>
          </div>
        </div>

        <div className="glass min-w-0 rounded-3xl p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            Current student passengers
          </p>
          {chatError ? (
            <p className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-100">
              {chatError}
            </p>
          ) : null}
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
