import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Zap, LogOut, CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '../../store/useAppStore'
import NotificationPanel from '../ui/NotificationPanel'
import clsx from 'clsx'

const PAGE_TITLES = {
  '/':               { title: 'Dashboard',              sub: 'Overview of all AI modules' },
  '/product-tagger': { title: 'AI Product Tagger',      sub: 'Auto-classify products with AI' },
  '/proposals':      { title: 'B2B Proposal Generator', sub: 'AI-powered sourcing proposals' },
  '/impact-reports': { title: 'Impact Report Viewer',   sub: 'Sustainability analytics' },
  '/ai-logs':        { title: 'AI Logs',                sub: 'Monitor every API call' },
}

const TOAST_ICONS = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  error:   <AlertCircle  className="h-4 w-4 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
  info:    <Info          className="h-4 w-4 shrink-0" />,
}

const TOAST_STYLES = {
  success: 'border-emerald-500/30 bg-slate-900/95 text-emerald-100',
  error:   'border-red-500/30 bg-slate-900/95 text-red-100',
  warning: 'border-amber-500/30 bg-slate-900/95 text-amber-100',
  info:    'border-blue-500/30 bg-slate-900/95 text-blue-100',
}

const ICON_COLORS = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  warning: 'text-amber-400',
  info:    'text-blue-400',
}

export default function TopBar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { sidebarCollapsed, isDemoMode, toasts, removeToast, user, logout, unreadCount } = useAppStore()
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef   = useRef(null)
  const pageInfo  = PAGE_TITLES[location.pathname] || { title: 'Rayeva AI', sub: '' }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ── Main bar ──────────────────────────────────────────────────── */}
      <header
        className={clsx(
          'fixed top-0 right-0 z-20 flex h-16 items-center justify-between px-6',
          'border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm transition-all duration-300',
        )}
        style={{ left: sidebarCollapsed ? 64 : 240 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-base font-bold text-slate-900 leading-tight">{pageInfo.title}</h1>
            <p className="text-xs text-slate-500 leading-tight">
              {isDemoMode ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Demo mode — using mock data
                </span>
              ) : pageInfo.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* ── Bell with notification badge ── */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((v) => !v)}
              className={clsx(
                'relative p-2 rounded-xl transition-all duration-200',
                bellOpen
                  ? 'bg-slate-100 text-slate-800 ring-2 ring-slate-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
              )}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell style={{ width: 18, height: 18 }} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                    className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-0.5 leading-none"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Notification dropdown panel */}
            <AnimatePresence>
              {bellOpen && (
                <NotificationPanel
                  anchorRef={bellRef}
                  onClose={() => setBellOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* ── Avatar → navigate to profile ── */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
            title="View profile"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold select-none shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {user?.name && (
              <span className="hidden sm:block text-sm text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                {user.name}
              </span>
            )}
          </button>

          {/* ── Logout ── */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Toast notifications ────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={clsx(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3',
                'shadow-2xl text-sm backdrop-blur-xl',
                TOAST_STYLES[toast.type] || TOAST_STYLES.info,
              )}
            >
              <span className={clsx('mt-0.5', ICON_COLORS[toast.type])}>
                {TOAST_ICONS[toast.type]}
              </span>
              <span className="flex-1 leading-snug text-slate-200">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
