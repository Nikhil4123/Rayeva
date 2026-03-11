import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

// ── Leaf node value renderers ─────────────────────────────────────────────────
function JSONValue({ value }) {
  if (value === null)             return <span className="json-null">null</span>
  if (typeof value === 'boolean') return <span className="json-bool">{String(value)}</span>
  if (typeof value === 'number')  return <span className="json-num">{value}</span>
  if (typeof value === 'string')  return <span className="json-str">"{value}"</span>
  return null
}

// ── Recursive node ────────────────────────────────────────────────────────────
function JSONNode({ data, keyName, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2)

  const isArr = Array.isArray(data)
  const isObj = data !== null && typeof data === 'object'
  const isPrimitive = !isObj

  if (isPrimitive) {
    return (
      <div className="flex items-baseline gap-1 pl-1 py-0.5 text-sm font-mono">
        {keyName !== undefined && (
          <span className="json-key">"{keyName}"<span className="text-slate-500">: </span></span>
        )}
        <JSONValue value={data} />
      </div>
    )
  }

  const entries = isArr ? data.map((v, i) => [i, v]) : Object.entries(data)
  const preview = isArr ? `[ ${data.length} items ]` : `{ ${Object.keys(data).length} keys }`

  return (
    <div className="pl-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 py-0.5 text-sm font-mono hover:bg-slate-800 rounded px-1 w-full text-left"
      >
        {open
          ? <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
          : <ChevronRight className="h-3 w-3 text-slate-500 shrink-0" />
        }
        {keyName !== undefined && (
          <span className="json-key">"{keyName}"<span className="text-slate-500">: </span></span>
        )}
        <span className="text-slate-400 text-xs">
          {open ? (isArr ? '[' : '{') : preview}
        </span>
      </button>

      {open && (
        <div className="ml-4 border-l border-slate-700 pl-3">
          {entries.map(([k, v]) => (
            <JSONNode key={k} data={v} keyName={isArr ? undefined : k} depth={depth + 1} />
          ))}
          <div className="text-sm font-mono text-slate-400 py-0.5">
            {isArr ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────
export default function JSONViewer({ data, title }) {
  const [showRaw, setShowRaw] = useState(false)

  return (
    <div className="rounded-xl bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{title || 'JSON Response'}</span>
        <button
          onClick={() => setShowRaw((r) => !r)}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-0.5 rounded hover:bg-slate-800"
        >
          {showRaw ? 'tree view' : 'raw'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] max-h-96 scrollbar-thin">
        {showRaw ? (
          <pre className="text-emerald-400 font-mono whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <JSONNode data={data} depth={0} />
        )}
      </div>
    </div>
  )
}
