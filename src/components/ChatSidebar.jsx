const ChatSidebar = ({ title, subtitle, children }) => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          {title}
        </p>
        <p className="truncate text-sm text-slate-300">{subtitle}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
        {children}
      </div>
    </div>
  )
}

export default ChatSidebar
