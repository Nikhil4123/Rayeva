import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Eye, EyeOff, ArrowRight, Users, Globe, Leaf, Award } from 'lucide-react'
import axiosClient from '../api/axiosClient'
import useAppStore from '../store/useAppStore'
import Alert from '../components/ui/Alert'

const BENEFITS = [
  { icon: Users,  text: 'Join 500+ sustainable businesses' },
  { icon: Globe,  text: 'Track your global carbon footprint' },
  { icon: Leaf,   text: 'AI-powered ESG reporting' },
  { icon: Award,  text: 'Certified green commerce platform' },
]

export default function SignUp() {
  const navigate  = useNavigate()
  const { login, toast } = useAppStore()

  const [form, setForm] = useState({
    name: '', email: '', company: '', password: '', confirmPassword: '',
  })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [showPw, setShowPw]     = useState(false)
  const [showCPw, setShowCPw]   = useState(false)

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: 'user' }
      const { data: res } = await axiosClient.post('/auth/register', payload)
      if (res.success) {
        const { user, tokens } = res.data
        login(user, tokens)
        toast.success(`Welcome to Rayeva AI, ${user.name}!`)
        navigate('/', { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#030b18]">
      {/* ── LEFT — Form panel ─────────────────────────────────────────── */}
      <div className="flex-1 lg:flex-none lg:w-[560px] xl:w-[620px] flex flex-col justify-center relative overflow-hidden px-8 sm:px-12 py-10">
        {/* Background glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="pointer-events-none absolute -bottom-32 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 w-full max-w-sm mx-auto lg:mx-0"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
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
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
              Create your account
            </h1>
            <p className="text-slate-400 text-sm">
              Get full access to AI-powered sustainability tools
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Jane Doe"
                required
                autoComplete="name"
                className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="jane@company.com"
                required
                autoComplete="email"
                className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Company name{' '}
                <span className="text-slate-600 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.company}
                onChange={handleChange('company')}
                placeholder="Acme Corp"
                autoComplete="organization"
                className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    placeholder="Min. 6 chars"
                    required
                    autoComplete="new-password"
                    className="w-full h-11 rounded-xl px-4 pr-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    type={showCPw ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    placeholder="Repeat"
                    required
                    autoComplete="new-password"
                    className="w-full h-11 rounded-xl px-4 pr-10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 mt-1"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign in link */}
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-2.5">
            {BENEFITS.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="flex items-center gap-2 text-[11px] text-slate-500"
              >
                <Icon className="h-3 w-3 text-emerald-500/60 shrink-0" />
                {text}
              </motion.div>
            ))}
          </div>
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
          <source src="/signuppagesvgimg.mp4" type="video/mp4" />
        </video>

        {/* Left-edge blend */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #030b18 0%, #030b18 2%, transparent 20%)',
          }}
        />
        <div className="absolute inset-0 bg-[#030b18]/15" />

        {/* Overlay text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute bottom-12 left-12 right-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20 mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/90 font-medium">Free Forever Plan</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-3">
            Join the green<br />
            commerce revolution
          </h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Hundreds of businesses are already reducing their carbon footprint with Rayeva AI.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
