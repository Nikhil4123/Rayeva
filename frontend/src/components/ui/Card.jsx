import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Card({ children, className, padding = true, hover = false, animate = false, delay = 0, ...props }) {
  const Comp = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] },
  } : {}

  return (
    <Comp
      className={clsx(
        'bg-white rounded-2xl border border-slate-200/80 shadow-card',
        padding && 'p-5',
        hover && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className,
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={clsx('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardDivider() {
  return <hr className="border-slate-100 -mx-5 my-4" />
}
