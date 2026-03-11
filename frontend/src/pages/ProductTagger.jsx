import { useState } from 'react'
import { Tag, Sparkles, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import Card, { CardHeader, CardDivider } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import JSONViewer from '../components/ui/JSONViewer'
import { FullPageSpinner } from '../components/ui/Spinner'
import { categorizeProduct } from '../api/productApi'
import useAppStore from '../store/useAppStore'

// Predefined sample products for quick demo
const SAMPLES = [
  {
    title: 'Bamboo Toothbrush – Charcoal Infused, Pack of 4',
    description:
      'FSC-certified bamboo handle, charcoal-infused nylon bristles for deep cleaning. Handle is fully compostable. Packaged in recycled kraft paper — zero plastic. Vegan and cruelty-free.',
  },
  {
    title: 'Organic Beeswax Food Wrap Set – 3 Sizes',
    description:
      'Replace cling film with these reusable beeswax wraps made from 100% organic cotton, sustainably harvested beeswax, jojoba oil and tree resin. Keeps food fresh for 12+ months. Compostable at end of life.',
  },
  {
    title: 'Recycled Ocean Plastic A5 Notebook',
    description:
      'Cover made from reclaimed ocean plastic bottles. Inside pages are 100% recycled FSC paper. Lay-flat binding. Available in ruled or dotted. Each notebook removes 5 plastic bottles from the ocean.',
  },
]

function ConfidenceBar({ score }) {
  const pct = Math.min(100, Math.max(0, Math.round(Number(score) || 0)))
  const color = pct >= 85 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Confidence Score</span>
        <span className="font-semibold text-slate-800">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bar-fill transition-all ${color}`}
          style={{ '--bar-width': `${pct}%`, width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ProductTagger() {
  const [form, setForm]       = useState({ title: '', description: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [apiError, setApiError] = useState(null)
  const [showJSON, setShowJSON] = useState(false)
  const { addToast, setDemoMode } = useAppStore()

  function validate() {
    const e = {}
    if (!form.title.trim() || form.title.trim().length < 3)
      e.title = 'Title must be at least 3 characters'
    if (!form.description.trim() || form.description.trim().length < 20)
      e.description = 'Description must be at least 20 characters'
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
      const res = await categorizeProduct({ title: form.title.trim(), description: form.description.trim() })
      if (res._demo) setDemoMode(true)
      setResult(res.data)
      addToast('success', 'Product classified successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to classify product'
      setApiError(msg)
      addToast('error', 'Classification failed. ' + msg)
    } finally {
      setLoading(false)
    }
  }

  function loadSample(s) {
    setForm(s)
    setErrors({})
    setResult(null)
    setApiError(null)
  }

  function reset() {
    setForm({ title: '', description: '' })
    setErrors({})
    setResult(null)
    setApiError(null)
    setShowJSON(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Tag className="h-5 w-5 text-emerald-600" />
          AI Product Tagger
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter a product title and description. Our AI will auto-assign category, tags and sustainability filters.
        </p>
      </div>

      {/* ── Sample quick-load ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 self-center">Try a sample:</span>
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => loadSample(s)}
            className="text-xs px-3 py-1 border border-emerald-200 text-emerald-700 rounded-full hover:bg-emerald-50 transition-colors"
          >
            {s.title.substring(0, 30)}…
          </button>
        ))}
      </div>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader title="Product Details" subtitle="Provide title and description" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Product Title"
              placeholder="e.g. Bamboo Toothbrush Pack of 4"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={errors.title}
              required
            />
            <Textarea
              label="Product Description"
              placeholder="Describe materials, sustainability features, use case…"
              rows={7}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              error={errors.description}
              hint={`${form.description.length} / 5000 characters`}
              required
            />

            {apiError && (
              <Alert type="error" title="Classification failed" onClose={() => setApiError(null)}>
                {apiError}
              </Alert>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
                icon={<Sparkles className="h-4 w-4" />}
              >
                {loading ? 'Analyzing…' : 'Analyze with AI'}
              </Button>
              <Button type="button" variant="ghost" onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {/* Result panel */}
        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <Card>
              <FullPageSpinner label="AI is classifying your product…" />
            </Card>
          )}

          {!loading && !result && (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-emerald-50 mb-4">
                <Tag className="h-8 w-8 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No result yet</p>
              <p className="text-xs text-slate-400 mt-1">Submit a product above to see AI classification here</p>
            </Card>
          )}

          {result && (
            <div className="space-y-4 animate-slide-up">
              {/* Category card */}
              <Card>
                <CardHeader title="Classification Result" subtitle={`AI Model: Sarvam AI`} />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between min-h-[72px]">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Primary Category</p>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{result.primaryCategory}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[72px]">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Sub-Category</p>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{result.subCategory}</p>
                  </div>
                </div>

                <ConfidenceBar score={result.confidenceScore} />

                {result.reasoning && (
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    <span className="font-medium text-slate-700">Reason: </span>
                    {result.reasoning}
                  </p>
                )}
              </Card>

              {/* Keywords / SEO Tags */}
              <Card>
                <CardHeader
                  title="Keywords"
                  subtitle={`${result.keywords?.length ?? 0} tags generated`}
                />
                <div className="flex flex-wrap gap-2 items-center">
                  {result.keywords?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      # {tag}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Sustainability filters */}
              <Card>
                <CardHeader
                  title="Sustainability Filters"
                  subtitle={`${result.sustainabilityTags?.length ?? 0} filters matched`}
                />
                <div className="flex flex-wrap gap-2 items-center">
                  {result.sustainabilityTags?.map((f) => (
                    <Badge key={f} variant={f} size="md">
                      🌿 {f}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* JSON toggle */}
              <Card padding={false}>
                <button
                  onClick={() => setShowJSON((v) => !v)}
                  className="flex w-full items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <span className="text-sm font-medium text-slate-700">Raw JSON Response</span>
                  {showJSON
                    ? <ChevronUp className="h-4 w-4 text-slate-500" />
                    : <ChevronDown className="h-4 w-4 text-slate-500" />
                  }
                </button>
                {showJSON && (
                  <div className="px-5 pb-5">
                    <JSONViewer data={result} title="product-categorize response" />
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
