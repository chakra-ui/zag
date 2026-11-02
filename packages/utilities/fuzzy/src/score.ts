import { MAX_LENGTH, WHITESPACE, prepareFuzzyTarget, prepareQuery } from "./prepare"
import type { FuzzyMatcher, PreparedQuery, PreparedTarget, PreparedText } from "./types"

export const GAP_LEADING = -0.005
export const GAP_TRAILING = -0.005
export const GAP_INNER = -0.01
export const MATCH_CONSECUTIVE = 1

const KEYWORD_WEIGHT = 0.9
const PER_WORD_WEIGHT = 0.95

// reused across calls; scoring is synchronous
const bestEndingHere = new Float64Array(MAX_LENGTH)
const bestSoFar = new Float64Array(MAX_LENGTH)

export function isSubsequence(query: PreparedQuery, target: PreparedText) {
  const qc = query.codes
  const tc = target.codes
  if (qc.length > tc.length || (query.mask & target.mask) !== query.mask) return false
  let k = 0
  for (let j = 0; j < tc.length && k < qc.length; j++) if (tc[j] === qc[k]) k++
  return k === qc.length
}

export function scoreText(query: PreparedQuery, target: PreparedText): number {
  const qc = query.codes
  const tc = target.codes
  const n = qc.length
  const m = tc.length

  if (n === 0) return 1
  if (!isSubsequence(query, target)) return 0
  if (n === m) return 1

  const D = bestEndingHere
  const M = bestSoFar
  const bonus = target.bonus

  for (let i = 0; i < n; i++) {
    const gap = i === n - 1 ? GAP_TRAILING : GAP_INNER
    const ch = qc[i]
    let prevScore = -Infinity
    let prevD = -Infinity
    let prevM = -Infinity

    for (let j = 0; j < m; j++) {
      const lastD = D[j]
      const lastM = M[j]
      if (tc[j] === ch) {
        let score = -Infinity
        if (i === 0) {
          score = j * GAP_LEADING + bonus[j]
        } else if (j > 0) {
          const jump = prevM + bonus[j]
          const consecutive = prevD + MATCH_CONSECUTIVE
          score = jump > consecutive ? jump : consecutive
        }
        D[j] = score
        const gapped = prevScore + gap
        M[j] = prevScore = score > gapped ? score : gapped
      } else {
        D[j] = -Infinity
        M[j] = prevScore = prevScore + gap
      }
      prevD = lastD
      prevM = lastM
    }
  }

  const raw = M[m - 1]
  if (raw === -Infinity) return 0
  return 1 / (1 + Math.exp(-raw))
}

function scoreTarget(query: PreparedQuery, target: PreparedTarget) {
  let best = scoreText(query, target.text)
  for (const keyword of target.keywords) {
    const score = scoreText(query, keyword) * KEYWORD_WEIGHT
    if (score > best) best = score
  }
  return best
}

/**
 * Prepares a query once and returns a scorer for prepared targets.
 * Each space-separated word may match the text or a keyword on its own.
 */
export function createFuzzyMatcher(query: string): FuzzyMatcher {
  const trimmed = query.trim()
  if (!trimmed) return () => 1

  const whole = prepareQuery(trimmed)
  const words = trimmed.split(WHITESPACE)
  const parts = words.length > 1 ? words.map(prepareQuery) : null

  return (target) => {
    const best = scoreTarget(whole, target)
    if (!parts) return best
    let total = 0
    for (const part of parts) {
      const score = scoreTarget(part, target)
      if (score === 0) return best
      total += score
    }
    const perWord = (total / parts.length) * PER_WORD_WEIGHT
    return perWord > best ? perWord : best
  }
}

/**
 * Scores `query` against `text` and its `keywords`, from 0 (no match) to 1.
 * Use `createFuzzyMatcher` with prepared targets when scoring many items.
 */
export function fuzzyScore(text: string, query: string, keywords?: readonly string[] | undefined): number {
  return createFuzzyMatcher(query)(prepareFuzzyTarget(text, keywords))
}
