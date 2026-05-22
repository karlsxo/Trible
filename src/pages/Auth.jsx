import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import ToastNotification from '../components/ToastNotification'
import { useAuth } from '../context/AuthContext'

const Auth = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const { login, signUp, session } = useAuth()
  const [mode, setMode] = useState('login')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    driverId: '',
    username: '',
    identifier: '',
    password: '',
  })

  const normalizedRole = useMemo(() => {
    if (role === 'student' || role === 'driver') return role
    return null
  }, [role])

  if (!normalizedRole) {
    return <Navigate to="/welcome" replace />
  }

  // Already logged in — redirect
  if (session) {
    const target =
      session.role === 'driver' ? '/dashboard/driver' : '/dashboard/student'
    return <Navigate to={target} replace />
  }

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (mode === 'login') {
      const result = login(form.identifier, form.password, normalizedRole)
      if (!result.ok) {
        setToast({ title: 'Login failed', message: result.message })
        return
      }
      navigate(
        result.role === 'driver'
          ? '/dashboard/driver'
          : '/dashboard/student',
      )
      return
    }

    const result = signUp(normalizedRole, {
      fullName: form.fullName,
      driverId: form.driverId,
      username: form.username,
      password: form.password,
    })

    if (!result.ok) {
      setToast({ title: 'Sign up failed', message: result.message })
      return
    }

    navigate(
      normalizedRole === 'driver'
        ? '/dashboard/driver'
        : '/dashboard/student',
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-night-950 px-4">
      <div className="absolute inset-0 bg-aurora opacity-70" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative z-10 w-full max-w-md rounded-[36px] p-8 shadow-soft"
      >
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            {normalizedRole} access
          </p>
          <h1 className="font-display text-2xl font-semibold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-300">
            {mode === 'login'
              ? 'Use your username to sign in.'
              : 'Enter your details to set up your profile.'}
          </p>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Role:</span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
            {normalizedRole}
          </span>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-night-900/60 p-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              className={`rounded-2xl px-4 py-2 transition ${
                mode === 'login'
                  ? 'bg-emerald-400/20 text-emerald-200'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`rounded-2xl px-4 py-2 transition ${
                mode === 'signup'
                  ? 'bg-emerald-400/20 text-emerald-200'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="mt-6">
          <AuthForm
            role={normalizedRole}
            mode={mode}
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onToggleMode={() =>
              setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
            }
          />
        </div>
        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/welcome" className="transition hover:text-white">
            Back to role selection
          </Link>
        </div>
      </motion.div>
      <ToastNotification
        title={toast?.title}
        message={toast?.message}
        onClose={() => setToast(null)}
      />
    </div>
  )
}

export default Auth