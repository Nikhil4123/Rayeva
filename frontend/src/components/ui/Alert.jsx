import { motion } from 'framer-motion'
import clsx from 'clsx'
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react'

const config = {
  success: {
    wrap: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />,
  },
  error: {
    wrap: 'bg-red-50 border-red-200 text-red-800',
    icon: <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />,
  },
  info: {
    wrap: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />,
  },
}

export default function Alert({ type = 'info', title, children, onClose, className }) {
  const { wrap, icon } = config[type] || config.info
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={clsx('flex gap-3 rounded-xl border p-3.5 text-sm', wrap, className)}
    >
      {icon}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  )
}
