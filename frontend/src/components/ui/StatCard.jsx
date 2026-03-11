import clsx from 'clsx'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

export default function StatCard({ icon, label, value, sub, trend, className, delay = 0 }) {
  // Determine if value is a pure number for CountUp animation
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
  const isNumeric = !isNaN(numericValue) && numericValue !== undefined
  const suffix = typeof value === 'string' ? value.replace(/[0-9.,]/g, '') : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.34, 1.3, 0.64, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={clsx(
        'bg-white rounded-2xl border border-slate-200/80 shadow-card p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
          {icon}
        </div>
        {trend != null && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className={clsx(
              'text-xs font-semibold px-2 py-1 rounded-full',
              trend >= 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-red-50 text-red-600 border border-red-100',
            )}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-900 tabular-nums">
          {isNumeric ? (
            <CountUp end={numericValue} duration={1.5} delay={delay} separator="," suffix={suffix} />
          ) : value}
        </div>
        <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </motion.div>
  )
}
