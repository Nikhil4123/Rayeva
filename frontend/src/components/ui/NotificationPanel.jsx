import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Trash2, CheckCircle2, XCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import useAppStore from '../../store/useAppStore'

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-200',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    dot: 'bg-red-500',
    ring: 'ring-red-200',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    dot: 'bg-amber-500',
    ring: 'ring-amber-200',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    dot: 'bg-blue-500',
    ring: 'ring-blue-200',
  },
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 30)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationPanel({ onClose, anchorRef }) {
  const { notifications, unreadCount, markRead, markAllRead, clearNotifications } = useAppStore()
  const panelRef  = useRef(null)
  const navigate  = useNavigate()

  // Close on click outside (but not on the anchor bell button)
  useEffect(() => {
    function handler(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorRef])

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className="absolute top-full right-0 mt-2 w-[400px] rounded-2xl bg-white border border-slate-200/80 shadow-2xl z-[100] overflow-hidden"
      style={{ boxShadow: '0 24px 60px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.1)' }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
            <Bell className="h-4 w-4 text-slate-700" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Notifications</p>
            <p className="text-[11px] text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Clear all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Notification list ─────────────────────────────────────────── */}
      <div className="max-h-[460px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
              <Bell className="h-6 w-6 opacity-40" />
            </div>
            <p className="text-sm font-medium text-slate-500">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">AI events and alerts will appear here</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n, i) => {
              const cfg  = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
              const Icon = cfg.icon
              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.2 }}
                  onClick={() => markRead(n.id)}
                  className={clsx(
                    'w-full flex items-start gap-3.5 px-5 py-4 text-left transition-all duration-150',
                    'border-b border-slate-50 last:border-0',
                    n.read
                      ? 'hover:bg-slate-50/70'
                      : 'bg-gradient-to-r from-blue-50/60 to-transparent hover:from-blue-50',
                  )}
                >
                  {/* Icon */}
                  <div className={clsx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5',
                    cfg.bg,
                  )}>
                    <Icon className={clsx('h-4 w-4', cfg.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className={clsx(
                        'text-sm leading-snug',
                        n.read ? 'font-medium text-slate-600' : 'font-semibold text-slate-900',
                      )}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 mt-0.5 tabular-nums">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className={clsx('h-2 w-2 rounded-full shrink-0 mt-2', cfg.dot)} />
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {notifications.length} total · {notifications.filter((n) => n.read).length} read
          </p>
          <button
            onClick={() => { navigate('/ai-logs'); onClose() }}
            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            View AI Logs
          </button>
        </div>
      )}
    </motion.div>
  )
}
