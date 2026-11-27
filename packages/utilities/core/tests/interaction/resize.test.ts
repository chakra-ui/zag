import { describe, expect, test } from "vitest"
import {
  arrowDelta,
  clampBetween,
  hasEdge,
  isCorner,
  moveBox,
  resizeBox,
  resizeKeyDelta,
  type HandlePlacement,
} from "../../src/interaction"

describe("handle helpers", () => {
  const all: HandlePlacement[] = ["n", "e", "s", "w", "ne", "nw", "se", "sw"]
  const moving = (edge: "n" | "e" | "s" | "w") => all.filter((h) => hasEdge(h, edge))

  test("hasEdge finds the handles that move an edge", () => {
    expect(moving("w")).toEqual(["w", "nw", "sw"])
    expect(moving("e")).toEqual(["e", "ne", "se"])
    expect(moving("n")).toEqual(["n", "ne", "nw"])
    expect(moving("s")).toEqual(["s", "se", "sw"])
  })

  test("isCorner is true only for the corners", () => {
    expect(all.filter(isCorner)).toEqual(["ne", "nw", "se", "sw"])
  })
})

describe("arrowDelta", () => {
  test("converts ArrowKey names to point deltas", () => {
    expect(arrowDelta("ArrowLeft", 10)).toEqual({ x: -10, y: 0 })
    expect(arrowDelta("ArrowRight", 10)).toEqual({ x: 10, y: 0 })
    expect(arrowDelta("ArrowUp", 5)).toEqual({ x: 0, y: -5 })
    expect(arrowDelta("ArrowDown", 5)).toEqual({ x: 0, y: 5 })
  })

  test("returns zero for non-arrow keys", () => {
    expect(arrowDelta("Enter", 10)).toEqual({ x: 0, y: 0 })
  })
})

describe("resizeKeyDelta", () => {
  test("left handle: ArrowLeft expands, ArrowRight shrinks", () => {
    expect(resizeKeyDelta("ArrowLeft", "w", 10)).toEqual({ x: -10, y: 0 })
    expect(resizeKeyDelta("ArrowRight", "w", 10)).toEqual({ x: 10, y: 0 })
    expect(resizeKeyDelta("ArrowUp", "w", 10)).toEqual({ x: 0, y: 0 })
  })

  test("right handle: ArrowRight expands, ArrowLeft shrinks", () => {
    expect(resizeKeyDelta("ArrowRight", "e", 10)).toEqual({ x: 10, y: 0 })
    expect(resizeKeyDelta("ArrowLeft", "e", 10)).toEqual({ x: -10, y: 0 })
  })

  test("top handle: ArrowUp expands, ArrowDown shrinks", () => {
    expect(resizeKeyDelta("ArrowUp", "n", 10)).toEqual({ x: 0, y: -10 })
    expect(resizeKeyDelta("ArrowDown", "n", 10)).toEqual({ x: 0, y: 10 })
  })

  test("bottom handle: ArrowDown expands, ArrowUp shrinks", () => {
    expect(resizeKeyDelta("ArrowDown", "s", 10)).toEqual({ x: 0, y: 10 })
    expect(resizeKeyDelta("ArrowUp", "s", 10)).toEqual({ x: 0, y: -10 })
  })

  test("corner nw: ArrowLeft+ArrowUp expand both axes", () => {
    expect(resizeKeyDelta("ArrowLeft", "nw", 10)).toEqual({ x: -10, y: 0 })
    expect(resizeKeyDelta("ArrowUp", "nw", 10)).toEqual({ x: 0, y: -10 })
  })

  test("corner se: ArrowRight+ArrowDown expand both axes", () => {
    expect(resizeKeyDelta("ArrowRight", "se", 10)).toEqual({ x: 10, y: 0 })
    expect(resizeKeyDelta("ArrowDown", "se", 10)).toEqual({ x: 0, y: 10 })
  })
})

describe("clampBetween", () => {
  test("clamps within range", () => {
    expect(clampBetween({ x: 50, y: 50 }, { x: 0, y: 0 }, { x: 100, y: 100 })).toEqual({ x: 50, y: 50 })
  })

  test("clamps to min", () => {
    expect(clampBetween({ x: -10, y: -5 }, { x: 0, y: 0 }, { x: 100, y: 100 })).toEqual({ x: 0, y: 0 })
  })

  test("clamps to max", () => {
    expect(clampBetween({ x: 200, y: 150 }, { x: 0, y: 0 }, { x: 100, y: 100 })).toEqual({ x: 100, y: 100 })
  })
})

/* -------------------------------------------------------------------------- */
/* moveBox                                                                   */
/* -------------------------------------------------------------------------- */

