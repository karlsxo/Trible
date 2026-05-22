const ConversationList = ({ items, activeId, onSelect }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
        No conversations yet.
      </div>
    )
  }

  return items.map((item) => {
    const isActive = item.id === activeId
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item.id)}
        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
          isActive
            ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">{item.timestamp || ''}</p>
            {item.unread > 0 ? (
              <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-400/20 px-1.5 text-[10px] font-semibold text-emerald-100">
                {item.unread}
              </span>
            ) : null}
          </div>
        </div>
        {item.status ? (
          <p className="mt-2 text-[10px] uppercase tracking-wide text-emerald-300/80">
            {item.status}
          </p>
        ) : null}
      </button>
    )
  })
}

export default ConversationList
