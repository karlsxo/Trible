import { LayoutGrid, Menu, MessageSquareText, Settings, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = ({
  heading,
  title,
  subtitle,
  children,
  actions,
  showBack = true,
}) => {
  const { logout, session } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const baseRole = heading === 'Driver' ? 'driver' : 'student'
  const baseRoute = `/dashboard/${baseRole}`
  const items = [
    { label: 'Dashboard', icon: LayoutGrid, to: baseRoute },
    { label: 'Chat', icon: MessageSquareText, to: '/chat' },
    { label: 'Settings', icon: Settings, to: '/settings' },
  ]

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-night-950">
      <Sidebar heading={heading} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-white/5 bg-night-900/80 px-4 py-4 backdrop-blur md:static md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 md:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                {title}
              </p>
              <p className="truncate text-lg font-semibold text-white sm:text-xl">
                {subtitle}
              </p>
              <p className="truncate text-xs text-slate-400">
                Signed in as {session?.name}
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            {showBack ? (
              <BackButton fallback={baseRoute} className="w-full sm:w-auto" />
            ) : null}
            {actions}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full sm:w-auto"
            >
              Logout
            </Button>
          </div>
        </header>
        <main className="w-full px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-night-950/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="glass relative flex h-full w-[min(19rem,86vw)] flex-col gap-6 rounded-r-3xl px-5 py-6 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">
                  {heading}
                </p>
                <p className="text-lg font-semibold text-white">TRIBLE Console</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-2 text-sm">
              {items.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.to

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 transition ${
                      active
                        ? 'bg-emerald-400/15 text-emerald-200'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

export default DashboardLayout
