/**
 * routes/factcheck.js
 * Two endpoints:
 *   POST /api/extract-claims  — takes PDF text, returns list of claims
 *   POST /api/verify-claims   — takes claims array, returns verdicts
 */

import express from 'express'
import { callAI } from '../aiProviders.js'

const router = express.Router()

// ─── POST /api/extract-claims ─────────────────────────────────────────────────
router.post('/extract-claims', async (req, res) => {
  const { text } = req.body

  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return res.status(400).json({ error: 'Please provide at least 50 characters of PDF text.' })
  }

  const systemPrompt = `You are a professional fact-checker.
Extract specific, verifiable claims from the provided document text.
Focus on: statistics, percentages, financial figures, dates, named events, product claims, attributed quotes.
Ignore vague opinions or non-verifiable statements.
Return ONLY a JSON array of strings. No markdown, no explanation. Maximum 8 items.
Example: ["Claim one text", "Claim two text"]`

  try {
    const raw = await callAI(systemPrompt, `Extract verifiable claims:\n\n${text.slice(0, 6000)}`)

    let claims = []
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) claims = parsed
    } catch {
      // Fallback: split by newlines
      claims = raw
        .split('\n')
        .map(l => l.replace(/^[\d\.\-\*\•"]+\s*/, '').replace(/",?$/, '').trim())
        .filter(l => l.length > 15)
        .slice(0, 8)
    }

    if (claims.length === 0) {
      return res.status(422).json({ error: 'No verifiable claims found in this document.' })
    }

    return res.json({ claims })
  } catch (err) {
    console.error('[extract-claims] Error:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// ─── POST /api/verify-claims ──────────────────────────────────────────────────
router.post('/verify-claims', async (req, res) => {
  const { claims } = req.body

  if (!Array.isArray(claims) || claims.length === 0) {
    return res.status(400).json({ error: 'Provide a non-empty array of claims.' })
  }

  const numbered = claims.map((c, i) => `Claim ${i + 1}: ${c}`).join('\n')

  const systemPrompt = `You are a professional fact-checker with broad knowledge of current events and data.
For each claim provided, verify it based on your knowledge and reasoning.
Return ONLY a valid JSON array. Each item must have exactly these keys:
  "claim"       — the original claim text (string)
  "verdict"     — one of: "VERIFIED", "INACCURATE", or "FALSE"
  "explanation" — 1-2 sentence explanation of the finding (string)
  "source"      — a credible source name, e.g. "WHO", "Reuters", "Statista", "General knowledge" (string)

Verdict meanings:
  VERIFIED   = claim is accurate based on current knowledge
  INACCURATE = claim is partially wrong, outdated, or misleading
  FALSE      = claim is clearly incorrect

No markdown, no preamble, no explanation outside the JSON array.`

  try {
    const raw = await callAI(systemPrompt, `Verify these claims:\n${numbered}`)

    let results = []
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      results = JSON.parse(cleaned)
    } catch {
      // Graceful fallback
      results = claims.map(c => ({
        claim: c,
        verdict: 'INACCURATE',
        explanation: 'Could not automatically verify. Please check manually.',
        source: 'N/A',
      }))
    }

    return res.json({ results })
  } catch (err) {
    console.error('[verify-claims] Error:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

export default router
