const DashboardCard = ({ title, value, caption, icon: Icon }) => {
  return (
    <div className="glass min-w-0 rounded-3xl p-5 shadow-soft">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
            {title}
          </p>
          <p className="truncate text-2xl font-semibold text-white">{value}</p>
          {caption ? (
            <p className="truncate text-xs text-slate-400">{caption}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="shrink-0 rounded-2xl bg-emerald-400/10 p-3 text-emerald-200">
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DashboardCard
