import { LayoutGrid, MessageSquareText, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ heading = 'Student' }) => {
  const location = useLocation()
  const baseRole = heading === 'Driver' ? 'driver' : 'student'
  const baseRoute = `/dashboard/${baseRole}`
  const items = [
    { label: 'Dashboard', icon: LayoutGrid, to: baseRoute },
    { label: 'Chat', icon: MessageSquareText, to: '/chat' },
    { label: 'Settings', icon: Settings, to: `/auth/${baseRole}` },
  ]

  return (
    <aside className="hidden h-full w-64 flex-col gap-6 border-r border-white/5 bg-night-900/70 px-5 py-8 md:flex">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">
          {heading}
        </p>
        <p className="text-lg font-semibold text-white">TRIBLE Console</p>
      </div>
      <div className="space-y-2 text-sm">
        {items.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.to
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
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
      </div>
    </aside>
  )
}

export default Sidebar
