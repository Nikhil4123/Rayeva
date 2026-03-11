import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, RefreshCw, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import JSONViewer from '../components/ui/JSONViewer'
import Spinner from '../components/ui/Spinner'
import { getLogs } from '../api/logsApi'
import useAppStore from '../store/useAppStore'

const MODULE_OPTIONS = [
  { value: '', label: 'All modules' },
  { value: 'product_tagger',   label: 'Product Tagger'   },
  { value: 'b2b_proposal',     label: 'B2B Proposal'     },
  { value: 'impact_report',    label: 'Impact Report'    },
  { value: 'whatsapp_support', label: 'WhatsApp Bot'     },
]

const STATUS_OPTIONS = [
  { value: '',             label: 'All statuses'  },
  { value: 'success',      label: 'Success'       },
  { value: 'parse_error',  label: 'Parse Error'   },
  { value: 'api_error',    label: 'API Error'     },
  { value: 'rate_limited', label: 'Rate Limited'  },
]

const STATUS_MAP = {
  success:      { variant: 'success', label: 'Success'      },
  parse_error:  { variant: 'warning', label: 'Parse Error'  },
  api_error:    { variant: 'error',   label: 'API Error'    },
  rate_limited: { variant: 'warning', label: 'Rate Limited' },
}

function latencyColor(ms) {
  if (ms < 1000) return 'text-emerald-600'
  if (ms < 3000) return 'text-amber-600'
  return 'text-red-600'
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false)
  const sc = STATUS_MAP[log.status] || STATUS_MAP.success

  let parsedResponse = null
  if (log.raw_response) {
    try { parsedResponse = JSON.parse(log.raw_response) } catch { /* keep null */ }
  }

  return (
    <div className="border-b border-slate-100 last:border-0">
      {/* ── Summary row ────────────────────────────────────────────── */}
      <button
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Expand icon */}
        <span className="shrink-0 text-slate-400">
          {expanded
            ? <ChevronUp className="h-3.5 w-3.5"   />
            : <ChevronDown className="h-3.5 w-3.5" />
          }
        </span>

        {/* Module */}
        <div className="w-32 shrink-0">
          <Badge variant={log.module} size="xs">
            {log.module?.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Model */}
        <div className="hidden sm:block w-32 shrink-0 text-xs text-slate-500 truncate">
          {log.model}
        </div>

        {/* Status */}
        <div className="w-28 shrink-0">
          <Badge variant={sc.variant} size="xs" dot>
            {sc.label}
          </Badge>
        </div>

        {/* Latency */}
        <div className={`hidden md:block w-20 shrink-0 text-xs font-mono tabular-nums text-right ${latencyColor(log.latency_ms)}`}>
          {log.latency_ms ? `${log.latency_ms.toLocaleString()}ms` : '—'}
        </div>

        {/* Tokens */}
        <div className="hidden lg:block w-20 shrink-0 text-xs text-slate-500 text-right tabular-nums">
          {log.tokens_used ? `${log.tokens_used.toLocaleString()} tok` : '—'}
        </div>

        {/* Time */}
        <div className="flex-1 text-right text-xs text-slate-400 truncate">
          {timeAgo(log.created_at)}
        </div>
      </button>

      {/* ── Expanded detail ────────────────────────────────────────── */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 bg-slate-50 border-t border-slate-100 animate-fade-in">
          {log.error_message && (
            <Alert type="error" title="Error Message">
              {log.error_message}
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prompt */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prompt Sent</p>
              <div className="bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto scrollbar-thin">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                  {log.prompt || '(no prompt recorded)'}
                </pre>
              </div>
            </div>

            {/* Response */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">AI Response</p>
              {parsedResponse ? (
                <JSONViewer data={parsedResponse} title="parsed response" />
              ) : (
                <div className="bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto scrollbar-thin">
                  <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
                    {log.raw_response || '(no response recorded)'}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Metadata footer */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
            <span><span className="font-medium text-slate-700">Log ID:</span> {log.id}</span>
            <span><span className="font-medium text-slate-700">Model:</span> {log.model}</span>
            <span><span className="font-medium text-slate-700">Latency:</span> {log.latency_ms}ms</span>
            <span><span className="font-medium text-slate-700">Tokens:</span> {log.tokens_used ?? '—'}</span>
            <span><span className="font-medium text-slate-700">Timestamp:</span> {new Date(log.created_at).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AILogs() {
  const [logs, setLogs]         = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [apiError, setApiError] = useState(null)
  const [filters, setFilters]   = useState({ module: '', status: '', search: '' })
  const { addToast, setDemoMode } = useAppStore()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      const res = await getLogs({
        module: filters.module || undefined,
        status: filters.status || undefined,
      })
      if (res._demo) setDemoMode(true)
      setLogs(res.data || [])
      setTotal(res.total || res.data?.length || 0)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load AI logs'
      setApiError(msg)
      addToast('error', msg)
    } finally {
      setLoading(false)
    }
  }, [filters.module, filters.status, setDemoMode, addToast])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Client-side search filter (search over module + error_message)
  const displayed = logs.filter((log) => {
    if (!filters.search) return true
    const q = filters.search.toLowerCase()
    return (
      log.module?.toLowerCase().includes(q) ||
      log.status?.toLowerCase().includes(q) ||
      log.error_message?.toLowerCase().includes(q) ||
      log.model?.toLowerCase().includes(q)
    )
  })

  // Aggregate stats
  const successCount  = logs.filter((l) => l.status === 'success').length
  const errorCount    = logs.filter((l) => l.status !== 'success').length
  const avgLatency    = logs.length
    ? Math.round(logs.reduce((s, l) => s + (l.latency_ms || 0), 0) / logs.length)
    : 0

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            AI Logs
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Every AI API call is recorded here — prompt, response, latency, and status.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          loading={loading}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </motion.div>

      {/* ── Summary stats ────────────────────────────────────────────── */}
      {!loading && logs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Logs',       value: total,        color: 'text-slate-900' },
            { label: 'Successful',       value: successCount, color: 'text-emerald-600' },
            { label: `Errors / Warnings`,value: errorCount,   color: errorCount > 0 ? 'text-red-600' : 'text-slate-900' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="py-3 px-4">
              <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-44">
            <Input
              label="Search"
              placeholder="module, status, error…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="w-44">
            <Select
              label="Module"
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            >
              {MODULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <div className="w-44">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilters({ module: '', status: '', search: '' })}
            icon={<Filter className="h-3.5 w-3.5" />}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {apiError && <Alert type="error" onClose={() => setApiError(null)}>{apiError}</Alert>}

      {/* ── Table ────────────────────────────────────────────────────── */}
      <Card padding={false}>
        {/* Table header */}
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <div className="w-4 shrink-0" />
          <div className="w-32 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide">Module</div>
          <div className="hidden sm:block w-32 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide">Model</div>
          <div className="w-28 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
          <div className="hidden md:block w-20 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Latency</div>
          <div className="hidden lg:block w-20 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Tokens</div>
          <div className="flex-1 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Time</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" label="Loading logs…" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">No logs found</p>
            {(filters.module || filters.status || filters.search) && (
              <button
                onClick={() => setFilters({ module: '', status: '', search: '' })}
                className="text-xs text-emerald-600 mt-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          displayed.map((log) => <LogRow key={log.id} log={log} />)
        )}

        {/* Footer */}
        {!loading && displayed.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl text-xs text-slate-500 flex justify-between items-center">
            <span>
              Showing {displayed.length} of {total} logs
              {avgLatency > 0 && ` · avg latency: ${avgLatency}ms`}
            </span>
            <span className="text-slate-400">Click any row to inspect prompt & response</span>
          </div>
        )}
      </Card>
    </div>
  )
}
