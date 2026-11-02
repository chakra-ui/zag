import { describe, expect, test } from "vitest"
import { getClosestIndex, getFillSpan, getOriginPercent, resolveThumbCollision, toThumbSize } from "../src/slider.utils"
import type { SliderOrigin } from "../src/slider.types"

/**
 * Legend for the track diagrams below (all in percent-space, 0 = start of track, 100 = end):
 *
 *   ○  origin  — the point the track fills from
 *   ●  value   — the thumb's current position
 *   █  filled  — the range that should render as "filled" track
 *   ·  empty   — unfilled track
 *
 * `getOriginPercent(origin, min, max)` turns the `origin` prop ("start" | "center" | "end" | a
 * domain value) into one of these percent positions. `getFillSpan` returns the filled part of the
 * track as `[from, to]` percents, from the thumbs' percents and the origin.
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

function fillSpan(valuePercent: number[], origin: SliderOrigin, min = 0, max = 100) {
  const props: Record<string, unknown> = { origin, min, max }
  return getFillSpan({ computed: () => valuePercent, prop: (key: string) => props[key] } as any)
}

describe("@zag-js/slider getFillSpan", () => {
  test("origin at the start: fills from the left edge up to the value", () => {
    //   0                  50                 100
    //   ○█████████████████████████████●··········
    expect(fillSpan([75], 0)).toEqual([0, 75])

    //   0                  50                 100
    //   ○███████████████████████████████████████●
    expect(fillSpan([100], 0)).toEqual([0, 100])
  })

  test("origin at the end: fills from the value up to the right edge", () => {
    //   0                  50                 100
    //   ··········●█████████████████████████████○
    expect(fillSpan([25], 100)).toEqual([25, 100])

    //   0                  50                 100
    //   ●███████████████████████████████████████○
    expect(fillSpan([0], 100)).toEqual([0, 100])
  })

  test("origin in the center: fills toward whichever side the value is on", () => {
    //   0                  50                 100
    //   ············●███████○····················
    expect(fillSpan([30], 50)).toEqual([30, 50])

    //   0                  50                 100
    //   ····················○███████●············
    expect(fillSpan([70], 50)).toEqual([50, 70])
  })

  test("fills correctly around an arbitrary, off-center origin too", () => {
    // origin ~16.7% (this is where domain value `0` sits on a -20..100 slider)
    //
    //   0                  50                 100
    //   ·······○████████████████●················
    expect(fillSpan([60], 16.6667)).toEqual([16.6667, 60])

    //   0                  50                 100
    //   ··●████○·································
    expect(fillSpan([5], 16.6667)).toEqual([5, 16.6667])
  })

  test("value exactly at the origin never renders a fill, at any origin position", () => {
    for (const origin of [0, 50, 100, 16.6667]) {
      const [from, to] = fillSpan([origin], origin)
      expect(to - from).toBe(0)
    }
  })

  test("multiple thumbs fill between the first and last thumb, ignoring the origin", () => {
    //   0                  50                 100
    //   ········●████████████████●···············
    expect(fillSpan([20, 60], 0)).toEqual([20, 60])
    expect(fillSpan([20, 40, 60], 100)).toEqual([20, 60])
  })
})

describe("regression: 'center' vs. a numeric origin on an asymmetric domain", () => {
  test("'center' still behaves exactly as before on a symmetric domain", () => {
    // domain -50..50: the midpoint (0) is also the neutral value, so "center" is correct here
    expect(fillSpan([30], "center", -50, 50)).toEqual([30, 50])
    expect(fillSpan([70], "center", -50, 50)).toEqual([50, 70])
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
    const [from, to] = fillSpan([valuePercent], neutralValue, min, max)
    expect(to - from).toBe(0)

    // origin = "center" (the midpoint, 40, not the neutral value): misreads the untouched
    // value as a fill toward the midpoint
    //   0                  50                 100
    //   ·······●█████████████○····················
    const [wrongFrom, wrongTo] = fillSpan([valuePercent], "center", min, max)
    expect(wrongTo - wrongFrom).toBeGreaterThan(0)
  })
})

describe("toThumbSize", () => {
  test("a number sets both width and height", () => {
    expect(toThumbSize(20)).toEqual({ width: 20, height: 20 })
  })

  test("a size object passes through", () => {
    expect(toThumbSize({ width: 24, height: 16 })).toEqual({ width: 24, height: 16 })
  })

  test("no size is null, so the thumb gets measured", () => {
    expect(toThumbSize(undefined)).toBeNull()
  })
})

describe("disabled thumbs", () => {
  // values [20, 50, 80], step 1, no gap; thumb 1 is disabled
  const values = [20, 50, 80]
  const disabled = new Set([1])
  const collide = (behavior: "none" | "push" | "swap", index: number, value: number) =>
    resolveThumbCollision(behavior, index, value, values, 0, 100, 1, 0, values[index], disabled).values

  test("push stops in front of a disabled thumb", () => {
    expect(collide("push", 0, 70)).toEqual([50, 50, 80])
    expect(collide("push", 2, 10)).toEqual([20, 50, 50])
  })

  test("push still moves enabled thumbs before the disabled one", () => {
    const four = [10, 20, 60, 90]
    const result = resolveThumbCollision("push", 0, 80, four, 0, 100, 1, 0, 10, new Set([2])).values
    expect(result).toEqual([60, 60, 60, 90])
  })

  test("swap doesn't swap with a disabled thumb", () => {
    expect(collide("swap", 0, 70)).toEqual([50, 50, 80])
  })

  test("the closest thumb skips disabled ones", () => {
    const params = { context: { get: () => values }, prop: (key: string) => ({ max: 100 })[key] } as any
    expect(getClosestIndex(params, 52, disabled)).toBe(2)
    expect(getClosestIndex(params, 48, disabled)).toBe(0)
    expect(getClosestIndex(params, 50, new Set([0, 1, 2]))).toBe(-1)
  })
})
