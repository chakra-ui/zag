import { describe, expect, test } from "vitest"
import {
  applyMove,
  applyResize,
  clampPointInRange,
  getArrowKeyDelta,
  getDirectionDelta,
  getKeyboardResizeDelta,
  isBottomHandle,
  isCornerHandle,
  isHorizontalHandle,
  isLeftHandle,
  isRightHandle,
  isTopHandle,
  isVerticalHandle,
  type HandlePosition,
} from "../src/interact"

/* -------------------------------------------------------------------------- */
/* Handle direction helpers                                                    */
/* -------------------------------------------------------------------------- */

describe("handle direction helpers", () => {
  const corners: HandlePosition[] = ["nw", "ne", "sw", "se"]
  const horizontals: HandlePosition[] = ["e", "w"]
  const verticals: HandlePosition[] = ["n", "s"]

  const h = (...v: HandlePosition[]) => v

  test("isLeftHandle", () => {
    expect(h("w", "nw", "sw").every(isLeftHandle)).toBe(true)
    expect(h("e", "ne", "se", "n", "s").some(isLeftHandle)).toBe(false)
  })

  test("isRightHandle", () => {
    expect(h("e", "ne", "se").every(isRightHandle)).toBe(true)
    expect(h("w", "nw", "sw", "n", "s").some(isRightHandle)).toBe(false)
  })

  test("isTopHandle", () => {
    expect(h("n", "nw", "ne").every(isTopHandle)).toBe(true)
    expect(h("s", "sw", "se", "e", "w").some(isTopHandle)).toBe(false)
  })

  test("isBottomHandle", () => {
    expect(h("s", "sw", "se").every(isBottomHandle)).toBe(true)
    expect(h("n", "nw", "ne", "e", "w").some(isBottomHandle)).toBe(false)
  })

  test("isCornerHandle", () => {
    expect(corners.every(isCornerHandle)).toBe(true)
    expect([...horizontals, ...verticals].some(isCornerHandle)).toBe(false)
  })

  test("isHorizontalHandle", () => {
    expect(horizontals.every(isHorizontalHandle)).toBe(true)
    expect([...corners, ...verticals].some(isHorizontalHandle)).toBe(false)
  })

  test("isVerticalHandle", () => {
    expect(verticals.every(isVerticalHandle)).toBe(true)
    expect([...corners, ...horizontals].some(isVerticalHandle)).toBe(false)
  })
})

/* -------------------------------------------------------------------------- */
/* getDirectionDelta                                                           */
/* -------------------------------------------------------------------------- */

describe("getDirectionDelta", () => {
  test("converts arrow directions to point deltas", () => {
    expect(getDirectionDelta("left", 10)).toEqual({ x: -10, y: 0 })
    expect(getDirectionDelta("right", 10)).toEqual({ x: 10, y: 0 })
    expect(getDirectionDelta("up", 5)).toEqual({ x: 0, y: -5 })
    expect(getDirectionDelta("down", 5)).toEqual({ x: 0, y: 5 })
  })
})

describe("getArrowKeyDelta", () => {
  test("converts ArrowKey names to point deltas", () => {
    expect(getArrowKeyDelta("ArrowLeft", 10)).toEqual({ x: -10, y: 0 })
    expect(getArrowKeyDelta("ArrowRight", 10)).toEqual({ x: 10, y: 0 })
    expect(getArrowKeyDelta("ArrowUp", 5)).toEqual({ x: 0, y: -5 })
    expect(getArrowKeyDelta("ArrowDown", 5)).toEqual({ x: 0, y: 5 })
  })

  test("returns zero for non-arrow keys", () => {
    expect(getArrowKeyDelta("Enter", 10)).toEqual({ x: 0, y: 0 })
  })
})

