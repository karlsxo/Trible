import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import RoleSelectionCard from '../components/RoleSelectionCard'
import { useAuth } from '../context/AuthContext'

const Welcome = () => {
  const navigate = useNavigate()
  const { session } = useAuth()

  // Already logged in — skip welcome
  if (session) {
    const target =
      session.role === 'driver' ? '/dashboard/driver' : '/dashboard/student'
    return <Navigate to={target} replace />
  }

  return (
    <div className="bg-night-950 text-slate-100">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-24 pt-16 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            Welcome to TRIBLE
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl font-semibold text-white md:text-5xl">
            Connecting students and tricycle drivers with faster and smarter
            terminal booking.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mt-14 w-full"
        >
          <div className="absolute -inset-6 rounded-[48px] bg-aurora blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-2">
            <RoleSelectionCard
              title="Student"
              description="Book seats, check live availability, and chat with drivers."
              onClick={() => navigate('/auth/student')}
            />
            <RoleSelectionCard
              title="Driver"
              description="Manage seats, view passengers, and respond to chats."
              onClick={() => navigate('/auth/driver')}
            />
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

export default Welcome
