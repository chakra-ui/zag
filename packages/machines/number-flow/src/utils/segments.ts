/**
 * Pure formatting + counter math for `@zag-js/number-flow`.
 *
 * No DOM, no machine. Digits are keyed by their place exponent relative to the decimal
 * point (never by array index), so segment identity survives digit-count changes -
 * `999 -> 1000` enters a new place instead of re-keying every segment. See design doc §5.
 */

/* -----------------------------------------------------------------------------
 * Formatter cache - module-level LRU, shared by every instance on the page (§9.8)
 * -----------------------------------------------------------------------------*/

const FORMATTER_CACHE_LIMIT = 16
const formatterCache = new Map<string, Intl.NumberFormat>()

function stableOptionsKey(locale: string, options: Intl.NumberFormatOptions | undefined) {
  if (!options) return locale
  const keys = Object.keys(options).sort()
  return `${locale}|${keys.map((key) => `${key}:${JSON.stringify((options as Record<string, unknown>)[key])}`).join(",")}`
}

export function getNumberFormatter(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = stableOptionsKey(locale, options)
  const cached = formatterCache.get(key)
  if (cached) {
    // refresh recency (Map preserves insertion order)
    formatterCache.delete(key)
    formatterCache.set(key, cached)
    return cached
  }

  const formatter = new Intl.NumberFormat(locale, options)
  formatterCache.set(key, formatter)

  if (formatterCache.size > FORMATTER_CACHE_LIMIT) {
    const oldestKey = formatterCache.keys().next().value
    if (oldestKey !== undefined) formatterCache.delete(oldestKey)
  }

  return formatter
}

/* -----------------------------------------------------------------------------
 * Locale digit glyphs - for non-Latin numeral systems (ar-EG, hi-IN-u-nu-deva, ...)
 * -----------------------------------------------------------------------------*/

const glyphCache = new Map<string, string[]>()

export function getDigitGlyphs(locale: string): string[] {
  const cached = glyphCache.get(locale)
  if (cached) return cached

  const formatter = getNumberFormatter(locale, { useGrouping: false })
  const glyphs = Array.from({ length: 10 }, (_, digit) => formatter.format(digit))
  glyphCache.set(locale, glyphs)
  return glyphs
}

export function parseDigitGlyph(char: string, glyphs: string[]): number {
  const index = glyphs.indexOf(char)
  if (index !== -1) return index
  const fallback = Number(char)
  return Number.isNaN(fallback) ? 0 : fallback
}

export interface DigitCell {
  /** The cell's position in the strip. Stable - use it as the render key. */
  index: number
  /** The digit this cell shows, `0-9`. */
  digit: number
  /** The locale glyph for `digit`. */
  glyph: string
}

const stripCache = new Map<string, readonly DigitCell[]>()

/**
 * The full list of cells to render inside one digit track: `cycles` repetitions of `0-9`.
 *
 * Cached and frozen, so every digit on the page shares one array and re-renders allocate
 * nothing - the strip only ever depends on the locale and the cycle count.
 */
export function getDigitCells(locale: string, cycles: number): readonly DigitCell[] {
  const key = `${locale}:${cycles}`
  const cached = stripCache.get(key)
  if (cached) return cached

  const glyphs = getDigitGlyphs(locale)
  const strip: DigitCell[] = []
  for (let index = 0; index < getStripSize(cycles); index++) {
    const digit = index % 10
    strip.push({ index, digit, glyph: glyphs[digit] })
  }

  const frozen = Object.freeze(strip)
  stripCache.set(key, frozen)
  return frozen
}

/* -----------------------------------------------------------------------------
 * Segment model (§5.1, §5.2)
 * -----------------------------------------------------------------------------*/

export interface DigitSegment {
  kind: "digit"
  /** Place exponent relative to the decimal point - the segment's stable identity. */
  place: number
  digit: number
  key: string
}

export interface SymbolSegment {
  kind: "symbol"
  type: Intl.NumberFormatPartTypes
  value: string
  key: string
}

export type Segment = DigitSegment | SymbolSegment

export const isDigitSegment = (segment: Segment): segment is DigitSegment => segment.kind === "digit"
export const isSymbolSegment = (segment: Segment): segment is SymbolSegment => segment.kind === "symbol"

/**
 * Splits `integer` and `fraction` parts into place-keyed digit segments. Everything else
 * passes through as a symbol segment. Group separators anchor to the integer place
 * immediately to their left, so they enter/exit in lockstep with the digit run that
 * introduces them (e.g. the comma in `999 -> 1,000`). Other static types are keyed by
 * their occurrence index among parts of the same type.
 *
 * Digits are read through `glyphs`, not `Number(char)` - `Intl` emits the locale's own
 * numerals, and `Number("١")` is `NaN`.
 */
