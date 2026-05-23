import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'

const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-night-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link to="/welcome" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
            TR
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-100">TRIBLE</p>
            <p className="text-xs text-slate-400">Tricycle Available</p>
          </div>
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/welcome">
            <Button size="sm">Role Selection</Button>
          </Link>
        </div>
        <button
          className="md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/5 bg-night-950/95 px-4 py-4 text-sm text-slate-300 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/welcome">
              <Button size="sm" className="w-full">
                Role Selection
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

export default Navbar
