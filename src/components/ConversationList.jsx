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
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
      </button>
    )
  })
}

export default ConversationList