export function toSegments(parts: Intl.NumberFormatPart[], glyphs: string[]): Segment[] {
  const totalIntegerDigits = parts.reduce((sum, part) => (part.type === "integer" ? sum + part.value.length : sum), 0)

  let integerPlace = totalIntegerDigits - 1
  let fractionPlace = -1
  const occurrences = new Map<string, number>()

  const result: Segment[] = []

  for (const part of parts) {
    if (part.type === "integer") {
      for (const char of part.value) {
        const digit = parseDigitGlyph(char, glyphs)
        result.push({ kind: "digit", place: integerPlace, digit, key: `digit:${integerPlace}` })
        integerPlace--
      }
      continue
    }

    if (part.type === "fraction") {
      for (const char of part.value) {
        const digit = parseDigitGlyph(char, glyphs)
        result.push({ kind: "digit", place: fractionPlace, digit, key: `digit:${fractionPlace}` })
        fractionPlace--
      }
      continue
    }

    if (part.type === "group") {
      result.push({ kind: "symbol", type: part.type, value: part.value, key: `group:${integerPlace + 1}` })
      continue
    }

    const occurrenceIndex = occurrences.get(part.type) ?? 0
    occurrences.set(part.type, occurrenceIndex + 1)
    result.push({ kind: "symbol", type: part.type, value: part.value, key: `${part.type}:${occurrenceIndex}` })
  }

  return result
}

/**
 * Cheap structural signature - a run-length encoding of segment kinds. Equal signatures mean
 * the DOM tree is unchanged, so the update can skip reconciliation entirely (§9.3).
 */
export function getSignature(segments: Segment[]): string {
  const runs: string[] = []
  let currentKind: string | null = null
  let count = 0

  for (const segment of segments) {
    const kind = segment.kind === "digit" ? (segment.place >= 0 ? "integer" : "fraction") : segment.type
    if (kind === currentKind) {
      count++
    } else {
      if (currentKind) runs.push(`${currentKind}${count}`)
      currentKind = kind
      count = 1
    }
  }
  if (currentKind) runs.push(`${currentKind}${count}`)

  return runs.join(":")
}

export interface RenderResult {
  segments: Segment[]
  signature: string
  valueText: string
  places: number[]
}

export interface RenderOptions {
  value: number
  locale: string
  formatOptions?: Intl.NumberFormatOptions | undefined
  prefix?: string | undefined
  suffix?: string | undefined
}

export function getRenderResult(options: RenderOptions): RenderResult {
  const { value, locale, formatOptions, prefix, suffix } = options
  const formatter = getNumberFormatter(locale, formatOptions)
  const rawParts = formatter.formatToParts(value)

  const segments: Segment[] = []
  if (prefix) segments.push({ kind: "symbol", type: "literal", value: prefix, key: "prefix" })
  segments.push(...toSegments(rawParts, getDigitGlyphs(locale)))
  if (suffix) segments.push({ kind: "symbol", type: "literal", value: suffix, key: "suffix" })

  return {
    segments,
    signature: getSignature(segments),
    valueText: `${prefix ?? ""}${formatter.format(value)}${suffix ?? ""}`,
    places: segments.filter(isDigitSegment).map((segment) => segment.place),
  }
}

/* -----------------------------------------------------------------------------
 * Counter math (§5.3)
 * -----------------------------------------------------------------------------*/

export type Trend = boolean | 1 | -1

export const mod10 = (value: number): number => ((value % 10) + 10) % 10

/** Resolves a `trend` prop into a forced roll direction, or `undefined` for "shortest path". */
export function resolveTrend(trend: Trend | undefined, prevValue: number, nextValue: number): 1 | -1 | undefined {
  if (trend === 1 || trend === -1) return trend
  if (trend === true) {
    if (nextValue === prevValue) return undefined
    return nextValue > prevValue ? 1 : -1
  }
  return undefined
}

/** The number of cells rendered in one digit strip. */
export const getStripSize = (cycles: number): number => cycles * 10

/**
 * Shifts `target` by whole `0-9` cycles until it lands on a rendered cell. Whole-cycle
 * shifts never change the landing digit, so the roll still ends on the right glyph - it
 * just spins fewer times. Every counter handed to the DOM goes through here, which is what
 * makes a blank digit impossible rather than merely unlikely (§9.7).
 */
export function boundToStrip(target: number, cycles: number): number {
  const max = getStripSize(cycles) - 1
  if (target > max) return target - Math.ceil((target - max) / 10) * 10
  if (target < 0) return target + Math.ceil(-target / 10) * 10
  return target
}

/** Moves `counter` in `direction` to the nearest cell showing `digit`. */
function alignToDigit(counter: number, digit: number, direction: 1 | -1): number {
  return direction === 1 ? counter + mod10(digit - mod10(counter)) : counter - mod10(mod10(counter) - digit)
}

