import Button from '../components/Button'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = ({ heading, title, subtitle, children, actions }) => {
  const { logout, session } = useAuth()

  return (
    <div className="flex min-h-screen bg-night-950">
      <Sidebar heading={heading} />
      <div className="flex-1">
        <header className="flex flex-col gap-4 border-b border-white/5 bg-night-900/60 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
              {title}
            </p>
            <p className="text-xl font-semibold text-white">{subtitle}</p>
            <p className="text-xs text-slate-400">Signed in as {session?.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
