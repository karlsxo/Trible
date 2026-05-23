import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import Button from '../components/Button'

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-night-950 px-4 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
        404
      </p>
      <h1 className="text-3xl font-semibold text-white">Page not found</h1>
      <p className="text-sm text-slate-300">
        The page you are looking for is not part of the TRIBLE flow.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <BackButton fallback="/welcome" />
        <Link to="/welcome">
          <Button size="sm" className="w-full sm:w-auto">
            Back to welcome
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
