/**
 * aiProviders.js
 * All AI provider calls live here — keys stay on the server, never sent to browser.
 *
 * Providers:
 *   - Google Gemini  (GEMINI_API_KEY)  — free, 1500 req/day
 *   - Groq           (GROQ_API_KEY)    — free, 14400 req/day
 */

import fetch from 'node-fetch'

// ─── Google Gemini ────────────────────────────────────────────────────────────
export async function callGemini(systemPrompt, userContent) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.includes('PASTE')) {
    throw new Error('GEMINI_API_KEY not set in backend/.env')
  }

  const prompt = `${systemPrompt}\n\n${userContent}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
      })
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `Gemini error ${res.status}`
    if (res.status === 400) throw new Error('Invalid Gemini API key — check GEMINI_API_KEY in backend/.env')
    if (res.status === 429) throw new Error('Gemini rate limit — wait 60s and retry')
    throw new Error(msg)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// ─── Groq (Llama 3.3 70B) ────────────────────────────────────────────────────
export async function callGroq(systemPrompt, userContent) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.includes('PASTE')) {
    throw new Error('GROQ_API_KEY not set in backend/.env')
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent  },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('Invalid Groq API key — check GROQ_API_KEY in backend/.env')
    if (res.status === 429) throw new Error('Groq rate limit — wait 60s and retry')
    throw new Error(err?.error?.message || `Groq error ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

// ─── Unified caller with auto-fallback ───────────────────────────────────────
export async function callAI(systemPrompt, userContent) {
  const provider = process.env.AI_PROVIDER || 'gemini'

  const primary   = provider === 'groq' ? callGroq   : callGemini
  const secondary = provider === 'groq' ? callGemini : callGroq
  const secondaryKey = provider === 'groq'
    ? process.env.GEMINI_API_KEY
    : process.env.GROQ_API_KEY

  try {
    return await primary(systemPrompt, userContent)
  } catch (primaryErr) {
    const isConfigErr = primaryErr.message.includes('not set')
    // Auto-fallback to secondary if key exists and it's not a config error
    if (!isConfigErr && secondaryKey && !secondaryKey.includes('PASTE')) {
      console.warn(`[AI] Primary (${provider}) failed → trying fallback:`, primaryErr.message)
      return await secondary(systemPrompt, userContent)
    }
    throw primaryErr
  }
}
