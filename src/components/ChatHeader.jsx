const ChatHeader = ({ title, subtitle }) => {
  return (
    <div className="border-b border-white/5 pb-4">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
        Active chat
      </p>
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  )
}

export default ChatHeader
