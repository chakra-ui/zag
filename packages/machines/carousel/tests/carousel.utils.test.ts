import { describe, expect, test } from "vitest"
import { getPageForIndex, getReleaseVelocity, isSnapTarget } from "../src/carousel.utils"

describe("getReleaseVelocity", () => {
  test("measures the last moments of a flick", () => {
    const samples = [
      { time: 0, delta: 10 },
      { time: 100, delta: 20 },
      { time: 120, delta: 20 },
    ]
    expect(getReleaseVelocity(samples, 130, 50)).toBeCloseTo(40 / 30)
  })

  test("is zero when the pointer paused before release", () => {
    expect(getReleaseVelocity([{ time: 0, delta: 50 }], 80, 50)).toBe(0)
  })

  test("is zero for slow drags and click jitter", () => {
    expect(getReleaseVelocity([{ time: 0, delta: 5 }], 10, 5)).toBe(0)
    expect(
      getReleaseVelocity(
        [
          { time: 0, delta: 4 },
          { time: 60, delta: 4 },
          { time: 95, delta: 4 },
        ],
        100,
        12,
      ),
    ).toBe(0)
  })

  test("is zero without samples", () => {
    expect(getReleaseVelocity([], 10, 0)).toBe(0)
  })
})

describe("page helpers", () => {
  test("isSnapTarget marks every perMove-th slide", () => {
    expect([0, 1, 2, 3, 4].map((index) => isSnapTarget(index, 2))).toEqual([true, false, true, false, true])
  })

  test("getPageForIndex returns the containing page", () => {
    expect(getPageForIndex(2, 5, 2)).toBe(0)
    expect(getPageForIndex(7, 5, 2)).toBe(1)
    expect(getPageForIndex(3, 0, 2)).toBeUndefined()
  })
})
