const ChatSidebar = ({ title, subtitle, children }) => {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          {title}
        </p>
        <p className="text-sm text-slate-300">{subtitle}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">{children}</div>
    </div>
  )
}

export default ChatSidebar
