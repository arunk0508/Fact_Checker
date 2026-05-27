import { useState, useEffect } from 'react'
import UploadZone  from './components/UploadZone.jsx'
import StepBar     from './components/StepBar.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import ClaimCard   from './components/ClaimCard.jsx'
import { extractTextFromPDF } from './utils/pdfExtractor.js'
import { extractClaims, verifyClaims } from './utils/factChecker.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [file,          setFile]          = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [step,          setStep]          = useState(0)
  const [progress,      setProgress]      = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [results,       setResults]       = useState(null)
  const [error,         setError]         = useState('')
  const [backendStatus, setBackendStatus] = useState('checking') // checking | ok | error

  // Check backend is reachable on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(r => r.json())
      .then(d => setBackendStatus(d.status === 'ok' ? 'ok' : 'error'))
      .catch(() => setBackendStatus('error'))
  }, [])

  const counts = results ? {
    VERIFIED:   results.filter(r => r.verdict === 'VERIFIED').length,
    INACCURATE: results.filter(r => r.verdict === 'INACCURATE').length,
    FALSE:      results.filter(r => r.verdict === 'FALSE').length,
  } : null

  const handleAnalyze = async () => {
    if (!file) return setError('Please upload a PDF first.')
    if (backendStatus !== 'ok') return setError('Backend server is not running. Start it with: cd backend && npm run dev')
    setError(''); setResults(null); setLoading(true); setProgress(5); setStep(1)
    try {
      const text = await extractTextFromPDF(file)
      setExtractedText(text)
      setProgress(25); setStep(2)
      const claims = await extractClaims(text)
      setProgress(55); setStep(3)
      const verified = await verifyClaims(claims)
      setProgress(100); setStep(4)
      setResults(verified)
    } catch (err) {
      setError(err.message || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-20">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-navy text-teal font-mono text-xs tracking-widest px-4 py-1.5 rounded-full mb-4">
          <span>🔍</span> AI-POWERED FACT CHECKER
        </div>
        <h1 className="font-display font-extrabold text-5xl text-navy leading-tight mb-3">
          Truth<span className="text-teal">Layer</span>
        </h1>
        <p className="text-slate-500 max-w-md mx-auto text-base">
          Upload a PDF. AI extracts claims, searches knowledge, flags what's real — and what isn't.
        </p>

        {/* Backend status indicator */}
        <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full font-mono text-xs font-bold ${
          backendStatus === 'ok'       ? 'bg-green-100 text-green-700' :
          backendStatus === 'error'    ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            backendStatus === 'ok'    ? 'bg-green-500' :
            backendStatus === 'error' ? 'bg-red-500' : 'bg-slate-400'
          }`} />
          {backendStatus === 'ok'      ? 'Backend connected ✓' :
           backendStatus === 'error'   ? 'Backend offline — run: cd backend && npm run dev' :
                                        'Checking backend…'}
        </div>
      </div>

      {/* Step bar */}
      {step > 0 && <StepBar currentStep={step} />}

      {/* Upload */}
      <div className="mb-5">
        <UploadZone file={file} onFile={(f) => { setFile(f); setError('') }} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-5 text-red-800 text-sm whitespace-pre-line">
          ⚠️ {error}
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !file || backendStatus !== 'ok'}
        className={[
          'w-full py-4 rounded-xl font-display font-bold text-lg text-white flex items-center justify-center gap-3 transition-all duration-200',
          loading || !file || backendStatus !== 'ok'
            ? 'bg-slate-300 cursor-not-allowed'
            : 'bg-navy hover:bg-teal-dark hover:-translate-y-0.5 shadow-lg hover:shadow-xl',
        ].join(' ')}
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-sm" />
            Analyzing claims…
          </>
        ) : (
          <><span>🔬</span> Analyze &amp; Fact-Check PDF</>
        )}
      </button>

      {/* Progress */}
      {loading && <div className="mt-6"><ProgressBar progress={progress} step={step} /></div>}

      {/* Extracted text preview */}
      {extractedText && !loading && (
        <div className="mt-8">
          <p className="font-mono text-xs text-slate-400 tracking-widest mb-2">EXTRACTED TEXT PREVIEW</p>
          <div className="bg-navy rounded-xl p-4 font-mono text-xs text-teal/80 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {extractedText.slice(0, 600)}…
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="font-display font-extrabold text-2xl text-navy">Fact-Check Report</h2>
            <div className="flex gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-800">✅ {counts.VERIFIED} Verified</span>
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">⚠️ {counts.INACCURATE} Inaccurate</span>
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-800">❌ {counts.FALSE} False</span>
            </div>
          </div>
          {results.map((r, i) => <ClaimCard key={i} index={i} {...r} />)}
        </div>
      )}

      {!results && !loading && (
        <div className="text-center mt-12 text-slate-400">
          <p className="text-4xl mb-3">📋</p>
          <p>Upload a PDF and click "Analyze" to get your fact-check report.</p>
        </div>
      )}

      <div className="text-center mt-16 font-mono text-xs text-slate-400">
        TruthLayer · React + Express · Powered by Gemini APIs
      </div>
    </div>
  )
}
