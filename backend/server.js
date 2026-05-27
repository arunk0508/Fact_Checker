/**
 * server.js
 * TruthLayer Express backend
 * Runs on http://localhost:5000
 *
 * Endpoints:
 *   GET  /api/health          — check server is running
 *   POST /api/extract-claims  — AI extracts claims from PDF text
 *   POST /api/verify-claims   — AI verifies each claim
 */

import express   from 'express'
import cors      from 'cors'
import dotenv    from 'dotenv'
import factcheck from './routes/factcheck.js'

// Load .env file from backend folder
dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))   // parse JSON bodies (PDF text can be large)

// CORS — only allow requests from the frontend URL
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',    // local dev
    'http://localhost:5173',    // Vite default port
  ],
  methods: ['GET', 'POST'],
}))

// ─── Routes ───────────────────────────────────────────────────────────────────
// Health check — visit http://localhost:5000/api/health to confirm it's running
app.get('/api/health', (req, res) => {
  const provider = process.env.AI_PROVIDER || 'gemini'
  const geminiOk = !!(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('PASTE'))
  const groqOk   = !!(process.env.GROQ_API_KEY   && !process.env.GROQ_API_KEY.includes('PASTE'))

  res.json({
    status:   'ok',
    provider,
    gemini:   geminiOk ? 'configured' : 'not set',
    groq:     groqOk   ? 'configured' : 'not set',
    message:  'TruthLayer backend is running 🚀',
  })
})

// Fact-check routes
app.use('/api', factcheck)

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TruthLayer backend running at http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
  console.log(`   Provider:     ${process.env.AI_PROVIDER || 'gemini'}\n`)
})
