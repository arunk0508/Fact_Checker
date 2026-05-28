const CONFIG = {
  VERIFIED:   { icon: '✅', label: 'Verified',    bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
  INACCURATE: { icon: '⚠️', label: 'Inaccurate',  bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
  FALSE:      { icon: '❌', label: 'False',        bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-100 text-red-800'   },
}

export default function ClaimCard({ claim, verdict, explanation, source, index }) {
  const cfg = CONFIG[verdict] || CONFIG.INACCURATE

  return (
    <div
      className={`rounded-2xl border p-5 mb-4 animate-slideIn ${cfg.bg} ${cfg.border}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top row */}
      <div className="flex gap-3 items-start">
        <span className={`shrink-0 font-mono text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap ${cfg.badge}`}>
          {cfg.icon} {cfg.label}
        </span>
        <p className="font-semibold text-navy text-sm leading-relaxed">{claim}</p>
      </div>

      {/* Explanation */}
      {explanation && (
        <p className="mt-3 pt-3 border-t border-slate-200 text-slate-600 text-sm leading-relaxed">
          {explanation}
        </p>
      )}

      {/* Source */}
      {source && source !== 'N/A' && (
        <p className="mt-2 font-mono text-xs text-teal-dark">🔗 Source: {source}</p>
      )}
    </div>
  )
}
