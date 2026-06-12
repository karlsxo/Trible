import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BackButton = ({ fallback = '/welcome', label = 'Back', className = '', to }) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (to) {
      navigate(to)
      return
    }

    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallback)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 active:scale-[0.98] ${className}`}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  )
}

export default BackButton
