import { describe, expect, test } from "vitest"
import {
  boundToStrip,
  computeCounters,
  getCycles,
  getDigitGlyphs,
  getDigitCells,
  getPlaceValue,
  getRenderResult,
  getSignature,
  getStripSize,
  isDigitSegment,
  mod10,
  nextCounter,
  nextCounterContinuous,
  normalizeCounter,
  resolveTrend,
  type Segment,
} from "../src/utils/segments"

const digits = (segments: Segment[]) =>
  segments.filter(isDigitSegment).map((segment) => ({ place: segment.place, digit: segment.digit }))

describe("render result", () => {
  test("keys integer digits by place, most significant first", () => {
    const { segments } = getRenderResult({ value: 1234, locale: "en-US" })
    expect(digits(segments)).toEqual([
      { place: 3, digit: 1 },
      { place: 2, digit: 2 },
      { place: 1, digit: 3 },
      { place: 0, digit: 4 },
    ])
  })

  test("keys fraction digits by negative place", () => {
    const { segments } = getRenderResult({
      value: 12.34,
      locale: "en-US",
      formatOptions: { minimumFractionDigits: 2 },
    })
    expect(digits(segments)).toEqual([
      { place: 1, digit: 1 },
      { place: 0, digit: 2 },
      { place: -1, digit: 3 },
      { place: -2, digit: 4 },
    ])
  })

  test("place identity survives a digit-count change", () => {
    const before = getRenderResult({ value: 999, locale: "en-US" })
    const after = getRenderResult({ value: 1000, locale: "en-US" })
    // the three existing places stay put, only place 3 is new
    expect(before.places).toEqual([2, 1, 0])
    expect(after.places).toEqual([3, 2, 1, 0])
  })

  test("anchors the group separator to the place on its left", () => {
    const { segments } = getRenderResult({ value: 1234, locale: "en-US" })
    const group = segments.find((segment) => segment.kind === "symbol" && segment.type === "group")
    expect(group?.key).toBe("group:3")
  })

  test("reads non-latin numerals through the locale glyphs", () => {
    // `Number("١")` is NaN - digits have to be parsed against the locale's own glyphs
    const { segments, valueText } = getRenderResult({ value: 1234, locale: "ar-EG" })
    expect(valueText).toBe("١٬٢٣٤")
    expect(digits(segments)).toEqual([
      { place: 3, digit: 1 },
      { place: 2, digit: 2 },
      { place: 1, digit: 3 },
      { place: 0, digit: 4 },
    ])
  })

  test.each(["ar-EG", "hi-IN-u-nu-deva", "bn-BD", "en-US"])("digit glyphs are 10 distinct chars for %s", (locale) => {
    const glyphs = getDigitGlyphs(locale)
    expect(glyphs).toHaveLength(10)
    expect(new Set(glyphs).size).toBe(10)
  })

  test("digit strip repeats 0-9 for every cycle", () => {
    const strip = getDigitCells("en-US", 3)
    expect(strip).toHaveLength(getStripSize(3))
    expect(strip[0]).toEqual({ index: 0, digit: 0, glyph: "0" })
    expect(strip[12]).toEqual({ index: 12, digit: 2, glyph: "2" })
    expect(strip.at(-1)).toEqual({ index: 29, digit: 9, glyph: "9" })
    expect(strip.map((cell) => cell.digit)).toEqual(strip.map((_, index) => index % 10))
  })

  test("digit strip uses the locale's own numerals", () => {
    expect(getDigitCells("ar-EG", 3)[3].glyph).toBe("٣")
  })

  test("digit strip is shared and immutable, so renders allocate nothing", () => {
    expect(getDigitCells("en-US", 3)).toBe(getDigitCells("en-US", 3))
    expect(getDigitCells("en-US", 3)).not.toBe(getDigitCells("en-US", 5))
    expect(Object.isFrozen(getDigitCells("en-US", 3))).toBe(true)
  })

  test("negative values keep the sign as a symbol segment", () => {
    const { segments, valueText } = getRenderResult({ value: -42, locale: "en-US" })
    expect(valueText).toBe("-42")
    expect(segments[0]).toMatchObject({ kind: "symbol", type: "minusSign" })
    expect(digits(segments)).toEqual([
      { place: 1, digit: 4 },
      { place: 0, digit: 2 },
    ])
  })

  test("prefix and suffix are symbols and included in the value text", () => {
    const { segments, valueText } = getRenderResult({ value: 5, locale: "en-US", prefix: "~", suffix: " kg" })
    expect(valueText).toBe("~5 kg")
    expect(segments.at(0)).toMatchObject({ key: "prefix", value: "~" })
    expect(segments.at(-1)).toMatchObject({ key: "suffix", value: " kg" })
  })

  test("signature changes only when the render shape changes", () => {
    const shape = (value: number) => getSignature(getRenderResult({ value, locale: "en-US" }).segments)
    expect(shape(123)).toBe(shape(456))
    expect(shape(999)).not.toBe(shape(1000))
    expect(shape(5)).not.toBe(shape(-5))
  })
})

