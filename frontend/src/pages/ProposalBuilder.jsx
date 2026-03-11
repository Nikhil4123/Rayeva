import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Sparkles, RotateCcw, ChevronDown, ChevronUp, TrendingUp, Leaf, Package, Building2, CheckCircle2, Zap } from 'lucide-react'
import Card, { CardHeader, CardDivider } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import JSONViewer from '../components/ui/JSONViewer'
import { FullPageSpinner } from '../components/ui/Spinner'
import { generateProposal } from '../api/proposalApi'
import useAppStore from '../store/useAppStore'

const COMPANY_TYPES = [
  { value: '',           label: 'Select company type…' },
  { value: 'tech_startup',  label: 'Tech Startup' },
  { value: 'retail',        label: 'Retail / E-commerce' },
  { value: 'hospitality',   label: 'Hospitality / Hotels' },
  { value: 'corporate',     label: 'Corporate Office' },
  { value: 'education',     label: 'Education / Campus' },
  { value: 'healthcare',    label: 'Healthcare / Clinic' },
  { value: 'fmcg',          label: 'FMCG / Manufacturing' },
]

const SAMPLE_PROPOSALS = [
  {
    label: 'EcoNest Hotels',
    company_name: 'EcoNest Hotels & Resorts',
    company_type: 'hospitality',
    currency: 'INR',
    total_budget: '250000',
    sustainability_goal: 'Replace all single-use plastic across 3 hotel properties — rooms, restaurants and banquet halls. Target zero-plastic certification by Q3. Focus on guest amenities, kitchen supplies and housekeeping consumables.',
    notes: '450 rooms, 3 properties in Mumbai. Bulk procurement preferred. Monthly replenishment cycle.',
  },
  {
    label: 'GreenTech Office',
    company_name: 'GreenTech Solutions Pvt Ltd',
    company_type: 'tech_startup',
    currency: 'INR',
    total_budget: '80000',
    sustainability_goal: 'Zero-waste office transition for 200 employees — eliminate single-use plastics from pantry, meeting rooms and stationery. Improve ESG score for upcoming Series B fundraising.',
    notes: '5 floors, Bangalore. Employees WFH 2 days/week. Cafeteria serves ~250 meals/day.',
  },
  {
    label: 'LeafCo Retail',
    company_name: 'LeafCo Retail & E-commerce',
    company_type: 'retail',
    currency: 'INR',
    total_budget: '150000',
    sustainability_goal: 'Switch all outbound packaging to compostable alternatives and introduce an eco-product line for resale. Want to highlight sustainability credentials to attract Gen-Z customers.',
    notes: 'E-commerce + 2 physical stores in Pune. Ships ~1200 orders/month. Custom branding on packaging required.',
  },
]

