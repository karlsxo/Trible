const variants = {
  primary:
    'bg-emerald-400/90 text-night-950 hover:bg-emerald-400 shadow-glow',
  ghost:
    'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10',
  outline:
    'border border-emerald-400/50 text-emerald-200 hover:bg-emerald-400/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