describe("counter math", () => {
  const cycles = getCycles(false)
  const max = getStripSize(cycles) - 1
  const home = normalizeCounter(0, cycles)

  test("normalizeCounter lands on the middle cycle, same digit", () => {
    expect(normalizeCounter(7, 3)).toBe(17)
    expect(normalizeCounter(27, 3)).toBe(17)
    expect(normalizeCounter(-3, 3)).toBe(17)
    expect(mod10(normalizeCounter(43, 5))).toBe(3)
  })

  test("takes the shortest path by default", () => {
    // 9 -> 0 rolls forward one, not backward nine
    expect(nextCounter(home + 9, 0, undefined, cycles)).toBe(home + 10)
    expect(nextCounter(home + 1, 8, undefined, cycles)).toBe(home - 2)
  })

  test("a forced trend overrides the shortest path", () => {
    expect(nextCounter(home + 9, 0, 1, cycles)).toBe(home + 10)
    expect(nextCounter(home, 9, 1, cycles)).toBe(home + 9)
    expect(nextCounter(home, 1, -1, cycles)).toBe(home - 9)
  })

  test("always lands on a cell showing the target digit", () => {
    for (let prev = 0; prev <= max; prev++) {
      for (let digit = 0; digit < 10; digit++) {
        for (const trend of [undefined, 1, -1] as const) {
          expect(mod10(nextCounter(prev, digit, trend, cycles))).toBe(digit)
        }
      }
    }
  })

  test("never leaves the rendered strip", () => {
    for (let prev = 0; prev <= max; prev++) {
      for (let digit = 0; digit < 10; digit++) {
        for (const trend of [undefined, 1, -1] as const) {
          const next = nextCounter(prev, digit, trend, cycles)
          expect(next).toBeGreaterThanOrEqual(0)
          expect(next).toBeLessThanOrEqual(max)
        }
      }
    }
  })

  test("takes the opposite path instead of a full-cycle backspin at the edge", () => {
    // at the top of the strip an upward roll has nowhere to go - it rolls down 1 cell,
    // not back through a whole cycle
    expect(nextCounter(max, 0, 1, cycles)).toBe(max - 9)
    expect(nextCounter(max, mod10(max) + 1, 1, cycles)).toBe(max - 9)
    expect(nextCounter(0, 9, -1, cycles)).toBe(9)
  })

  test("moves at most 9 cells per roll", () => {
    for (let prev = 0; prev <= max; prev++) {
      for (let digit = 0; digit < 10; digit++) {
        for (const trend of [undefined, 1, -1] as const) {
          expect(Math.abs(nextCounter(prev, digit, trend, cycles) - prev)).toBeLessThanOrEqual(9)
        }
      }
    }
  })

  test("resolveTrend maps the prop onto a direction", () => {
    expect(resolveTrend(false, 1, 2)).toBeUndefined()
    expect(resolveTrend(true, 1, 2)).toBe(1)
    expect(resolveTrend(true, 2, 1)).toBe(-1)
    expect(resolveTrend(true, 2, 2)).toBeUndefined()
    expect(resolveTrend(1, 2, 1)).toBe(1)
    expect(resolveTrend(-1, 1, 2)).toBe(-1)
  })

  test("boundToStrip shifts by whole cycles only", () => {
    expect(boundToStrip(70, 5)).toBe(40)
    expect(boundToStrip(-5, 5)).toBe(5)
    expect(boundToStrip(25, 5)).toBe(25)
    for (const target of [-113, -7, 0, 12, 49, 50, 512]) {
      const bounded = boundToStrip(target, 5)
      expect(mod10(bounded)).toBe(mod10(target))
      expect(bounded).toBeGreaterThanOrEqual(0)
      expect(bounded).toBeLessThanOrEqual(getStripSize(5) - 1)
    }
  })
})

