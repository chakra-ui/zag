import { resizeObserverBorderBox } from "@zag-js/dom-query"
import { afterEach, describe, expect, test, vi } from "vitest"
import { WaterfallVirtualizer } from "../src/waterfall-virtualizer"
import { createMeasuredElement } from "./test-utils"

type WaterfallInternals = {
  readonly measuredSizeCache: Map<number, number>
  readonly laneItemIndices: number[][]
  readonly laneItemStarts: number[][]
  readonly laneItemEnds: number[][]
  readonly itemColumns: number[]
}

function createVirtualizer(
  options: Partial<ConstructorParameters<typeof WaterfallVirtualizer>[0]> = {},
): WaterfallVirtualizer {
  return new WaterfallVirtualizer({
    count: 6,
    estimatedSize: () => 80,
    overscan: 0,
    initialRect: { width: 320, height: 220 },
    ...options,
  })
}

function getExpectedRange(
  items: Array<{ index: number; start: number; end: number }>,
  viewportStart: number,
  viewportEnd: number,
) {
  const visible = items.filter((item) => item.end > viewportStart && item.start < viewportEnd)
  if (visible.length > 0) {
    return {
      startIndex: Math.min(...visible.map((item) => item.index)),
      endIndex: Math.max(...visible.map((item) => item.index)),
    }
  }

  let nearestIndex = 0
  let nearestStart = Number.NEGATIVE_INFINITY
  for (const item of items) {
    if (viewportStart >= item.start && viewportStart < item.end) {
      return { startIndex: item.index, endIndex: item.index }
    }
    if (item.start <= viewportStart && item.start >= nearestStart) {
      nearestStart = item.start
      nearestIndex = item.index
    }
  }
  return { startIndex: nearestIndex, endIndex: nearestIndex }
}