const CURRENCIES = [
  { value: 'INR', label: '₹ INR' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
]

function BudgetBar({ label, amount, total, color = 'bg-emerald-500' }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-600">
        <span className="truncate flex-1 mr-2">{label}</span>
        <span className="font-semibold shrink-0">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} bar-fill`} style={{ '--bar-width': `${pct}%`, width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ImpactMetric({ icon, value, unit, label, bg }) {
  return (
    <div className={`flex-1 min-w-0 p-4 ${bg}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-slate-900 tabular-nums">
        {value?.toLocaleString()}<span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

const BAR_COLORS = [
  'bg-emerald-500', 'bg-violet-500', 'bg-blue-500',
  'bg-amber-500', 'bg-teal-500', 'bg-pink-500',
]

export default function ProposalBuilder() {
  const [form, setForm]     = useState({ company_name: '', company_type: '', currency: 'INR', total_budget: '', sustainability_goal: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [apiError, setApiError] = useState(null)
  const [showJSON, setShowJSON] = useState(false)
  const { addToast, setDemoMode } = useAppStore()

  function loadSample(s) {
    const { label: _label, ...fields } = s
    setForm(fields)
    setErrors({})
    setResult(null)
    setApiError(null)
  }

  function validate() {
    const e = {}
    if (!form.company_type) e.company_type = 'Please select a company type'
    if (!form.total_budget || isNaN(Number(form.total_budget)) || Number(form.total_budget) <= 0)
      e.total_budget = 'Enter a valid positive budget'
    if (!form.sustainability_goal.trim() || form.sustainability_goal.trim().length < 10)
      e.sustainability_goal = 'Describe your sustainability goal (min 10 characters)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    setResult(null)
    try {
      const payload = {
        ...form,
        total_budget: Number(form.total_budget),
      }
      const res = await generateProposal(payload)
      if (res._demo) setDemoMode(true)
      setResult(res.data)
      addToast('success', 'Proposal generated successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate proposal'
      setApiError(msg)
      addToast('error', 'Proposal generation failed.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setForm({ company_name: '', company_type: '', currency: 'INR', total_budget: '', sustainability_goal: '', notes: '' })
    setErrors({})
    setResult(null)
    setApiError(null)
    setShowJSON(false)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-200">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">B2B Proposal Generator</h2>
            <p className="text-sm text-slate-500">AI-crafted sustainable procurement proposals with full budget breakdown</p>
          </div>
        </div>
      </motion.div>

      {/* ── Sample quick-load ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-xs text-slate-500 font-medium">Try a sample:</span>
        {SAMPLE_PROPOSALS.map((s) => (
          <button
            key={s.label}
            onClick={() => loadSample(s)}
            className="text-xs px-3 py-1.5 border border-violet-200 text-violet-700 rounded-full hover:bg-violet-50 hover:border-violet-400 transition-all font-medium"
          >
            {s.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Form panel ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
          {/* Panel header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-semibold text-slate-800">Client Configuration</p>
            </div>
            <p className="text-xs text-slate-500">Fill in company details to generate a tailored proposal</p>
          </div>

          {/* Steps indicator */}
          <div className="flex gap-0 px-6 pt-4 pb-2">
            {[{ n: 1, label: 'Company' }, { n: 2, label: 'Budget' }, { n: 3, label: 'Goal' }].map((step, i) => (
              <div key={step.n} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-300 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-violet-600">{step.n}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5">{step.label}</span>
                </div>
                {i < 2 && <div className="h-px w-8 bg-slate-200 mx-1 mb-4" />}
              </div>
            ))}
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Company Name</label>
              <input
                type="text"
                placeholder="e.g. GreenTech Solutions Pvt Ltd"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Company Type <span className="text-red-500">*</span></label>
              <select
                value={form.company_type}
                onChange={(e) => setForm({ ...form, company_type: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors"
              >
                {COMPANY_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.company_type && <p className="text-xs text-red-500 mt-1">{errors.company_type}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Total Budget <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="50000"
                  min={1}
                  value={form.total_budget}
                  onChange={(e) => setForm({ ...form, total_budget: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors"
                />
                {errors.total_budget && <p className="text-xs text-red-500 mt-1">{errors.total_budget}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Sustainability Goal <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Describe the sustainability outcome the company wants to achieve…"
                rows={4}
                value={form.sustainability_goal}
                onChange={(e) => setForm({ ...form, sustainability_goal: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors resize-none"
              />
              {errors.sustainability_goal && <p className="text-xs text-red-500 mt-1">{errors.sustainability_goal}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Additional Notes <span className="text-slate-400">(optional)</span></label>
              <textarea
                placeholder="Team size, office location, specific requirements…"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-colors resize-none"
              />
            </div>

            {apiError && (
              <Alert type="error" title="Generation failed" onClose={() => setApiError(null)}>
                {apiError}
              </Alert>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> Generating…</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate Proposal</>
                )}
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* ── Result panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <Card>
              <FullPageSpinner label="AI is crafting your proposal…" />
            </Card>
          )}

          {!loading && !result && (
            <div className="h-full min-h-[420px] rounded-2xl border-2 border-dashed border-violet-100 bg-gradient-to-br from-violet-50/50 to-slate-50 flex flex-col items-center justify-center py-20 text-center">
              <div className="p-5 rounded-2xl bg-white shadow-sm border border-violet-100 mb-5">
                <Briefcase className="h-10 w-10 text-violet-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Your proposal will appear here</p>
              <p className="text-xs text-slate-400 mt-1.5 max-w-48">Configure the form on the left and click Generate Proposal</p>
              <div className="flex flex-col gap-2 mt-6 text-xs text-slate-400">
                {['Budget breakdown by category', 'Product mix recommendations', 'Impact positioning summary'].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-300 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="space-y-4"
              >
                {/* ── Proposal identity banner ── */}
                <div className="rounded-2xl overflow-hidden shadow-md">
                  <div className="bg-gradient-to-r from-violet-700 to-purple-800 px-6 pt-6 pb-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-violet-300 uppercase tracking-widest mb-1">
                          Generated Proposal
                        </p>
                        <h3 className="text-lg font-bold text-white leading-tight">{result.proposal_title}</h3>
                        <p className="text-sm text-violet-200/80 mt-1 leading-relaxed">{result.sustainability_focus}</p>
                      </div>
                      {/* Confidence badge */}
                      <div className="shrink-0 flex flex-col items-center bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
                        <span className="text-2xl font-black text-white tabular-nums">
                          {Math.round((result.confidence_score || 0) * 100)}
                          <span className="text-sm font-normal text-violet-200">%</span>
                        </span>
                        <span className="text-[10px] text-violet-300 font-medium mt-0.5">AI Confidence</span>
                      </div>
                    </div>
                  </div>

                  {/* Impact metrics strip */}
                  <div className="bg-white border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                    <ImpactMetric icon="🌿" value={result.total_estimated_plastic_saved_kg} unit="kg" label="Plastic saved" bg="" />
                    <ImpactMetric icon="💨" value={result.total_estimated_co2_avoided_kg}   unit="kg" label="CO₂ avoided"   bg="" />
                    <ImpactMetric icon="⏱" value={result.implementation_timeline}            unit=""   label="Timeline"     bg="" />
                  </div>
                </div>

                {/* ── Product mix ── */}
                <Card>
                  <CardHeader
                    title="Recommended Product Mix"
                    subtitle={`${result.product_mix?.length} categories`}
                    action={<Package className="h-4 w-4 text-slate-400" />}
                  />
                  <div className="space-y-3">
                    {result.product_mix?.map((item, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                        <div className="flex items-start justify-between gap-3 p-4">
                          <div className="flex gap-3 flex-1 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: ['#8b5cf6','#06b6d4','#f59e0b','#10b981','#ec4899','#6366f1'][i % 6] }}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{item.category}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.product_description}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-slate-900 tabular-nums">
                              {form.currency} {item.allocated_budget?.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-600 font-medium">{item.estimated_units} units</p>
                          </div>
                        </div>
                        <div className="px-4 pb-3 pt-1 space-y-2 border-t border-slate-50 bg-slate-50/50">
                          <BudgetBar
                            label={`${item.budget_percentage}% of total budget`}
                            amount={item.allocated_budget}
                            total={result.budget_summary?.total_budget}
                            color={BAR_COLORS[i % BAR_COLORS.length]}
                          />
                          <div className="flex gap-4 text-xs text-slate-600">
                            <span>🌿 {item.estimated_plastic_saved_kg} kg plastic saved</span>
                            <span>💨 {item.estimated_co2_avoided_kg} kg CO₂ avoided</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* ── Budget summary ── */}
                <Card>
                  <CardHeader title="Budget Summary" action={<TrendingUp className="h-4 w-4 text-slate-400" />} />
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Budget',   value: result.budget_summary?.total_budget,         accent: 'border-slate-200 bg-slate-50' },
                      { label: 'Allocated',      value: result.budget_summary?.total_allocated,       accent: 'border-emerald-100 bg-emerald-50' },
                      { label: 'Reserve',        value: result.budget_summary?.recommended_reserve,   accent: 'border-amber-100 bg-amber-50' },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className={`p-3 rounded-xl border ${accent}`}>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
                          {form.currency} {value?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  {result.budget_summary?.reserve_reason && (
                    <p className="text-xs text-slate-500 mt-3">
                      <span className="font-medium text-slate-700">Reserve note: </span>
                      {result.budget_summary.reserve_reason}
                    </p>
                  )}
                </Card>

                {/* ── Impact positioning ── */}
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-emerald-50">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Impact Positioning</p>
                      <p className="text-xs text-slate-400">Use this in your pitch deck or ESG report</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3">
                    <p className="text-sm text-slate-700 leading-relaxed">{result.impact_positioning_summary}</p>
                  </div>
                </Card>

                {/* ── JSON toggle ── */}
                <Card padding={false}>
                  <button
                    onClick={() => setShowJSON((v) => !v)}
                    className="flex w-full items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors rounded-xl"
                  >
                    <span className="text-sm font-medium text-slate-700">Raw JSON Response</span>
                    {showJSON ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  {showJSON && (
                    <div className="px-5 pb-5">
                      <JSONViewer data={result} title="b2b-proposal response" />
                    </div>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  )
}
