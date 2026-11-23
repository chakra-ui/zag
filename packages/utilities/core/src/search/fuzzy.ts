import type { FuzzySearch, FuzzySearchOptions, HighlightRange } from "./types"

interface PreparedText {
  codes: Uint16Array
  bonus: Float32Array
  mask: number
}

interface PreparedTarget {
  text: PreparedText
  keywords: PreparedText[]
}

// Scoring adapted from fzy (MIT, John Hawthorn)
const MATCH_SLASH = 0.9
const MATCH_WORD = 0.8
const MATCH_CAPITAL = 0.7
const MATCH_DOT = 0.6
const MATCH_CONSECUTIVE = 1
const GAP_LEADING = -0.005
const GAP_TRAILING = -0.005
const GAP_INNER = -0.01

const KEYWORD_WEIGHT = 0.9
const PER_WORD_WEIGHT = 0.95
// the sigmoid rounds long matches to 1, so cap partial matches below an exact one
const MAX_PARTIAL = 1 - 1e-6

const MAX_LENGTH = 256
const WHITESPACE = /\s+/
const DIACRITICS = /[̀-ͯ]/g
const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u

const stripDiacritics = (value: string) => value.normalize("NFD").replace(DIACRITICS, "")

// one bit per ascii letter, one for all digits
const charMask = (code: number) => {
  if (code >= 97 && code <= 122) return 1 << (code - 97)
  if (code >= 48 && code <= 57) return 1 << 26
  return 0
}

// per character, so the length never changes (e.g. "İ" lowercases to two characters)
const toLower = (code: number) => {
  if (code >= 65 && code <= 90) return code + 32
  if (code < 128) return code
  return String.fromCharCode(code).toLowerCase().charCodeAt(0)
}

// a letter or digit that isn't uppercase, in any script
const isLower = (code: number) => {
  if (code < 128) return (code >= 97 && code <= 122) || (code >= 48 && code <= 57)
  const char = String.fromCharCode(code)
  return LETTER_OR_DIGIT.test(char) && char === char.toLowerCase()
}

const isUpper = (code: number) => {
  if (code < 128) return code >= 65 && code <= 90
  const char = String.fromCharCode(code)
  return char !== char.toLowerCase()
}

const matchBonus = (last: number, code: number) => {
  if (!isLower(code) && !isUpper(code)) return 0
  // start of text or after "/"
  if (last === -1 || last === 47) return MATCH_SLASH
  // after " ", "-" or "_"
  if (last === 32 || last === 45 || last === 95) return MATCH_WORD
  // after "."
  if (last === 46) return MATCH_DOT
  if (isUpper(code) && isLower(last)) return MATCH_CAPITAL
  return 0
}

function prepareText(text: string): PreparedText {
  const raw = stripDiacritics(text).slice(0, MAX_LENGTH)
  const codes = new Uint16Array(raw.length)
  const bonus = new Float32Array(raw.length)
  let mask = 0
  let last = -1
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i)
    codes[i] = toLower(code)
    mask |= charMask(codes[i])
    bonus[i] = matchBonus(last, code)
    last = code
  }
  return { codes, bonus, mask }
}

const prepareTarget = (text: string, keywords?: readonly string[] | undefined): PreparedTarget => ({
  text: prepareText(text),
  keywords: keywords?.map(prepareText) ?? [],
})

function isSubsequence(query: PreparedText, target: PreparedText) {
  const qc = query.codes
  const tc = target.codes
  if (qc.length > tc.length || (query.mask & target.mask) !== query.mask) return false
  let k = 0
  for (let j = 0; j < tc.length && k < qc.length; j++) if (tc[j] === qc[k]) k++
  return k === qc.length
}

// reused across calls; scoring is synchronous
const bestEndingHere = new Float64Array(MAX_LENGTH)
const bestSoFar = new Float64Array(MAX_LENGTH)

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

// Same recurrence as `scoreText`, but keeps the full matrix to trace back the best path
function matchPositions(query: PreparedText, target: PreparedText): number[] | null {
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
 * Returns the sorted, non-overlapping ranges of `text` that match `query`, for `highlightRanges`.
 * Falls back to matching each space-separated word when the whole query doesn't match.
 */
export function getFuzzyMatchRanges(text: string, query: string): HighlightRange[] {
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

  let positions = matchPositions(prepareText(trimmed), target)
  if (!positions) {
    const all = new Set<number>()
    for (const word of trimmed.split(WHITESPACE)) {
      matchPositions(prepareText(word), target)?.forEach((p) => all.add(p))
    }
    positions = [...all].sort((a, b) => a - b)
  }

  const ranges: HighlightRange[] = []
  for (const position of positions) {
    const index = origin[position]
    const last = ranges[ranges.length - 1]
    if (last && last.end >= index) last.end = index + 1
    else ranges.push({ start: index, end: index + 1 })
  }
  return ranges
}
