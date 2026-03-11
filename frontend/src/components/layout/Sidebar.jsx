import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Tag,
  Briefcase,
  Leaf,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import useAppStore from '../../store/useAppStore'

const navItems = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard',     end: true,  color: 'text-emerald-400' },
  { to: '/product-tagger', icon: Tag,             label: 'Product Tagger',            color: 'text-blue-400'    },
  { to: '/proposals',      icon: Briefcase,       label: 'B2B Proposals',             color: 'text-violet-400'  },
  { to: '/impact-reports', icon: Leaf,            label: 'Impact Reports',            color: 'text-teal-400'    },
  { to: '/ai-logs',        icon: ClipboardList,   label: 'AI Logs',                   color: 'text-amber-400'   },
]

const bottomItems = [
  { to: '/profile', icon: User, label: 'Profile', color: 'text-slate-400' },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #0d1f17 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-bold text-base shadow-glow-sm"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">Rayeva AI</p>
              <p className="text-[11px] text-emerald-400/70 leading-tight whitespace-nowrap">Sustainable Commerce</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, end, color }, idx) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
          >
            <NavLink
              to={to}
              end={end}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-all duration-200 group relative',
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-glow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-emerald-400"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    style={{ width: 18, height: 18 }}
                    className={clsx('shrink-0 transition-colors', isActive ? color : 'text-current')}
                  />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="truncate font-medium"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* ── Profile (bottom nav) ───────────────────────────────── */}
      <div className="border-t border-white/5 px-2 py-2">
        {bottomItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-all duration-200 group relative',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  style={{ width: 18, height: 18 }}
                  className={clsx('shrink-0 transition-colors', isActive ? color : 'text-current')}
                />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="truncate font-medium"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* ── Collapse toggle ─────────────────────────────────── */}
      <div className="border-t border-white/5 p-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft  className="h-4 w-4" />
          }
        </motion.button>
      </div>
    </motion.aside>
  )
}
