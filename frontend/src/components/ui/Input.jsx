import clsx from 'clsx'

export function Input({ label, error, hint, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={clsx(
          'h-10 w-full rounded-xl border px-3.5 text-sm text-slate-900 transition-all duration-150',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]',
          'shadow-sm',
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-slate-300 bg-white hover:border-slate-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className, rows = 5, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={clsx(
          'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-150 resize-y',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]',
          'shadow-sm',
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-slate-300 bg-white hover:border-slate-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function Select({ label, error, hint, children, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={clsx(
          'h-10 w-full rounded-xl border px-3.5 text-sm text-slate-900 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]',
          'appearance-none bg-white shadow-sm',
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-slate-300 hover:border-slate-400',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
