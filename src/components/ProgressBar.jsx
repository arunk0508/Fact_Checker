const LABELS = {
  1: 'Extracting text from PDF…',
  2: 'Identifying verifiable claims with AI…',
  3: 'Searching the web to verify each claim…',
  4: 'Building your fact-check report…',
}

export default function ProgressBar({ progress, step }) {
  return (
    <div className="mb-8">
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-teal to-teal-dark rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center font-mono text-xs text-slate-500 animate-pulse-bar">
        {LABELS[step] || 'Working…'}
      </p>
    </div>
  )
}
