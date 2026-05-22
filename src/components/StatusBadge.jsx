const styles = {
  Available: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/20',
  'Almost Full': 'bg-amber-400/15 text-amber-200 border-amber-400/20',
  Full: 'bg-rose-400/15 text-rose-200 border-rose-400/20',
  Pending: 'bg-sky-400/15 text-sky-200 border-sky-400/20',
  Accepted: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/20',
  Offline: 'bg-slate-400/15 text-slate-200 border-slate-400/20',
}

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || styles.Offline
      }`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
