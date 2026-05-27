/**
 * factChecker.js — FRONTEND
 * Delegates all AI work to the backend via aiClient.js
 */

import { extractClaimsFromBackend, verifyClaimsFromBackend } from './aiClient.js'

export async function extractClaims(pdfText) {
  return extractClaimsFromBackend(pdfText)
}

export async function verifyClaims(claims) {
  return verifyClaimsFromBackend(claims)
}
