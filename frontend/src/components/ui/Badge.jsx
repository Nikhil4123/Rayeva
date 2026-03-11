import clsx from 'clsx'

const variants = {
  // Status
  success:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  error:      'bg-red-50 text-red-700 border-red-200',
  warning:    'bg-amber-50 text-amber-700 border-amber-200',
  info:       'bg-blue-50 text-blue-700 border-blue-200',
  neutral:    'bg-slate-100 text-slate-600 border-slate-200',

  // Sustainability filters
  'plastic-free':      'bg-blue-50 text-blue-700 border-blue-200',
  compostable:         'bg-lime-50 text-lime-700 border-lime-200',
  biodegradable:       'bg-green-50 text-green-700 border-green-200',
  vegan:               'bg-violet-50 text-violet-700 border-violet-200',
  'cruelty-free':      'bg-pink-50 text-pink-700 border-pink-200',
  'recycled-material': 'bg-amber-50 text-amber-700 border-amber-200',
  upcycled:            'bg-orange-50 text-orange-700 border-orange-200',
  organic:             'bg-teal-50 text-teal-700 border-teal-200',
  'fair-trade':        'bg-yellow-50 text-yellow-700 border-yellow-200',
  'zero-waste':        'bg-emerald-50 text-emerald-700 border-emerald-200',
  reusable:            'bg-cyan-50 text-cyan-700 border-cyan-200',
  'solar-powered':     'bg-yellow-50 text-yellow-700 border-yellow-200',
  'locally-sourced':   'bg-orange-50 text-orange-700 border-orange-200',
  'carbon-neutral':    'bg-slate-50 text-slate-700 border-slate-200',
  'BPA-free':          'bg-indigo-50 text-indigo-700 border-indigo-200',
  general:             'bg-slate-100 text-slate-500 border-slate-200',

  // Module names
  product_tagger:    'bg-blue-50 text-blue-700 border-blue-200',
  b2b_proposal:      'bg-violet-50 text-violet-700 border-violet-200',
  impact_report:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  whatsapp_support:  'bg-green-50 text-green-700 border-green-200',
}

const sizes = {
  xs: 'h-5 px-1.5 text-[10px] font-semibold tracking-wide',
  sm: 'h-6 px-2 text-[11px] font-medium',
  md: 'h-7 px-2.5 text-xs font-medium',
}

export default function Badge({ children, variant = 'neutral', size = 'sm', dot = false, className }) {
  const cls = variants[variant] || variants.neutral
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border',
        cls,
        sizes[size],
        className,
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}