describe("continuous counter math", () => {
  const cycles = getCycles(true)
  const max = getStripSize(cycles) - 1

  test("spins through every intermediate value when it fits", () => {
    const start = normalizeCounter(0, cycles)
    // 0 -> 12 at the ones place is a 12-cell spin, not a 2-cell hop
    expect(nextCounterContinuous(0, 12, 0, start, 2, cycles)).toBe(start + 12)
  })

  test("bounds an oversized delta without changing the landing digit", () => {
    const start = normalizeCounter(5, cycles)
    const next = nextCounterContinuous(0, 4045, 0, start, 5, cycles)
    expect(next).toBeGreaterThanOrEqual(0)
    expect(next).toBeLessThanOrEqual(max)
    expect(mod10(next)).toBe(5)
  })

  test("lands on the rendered digit even when the formatter rounds", () => {
    // 1.4 -> 1.6 renders as "1" -> "2" with maximumFractionDigits: 0
    const start = normalizeCounter(1, cycles)
    expect(mod10(nextCounterContinuous(1.4, 1.6, 0, start, 2, cycles))).toBe(2)
  })

  test("reads the magnitude, so a sign flip does not spin the wrong way", () => {
    const start = normalizeCounter(3, cycles)
    expect(nextCounterContinuous(3, -3, 0, start, 3, cycles)).toBe(start)
    expect(mod10(nextCounterContinuous(3, -7, 0, start, 7, cycles))).toBe(7)
  })

  test("getPlaceValue is immune to binary floating point noise", () => {
    expect(getPlaceValue(1234.5, -1)).toBe(12345)
    expect(getPlaceValue(1234.56, -2)).toBe(123456)
    expect(getPlaceValue(0.29, -2)).toBe(29)
    expect(getPlaceValue(1234, 2)).toBe(12)
    expect(getPlaceValue(-1234.5, -1)).toBe(12345)
  })
})

describe("computeCounters", () => {
  const build = (value: number, locale = "en-US") => getRenderResult({ value, locale }).segments

  const roll = (opts: {
    prevCounters: Map<number, number>
    value: number
    prevValue: number
    trend?: boolean | 1 | -1
    continuous?: boolean
    locale?: string
  }) =>
    computeCounters({
      prevCounters: opts.prevCounters,
      segments: build(opts.value, opts.locale),
      prevValue: opts.prevValue,
      nextValue: opts.value,
      trend: opts.trend,
      continuous: opts.continuous,
    })

  test("entering segments start at home with no roll", () => {
    const next = roll({ prevCounters: new Map(), value: 1234, prevValue: 0 })
    expect([...next.entries()]).toEqual([
      [3, normalizeCounter(1, 3)],
      [2, normalizeCounter(2, 3)],
      [1, normalizeCounter(3, 3)],
      [0, normalizeCounter(4, 3)],
    ])
  })

  test("a segment entering mid-number does not disturb its neighbours", () => {
    const prevCounters = roll({ prevCounters: new Map(), value: 999, prevValue: 999 })
    const next = roll({ prevCounters, value: 1000, prevValue: 999 })
    expect(next.get(3)).toBe(normalizeCounter(1, 3))
    expect(mod10(next.get(0)!)).toBe(0)
  })

  test("every counter stays in the strip across a rapid same-direction burst", () => {
    const cycles = getCycles(false)
    let counters = roll({ prevCounters: new Map(), value: 0, prevValue: 0 })
    let value = 0

    // 200 forced-up rolls with no settle in between - the case that used to walk the
    // counter off the end of the strip and render a blank digit
    for (let i = 0; i < 200; i++) {
      const prevValue = value
      value += 137
      counters = roll({ prevCounters: counters, value, prevValue, trend: 1 })

      const segments = build(value).filter(isDigitSegment)
      for (const segment of segments) {
        const counter = counters.get(segment.place)!
        expect(counter).toBeGreaterThanOrEqual(0)
        expect(counter).toBeLessThanOrEqual(getStripSize(cycles) - 1)
        expect(mod10(counter)).toBe(segment.digit)
      }
    }
  })

  test("never reverses by a whole cycle", () => {
    let counters = roll({ prevCounters: new Map(), value: 0, prevValue: 0 })
    let value = 0

    for (let i = 0; i < 200; i++) {
      const prevValue = value
      value += 137
      const next = roll({ prevCounters: counters, value, prevValue, trend: 1 })
      for (const [place, counter] of next) {
        const prev = counters.get(place)
        if (prev == null) continue
        expect(Math.abs(counter - prev)).toBeLessThanOrEqual(9)
      }
      counters = next
    }
  })

  test("continuous rolls stay in the strip across a rapid burst", () => {
    const cycles = getCycles(true)
    let counters = roll({ prevCounters: new Map(), value: 0, prevValue: 0, continuous: true })
    let value = 0

    for (let i = 0; i < 200; i++) {
      const prevValue = value
      value += 45
      counters = roll({ prevCounters: counters, value, prevValue, continuous: true })

      for (const segment of build(value).filter(isDigitSegment)) {
        const counter = counters.get(segment.place)!
        expect(counter).toBeGreaterThanOrEqual(0)
        expect(counter).toBeLessThanOrEqual(getStripSize(cycles) - 1)
        expect(mod10(counter)).toBe(segment.digit)
      }
    }
  })

  test("non-latin locales roll like any other", () => {
    const prevCounters = roll({ prevCounters: new Map(), value: 1234, prevValue: 1234, locale: "ar-EG" })
    const next = roll({ prevCounters, value: 1134, prevValue: 1234, locale: "ar-EG" })
    expect(mod10(next.get(2)!)).toBe(1)
    expect([...next.values()].every(Number.isFinite)).toBe(true)
  })
})
