import clsx from 'clsx'

export default function Spinner({ size = 'md', className, label }) {
  const sizes = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' }
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2', className)}>
      <svg
        className={clsx('animate-spin text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]', sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}

// Full-page centered loading overlay
export function FullPageSpinner({ label = 'Thinking with AI…' }) {
  return (
    <div className="flex items-center justify-center min-h-[320px]">
      <Spinner size="xl" label={label} />
    </div>
  )
}
