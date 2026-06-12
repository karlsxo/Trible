import { ArrowLeft } from 'lucide-react'

const ChatHeader = ({ title, subtitle, onBack, status }) => {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-white/5 pb-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
          Active chat
        </p>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          {status ? (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
          ) : null}
          <p className="truncate text-lg font-semibold text-white">{title}</p>
        </div>
        <p className="truncate text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

export default ChatHeader
