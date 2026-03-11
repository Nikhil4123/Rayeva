import { create } from 'zustand'

// ── Toast helpers ─────────────────────────────────────────────────────────────
let toastId = 0
let notifId = 1000
const makeToast = (type, message, duration = 4000) => ({
  id: ++toastId,
  type,  // 'success' | 'error' | 'info' | 'warning'
  message,
  duration,
})

// ── Seed notifications ────────────────────────────────────────────────────────
const SEED_NOTIFICATIONS = [
  {
    id: 1, type: 'success', title: 'Sarvam AI Connected',
    message: 'API connection established and all modules are online.',
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(), read: false,
  },
  {
    id: 2, type: 'info', title: 'Impact Reports are now live',
    message: 'AI-powered carbon & plastic impact scoring is available for all orders.',
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(), read: false,
  },
  {
    id: 3, type: 'warning', title: 'Daily quota at 80%',
    message: 'You have used 80% of today\'s Sarvam AI request quota. Resets at midnight.',
    createdAt: new Date(Date.now() - 52 * 60000).toISOString(), read: false,
  },
  {
    id: 4, type: 'success', title: '24 Products Auto-Tagged',
    message: 'Batch product classification completed with 96% confidence.',
    createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString(), read: true,
  },
  {
    id: 5, type: 'info', title: 'New AI Model Available',
    message: 'sarvam-m has been updated with improved sustainability classification.',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), read: true,
  },
]

// ── Store ─────────────────────────────────────────────────────────────────────
const useAppStore = create((set, get) => ({
  // ── Auth ───────────────────────────────────────────────────────────────────
  isAuthenticated: !!localStorage.getItem('access_token'),
  user: (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })(),
  login: (user, tokens) => {
    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(user))
    set({ isAuthenticated: true, user })
    get().addNotification('success', 'Signed in', `Welcome back, ${user.name}!`)
  },
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    set({ isAuthenticated: false, user: null })
  },

  // ── Sidebar ────────────────────────────────────────────────────────────────
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ── Toasts ─────────────────────────────────────────────────────────────────
  toasts: [],
  addToast: (type, message, duration) => {
    const toast = makeToast(type, message, duration)
    set((s) => ({ toasts: [...s.toasts, toast] }))
    if (toast.duration > 0) {
      setTimeout(() => get().removeToast(toast.id), toast.duration)
    }
    // Mirror to persistent notifications for success/error/warning
    if (type !== 'info') {
      const titles = { success: 'Action successful', error: 'Something went wrong', warning: 'Heads up' }
      get().addNotification(type, titles[type] || 'Notice', message)
    }
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  toast: {
    success: (msg) => useAppStore.getState().addToast('success', msg),
    error:   (msg) => useAppStore.getState().addToast('error',   msg),
    info:    (msg) => useAppStore.getState().addToast('info',    msg),
    warning: (msg) => useAppStore.getState().addToast('warning', msg),
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: SEED_NOTIFICATIONS,
  unreadCount: SEED_NOTIFICATIONS.filter((n) => !n.read).length,
  addNotification: (type, title, message) => {
    const notif = {
      id: ++notifId, type, title, message,
      createdAt: new Date().toISOString(), read: false,
    }
    set((s) => ({
      notifications: [notif, ...s.notifications].slice(0, 60),
      unreadCount: s.unreadCount + 1,
    }))
  },
  markRead: (id) => set((s) => {
    const notif = s.notifications.find((n) => n.id === id)
    if (!notif || notif.read) return {}
    return {
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }
  }),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

  // ── Demo mode flag ─────────────────────────────────────────────────────────
  isDemoMode: false,
  setDemoMode: (v) => set({ isDemoMode: v }),

  // ── Dashboard stats ─────────────────────────────────────────────────────────
  dashboardStats: null,
  setDashboardStats: (stats) => set({ dashboardStats: stats }),

  // ── Recent AI logs ─────────────────────────────────────────────────────────
  recentActivity: [],
  setRecentActivity: (logs) => set({ recentActivity: logs }),
}))

export default useAppStore
