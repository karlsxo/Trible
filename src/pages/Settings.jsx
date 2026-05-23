import { Moon, Sun } from 'lucide-react'
import Button from '../components/Button'
import DashboardLayout from '../layouts/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useThemeStore } from '../store/themeStore'

const Settings = () => {
  const { session } = useAuth()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <DashboardLayout
      heading={session?.role === 'driver' ? 'Driver' : 'Student'}
      title="Settings"
      subtitle="Appearance and preferences"
    >
      <div className="glass w-full max-w-2xl rounded-3xl p-4 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          Theme
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Display Mode</h2>
        <p className="mt-2 text-sm text-slate-300">
          Switch between dark and light mode.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="ghost" onClick={toggleTheme} className="w-full sm:w-auto">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Button>
          <span className="text-sm text-slate-300">Current: {theme}</span>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings
