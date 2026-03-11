import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Mail, Building2, Shield, LogOut, Edit3, Save, X,
  Tag, Briefcase, Leaf, Bot, TrendingUp, Clock, CheckCircle2,
  Calendar, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import useAppStore from '../store/useAppStore'
import Alert from '../components/ui/Alert'

// Demo activity data — last 7 days
const ACTIVITY_DATA = [
  { day: 'Mon', calls: 12 },
  { day: 'Tue', calls: 28 },
  { day: 'Wed', calls: 19 },
  { day: 'Thu', calls: 34 },
  { day: 'Fri', calls: 22 },
  { day: 'Sat', calls: 8  },
  { day: 'Sun', calls: 15 },
]

const STAT_CARDS = [
  { label: 'AI Calls Made',      value: '138',    sub: 'This week',   icon: Bot,         color: 'text-blue-600',    bg: 'bg-blue-50'    },
  { label: 'Products Tagged',    value: '1,247',  sub: 'Total',       icon: Tag,         color: 'text-violet-600',  bg: 'bg-violet-50'  },
  { label: 'Proposals Created',  value: '43',     sub: 'Lifetime',    icon: Briefcase,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
  { label: 'Carbon Tracked',     value: '5.2t',   sub: 'CO₂ offset',  icon: Leaf,        color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const RECENT_ACTIVITY = [
  { action: 'Product batch tagged (34 items)',  time: '10m ago',  type: 'tag'      },
  { action: 'B2B proposal generated',           time: '1h ago',   type: 'proposal' },
  { action: 'Impact report viewed',             time: '3h ago',   type: 'impact'   },
  { action: 'AI Log exported (CSV)',            time: '5h ago',   type: 'log'      },
  { action: 'Profile settings updated',         time: 'Yesterday', type: 'profile' },
]

const ACTIVITY_ICON = {
  tag:      { icon: Tag,         bg: 'bg-violet-100', color: 'text-violet-600' },
  proposal: { icon: Briefcase,   bg: 'bg-amber-100',  color: 'text-amber-600'  },
  impact:   { icon: Leaf,        bg: 'bg-emerald-100',color: 'text-emerald-600' },
  log:      { icon: Activity,    bg: 'bg-blue-100',   color: 'text-blue-600'   },
  profile:  { icon: User,        bg: 'bg-slate-100',  color: 'text-slate-600'  },
}

export default function Profile() {
  const navigate  = useNavigate()
  const { user, logout } = useAppStore()

  const [editing, setEditing]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [formData, setFormData] = useState({
    name:    user?.name    || 'Admin User',
    email:   user?.email   || 'admin@rayeva.ai',
    company: user?.company || 'Rayeva Inc.',
    role:    user?.role    || 'admin',
  })

  const handleSave = () => {
    // In a real app: PATCH /users/me with formData
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const joinDate = new Date(user?.createdAt || Date.now() - 86400000 * 60)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-8 pb-12">
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0d1f17 50%, #0f2a1a 100%)' }}
      >
        <div className="relative px-8 py-10">
          {/* Decorative glows */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
          <div className="pointer-events-none absolute -bottom-20 left-20 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-20 w-20 items-center justify-center rounded-3xl text-white text-3xl font-bold shadow-2xl ring-4 ring-emerald-500/30 shrink-0 select-none"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {formData.name?.[0]?.toUpperCase() || 'U'}
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-white">{formData.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                  <Shield className="h-3 w-3" />
                  {formData.role}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-2">{formData.email}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {formData.company && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" /> {formData.company}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Member since {joinDate}
                </span>
              </div>
            </div>

            {/* Edit / Logout */}
            <div className="flex items-center gap-2 shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2 text-sm text-white font-medium transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm text-slate-300 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm text-white font-medium transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Save success banner ─────────────────────────────────────────── */}
      {saved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert type="success">Profile updated successfully.</Alert>
        </motion.div>
      )}

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main content — 2-col ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account settings form */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <User className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900 text-sm">Account Details</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Full name',    field: 'name',    type: 'text',  icon: User      },
              { label: 'Email',        field: 'email',   type: 'email', icon: Mail      },
              { label: 'Company',      field: 'company', type: 'text',  icon: Building2 },
            ].map(({ label, field, type, icon: Icon }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                  {label}
                </label>
                {editing ? (
                  <input
                    type={type}
                    value={formData[field]}
                    onChange={(e) => setFormData((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full h-9 rounded-lg px-3 text-sm text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all bg-white"
                  />
                ) : (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-50 text-sm text-slate-700">
                    <Icon className="h-3.5 w-3.5 text-slate-400" />
                    {formData[field] || <span className="text-slate-400 italic">Not set</span>}
                  </div>
                )}
              </div>
            ))}

            {/* Role badge (non-editable) */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                Role
              </label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-50 text-sm">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-slate-700 capitalize">{formData.role}</span>
                <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Session</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl h-9 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out of Rayeva AI
            </button>
          </div>
        </motion.div>

        {/* Right col — Activity chart + recent activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly activity chart */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h2 className="font-semibold text-slate-900 text-sm">AI Activity — Last 7 Days</h2>
                </div>
                <p className="text-xs text-slate-400">Total AI API calls per day</p>
              </div>
              <span className="text-sm font-bold text-slate-900">138</span>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ACTIVITY_DATA} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    formatter={(v) => [`${v} calls`, 'API Calls']}
                  />
                  <Bar
                    dataKey="calls"
                    radius={[6, 6, 0, 0]}
                    fill="url(#profileBarGrad)"
                  />
                  <defs>
                    <linearGradient id="profileBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-5">
              <Clock className="h-4 w-4 text-slate-500" />
              <h2 className="font-semibold text-slate-900 text-sm">Recent Activity</h2>
            </div>
            <div className="space-y-1">
              {RECENT_ACTIVITY.map(({ action, time, type }, i) => {
                const cfg  = ACTIVITY_ICON[type]
                const Icon = cfg.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>
                    <p className="flex-1 text-sm text-slate-700">{action}</p>
                    <span className="text-xs text-slate-400 shrink-0 tabular-nums">{time}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
