import { describe, expect, test } from "vitest"
import { getFillRange, getOriginPercent } from "../src/slider.utils"

/**
 * Legend for the track diagrams below (all in percent-space, 0 = start of track, 100 = end):
 *
 *   ○  origin  — the point the track fills from
 *   ●  value   — the thumb's current position
 *   █  filled  — the range that should render as "filled" track
 *   ·  empty   — unfilled track
 *
 * `getOriginPercent(origin, min, max)` turns the `origin` prop ("start" | "center" | "end" | a
 * domain value) into one of these percent positions. `getFillRange(valuePercent, originPercent)`
 * then turns a origin + value pair into `{ start, end }` — insets from the track's left and right
 * edges respectively, which is what `getRangeStyle` turns into CSS.
 */

describe("@zag-js/slider getOriginPercent", () => {
  test("'start' is always the left edge (0%), regardless of the domain", () => {
    expect(getOriginPercent("start", 0, 100)).toBe(0)
    expect(getOriginPercent("start", -50, 50)).toBe(0)
    expect(getOriginPercent("start", -20, 100)).toBe(0)
  })

  test("'end' is always the right edge (100%), regardless of the domain", () => {
    expect(getOriginPercent("end", 0, 100)).toBe(100)
    expect(getOriginPercent("end", -50, 50)).toBe(100)
    expect(getOriginPercent("end", -20, 100)).toBe(100)
  })

  test("'center' is always the track midpoint (50%) — even on an asymmetric domain", () => {
    expect(getOriginPercent("center", 0, 100)).toBe(50)
    expect(getOriginPercent("center", -50, 50)).toBe(50)
    // domain -20..100: midpoint *value* is 40, but it's still 50% of the track
    expect(getOriginPercent("center", -20, 100)).toBe(50)
  })

  test("a number places the origin at that value's own position, wherever it falls", () => {
    expect(getOriginPercent(0, -50, 50)).toBe(50) // symmetric domain: same as "center"

    // domain -20..100: value 0 sits well left of the midpoint (value 40) — "center" can
    // only ever mean "the midpoint", never "wherever this value happens to fall"
    expect(getOriginPercent(0, -20, 100)).toBeCloseTo(16.6667, 4)

    // domain 0..300, neutral value 100 (the midpoint, 150, is a different point entirely)
    expect(getOriginPercent(100, 0, 300)).toBeCloseTo(33.3333, 4)
  })

  test("a number equal to min/max/midpoint lands on the same spot as the matching named origin", () => {
    expect(getOriginPercent(0, 0, 100)).toBe(getOriginPercent("start", 0, 100))
    expect(getOriginPercent(100, 0, 100)).toBe(getOriginPercent("end", 0, 100))
    expect(getOriginPercent(50, 0, 100)).toBe(getOriginPercent("center", 0, 100))
    expect(getOriginPercent(-20, -20, 100)).toBe(getOriginPercent("start", -20, 100))
    expect(getOriginPercent(40, -20, 100)).toBe(getOriginPercent("center", -20, 100))
  })

  test("clamps a numeric origin outside the domain, instead of a nonsensical percent", () => {
    expect(getOriginPercent(-1000, 0, 100)).toBe(0)
    expect(getOriginPercent(1000, 0, 100)).toBe(100)
    expect(getOriginPercent(-9999, -20, 100)).toBe(0)
  })
})

describe("@zag-js/slider getFillRange", () => {
  test("origin at the start: fills from the left edge up to the value", () => {
    //   0                  50                 100
    //   ○█████████████████████████████●··········
    expect(getFillRange(75, 0)).toEqual({ start: 0, end: 25 })

    //   0                  50                 100
    //   ○███████████████████████████████████████●
    expect(getFillRange(100, 0)).toEqual({ start: 0, end: 0 })
  })

  test("origin at the end: fills from the value up to the right edge", () => {
    //   0                  50                 100
    //   ··········●█████████████████████████████○
    expect(getFillRange(25, 100)).toEqual({ start: 25, end: 0 })

    //   0                  50                 100
    //   ●███████████████████████████████████████○
    expect(getFillRange(0, 100)).toEqual({ start: 0, end: 0 })
  })

  test("origin in the center: fills toward whichever side the value is on", () => {
    //   0                  50                 100
    //   ············●███████○····················
    expect(getFillRange(30, 50)).toEqual({ start: 30, end: 50 })

    //   0                  50                 100
    //   ····················○███████●············
    expect(getFillRange(70, 50)).toEqual({ start: 50, end: 30 })
  })

  test("fills correctly around an arbitrary, off-center origin too", () => {
    // origin ~16.7% (this is where domain value `0` sits on a -20..100 slider)
    //
    //   0                  50                 100
    //   ·······○████████████████●················
    expect(getFillRange(60, 16.6667)).toEqual({ start: 16.6667, end: 40 })

    //   0                  50                 100
    //   ··●████○·································
    expect(getFillRange(5, 16.6667)).toEqual({ start: 5, end: 100 - 16.6667 })
  })

  test("value exactly at the origin never renders a fill, at any origin position", () => {
    //   0                  50                 100
    //   ····················○····················
    //   (only the origin marker shows — there's nothing to fill)
    const atStart = getFillRange(0, 0)
    const atCenter = getFillRange(50, 50)
    const atEnd = getFillRange(100, 100)
    const atCustom = getFillRange(16.6667, 16.6667)

    for (const { start, end } of [atStart, atCenter, atEnd, atCustom]) {
      expect(start + end).toBeCloseTo(100, 4)
    }
  })

  test("start + fill-width + end always add up to exactly 100% of the track", () => {
    const cases: Array<[value: number, origin: number]> = [
      [0, 0],
      [100, 0],
      [25, 100],
      [30, 50],
      [70, 50],
      [60, 16.6667],
    ]
    for (const [value, origin] of cases) {
      const { start, end } = getFillRange(value, origin)
      const fillWidth = 100 - start - end
      expect(fillWidth).toBeGreaterThanOrEqual(0)
      expect(start + fillWidth + end).toBeCloseTo(100, 4)
    }
  })
})

describe("regression: 'center' vs. a numeric origin on an asymmetric domain", () => {
  test("'center' still behaves exactly as before on a symmetric domain", () => {
    // domain -50..50: the midpoint (0) is also the neutral value, so "center" is correct here
    const origin = getOriginPercent("center", -50, 50)
    expect(getFillRange(30, origin)).toEqual({ start: 30, end: 50 })
    expect(getFillRange(70, origin)).toEqual({ start: 50, end: 30 })
  })

  test("a numeric origin fixes the case 'center' gets wrong: neutral value off the midpoint", () => {
    // domain -20..100, neutral value 0 (midpoint is 40). Slider sits at its neutral value,
    // so nothing has been adjusted — the track should show no fill.
    const min = -20
    const max = 100
    const neutralValue = 0
    const valuePercent = getOriginPercent(neutralValue, min, max)

    // origin = 0 (the real neutral value): value sits ON the origin → zero fill
    //   0                  50                 100
    //   ·······○··································
    const correctFill = getFillRange(valuePercent, getOriginPercent(neutralValue, min, max))
    expect(correctFill.start + correctFill.end).toBeCloseTo(100, 4)

    // origin = "center" (the midpoint, 40, not the neutral value): misreads the untouched
    // value as a fill toward the midpoint
    //   0                  50                 100
    //   ·······●█████████████○····················
    const wrongFill = getFillRange(valuePercent, getOriginPercent("center", min, max))
    expect(wrongFill.start + wrongFill.end).toBeLessThan(100)
  })
})
