import { MAX_LENGTH, WHITESPACE, prepareQuery, prepareText, stripDiacritics } from "./prepare"
import { GAP_INNER, GAP_LEADING, GAP_TRAILING, MATCH_CONSECUTIVE, isSubsequence } from "./score"
import type { FuzzyRange, PreparedQuery, PreparedText } from "./types"

// Same recurrence as `scoreText`, but keeps the full matrix to trace back the best path
function matchPositions(query: PreparedQuery, target: PreparedText): number[] | null {
  const qc = query.codes
  const tc = target.codes
  const n = qc.length
  const m = tc.length
  if (n === 0 || !isSubsequence(query, target)) return null
  if (n === m) return Array.from({ length: n }, (_, i) => i)

  const D = new Float64Array(n * m)
  const M = new Float64Array(n * m)
  const bonus = target.bonus

  for (let i = 0; i < n; i++) {
    const gap = i === n - 1 ? GAP_TRAILING : GAP_INNER
    let prevScore = -Infinity
    for (let j = 0; j < m; j++) {
      const at = i * m + j
      if (tc[j] === qc[i]) {
        let score = -Infinity
        if (i === 0) {
          score = j * GAP_LEADING + bonus[j]
        } else if (j > 0) {
          const jump = M[at - m - 1] + bonus[j]
          const consecutive = D[at - m - 1] + MATCH_CONSECUTIVE
          score = jump > consecutive ? jump : consecutive
        }
        D[at] = score
        const gapped = prevScore + gap
        M[at] = prevScore = score > gapped ? score : gapped
      } else {
        D[at] = -Infinity
        M[at] = prevScore = prevScore + gap
      }
    }
  }

  const positions = new Array<number>(n)
  let matchRequired = false
  for (let i = n - 1, j = m - 1; i >= 0; i--) {
    for (; j >= 0; j--) {
      const at = i * m + j
      if (D[at] !== -Infinity && (matchRequired || D[at] === M[at])) {
        matchRequired = i > 0 && j > 0 && M[at] === D[at - m - 1] + MATCH_CONSECUTIVE
        positions[i] = j--
        break
      }
    }
  }
  return positions
}

/**
 * Returns the sorted, non-overlapping ranges of `text` that match `query`, for highlighting.
 * Falls back to matching each space-separated word when the whole query doesn't match.
 */
export function getFuzzyMatchRanges(text: string, query: string): FuzzyRange[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  // map each normalized character back to its index in `text`
  let normalized = ""
  const origin: number[] = []
  for (let i = 0; i < text.length && origin.length < MAX_LENGTH; i++) {
    const part = stripDiacritics(text[i])
    for (let k = 0; k < part.length; k++) origin.push(i)
    normalized += part
  }
  const target = prepareText(normalized)

  let positions = matchPositions(prepareQuery(trimmed), target)
  if (!positions) {
    const all = new Set<number>()
    for (const word of trimmed.split(WHITESPACE)) {
      matchPositions(prepareQuery(word), target)?.forEach((p) => all.add(p))
    }
    positions = [...all].sort((a, b) => a - b)
  }

  const ranges: FuzzyRange[] = []
  for (const position of positions) {
    const index = origin[position]
    const last = ranges[ranges.length - 1]
    if (last && last.end >= index) last.end = index + 1
    else ranges.push({ start: index, end: index + 1 })
  }
  return ranges
}