describe("moveBox", () => {
  const rect = { x: 100, y: 100, width: 200, height: 150 }

  test("moves rect by delta", () => {
    const result = moveBox(rect, { x: 50, y: -30 })
    expect(result).toEqual({ x: 150, y: 70, width: 200, height: 150 })
  })

  test("preserves size", () => {
    const result = moveBox(rect, { x: 10, y: 10 })
    expect(result.width).toBe(200)
    expect(result.height).toBe(150)
  })

  test("clamps within boundary", () => {
    const boundary = { x: 0, y: 0, width: 400, height: 300 }
    const result = moveBox(rect, { x: 500, y: 500 }, { boundary })
    expect(result.x).toBe(200) // 400 - 200
    expect(result.y).toBe(150) // 300 - 150
  })

  test("clamps to boundary min", () => {
    const boundary = { x: 0, y: 0, width: 400, height: 300 }
    const result = moveBox(rect, { x: -500, y: -500 }, { boundary })
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  test("snaps to grid", () => {
    const result = moveBox(rect, { x: 7, y: 13 }, { gridSize: 10 })
    expect(result.x).toBe(110) // round(7/10)*10 = 10
    expect(result.y).toBe(110) // round(13/10)*10 = 10
  })

  test("handles non-zero boundary origin", () => {
    const boundary = { x: 50, y: 50, width: 300, height: 200 }
    const result = moveBox(rect, { x: -200, y: -200 }, { boundary })
    expect(result.x).toBe(50)
    expect(result.y).toBe(50)
  })

  test("unconstrained when no boundary", () => {
    const result = moveBox(rect, { x: -9999, y: -9999 })
    expect(result.x).toBe(100 - 9999)
    expect(result.y).toBe(100 - 9999)
  })
})

/* -------------------------------------------------------------------------- */
/* resizeBox                                                                 */
/* -------------------------------------------------------------------------- */

describe("resizeBox", () => {
  const rect = { x: 100, y: 100, width: 200, height: 150 }
  const boundary = { x: 0, y: 0, width: 500, height: 400 }

  describe("basic edge resize", () => {
    test("resize from east (right edge)", () => {
      const result = resizeBox(rect, { x: 50, y: 0 }, "e")
      expect(result).toEqual({ x: 100, y: 100, width: 250, height: 150 })
    })

    test("resize from west (left edge)", () => {
      const result = resizeBox(rect, { x: -30, y: 0 }, "w")
      expect(result).toEqual({ x: 70, y: 100, width: 230, height: 150 })
    })

    test("resize from south (bottom edge)", () => {
      const result = resizeBox(rect, { x: 0, y: 40 }, "s")
      expect(result).toEqual({ x: 100, y: 100, width: 200, height: 190 })
    })

    test("resize from north (top edge)", () => {
      const result = resizeBox(rect, { x: 0, y: -20 }, "n")
      expect(result).toEqual({ x: 100, y: 80, width: 200, height: 170 })
    })
  })

  describe("corner resize", () => {
    test("resize from se corner", () => {
      const result = resizeBox(rect, { x: 30, y: 20 }, "se")
      expect(result).toEqual({ x: 100, y: 100, width: 230, height: 170 })
    })

    test("resize from nw corner", () => {
      const result = resizeBox(rect, { x: -10, y: -10 }, "nw")
      expect(result).toEqual({ x: 90, y: 90, width: 210, height: 160 })
    })

    test("resize from ne corner", () => {
      const result = resizeBox(rect, { x: 20, y: -15 }, "ne")
      expect(result).toEqual({ x: 100, y: 85, width: 220, height: 165 })
    })

    test("resize from sw corner", () => {
      const result = resizeBox(rect, { x: -20, y: 15 }, "sw")
      expect(result).toEqual({ x: 80, y: 100, width: 220, height: 165 })
    })
  })

  describe("size limits", () => {
    test("enforces min size", () => {
      const result = resizeBox(rect, { x: -180, y: -130 }, "se", {
        minSize: { width: 50, height: 50 },
      })
      expect(result.width).toBe(50)
      expect(result.height).toBe(50)
    })

    test("enforces max size", () => {
      const result = resizeBox(rect, { x: 999, y: 999 }, "se", {
        maxSize: { width: 300, height: 250 },
      })
      expect(result.width).toBe(300)
      expect(result.height).toBe(250)
    })

    test("min size prevents edge from crossing opposite edge", () => {
      const result = resizeBox(rect, { x: 300, y: 0 }, "w", {
        minSize: { width: 40, height: 40 },
      })
      expect(result.width).toBeGreaterThanOrEqual(40)
      expect(result.x).toBeLessThanOrEqual(rect.x + rect.width - 40)
    })
  })

  describe("boundary containment", () => {
    test("prevents resize beyond boundary right", () => {
      const result = resizeBox(rect, { x: 999, y: 0 }, "e", { boundary })
      expect(result.x + result.width).toBeLessThanOrEqual(500)
    })

    test("prevents resize beyond boundary left", () => {
      const result = resizeBox(rect, { x: -999, y: 0 }, "w", { boundary })
      expect(result.x).toBeGreaterThanOrEqual(0)
    })

    test("prevents resize beyond boundary bottom", () => {
      const result = resizeBox(rect, { x: 0, y: 999 }, "s", { boundary })
      expect(result.y + result.height).toBeLessThanOrEqual(400)
    })

    test("prevents resize beyond boundary top", () => {
      const result = resizeBox(rect, { x: 0, y: -999 }, "n", { boundary })
      expect(result.y).toBeGreaterThanOrEqual(0)
    })

    test("max size limited by boundary dimensions", () => {
      const smallBoundary = { x: 0, y: 0, width: 250, height: 200 }
      const result = resizeBox(rect, { x: 999, y: 999 }, "se", {
        boundary: smallBoundary,
        maxSize: { width: 500, height: 500 },
      })
      expect(result.width).toBeLessThanOrEqual(250)
      expect(result.height).toBeLessThanOrEqual(200)
    })
  })

  describe("aspect ratio", () => {
    test("corner resize maintains aspect ratio", () => {
      const result = resizeBox(rect, { x: 100, y: 0 }, "se", {
        aspectRatio: 2,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 2)).toBeLessThan(0.01)
    })

    test("horizontal edge resize adjusts height for aspect ratio", () => {
      const result = resizeBox(rect, { x: 100, y: 0 }, "e", {
        aspectRatio: 2,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 2)).toBeLessThan(0.01)
    })

    test("vertical edge resize adjusts width for aspect ratio", () => {
      const result = resizeBox(rect, { x: 0, y: 50 }, "s", {
        aspectRatio: 2,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 2)).toBeLessThan(0.01)
    })

    test("aspect ratio with boundary containment", () => {
      const result = resizeBox(rect, { x: 999, y: 999 }, "se", {
        boundary,
        aspectRatio: 1,
      })
      const actualRatio = result.width / result.height
      expect(Math.abs(actualRatio - 1)).toBeLessThan(0.01)
      expect(result.x + result.width).toBeLessThanOrEqual(500)
      expect(result.y + result.height).toBeLessThanOrEqual(400)
    })

    test("aspect ratio with min/max size", () => {
      const result = resizeBox(rect, { x: -180, y: 0 }, "se", {
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
      const result = resizeBox(rect, { x: 20, y: 0 }, "e", {
        origin: "center",
      })
      const cx = rect.x + rect.width / 2
      expect(result.x + result.width / 2).toBeCloseTo(cx, 5)
      expect(result.width).toBe(rect.width + 40) // delta doubled
    })

    test("center origin stays within boundary", () => {
      const smallRect = { x: 200, y: 150, width: 100, height: 100 }
      const result = resizeBox(smallRect, { x: 200, y: 200 }, "se", {
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
      const result = resizeBox(rect, { x: 0, y: 0 }, "se")
      expect(result).toEqual(rect)
    })

    test("negative resize (shrinking)", () => {
      const result = resizeBox(rect, { x: -50, y: -40 }, "se")
      expect(result.width).toBe(150)
      expect(result.height).toBe(110)
    })

    test("resize does not invert rect", () => {
      const result = resizeBox(rect, { x: -999, y: -999 }, "se", {
        minSize: { width: 10, height: 10 },
      })
      expect(result.width).toBeGreaterThan(0)
      expect(result.height).toBeGreaterThan(0)
    })
  })
})

describe("resizeBox gridSize", () => {
  test("keeps fractional deltas without a grid", () => {
    const rect = { x: 0, y: 0, width: 100, height: 100 }
    expect(resizeBox(rect, { x: 10.4, y: 2.6 }, "se")).toEqual({ x: 0, y: 0, width: 110.4, height: 102.6 })
  })

  test("snaps the pointer delta to the grid", () => {
    const rect = { x: 0, y: 0, width: 100, height: 100 }
    expect(resizeBox(rect, { x: 13, y: 19 }, "se", { gridSize: 10 })).toEqual({ x: 0, y: 0, width: 110, height: 120 })
    expect(resizeBox(rect, { x: -13, y: 4 }, "nw", { gridSize: 10 })).toEqual({
      x: -10,
      y: 0,
      width: 110,
      height: 100,
    })
  })
})

describe("grid snapping", () => {
  test("moveBox lands the box on grid lines, even from off the grid", () => {
    const box = { x: 3, y: 5, width: 50, height: 50 }
    expect(moveBox(box, { x: 9, y: 2 }, { gridSize: 10 })).toEqual({ x: 10, y: 10, width: 50, height: 50 })
  })

  test("resizeBox lands the moving edges on grid lines", () => {
    const box = { x: 3, y: 5, width: 50, height: 50 }
    // right edge 53 + 13 = 66 snaps to 70, bottom edge 55 + 4 = 59 snaps to 60
    expect(resizeBox(box, { x: 13, y: 4 }, "se", { gridSize: 10 })).toEqual({ x: 3, y: 5, width: 67, height: 55 })
    // left edge 3 - 4 = -1 snaps to 0
    expect(resizeBox(box, { x: -4, y: 0 }, "w", { gridSize: 10 })).toMatchObject({ x: 0, width: 53 })
  })

  test("keeps fractional moves without a grid", () => {
    const box = { x: 0, y: 0, width: 50, height: 50 }
    expect(moveBox(box, { x: 1.25, y: 2.5 })).toEqual({ x: 1.25, y: 2.5, width: 50, height: 50 })
  })
})
