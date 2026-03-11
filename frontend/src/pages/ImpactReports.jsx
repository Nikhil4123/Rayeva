import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Search, ChevronDown, ChevronUp, Award } from 'lucide-react'
import Card, { CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import JSONViewer from '../components/ui/JSONViewer'
import { FullPageSpinner } from '../components/ui/Spinner'
import { generateImpactReport, getImpactReport } from '../api/impactApi'
import useAppStore from '../store/useAppStore'

const BADGE_CONFIG = {
  'Eco Champion':         { bg: 'bg-emerald-600', text: 'text-white', icon: '🏆' },
  'Green Buyer':          { bg: 'bg-teal-500',    text: 'text-white', icon: '🌿' },
  'Sustainability Starter':{ bg: 'bg-blue-500',   text: 'text-white', icon: '🌱' },
  'Conscious Consumer':   { bg: 'bg-violet-500',  text: 'text-white', icon: '♻️' },
}

function ScoreRing({ score }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} strokeWidth="8" stroke="#e2e8f0" fill="none" />
        <circle
          cx="48" cy="48" r={r}
          strokeWidth="8"
          stroke={color}
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-tight">
        <span className="text-xl font-bold text-slate-900 tabular-nums">{score}</span>
        <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
      </div>
    </div>
  )
}

