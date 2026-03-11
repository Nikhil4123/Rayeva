import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Tag, Briefcase, Leaf, ClipboardList, ArrowRight,
  CheckCircle2, TrendingUp, Bot, Zap, Activity, Circle,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import StatCard from '../components/ui/StatCard'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { getDashboardStats, getRecentActivity } from '../api/logsApi'
import useAppStore from '../store/useAppStore'

const STATUS_CONFIG = {
  success:      { label: 'Success',      variant: 'success' },
  parse_error:  { label: 'Parse Error',  variant: 'warning' },
  api_error:    { label: 'API Error',    variant: 'error'   },
  rate_limited: { label: 'Rate Limited', variant: 'warning' },
}

const MODULE_LABELS = {
  product_tagger:   'Product Tagger',
  b2b_proposal:     'B2B Proposal',
  impact_report:    'Impact Report',
  whatsapp_support: 'WhatsApp Bot',
}

const CHART_DATA = [
  { day: 'Mon', calls: 12 }, { day: 'Tue', calls: 28 }, { day: 'Wed', calls: 19 },
  { day: 'Thu', calls: 35 }, { day: 'Fri', calls: 41 }, { day: 'Sat', calls: 22 },
  { day: 'Sun', calls: 38 },
]

const MODULE_STATUS = [
  {
    to: '/product-tagger',
    icon: Tag,
    title: 'AI Product Tagger',
    desc: 'Auto-classifies products with eco labels',
    status: 'online',
    calls: '1,247',
    lastUsed: '10m ago',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    accent: 'border-l-emerald-400',
  },
  {
    to: '/proposals',
    icon: Briefcase,
    title: 'B2B Proposal AI',
    desc: 'Generates sustainable sourcing packages',
    status: 'online',
    calls: '43',
    lastUsed: '2h ago',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
    accent: 'border-l-violet-400',
  },
  {
    to: '/impact-reports',
    icon: Leaf,
    title: 'Impact Reports',
    desc: 'Carbon & sustainability scoring',
    status: 'online',
    calls: '218',
    lastUsed: '4h ago',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    accent: 'border-l-teal-400',
  },
  {
    to: '/ai-logs',
    icon: Bot,
    title: 'AI Activity Monitor',
    desc: 'Real-time API call logging',
    status: 'online',
    calls: '4,891',
    lastUsed: 'Live',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    accent: 'border-l-blue-400',
  },
]

const QUICK_ACTIONS = [
  {
    to: '/product-tagger',
    icon: <Tag className="h-5 w-5 text-emerald-600" />,
    title: 'Tag a Product',
    desc: 'Auto-categorize with AI',
    color: 'from-emerald-50 to-emerald-100/50',
    border: 'border-emerald-100',
  },
  {
    to: '/proposals',
    icon: <Briefcase className="h-5 w-5 text-violet-600" />,
    title: 'Generate Proposal',
    desc: 'B2B sustainable package',
    color: 'from-violet-50 to-violet-100/50',
    border: 'border-violet-100',
  },
  {
    to: '/impact-reports',
    icon: <Leaf className="h-5 w-5 text-teal-600" />,
    title: 'Impact Report',
    desc: 'Sustainability analytics',
    color: 'from-teal-50 to-teal-100/50',
    border: 'border-teal-100',
  },
  {
    to: '/ai-logs',
    icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
    title: 'View AI Logs',
    desc: 'Monitor API calls',
    color: 'from-blue-50 to-blue-100/50',
    border: 'border-blue-100',
  },
]

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-white/10">
      <p className="font-semibold">{payload[0].value} calls</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const { setDemoMode, addToast } = useAppStore()

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, actRes] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
        ])
        if (statsRes._demo || actRes._demo) setDemoMode(true)
        setStats(statsRes.data)
        setActivity(actRes.data || [])
      } catch {
        addToast('error', 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setDemoMode, addToast])

  return (
    <div className="space-y-8 pb-8">
      {/* ── Welcome header ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back 👋</h2>
        <p className="text-sm text-slate-500 mt-1">Here's what your AI modules are doing today.</p>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 h-40 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard delay={0}    icon={<Tag className="h-6 w-6 text-emerald-600" />}        label="Products Tagged"     value={stats?.products_tagged?.toLocaleString()     ?? '—'} sub="All time"       trend={12}  />
          <StatCard delay={0.06} icon={<Briefcase className="h-6 w-6 text-violet-600" />}   label="Proposals Generated" value={stats?.proposals_generated?.toLocaleString() ?? '—'} sub="All time"       trend={8}   />
          <StatCard delay={0.12} icon={<Activity className="h-6 w-6 text-blue-600" />}      label="AI Calls Today"      value={stats?.ai_calls_today?.toLocaleString()      ?? '—'} sub="Last 24 hours"  trend={5}   />
          <StatCard delay={0.18} icon={<CheckCircle2 className="h-6 w-6 text-teal-600" />}  label="Success Rate"        value={`${stats?.success_rate ?? '—'}%`}                    sub="Last 7 days"    trend={0.2} />
        </div>
      )}

      {/* ── Chart + Quick Actions ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="lg:col-span-2 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader title="AI Calls — Last 7 Days" subtitle="Daily volume across all modules" action={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 6, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="callsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#callsGrad)"
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }} className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader title="Quick Actions" subtitle="Jump to a module" />
            <div className="space-y-2.5">
              {QUICK_ACTIONS.map(({ to, icon, title, desc, color, border }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border bg-gradient-to-r ${color} ${border} hover:shadow-sm transition-all duration-200 group`}
                >
                  <div className="p-2 rounded-xl bg-white/80 shrink-0 shadow-sm">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Module Status Grid ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.4 }}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Module Health</h3>
          <p className="text-sm text-slate-500 mt-0.5">Real-time status of all AI modules</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {MODULE_STATUS.map(({ to, icon: Icon, title, desc, status, calls, lastUsed, iconColor, iconBg, accent }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
            >
              <Link
                to={to}
                className={`flex flex-col gap-4 rounded-2xl bg-white border border-slate-200/80 border-l-4 ${accent} p-5 shadow-sm hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">{status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>{calls} total calls</span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {lastUsed}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Recent AI Activity ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
        <Card padding={false}>
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <CardHeader
              title="Recent AI Activity"
              subtitle="Last 5 AI module calls"
              action={
                <Link to="/ai-logs" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg skeleton" />)}
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ClipboardList className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No AI calls yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {activity.map((log, i) => {
                const sc = STATUS_CONFIG[log.status] || STATUS_CONFIG.success
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="w-34 shrink-0">
                      <Badge variant={log.module} size="xs">{MODULE_LABELS[log.module] || log.module}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 truncate">
                        {log.error_message || `${log.tokens_used} tokens · ${log.latency_ms}ms`}
                      </p>
                    </div>
                    <Badge variant={sc.variant} size="xs" dot>{sc.label}</Badge>
                    <span className="text-xs text-slate-500 shrink-0 w-16 text-right tabular-nums">{timeAgo(log.created_at)}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