describe("getKeyboardResizeDelta", () => {
  test("left handle: ArrowLeft expands, ArrowRight shrinks", () => {
    expect(getKeyboardResizeDelta("ArrowLeft", "w", 10)).toEqual({ x: -10, y: 0 })
    expect(getKeyboardResizeDelta("ArrowRight", "w", 10)).toEqual({ x: 10, y: 0 })
    expect(getKeyboardResizeDelta("ArrowUp", "w", 10)).toEqual({ x: 0, y: 0 })
  })

  test("right handle: ArrowRight expands, ArrowLeft shrinks", () => {
    expect(getKeyboardResizeDelta("ArrowRight", "e", 10)).toEqual({ x: 10, y: 0 })
    expect(getKeyboardResizeDelta("ArrowLeft", "e", 10)).toEqual({ x: -10, y: 0 })
  })

  test("top handle: ArrowUp expands, ArrowDown shrinks", () => {
    expect(getKeyboardResizeDelta("ArrowUp", "n", 10)).toEqual({ x: 0, y: -10 })
    expect(getKeyboardResizeDelta("ArrowDown", "n", 10)).toEqual({ x: 0, y: 10 })
  })

  test("bottom handle: ArrowDown expands, ArrowUp shrinks", () => {
    expect(getKeyboardResizeDelta("ArrowDown", "s", 10)).toEqual({ x: 0, y: 10 })
    expect(getKeyboardResizeDelta("ArrowUp", "s", 10)).toEqual({ x: 0, y: -10 })
  })

  test("corner nw: ArrowLeft+ArrowUp expand both axes", () => {
    expect(getKeyboardResizeDelta("ArrowLeft", "nw", 10)).toEqual({ x: -10, y: 0 })
    expect(getKeyboardResizeDelta("ArrowUp", "nw", 10)).toEqual({ x: 0, y: -10 })
  })

  test("corner se: ArrowRight+ArrowDown expand both axes", () => {
    expect(getKeyboardResizeDelta("ArrowRight", "se", 10)).toEqual({ x: 10, y: 0 })
    expect(getKeyboardResizeDelta("ArrowDown", "se", 10)).toEqual({ x: 0, y: 10 })
  })
})

describe("clampPointInRange", () => {
  test("clamps within range", () => {
    expect(clampPointInRange({ x: 50, y: 50 }, { x: 0, y: 0 }, { x: 100, y: 100 })).toEqual({ x: 50, y: 50 })
  })

  test("clamps to min", () => {
    expect(clampPointInRange({ x: -10, y: -5 }, { x: 0, y: 0 }, { x: 100, y: 100 })).toEqual({ x: 0, y: 0 })
  })

  test("clamps to max", () => {
    expect(clampPointInRange({ x: 200, y: 150 }, { x: 0, y: 0 }, { x: 100, y: 100 })).toEqual({ x: 100, y: 100 })
  })
})

/* -------------------------------------------------------------------------- */
/* applyMove                                                                   */
/* -------------------------------------------------------------------------- */

