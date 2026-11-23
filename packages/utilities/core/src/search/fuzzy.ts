import {
  GAP_INNER,
  GAP_LEADING,
  GAP_TRAILING,
  KEYWORD_WEIGHT,
  MATCH_CONSECUTIVE,
  MAX_LENGTH,
  MAX_PARTIAL,
  PER_WORD_WEIGHT,
  WHITESPACE,
  isSubsequence,
  prepareTarget,
  prepareText,
  type PreparedTarget,
  type PreparedText,
} from "./fuzzy-prepare"
import type { FuzzySearch, FuzzySearchOptions } from "./types"

// reused across calls; scoring is synchronous
const bestEndingHere = /*#__PURE__*/ new Float64Array(MAX_LENGTH)
const bestSoFar = /*#__PURE__*/ new Float64Array(MAX_LENGTH)

function scoreText(query: PreparedText, target: PreparedText): number {
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
  return Math.min(1 / (1 + Math.exp(-raw)), MAX_PARTIAL)
}

function scoreTarget(query: PreparedText, target: PreparedTarget) {
  let best = scoreText(query, target.text)
  for (const keyword of target.keywords) {
    const score = scoreText(query, keyword) * KEYWORD_WEIGHT
    if (score > best) best = score
  }
  return best
}

// Prepares the query once; each space-separated word may match the text or a keyword on its own
function createMatcher(query: string): (target: PreparedTarget) => number {
  const trimmed = query.trim()
  if (!trimmed) return () => 1

  const whole = prepareText(trimmed)
  const words = trimmed.split(WHITESPACE)
  const parts = words.length > 1 ? words.map(prepareText) : null

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
 * Use `createFuzzySearch` when searching many items.
 */
export function fuzzyScore(text: string, query: string, keywords?: readonly string[] | undefined): number {
  return createMatcher(query)(prepareTarget(text, keywords))
}

/**
 * Returns the items with a score above 0, highest first. Ties keep their original order.
 */
export function rankItems<T>(items: readonly T[], score: (item: T) => number): T[] {
  const entries: { item: T; index: number; score: number }[] = []
  items.forEach((item, index) => {
    const value = score(item)
    if (value > 0) entries.push({ item, index, score: value })
  })
  return entries.sort((a, b) => b.score - a.score || a.index - b.index).map((entry) => entry.item)
}

/**
 * Creates a fuzzy search that caches each object item's prepared text. When the query
 * only grows on the same items, it searches the previous matches instead of all items.
 * Pass a new array when the items change, or call `clear()` after changing them in place.
 */
export function createFuzzySearch<T>(options: FuzzySearchOptions<T>): FuzzySearch<T> {
  const { itemToString, itemToKeywords } = options

  let cache = new WeakMap<object, PreparedTarget>()
  let last: { items: readonly T[]; length: number; query: string; matches: number[] } | null = null

  const prepare = (item: T) => {
    const cacheable = typeof item === "object" && item !== null
    let target = cacheable ? cache.get(item) : undefined
    if (!target) {
      target = prepareTarget(itemToString(item), itemToKeywords?.(item))
      if (cacheable) cache.set(item, target)
    }
    return target
  }

  const search = (items: readonly T[], query: string): T[] => {
    const trimmed = query.trim()
    if (!trimmed) {
      last = null
      return [...items]
    }

    // a match for the longer query also matches the shorter one
    const narrow =
      last !== null && last.items === items && last.length === items.length && trimmed.startsWith(last.query)
    const pool = narrow ? last!.matches : items.map((_, index) => index)

    const match = createMatcher(trimmed)
    const matches = rankItems(pool, (index) => match(prepare(items[index])))
    last = { items, length: items.length, query: trimmed, matches }
    return matches.map((index) => items[index])
  }

  const clear = () => {
    cache = new WeakMap()
    last = null
  }

  return { search, clear }
}