function MetricCard({ icon, value, unit, label, sub, bg }) {
  return (
    <div className={`flex flex-col ${bg} rounded-xl p-4 gap-1`}>
      <span className="text-2xl">{icon}</span>
      <div className="text-xl font-bold text-slate-900 tabular-nums leading-tight">
        {value?.toLocaleString?.() ?? value}
        <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
      </div>
      <div className="text-xs font-medium text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

const DEMO_ORDER_IDS = ['ORD-2026-001234', 'ORD-2026-000891', 'ORD-2026-002410']

// Pre-built mock reports — load instantly without any API call
const MOCK_REPORTS = {
  'ORD-2026-001234': {
    report_id: 'demo-report-001',
    order_id: 'ORD-2026-001234',
    sustainability_score: 87,
    badge: 'Eco Champion',
    plastic_saved_grams: 420,
    carbon_avoided_grams: 1850,
    local_sourcing_percent: 72,
    trees_equivalent: 0.04,
    reuse_multiplier: 12,
    impact_statement:
      'Your order of 6 sustainable products saved 420 g of single-use plastic and avoided 1,850 g of CO₂ emissions — equivalent to driving 14 km less in a petrol car. 72% of items were locally sourced, dramatically cutting transport-related emissions. This order ranks in the top 15% of all Rayeva purchases.',
    item_breakdown: [
      { product_name: 'Bamboo Toothbrush Set (×4)', plastic_saved_g: 120, carbon_avoided_g: 480 },
      { product_name: 'Organic Cotton Tote Bag', plastic_saved_g: 200, carbon_avoided_g: 820 },
      { product_name: 'Beeswax Food Wrap (3-pack)', plastic_saved_g: 100, carbon_avoided_g: 550 },
    ],
  },
  'ORD-2026-000891': {
    report_id: 'demo-report-002',
    order_id: 'ORD-2026-000891',
    sustainability_score: 64,
    badge: 'Green Buyer',
    plastic_saved_grams: 185,
    carbon_avoided_grams: 760,
    local_sourcing_percent: 48,
    trees_equivalent: 0.01,
    reuse_multiplier: 6,
    impact_statement:
      'This order eliminated 185 g of single-use plastic and prevented 760 g of CO₂ from entering the atmosphere. 48% of products were locally sourced. A solid green purchase — choosing more locally sourced items next time could push your score above 80.',
    item_breakdown: [
      { product_name: 'Recycled Ocean Plastic Notebook', plastic_saved_g: 85, carbon_avoided_g: 310 },
      { product_name: 'Plant-Based Cleaning Concentrate', plastic_saved_g: 100, carbon_avoided_g: 450 },
    ],
  },
  'ORD-2026-002410': {
    report_id: 'demo-report-003',
    order_id: 'ORD-2026-002410',
    sustainability_score: 51,
    badge: 'Sustainability Starter',
    plastic_saved_grams: 90,
    carbon_avoided_grams: 340,
    local_sourcing_percent: 30,
    trees_equivalent: 0.005,
    reuse_multiplier: 3,
    impact_statement:
      'Your first step into sustainable shopping — this order saved 90 g of plastic and avoided 340 g of CO₂. Only 30% was locally sourced, which is an area to improve. Switching even one product to a local sustainable alternative on your next order could boost your score by 15+ points.',
    item_breakdown: [
      { product_name: 'Compostable Bin Liners (×20)', plastic_saved_g: 60, carbon_avoided_g: 200 },
      { product_name: 'Organic Soap Bar', plastic_saved_g: 30, carbon_avoided_g: 140 },
    ],
  },
}

export default function ImpactReports() {
  const [orderId, setOrderId]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [report, setReport]     = useState(null)
  const [apiError, setApiError] = useState(null)
  const [showJSON, setShowJSON] = useState(false)
  const { addToast, setDemoMode } = useAppStore()

  async function handleGenerate(id) {
    const oid = (id || orderId).trim()
    if (!oid) return

    // Instant load for known demo order IDs — no API call needed
    if (MOCK_REPORTS[oid]) {
      setApiError(null)
      setReport(MOCK_REPORTS[oid])
      setDemoMode(true)
      addToast('success', 'Demo impact report loaded!')
      return
    }

    setLoading(true)
    setApiError(null)
    setReport(null)
    try {
      // Try to fetch existing report; if not found, generate a new one
      let res
      try {
        res = await getImpactReport(oid)
      } catch (e) {
        // 404 = no saved report yet → generate via AI
        if (e.response?.status === 404 || e.response?.status === undefined) {
          res = await generateImpactReport(oid)
        } else throw e
      }
      if (res._demo) setDemoMode(true)
      setReport(res.data)
      addToast('success', 'Impact report loaded!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load impact report'
      setApiError(msg)
      addToast('error', 'Could not load report.')
    } finally {
      setLoading(false)
    }
  }

  const badge = report ? BADGE_CONFIG[report.badge] : null

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-teal-600" />
          Impact Report Viewer
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter an Order ID to fetch or generate its AI-powered environmental sustainability report.
        </p>
      </motion.div>

      {/* ── Search bar ───────────────────────────────────────────────── */}
      <Card>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="e.g. ORD-2026-001234"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <Button
            onClick={() => handleGenerate()}
            loading={loading}
            icon={<Search className="h-4 w-4" />}
          >
            {loading ? 'Loading…' : 'Fetch Report'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-slate-500 self-center">Try a demo order:</span>
          {DEMO_ORDER_IDS.map((id) => (
            <button
              key={id}
              onClick={() => { setOrderId(id); handleGenerate(id) }}
              className="text-xs px-3 py-1 border border-teal-200 text-teal-700 rounded-full hover:bg-teal-50 transition-colors"
            >
              {id}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {apiError && (
        <Alert type="error" title="Failed to load report" onClose={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      {/* ── Loading ──────────────────────────────────────────────────── */}
      {loading && (
        <Card>
          <FullPageSpinner label="Calculating sustainability impact…" />
        </Card>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!loading && !report && !apiError && (
        <div className="space-y-4">
          <Card className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-4 rounded-full bg-teal-50 mb-4">
              <Leaf className="h-8 w-8 text-teal-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">Enter an order ID above, or try a featured report below</p>
            <p className="text-xs text-slate-400 mt-1">The AI will estimate the environmental impact of any order</p>
          </Card>

          {/* Featured demo reports */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Featured Demo Reports</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(MOCK_REPORTS).map((r) => {
                const bc = BADGE_CONFIG[r.badge] || { bg: 'bg-slate-500', text: 'text-white', icon: '🌱' }
                const scoreColor = r.sustainability_score >= 75 ? 'text-emerald-600' : r.sustainability_score >= 50 ? 'text-amber-500' : 'text-red-500'
                return (
                  <button
                    key={r.order_id}
                    onClick={() => { setOrderId(r.order_id); setReport(r); setDemoMode(true) }}
                    className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-slate-500 group-hover:text-teal-600 transition-colors">{r.order_id}</span>
                      <span className={`text-lg font-bold tabular-nums ${scoreColor}`}>{r.sustainability_score}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${bc.bg} ${bc.text} mb-3`}>
                      <span>{bc.icon}</span> {r.badge}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <span>🌿 {r.plastic_saved_grams} g plastic</span>
                      <span>💨 {r.carbon_avoided_grams} g CO₂</span>
                    </div>
                    <p className="text-xs text-teal-600 mt-3 font-medium group-hover:underline">View full report →</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Report ───────────────────────────────────────────────────── */}
      {report && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Header */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide">Impact Report</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">Order: {report.order_id}</p>
              </div>
              {badge && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${badge.bg}`}>
                  <span className="text-xl">{badge.icon}</span>
                  <span className={`text-sm font-bold ${badge.text}`}>{report.badge}</span>
                  <Award className={`h-4 w-4 ${badge.text}`} />
                </div>
              )}
            </div>
          </Card>

          {/* Metrics + score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sustainability score ring */}
            <Card className="flex flex-col items-center justify-center py-4 gap-2">
              <ScoreRing score={report.sustainability_score} />
              <p className="text-xs text-slate-500 font-medium">Sustainability Score</p>
            </Card>

            {/* Other metrics */}
            <MetricCard icon="🌿" value={report.plastic_saved_grams} unit="g"  label="Plastic Saved"    sub="Single-use plastic avoided" bg="bg-emerald-50" />
            <MetricCard icon="💨" value={report.carbon_avoided_grams} unit="g" label="CO₂ Avoided"      sub="Carbon emissions prevented"  bg="bg-sky-50"     />
            <MetricCard icon="📍" value={`${report.local_sourcing_percent}%`} unit="" label="Locally Sourced" sub="Reduced transport emissions" bg="bg-amber-50"   />
          </div>

          {/* Impact statement */}
          <Card>
            <CardHeader title="Impact Statement" />
            <p className="text-sm text-slate-700 leading-relaxed">{report.impact_statement}</p>
          </Card>

          {/* Item breakdown */}
          {report.item_breakdown?.length > 0 && (
            <Card padding={false}>
              <div className="px-5 pt-5 pb-3">
                <CardHeader title="Item Breakdown" subtitle="Per-product sustainability impact" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-slate-100 bg-slate-50">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-2.5">Product</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5">Plastic Saved</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-2.5">CO₂ Avoided</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report.item_breakdown.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-slate-800">{item.product_name}</td>
                        <td className="px-4 py-3 text-right text-emerald-600 font-medium tabular-nums">
                          {item.plastic_saved_g} g
                        </td>
                        <td className="px-5 py-3 text-right text-sky-600 font-medium tabular-nums">
                          {item.carbon_avoided_g} g
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* JSON toggle */}
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
                <JSONViewer data={report} title="impact-report response" />
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}