describe("applyMove", () => {
  const rect = { x: 100, y: 100, width: 200, height: 150 }

  test("moves rect by delta", () => {
    const result = applyMove(rect, { x: 50, y: -30 })
    expect(result).toEqual({ x: 150, y: 70, width: 200, height: 150 })
  })

  test("preserves size", () => {
    const result = applyMove(rect, { x: 10, y: 10 })
    expect(result.width).toBe(200)
    expect(result.height).toBe(150)
  })

  test("clamps within boundary", () => {
    const boundary = { x: 0, y: 0, width: 400, height: 300 }
    const result = applyMove(rect, { x: 500, y: 500 }, { boundary })
    expect(result.x).toBe(200) // 400 - 200
    expect(result.y).toBe(150) // 300 - 150
  })

  test("clamps to boundary min", () => {
    const boundary = { x: 0, y: 0, width: 400, height: 300 }
    const result = applyMove(rect, { x: -500, y: -500 }, { boundary })
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  test("snaps to grid", () => {
    const result = applyMove(rect, { x: 7, y: 13 }, { gridSize: 10 })
    expect(result.x).toBe(110) // round(7/10)*10 = 10
    expect(result.y).toBe(110) // round(13/10)*10 = 10
  })

  test("handles non-zero boundary origin", () => {
    const boundary = { x: 50, y: 50, width: 300, height: 200 }
    const result = applyMove(rect, { x: -200, y: -200 }, { boundary })
    expect(result.x).toBe(50)
    expect(result.y).toBe(50)
  })

  test("unconstrained when no boundary", () => {
    const result = applyMove(rect, { x: -9999, y: -9999 })
    expect(result.x).toBe(100 - 9999)
    expect(result.y).toBe(100 - 9999)
  })
})

/* -------------------------------------------------------------------------- */
/* applyResize                                                                 */
/* -------------------------------------------------------------------------- */

describe("applyResize", () => {
  const rect = { x: 100, y: 100, width: 200, height: 150 }
  const boundary = { x: 0, y: 0, width: 500, height: 400 }

  describe("basic edge resize", () => {
    test("resize from east (right edge)", () => {
      const result = applyResize(rect, { x: 50, y: 0 }, "e")
      expect(result).toEqual({ x: 100, y: 100, width: 250, height: 150 })
    })

    test("resize from west (left edge)", () => {
      const result = applyResize(rect, { x: -30, y: 0 }, "w")
      expect(result).toEqual({ x: 70, y: 100, width: 230, height: 150 })
    })

    test("resize from south (bottom edge)", () => {
      const result = applyResize(rect, { x: 0, y: 40 }, "s")
      expect(result).toEqual({ x: 100, y: 100, width: 200, height: 190 })
    })

    test("resize from north (top edge)", () => {
      const result = applyResize(rect, { x: 0, y: -20 }, "n")
      expect(result).toEqual({ x: 100, y: 80, width: 200, height: 170 })
    })
  })

  describe("corner resize", () => {
    test("resize from se corner", () => {
      const result = applyResize(rect, { x: 30, y: 20 }, "se")
      expect(result).toEqual({ x: 100, y: 100, width: 230, height: 170 })
    })

    test("resize from nw corner", () => {
      const result = applyResize(rect, { x: -10, y: -10 }, "nw")
      expect(result).toEqual({ x: 90, y: 90, width: 210, height: 160 })
    })

    test("resize from ne corner", () => {
      const result = applyResize(rect, { x: 20, y: -15 }, "ne")
      expect(result).toEqual({ x: 100, y: 85, width: 220, height: 165 })
    })

    test("resize from sw corner", () => {
      const result = applyResize(rect, { x: -20, y: 15 }, "sw")
      expect(result).toEqual({ x: 80, y: 100, width: 220, height: 165 })
    })
  })

  describe("size limits", () => {
    test("enforces min size", () => {
      const result = applyResize(rect, { x: -180, y: -130 }, "se", {
        minSize: { width: 50, height: 50 },
      })
      expect(result.width).toBe(50)
      expect(result.height).toBe(50)
    })

    test("enforces max size", () => {
      const result = applyResize(rect, { x: 999, y: 999 }, "se", {
        maxSize: { width: 300, height: 250 },
      })
      expect(result.width).toBe(300)
      expect(result.height).toBe(250)
    })

    test("min size prevents edge from crossing opposite edge", () => {
      const result = applyResize(rect, { x: 300, y: 0 }, "w", {
        minSize: { width: 40, height: 40 },
      })
      expect(result.width).toBeGreaterThanOrEqual(40)
      expect(result.x).toBeLessThanOrEqual(rect.x + rect.width - 40)
    })
  })

  describe("boundary containment", () => {
    test("prevents resize beyond boundary right", () => {
      const result = applyResize(rect, { x: 999, y: 0 }, "e", { boundary })
      expect(result.x + result.width).toBeLessThanOrEqual(500)
    })

    test("prevents resize beyond boundary left", () => {
      const result = applyResize(rect, { x: -999, y: 0 }, "w", { boundary })
      expect(result.x).toBeGreaterThanOrEqual(0)
    })

    test("prevents resize beyond boundary bottom", () => {
      const result = applyResize(rect, { x: 0, y: 999 }, "s", { boundary })
      expect(result.y + result.height).toBeLessThanOrEqual(400)
    })

    test("prevents resize beyond boundary top", () => {
      const result = applyResize(rect, { x: 0, y: -999 }, "n", { boundary })
      expect(result.y).toBeGreaterThanOrEqual(0)
    })

    test("max size limited by boundary dimensions", () => {
      const smallBoundary = { x: 0, y: 0, width: 250, height: 200 }
      const result = applyResize(rect, { x: 999, y: 999 }, "se", {
        boundary: smallBoundary,
        maxSize: { width: 500, height: 500 },
      })
      expect(result.width).toBeLessThanOrEqual(250)
      expect(result.height).toBeLessThanOrEqual(200)
    })
  })

  describe("aspect ratio", () => {
    test("corner resize maintains aspect ratio", () => {
      const result = applyResize(rect, { x: 100, y: 0 }, "se", {
        aspectRatio: 2,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 2)).toBeLessThan(0.01)
    })

    test("horizontal edge resize adjusts height for aspect ratio", () => {
      const result = applyResize(rect, { x: 100, y: 0 }, "e", {
        aspectRatio: 2,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 2)).toBeLessThan(0.01)
    })

    test("vertical edge resize adjusts width for aspect ratio", () => {
      const result = applyResize(rect, { x: 0, y: 50 }, "s", {
        aspectRatio: 2,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 2)).toBeLessThan(0.01)
    })

    test("aspect ratio with boundary containment", () => {
      const result = applyResize(rect, { x: 999, y: 999 }, "se", {
        boundary,
        aspectRatio: 1,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 1)).toBeLessThan(0.01)
      expect(result.x + result.width).toBeLessThanOrEqual(500)
      expect(result.y + result.height).toBeLessThanOrEqual(400)
    })

    test("aspect ratio with min/max size", () => {
      const result = applyResize(rect, { x: -180, y: 0 }, "se", {
        aspectRatio: 2,
        minSize: { width: 60, height: 30 },
      })
      expect(result.width).toBeGreaterThanOrEqual(60)
      expect(result.height).toBeGreaterThanOrEqual(30)
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 2)).toBeLessThan(0.01)
    })
  })

  describe("center origin", () => {
    test("resizes symmetrically from center", () => {
      const result = applyResize(rect, { x: 20, y: 0 }, "e", {
        origin: "center",
      })
      const cx = rect.x + rect.width / 2
      expect(result.x + result.width / 2).toBeCloseTo(cx, 5)
      expect(result.width).toBe(rect.width + 40) // delta doubled
    })

    test("center origin stays within boundary", () => {
      const smallRect = { x: 200, y: 150, width: 100, height: 100 }
      const result = applyResize(smallRect, { x: 200, y: 200 }, "se", {
        origin: "center",
        boundary,
      })
      expect(result.x).toBeGreaterThanOrEqual(0)
      expect(result.y).toBeGreaterThanOrEqual(0)
      expect(result.x + result.width).toBeLessThanOrEqual(500)
      expect(result.y + result.height).toBeLessThanOrEqual(400)
    })
  })

  describe("edge cases", () => {
    test("zero delta returns original rect", () => {
      const result = applyResize(rect, { x: 0, y: 0 }, "se")
      expect(result).toEqual(rect)
    })

    test("negative resize (shrinking)", () => {
      const result = applyResize(rect, { x: -50, y: -40 }, "se")
      expect(result.width).toBe(150)
      expect(result.height).toBe(110)
    })

    test("resize does not invert rect", () => {
      const result = applyResize(rect, { x: -999, y: -999 }, "se", {
        minSize: { width: 10, height: 10 },
      })
      expect(result.width).toBeGreaterThan(0)
      expect(result.height).toBeGreaterThan(0)
    })
  })
})