/**
 * Picks the counter value nearest in the direction of travel. With no forced trend, each
 * digit takes its own shortest path - `9 -> 0` rolls forward one step, not backward nine.
 *
 * When the preferred direction would leave the strip - only reachable by stacking rolls
 * faster than they settle - the congruent target in the *opposite* direction is taken
 * instead. That is at most 9 cells away and lands on the same digit, so the worst case is a
 * short roll the other way rather than the full-cycle backspin a whole-strip rebase causes.
 */
export function nextCounter(prev: number, digit: number, trend: 1 | -1 | undefined, cycles: number): number {
  const up = alignToDigit(prev, digit, 1)
  const down = alignToDigit(prev, digit, -1)

  const preferred = trend === 1 ? up : trend === -1 ? down : up - prev <= prev - down ? up : down
  const opposite = preferred === up ? down : up

  const max = getStripSize(cycles) - 1
  if (preferred >= 0 && preferred <= max) return preferred
  if (opposite >= 0 && opposite <= max) return opposite
  return boundToStrip(preferred, cycles)
}

/**
 * The integer formed by the digits at and above `place` - `getPlaceValue(1234.56, -1)` is
 * `12345`. Read off the magnitude, since the rendered digits are unsigned.
 */
export function getPlaceValue(value: number, place: number): number {
  const magnitude = Math.abs(value)
  const scaled = place >= 0 ? magnitude / 10 ** place : magnitude * 10 ** -place
  // `1234.5 * 10` is `12344.999999999998` in binary floating point, and flooring that lands
  // a whole digit short. Round the representation noise off first.
  return Math.floor(Number(scaled.toPrecision(12)))
}

/**
 * `continuous` mode: advances the counter by the true numeric delta at this place instead of
 * the nearest representative, so the digit spins through every intermediate value.
 *
 * The delta is re-aligned onto `digit` before being bounded, so the digit always comes to rest
 * on the glyph that is actually rendered even when the formatter rounds the value
 * (`maximumFractionDigits`) or the sign flips.
 */
export function nextCounterContinuous(
  prevValue: number,
  nextValue: number,
  place: number,
  prevCounter: number,
  digit: number,
  cycles: number,
): number {
  const delta = getPlaceValue(nextValue, place) - getPlaceValue(prevValue, place)
  const direction = delta >= 0 ? 1 : -1
  return boundToStrip(alignToDigit(prevCounter + delta, digit, direction), cycles)
}

/** Resets a counter into the middle cycle of the digit strip, congruent to the same digit. */
export function normalizeCounter(counter: number, cycles: number): number {
  const digit = mod10(counter)
  const middleCycle = Math.floor(cycles / 2)
  return middleCycle * 10 + digit
}

/**
 * The middle cycle is "home", and every roll is bounded into the strip regardless, so this
 * is a quality knob rather than a correctness one: it buys headroom for rolls that stack up
 * before one settles, and each spare cycle is one more same-direction roll that can be
 * honoured before `nextCounter` has to take the opposite path. `3` leaves a full spare cycle
 * on both sides of home; `continuous` gets more because it also spends cells spinning
 * through intermediate values.
 */
export function getCycles(continuous: boolean | undefined): number {
  return continuous ? 5 : 3
}

/** Descending place order: index 0 is the most significant digit, the last index the least. */
export function getPlaceOrder(places: Iterable<number>): number[] {
  return Array.from(new Set(places)).sort((a, b) => b - a)
}

export interface CounterUpdateOptions {
  prevCounters: Map<number, number>
  segments: Segment[]
  prevValue: number
  nextValue: number
  trend?: Trend | undefined
  continuous?: boolean | undefined
}

/**
 * Computes the next counter for every digit segment in `segments`. Segments with no previous counter
 * are entering - placed at the middle cycle directly, no roll.
 *
 * The previous counter is used as-is, never rebased. Rebasing a counter that is still
 * mid-roll moves its target by a whole cycle, which the browser renders as a full backspin
 * - the strip is what gets bounded instead, inside `nextCounter` (§9.7).
 */
export function computeCounters(options: CounterUpdateOptions): Map<number, number> {
  const { prevCounters, segments, prevValue, nextValue, trend, continuous } = options
  const cycles = getCycles(continuous)
  const resolvedTrend = resolveTrend(trend, prevValue, nextValue)
  const next = new Map<number, number>()

  for (const segment of segments) {
    if (!isDigitSegment(segment)) continue

    const prevCounter = prevCounters.get(segment.place)
    if (prevCounter == null) {
      next.set(segment.place, normalizeCounter(segment.digit, cycles))
      continue
    }

    next.set(
      segment.place,
      continuous
        ? nextCounterContinuous(prevValue, nextValue, segment.place, prevCounter, segment.digit, cycles)
        : nextCounter(prevCounter, segment.digit, resolvedTrend, cycles),
    )
  }

  return next
}
