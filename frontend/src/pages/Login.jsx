import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react'
import axiosClient from '../api/axiosClient'
import useAppStore from '../store/useAppStore'
import Alert from '../components/ui/Alert'

const FEATURES = [
  { icon: ShieldCheck, text: 'Enterprise-grade AI Security' },
  { icon: Zap,         text: 'Real-time Sarvam AI Processing' },
  { icon: BarChart3,   text: 'Live Sustainability Analytics' },
  { icon: Sparkles,    text: 'Auto Product Classification' },
]

export default function Login() {
  const navigate = useNavigate()
  const { login, toast } = useAppStore()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [showPw, setShowPw]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await axiosClient.post('/auth/login', form)
      if (res.success) {
        const { user, tokens } = res.data
        login(user, tokens)
        toast.success(`Welcome back, ${user.name}!`)
        navigate('/', { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#030b18]">
      {/* ── LEFT — Form panel ─────────────────────────────────────────── */}
      <div className="flex-1 lg:flex-none lg:w-[520px] xl:w-[580px] flex flex-col justify-center relative overflow-hidden px-8 sm:px-12 py-12">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 w-full max-w-sm mx-auto lg:mx-0"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Rayeva AI</p>
              <p className="text-xs text-emerald-400/70">Sustainable Commerce Platform</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
              Welcome back
            </h1>
            <p className="text-slate-400 text-sm">
              Sign in to your workspace to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <Alert type="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@rayeva.ai"
                required
                autoComplete="email"
                className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 rounded-xl px-4 pr-11 text-sm text-white placeholder:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </motion.button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>

          {/* Features list */}
          <div className="mt-10 pt-8 border-t border-white/5 space-y-3">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="flex items-center gap-3 text-xs text-slate-500"
              >
                <Icon className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                {text}
              </motion.div>
            ))}
          </div>

          <p className="mt-6 text-[11px] text-slate-700 text-center">
            Run <code className="text-slate-600">npm run seed</code> to create demo credentials
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT — Video panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/signinsvgimg.mp4" type="video/mp4" />
        </video>

        {/* Left-edge gradient to blend with form panel */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #030b18 0%, #030b18 2%, transparent 18%)',
          }}
        />

        {/* Subtle dark overlay for readability */}
        <div className="absolute inset-0 bg-[#030b18]/20" />

        {/* Bottom overlay text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute bottom-12 left-12 right-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20 mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/90 font-medium">AI Systems Online</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-3">
            Power your<br />
            sustainable future
          </h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Automate product classification, generate proposals, and track carbon footprints with cutting-edge AI.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
