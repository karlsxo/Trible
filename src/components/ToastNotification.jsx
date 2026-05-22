const ToastNotification = ({ title, message, onClose }) => {
  if (!title && !message) return null

  return (
    <div className="fixed right-6 top-6 z-50 w-[280px] rounded-2xl border border-emerald-400/20 bg-night-900/90 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          {message ? <p className="text-xs text-slate-300">{message}</p> : null}
        </div>
        <button
          className="text-xs text-slate-400 hover:text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default ToastNotification
