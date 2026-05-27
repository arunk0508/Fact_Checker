/**
 * aiClient.js — FRONTEND
 * Now just calls our own backend API.
 * API keys are ONLY in backend/.env — never in the browser.
 */

// In dev: http://localhost:5000
// On Vercel/Render: set VITE_API_URL in frontend .env to your deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function apiFetch(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Server error ${res.status}`)
  }
  return data
}

// Extract claims from PDF text — calls POST /api/extract-claims
export async function extractClaimsFromBackend(text) {
  const { claims } = await apiFetch('/api/extract-claims', { text })
  return claims
}

// Verify claims — calls POST /api/verify-claims
export async function verifyClaimsFromBackend(claims) {
  const { results } = await apiFetch('/api/verify-claims', { claims })
  return results
}
