import { describe, expect, test } from "vitest"
import type { NormalizedPanelData } from "../src/splitter.types"
import { resizeByDelta } from "../src/utils/resize-by-delta"
import { resizePanel } from "../src/utils/resize-panel"

const collapsible = (extra: Partial<NormalizedPanelData> = {}): NormalizedPanelData => ({
  id: "a",
  collapsible: true,
  collapsedSize: 5,
  minSize: 15,
  ...extra,
})

describe("resizePanel", () => {
  test("snaps a shrinking panel shut past half the gap by default", () => {
    const panels = [collapsible()]
    expect(resizePanel({ panels, index: 0, size: 11, prevSize: 15 })).toBe(15)
    expect(resizePanel({ panels, index: 0, size: 9, prevSize: 15 })).toBe(5)
  })

  test("uses collapsedThreshold when set", () => {
    const panels = [collapsible({ collapsedThreshold: 2 })]
    // collapses once it's more than 2 below the min
    expect(resizePanel({ panels, index: 0, size: 14, prevSize: 15 })).toBe(15)
    expect(resizePanel({ panels, index: 0, size: 12, prevSize: 15 })).toBe(5)
    // opens once it's more than 2 above the collapsed size
    expect(resizePanel({ panels, index: 0, size: 6, prevSize: 5 })).toBe(5)
    expect(resizePanel({ panels, index: 0, size: 8, prevSize: 5 })).toBe(15)
  })

  test("keeps a disabled panel's size", () => {
    const panels = [{ id: "a", disabled: true }]
    expect(resizePanel({ panels, index: 0, size: 60, prevSize: 30 })).toBe(30)
  })

  test("still fits a disabled panel when there's no previous size", () => {
    const panels = [{ id: "a", disabled: true, maxSize: 50 }]
    expect(resizePanel({ panels, index: 0, size: 60 })).toBe(50)
  })
})

describe("resizeByDelta from a collapsed panel", () => {
  const panels: NormalizedPanelData[] = [collapsible({ collapsedThreshold: 4 }), { id: "b" }]
  const size = [5, 95]
  const drag = (delta: number) =>
    resizeByDelta({ delta, initialSize: size, panels, pivotIndices: [0, 1], prevSize: size, trigger: "mouse-or-touch" })

  test("stays shut until the drag passes the threshold", () => {
    expect(drag(3)).toEqual([5, 95])
  })

  test("opens to the min once it does", () => {
    expect(drag(5)).toEqual([15, 85])
  })
})
