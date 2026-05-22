const RoleSelectionCard = ({ title, description, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass group flex w-full flex-col gap-3 rounded-[32px] border border-white/10 p-6 text-left transition hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-glow"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
        Continue as
      </p>
      <p className="text-2xl font-semibold text-white">{title}</p>
      <p className="text-sm text-slate-300">{description}</p>
      <span className="mt-2 inline-flex text-xs font-semibold text-emerald-200">
        Enter dashboard
      </span>
    </button>
  )
}

export default RoleSelectionCard