describe("WaterfallVirtualizer", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("places items in the shortest column", () => {
    const sizes = [100, 60, 80, 70, 90, 50]
    const virtualizer = createVirtualizer({
      count: sizes.length,
      estimatedSize: (index) => sizes[index]!,
      columnCount: 2,
      columnGap: 12,
      rowGap: 6,
      initialRect: { width: 480, height: 1000 },
    })

    const items = virtualizer.getVirtualItems()

    expect(items.map((item) => item.lane)).toEqual([0, 1, 1, 0, 1, 0])
    expect(items.map((item) => item.start)).toEqual([0, 0, 66, 106, 152, 182])
  })

  test("keeps visibility correct with tall interleaved items", () => {
    const sizes = [300, 80, 80, 80, 80, 80]
    const virtualizer = createVirtualizer({
      count: sizes.length,
      estimatedSize: (index) => sizes[index]!,
      columnCount: 2,
      rowGap: 10,
      initialRect: { width: 300, height: 120 },
    })

    virtualizer.scrollToOffset(180)

    const visibleIndexes = virtualizer
      .getVirtualItems()
      .filter((item) => item.isVisible)
      .map((item) => item.index)

    expect(visibleIndexes).toEqual([0, 3, 4])
  })

  test("measured lane assignment can reassign lanes after measurements", () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const virtualizer = createVirtualizer({
      count: 4,
      estimatedSize: () => 100,
      columnCount: 2,
      laneAssignment: "measured",
      rowGap: 0,
      initialRect: { width: 300, height: 800 },
    })

    const initial = virtualizer.getVirtualItems()
    expect(initial[2]?.lane).toBe(0)
    expect(initial[2]?.start).toBe(100)

    initial[0]?.measureElement(createMeasuredElement(200))

    const next = virtualizer.getVirtualItems()
    expect(next[2]?.lane).toBe(1)
    expect(next[2]?.start).toBe(100)
  })

  test("preserve lane assignment keeps prior lanes when columns are unchanged", () => {
    const virtualizer = createVirtualizer({
      count: 6,
      estimatedSize: () => 100,
      columnCount: 2,
      laneAssignment: "preserve",
      rowGap: 0,
      initialRect: { width: 300, height: 1000 },
    })

    const initial = virtualizer.getVirtualItems()
    expect(initial.map((item) => item.lane)).toEqual([0, 1, 0, 1, 0, 1])

    virtualizer.measureItem(1, 300)

    const next = virtualizer.getVirtualItems()
    expect(next[3]?.lane).toBe(1)
    expect(next[3]?.start).toBe(300)
  })

  test("preserve lane assignment falls back when prior lane is invalid", () => {
    const virtualizer = createVirtualizer({
      count: 6,
      estimatedSize: () => 100,
      columnCount: 3,
      laneAssignment: "preserve",
      rowGap: 0,
      initialRect: { width: 480, height: 1000 },
    })

    const initial = virtualizer.getVirtualItems()
    expect(initial.map((item) => item.lane)).toEqual([0, 1, 2, 0, 1, 2])

    virtualizer.updateOptions({ columnCount: 2 })
    virtualizer.measureItem(1, 180)

    const next = virtualizer.getVirtualItems()
    expect(next.map((item) => item.lane)).toEqual([0, 1, 0, 1, 0, 1])
    expect(next[2]?.lane).toBe(0)
    expect(next[5]?.lane).toBe(1)
    expect(next.every((item) => item.lane >= 0 && item.lane < 2)).toBe(true)
  })

  test("relayouts forward from dirty index without re-estimating earlier items", () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const estimateCalls = Array.from({ length: 6 }, () => 0)
    const virtualizer = createVirtualizer({
      count: 6,
      estimatedSize: (index) => {
        estimateCalls[index]! += 1
        return 100
      },
      columnCount: 2,
      rowGap: 0,
      initialRect: { width: 320, height: 1000 },
    })

    const initial = virtualizer.getVirtualItems()
    expect(initial).toHaveLength(6)
    const baselineCalls = [...estimateCalls]

    initial[3]?.measureElement(createMeasuredElement(180))
    const next = virtualizer.getVirtualItems()

    expect(next).toHaveLength(6)
    expect(estimateCalls[0]).toBe(baselineCalls[0])
    expect(estimateCalls[1]).toBe(baselineCalls[1])
    expect(estimateCalls[2]).toBe(baselineCalls[2])
    // `measureElement` computes scroll adjustment against the previous known size.
    // For the first live measurement at this index, that comparison uses one estimate.
    expect(estimateCalls[3]).toBe((baselineCalls[3] ?? 0) + 1)
    expect(estimateCalls[4]).toBe((baselineCalls[4] ?? 0) + 1)
    expect(estimateCalls[5]).toBe((baselineCalls[5] ?? 0) + 1)
  })

  test("keeps range and visibility correct after multiple size updates", () => {
    const sizes = [120, 90, 80, 70, 100, 60, 110, 95]
    const virtualizer = createVirtualizer({
      count: sizes.length,
      estimatedSize: (index) => sizes[index]!,
      columnCount: 2,
      rowGap: 8,
      overscan: 0,
      initialRect: { width: 320, height: 2000 },
    })

    virtualizer.measureItem(1, 170)
    virtualizer.measureItem(4, 150)
    virtualizer.measureItem(6, 60)

    const allItems = virtualizer.getVirtualItems().map((item) => ({
      index: item.index,
      start: item.start,
      end: item.end,
    }))
    expect(allItems).toHaveLength(sizes.length)

    virtualizer.setViewportSize(120)

    for (const offset of [0, 40, 120, 210, 280]) {
      virtualizer.scrollToOffset(offset)
      const viewportEnd = offset + 120
      const expected = getExpectedRange(allItems, offset, viewportEnd)
      expect(virtualizer.getVisibleRange()).toEqual(expected)
    }
  })

  test("recomputes columns when width changes with minColumnWidth", () => {
    const virtualizer = createVirtualizer({
      count: 8,
      estimatedSize: () => 80,
      minColumnWidth: 120,
      columnGap: 10,
      initialRect: { width: 250, height: 400 },
    })

    expect(virtualizer.getWaterfallState().columnCount).toBe(2)

    virtualizer.setCrossAxisSize(400)

    const state = virtualizer.getWaterfallState()
    expect(state.columnCount).toBe(3)

    const firstThree = virtualizer.getVirtualItems().slice(0, 3)
    expect(firstThree.map((item) => item.lane)).toEqual([0, 1, 2])
  })

  test("scrollToIndex targets item start in waterfall layout", () => {
    const sizes = [100, 60, 80, 70, 90, 50]
    const virtualizer = createVirtualizer({
      count: sizes.length,
      estimatedSize: (index) => sizes[index]!,
      columnCount: 2,
      rowGap: 10,
      initialRect: { width: 320, height: 120 },
    })

    expect(virtualizer.scrollToIndex(3, { align: "start" })).toEqual({ scrollTop: 110, scrollLeft: 0 })
    expect(virtualizer.getScrollState().offset.y).toBe(110)
  })

  test("applies keyed initialMeasurements before initial waterfall layout", () => {
    const keys = ["a", "b", "c", "d"]
    const virtualizer = createVirtualizer({
      count: keys.length,
      estimatedSize: () => 100,
      columnCount: 2,
      rowGap: 0,
      initialRect: { width: 320, height: 400 },
      indexToKey: (index) => keys[index]!,
      initialMeasurements: new Map<string | number, number>([
        ["a", 220],
        ["b", 80],
      ]),
    })

    const items = virtualizer.getVirtualItems()

    expect(items.map((item) => item.lane)).toEqual([0, 1, 1, 1])
    expect(items.map((item) => item.start)).toEqual([0, 0, 80, 180])
    expect(virtualizer.getTotalSize()).toBe(280)
  })

  test("measureItem overrides waterfall initialMeasurements and relayouts downstream items", () => {
    const virtualizer = createVirtualizer({
      count: 4,
      estimatedSize: () => 100,
      columnCount: 2,
      rowGap: 0,
      initialRect: { width: 320, height: 400 },
      initialMeasurements: { 0: 220, 1: 80 },
    })

    expect(virtualizer.getVirtualItems().map((item) => item.lane)).toEqual([0, 1, 1, 1])
    expect(virtualizer.getTotalSize()).toBe(280)

    virtualizer.measureItem(1, 260)

    const next = virtualizer.getVirtualItems()
    expect(next.map((item) => item.lane)).toEqual([0, 1, 0, 1])
    expect(next.map((item) => item.start)).toEqual([0, 0, 220, 260])
    expect(next[1]?.size).toBe(260)
    expect(virtualizer.getTotalSize()).toBe(360)
  })

  test("destroy clears waterfall lane and measurement caches", () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const virtualizer = createVirtualizer({
      count: 4,
      estimatedSize: () => 100,
      columnCount: 2,
      rowGap: 0,
      initialRect: { width: 320, height: 400 },
    })

    const [item] = virtualizer.getVirtualItems()
    item!.measureElement(createMeasuredElement(180))

    const internals = virtualizer as unknown as WaterfallInternals
    expect(internals.itemColumns.length).toBeGreaterThan(0)
    expect(internals.laneItemIndices.some((lane) => lane.length > 0)).toBe(true)
    expect(internals.measuredSizeCache.size).toBe(1)

    virtualizer.destroy()

    expect(internals.itemColumns).toEqual([])
    expect(internals.laneItemIndices).toEqual([[]])
    expect(internals.laneItemStarts).toEqual([[]])
    expect(internals.laneItemEnds).toEqual([[]])
    expect(internals.measuredSizeCache.size).toBe(0)
  })
})
