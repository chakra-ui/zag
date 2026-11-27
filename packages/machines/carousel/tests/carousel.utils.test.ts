import { describe, expect, test } from "vitest"
import { getFlickVelocity, getPageForIndex, isSnapTarget } from "../src/carousel.utils"

describe("getFlickVelocity", () => {
  test("keeps a fast release over a long enough drag", () => {
    expect(getFlickVelocity(1.2, 50)).toBe(1.2)
    expect(getFlickVelocity(-0.5, -40)).toBe(-0.5)
  })

  test("is zero for slow drags and click jitter", () => {
    expect(getFlickVelocity(0.2, 50)).toBe(0)
    expect(getFlickVelocity(2, 5)).toBe(0)
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
