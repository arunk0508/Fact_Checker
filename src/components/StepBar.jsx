const STEPS = ['Upload PDF', 'Extract Text', 'Find Claims', 'Verify Online', 'Report Ready']

export default function StepBar({ currentStep }) {
  return (
    <div className="flex gap-2 flex-wrap mb-8">
      {STEPS.map((label, i) => {
        const done   = i < currentStep
        const active = i === currentStep
        return (
          <div
            key={label}
            className={[
              'flex-1 min-w-[100px] text-center py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-300',
              done   ? 'border-verdant bg-verdant/10 text-green-800'  : '',
              active ? 'border-teal bg-teal/10 text-teal-dark'        : '',
              !done && !active ? 'border-slate-200 bg-white text-slate-400' : '',
            ].join(' ')}
          >
            {done ? '✓ ' : ''}{label}
          </div>
        )
      })}
    </div>
  )
}
