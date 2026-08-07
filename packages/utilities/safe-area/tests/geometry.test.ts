import { describe, expect, test } from "vitest"
import {
  getConvexHull,
  getSafeAreaPolygon,
  isMeasuredRect,
  isPointInPolygon,
  isPointInRect,
  type Point,
  type Rect,
} from "../src/geometry"

const TRIGGER: Rect = [200, 100, 70, 18]
const CONTENT: Rect = [150, 150, 280, 160]
// where the pointer crossed out of the trigger's bottom edge
const EXIT: Point = [235, 118]

describe("getConvexHull", () => {
  test("drops collinear points, keeping the hull minimal", () => {
    const square: Point[] = [
      [0, 0],
      [5, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]
    expect(getConvexHull(square)).toHaveLength(4)
  })

  test.each([
    ["fewer than three points", [[0, 0] as Point, [10, 10] as Point]],
    ["identical points", Array.from({ length: 4 }, () => [5, 5] as Point)],
    [
      "collinear points",
      [
        [0, 50],
        [50, 50],
        [100, 50],
      ] as Point[],
    ],
  ])("returns [] for %s rather than a degenerate polygon", (_label, points) => {
    expect(getConvexHull(points)).toEqual([])
  })
})

describe("isMeasuredRect", () => {
  test.each([
    ["an unmeasured rect", [0, 0, 0, 0] as Rect],
    ["a zero-height rect", [10, 10, 100, 0] as Rect],
    ["a zero-width rect", [10, 10, 0, 100] as Rect],
    ["a NaN rect", [NaN, 0, 10, 10] as Rect],
    ["null", null],
  ])("rejects %s", (_label, value) => {
    expect(isMeasuredRect(value)).toBe(false)
  })

  test("accepts a real rect", () => {
    expect(isMeasuredRect(TRIGGER)).toBe(true)
  })
})

describe("isPointInRect", () => {
  test("respects padding", () => {
    expect(isPointInRect(TRIGGER, [196, 108])).toBe(false)
    expect(isPointInRect(TRIGGER, [196, 108], 8)).toBe(true)
  })
})

describe("getSafeAreaPolygon", () => {
  test("spans the gap between the exit point and the content", () => {
    const hull = getSafeAreaPolygon({ exitPoint: EXIT, contentRect: CONTENT })
    expect(hull.length).toBeGreaterThanOrEqual(3)
    expect(isPointInPolygon(hull, [235, 135])).toBe(true)
  })

  test("is independent of winding order", () => {
    const hull = getSafeAreaPolygon({ exitPoint: EXIT, contentRect: CONTENT })
    const probe: Point = [235, 140]
    expect(isPointInPolygon(hull, probe)).toBe(isPointInPolygon(hull.slice().reverse(), probe))
  })

  // Regression: getBoundingClientRect() reports 0,0,0,0 for hidden or unmeasured content.
  // Hulling that anchored the polygon at the viewport origin, so a point nowhere near either
  // element tested as inside and the overlay could never close.
  test("yields no safe area when the content is unmeasured", () => {
    const hull = getSafeAreaPolygon({ exitPoint: [300, 310], contentRect: [0, 0, 0, 0] })
    expect(hull).toEqual([])
    expect(isPointInPolygon(hull, [20, 20])).toBe(false)
  })

  test("excludes a point moving away from the content", () => {
    const hull = getSafeAreaPolygon({ exitPoint: EXIT, contentRect: CONTENT })
    expect(isPointInPolygon(hull, [235, 80])).toBe(false)
  })

  test("works when the content sits above the exit point", () => {
    const hull = getSafeAreaPolygon({ exitPoint: [235, 300], contentRect: [150, 120, 280, 160] })
    expect(isPointInPolygon(hull, [235, 295])).toBe(true)
    expect(isPointInPolygon(hull, [235, 340])).toBe(false)
  })

  // Why the corridor is anchored at the exit point rather than hulling the whole trigger:
  // a menu item's siblings sit directly above and below it, and a trigger in prose has text
  // beside it. Hulling trigger-to-content flares sideways and swallows them.
  describe("keeps neighbouring elements reachable", () => {
    test.each([
      ["the row above a menu item", [100, 180] as Point],
      ["the row below a menu item", [100, 245] as Point],
    ])("excludes %s", (_label, probe) => {
      const hull = getSafeAreaPolygon({
        exitPoint: [200, 216],
        contentRect: [210, 120, 200, 320],
        padding: 5,
      })
      expect(isPointInPolygon(hull, probe)).toBe(false)
    })

    test("excludes text sitting beside an inline trigger", () => {
      // trigger 280..337 / y 40..69, card 159..459 / y 77..227, text at 387..442 on the trigger's row
      const hull = getSafeAreaPolygon({ exitPoint: [308, 69], contentRect: [159, 77, 300, 150] })
      expect(isPointInPolygon(hull, [414, 54])).toBe(false)
    })

    test("still allows travel toward the content", () => {
      const hull = getSafeAreaPolygon({
        exitPoint: [200, 216],
        contentRect: [210, 120, 200, 320],
        padding: 5,
      })
      expect(isPointInPolygon(hull, [205, 215])).toBe(true)
    })
  })
})
