const Input = ({ label, hint, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm font-semibold text-slate-200">
          {label}
        </label>
      ) : null}
      <input
        className={`w-full rounded-2xl border border-slate-700/60 bg-night-800/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 ${className}`}
        {...props}
      />
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export default Input
