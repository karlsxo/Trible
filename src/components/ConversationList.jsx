const ConversationList = ({ items, activeId, onSelect }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
        No conversations yet.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isActive = item.id === activeId
        const isOnline = item.status && item.status !== 'Offline'

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`w-full rounded-2xl border p-3 text-left transition active:scale-[0.99] sm:p-4 ${
              isActive
                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-sm font-semibold text-emerald-100">
                {(item.title || 'TR').slice(0, 2).toUpperCase()}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-night-900 ${
                    isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="shrink-0 text-[10px] text-slate-400">
                    {item.timestamp || ''}
                  </p>
                </div>
                <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-400">
                    {item.subtitle}
                  </p>
                  {item.unread > 0 ? (
                    <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 px-1.5 text-[10px] font-bold text-night-950">
                      {item.unread}
                    </span>
                  ) : null}
                </div>
                {item.status ? (
                  <p className="mt-2 truncate text-[10px] uppercase tracking-wide text-emerald-300/80">
                    {item.status}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ConversationList
