import { resizeObserverBorderBox } from "@zag-js/dom-query/observe"
import { afterEach, describe, expect, test, vi } from "vitest"
import { ListVirtualizer } from "../src/list-virtualizer"
import { WindowVirtualizer } from "../src/window-virtualizer"
import { createMockScrollContainer, installAnimationFrameMock, mountItem, mountTrailing } from "./test-utils"

afterEach(() => vi.restoreAllMocks())

describe("fixed-size lists", () => {
  test("numeric estimates are replaced by measurements", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedItemSize: 40,
      initialRect: { width: 600, height: 100 },
      initialMeasurements: { 0: 60 },
    })

    expect(virtualizer.getTotalSize()).toBe(420)
    expect(virtualizer.getVirtualItems()[1]).toMatchObject({
      start: 60,
      size: 40,
    })

    virtualizer.measureItem(1, 25)

    expect(virtualizer.getTotalSize()).toBe(405)
    expect(virtualizer.getVirtualItems()[1]).toMatchObject({
      start: 60,
      size: 25,
    })
    expect(virtualizer.getVirtualItems()[2]?.start).toBe(85)
  })

  test("numeric estimates still measure mounted rows and observe their size", () => {
    const observe = vi.spyOn(resizeObserverBorderBox, "observe").mockReturnValue(vi.fn())
    const measureElement = vi.fn(() => 65)
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedItemSize: 40,
      initialRect: { width: 600, height: 100 },
      measureElement,
    })
    const row = {} as HTMLElement

    mountItem(virtualizer, 0, row)

    expect(measureElement).toHaveBeenCalledWith(row, {
      index: 0,
      orientation: "vertical",
    })
    expect(observe).toHaveBeenCalledOnce()
    expect(virtualizer.getTotalSize()).toBe(425)
    expect(virtualizer.getVirtualItems()[0]?.size).toBe(65)
  })

  test("computes a large list without evaluating estimates or allocating a size tracker", () => {
    const estimate = vi.fn(() => 80)
    const virtualizer = new ListVirtualizer({
      count: 1_000_000,
      itemSize: 40,
      estimatedItemSize: estimate,
      initialRect: { width: 600, height: 400 },
    })

    expect(virtualizer.getTotalSize()).toBe(40_000_000)
    expect(virtualizer.getVirtualItems().length).toBeLessThan(30)
    expect(estimate).not.toHaveBeenCalled()
    expect((virtualizer as any).sizeTracker).toBeUndefined()
  })

  test.each([0, 3.5, 10])("matches estimated-list geometry with gap %s", (gap) => {
    const options = {
      count: 100,
      gap,
      paddingStart: 17,
      paddingEnd: 23,
      initialRect: { width: 600, height: 120 },
      overscan: 2,
    }
    const fixed = new ListVirtualizer({ ...options, itemSize: 26.5 })
    const dynamic = new ListVirtualizer({
      ...options,
      estimatedItemSize: () => 26.5,
    })

    for (const offset of [0, 17, 43.5, 60, 200, 1000, 2600]) {
      fixed.scrollToOffset(offset)
      dynamic.scrollToOffset(offset)

      expect(fixed.getTotalSize()).toBe(dynamic.getTotalSize())
      expect(fixed.getVisibleRange()).toEqual(dynamic.getVisibleRange())
      expect(fixed.getVirtualItems().map(({ index, start, size }) => ({ index, start, size }))).toEqual(
        dynamic.getVirtualItems().map(({ index, start, size }) => ({ index, start, size })),
      )
    }
  })

  test("skips DOM measurement, observers, seeded sizes, and manual size updates", () => {
    const observe = vi.spyOn(resizeObserverBorderBox, "observe").mockReturnValue(vi.fn())
    const measureElement = vi.fn(() => 200)
    const virtualizer = new ListVirtualizer({
      count: 100,
      itemSize: 40,
      initialRect: { width: 600, height: 400 },
      initialMeasurements: { 0: 200, 50: 300 },
      measureElement,
    })
    const listener = vi.fn()
    virtualizer.subscribe(listener)

    const row = {} as HTMLElement
    mountItem(virtualizer, 0, row)
    virtualizer.measureItem(0, 200)
    ;(virtualizer as unknown as { observeElementSize(element: Element, index: number): void }).observeElementSize(
      row,
      0,
    )

    expect(measureElement).not.toHaveBeenCalled()
    expect(observe).not.toHaveBeenCalled()
    expect(listener).not.toHaveBeenCalled()
    expect(virtualizer.getTotalSize()).toBe(4000)
    expect(virtualizer.getVirtualItems()[0]?.size).toBe(40)
  })

  test("switches between dynamic and exact sizes and cleans up item observers", () => {
    const cleanup = vi.fn()
    const observe = vi.spyOn(resizeObserverBorderBox, "observe").mockReturnValue(cleanup)
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedItemSize: () => 20,
      initialRect: { width: 600, height: 100 },
    })
    const row = { offsetHeight: 30 } as HTMLElement
    mountItem(virtualizer, 0, row)
    expect(virtualizer.getTotalSize()).toBe(210)

    virtualizer.updateOptions({ itemSize: 50, gap: 5 })

    expect(cleanup).toHaveBeenCalled()
    expect(virtualizer.getTotalSize()).toBe(545)
    expect(virtualizer.getVirtualItems()[0]?.size).toBe(50)

    virtualizer.updateOptions({ itemSize: undefined, gap: 2 })

    expect(virtualizer.getTotalSize()).toBe(228)
    expect(virtualizer.getVirtualItems()[0]?.size).toBe(30)
    expect(observe).toHaveBeenCalledTimes(2)
  })

  test("updates size, gaps, and count without reusing stale ranges", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      itemSize: 20,
      initialRect: { width: 600, height: 100 },
      overscan: 0,
      preserveScrollAnchor: false,
    })

    virtualizer.updateOptions({ itemSize: 50, gap: 10 })
    expect(virtualizer.getVisibleRange()).toEqual({
      startIndex: 0,
      endIndex: 1,
    })
    expect(virtualizer.getTotalSize()).toBe(590)

    virtualizer.updateOptions({ count: 0, paddingStart: 10, paddingEnd: 15 })
    expect(virtualizer.getVirtualItems()).toEqual([])
    expect(virtualizer.getTotalSize()).toBe(25)

    virtualizer.updateOptions({ count: 1 })
    expect(virtualizer.getTotalSize()).toBe(75)
    expect(virtualizer.getVirtualItems()[0]).toMatchObject({
      start: 10,
      size: 50,
    })
  })

  test("prepends fixed rows while preserving a keyed anchor", () => {
    let items = ["a", "b", "c", "d", "e"]
    const virtualizer = new ListVirtualizer({
      count: items.length,
      itemSize: 30,
      initialRect: { width: 600, height: 60 },
      initialOffset: 65,
      indexToKey: (index) => items[index]!,
      keyToIndex: (key) => items.indexOf(String(key)),
    })
    const anchor = virtualizer.getScrollAnchor()

    items = ["x", "y", ...items]
    virtualizer.prependItems(2)

    expect(virtualizer.getScrollAnchor()).toEqual(anchor)
    expect(virtualizer.getScrollState().offset.y).toBe(125)
    expect(virtualizer.getTotalSize()).toBe(210)
  })

  test("positions horizontal RTL rows with an exact border-box width", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      itemSize: 40,
      orientation: "horizontal",
      dir: "rtl",
      initialRect: { width: 120, height: 100 },
    })

    expect(virtualizer.getItemProps(virtualizer.getVirtualItems()[1]!).style).toMatchObject({
      width: "40px",
      height: "100%",
      boxSizing: "border-box",
      transform: "translate3d(-40px, 0, 0)",
    })
  })

  test("window lists accept exact sizes without an estimate", () => {
    const virtualizer = new WindowVirtualizer({
      count: 100,
      itemSize: 40,
      initialRect: { width: 600, height: 400 },
    })

    expect(virtualizer.getTotalSize()).toBe(4000)
    expect(virtualizer.getVirtualItems()[1]?.start).toBe(40)
  })

  test("cancels dynamic scroll corrections when switching to exact sizes", () => {
    const raf = installAnimationFrameMock()

    try {
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedItemSize: () => 20,
        initialRect: { width: 600, height: 100 },
      })

      virtualizer.scrollToIndex(80, { align: "start" })
      expect(raf.rafQueue).toHaveLength(1)

      virtualizer.updateOptions({ itemSize: 40 })

      const offset = virtualizer.getScrollState().offset.y
      raf.flushNextRaf()

      expect(virtualizer.getScrollState().offset.y).toBe(offset)

      virtualizer.scrollToIndex(90, { align: "start" })

      expect(virtualizer.getScrollState().offset.y).toBe(3600)
      expect(raf.rafQueue).toHaveLength(0)
    } finally {
      raf.restore()
    }
  })

  test.each([0, -1, Number.NaN, Infinity])("rejects invalid exact size %s before changing options", (itemSize) => {
    expect(() => new ListVirtualizer({ count: 10, itemSize })).toThrow("`itemSize`")

    const virtualizer = new ListVirtualizer({ count: 10, itemSize: 40 })
    expect(() => virtualizer.updateOptions({ itemSize })).toThrow("`itemSize`")
    expect(virtualizer.getTotalSize()).toBe(400)
  })
})

const viewport = { width: 600, height: 200 }

describe("scrolling to an item", () => {
  const createList = () => {
    const virtualizer = new ListVirtualizer({ count: 100, itemSize: 40 })
    const container = createMockScrollContainer({ viewport: { width: 600, height: 200 } })
    Object.assign(container.element, { clientHeight: 184 })
    virtualizer.init(container.element)
    return { virtualizer, container }
  }

  test("does not scroll when the item is fully visible", () => {
    const { virtualizer, container } = createList()

    virtualizer.scrollToIndex(3)

    expect(container.getScrollTop()).toBe(0)
  })

  test("reveals an item hidden behind the horizontal scrollbar at the bottom edge", () => {
    const { virtualizer, container } = createList()

    virtualizer.scrollToIndex(4)

    expect(container.getScrollTop()).toBe(16)
  })

  test("reveals an item above the viewport at the top edge", () => {
    const { virtualizer, container } = createList()
    virtualizer.scrollToOffset(1000)

    virtualizer.scrollToIndex(20)

    expect(container.getScrollTop()).toBe(800)
  })
})

describe("trailing content", () => {
  test("adds the trailing element to the total size and places it after the last item", () => {
    let onResize: ((entry: ResizeObserverEntry) => void) | undefined
    const cleanup = vi.fn()
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation((_element, callback) => {
      onResize = callback as typeof onResize
      return cleanup
    })

    const virtualizer = new ListVirtualizer({
      count: 10,
      itemSize: 40,
      paddingEnd: 8,
    })
    const element = {
      getBoundingClientRect: () => ({ width: 600, height: 50 }),
    } as HTMLElement

    mountTrailing(virtualizer, element)

    expect(virtualizer.getTotalSize()).toBe(458)
    expect(virtualizer.getTrailingProps().style.transform).toBe("translate3d(0, 400px, 0)")

    onResize!({
      borderBoxSize: [{ blockSize: 20, inlineSize: 600 }],
    } as unknown as ResizeObserverEntry)

    expect(virtualizer.getTotalSize()).toBe(428)

    mountTrailing(virtualizer, null)

    expect(cleanup).toHaveBeenCalled()
    expect(virtualizer.getTotalSize()).toBe(408)
  })
})

describe("onEndReached", () => {
  const setup = (options: { count: number; endReachedThreshold?: number }) => {
    const onEndReached = vi.fn()
    const virtualizer = new ListVirtualizer({
      ...options,
      itemSize: 40,
      onEndReached,
    })
    virtualizer.init(createMockScrollContainer({ viewport }).element)

    const scrollTo = (offset: number) => {
      virtualizer.scrollToOffset(offset)
      virtualizer.getVirtualItems()
    }

    return { virtualizer, onEndReached, scrollTo }
  }

  test("fires once per arrival at the end", () => {
    const { onEndReached, scrollTo } = setup({ count: 20 })

    scrollTo(0)
    expect(onEndReached).not.toHaveBeenCalled()

    scrollTo(600)
    scrollTo(590)
    expect(onEndReached).toHaveBeenCalledTimes(1)
  })

  test("re-arms after leaving the end", () => {
    const { onEndReached, scrollTo } = setup({ count: 20 })

    scrollTo(600)
    scrollTo(0)
    scrollTo(600)

    expect(onEndReached).toHaveBeenCalledTimes(2)
  })

  test("re-arms when the count grows", () => {
    const { virtualizer, onEndReached, scrollTo } = setup({ count: 20 })

    scrollTo(600)
    virtualizer.updateOptions({ count: 22 })
    virtualizer.getVirtualItems()

    expect(onEndReached).toHaveBeenCalledTimes(2)
  })

  test("endReachedThreshold fires before the last item", () => {
    const { onEndReached, scrollTo } = setup({
      count: 20,
      endReachedThreshold: 12,
    })

    scrollTo(0)

    expect(onEndReached).toHaveBeenCalledTimes(1)
  })
})

describe("geometry", () => {
  test("getItemMetrics works for unmounted items", () => {
    const virtualizer = new ListVirtualizer({
      count: 100,
      itemSize: 40,
      initialRect: viewport,
    })

    expect(virtualizer.getItemMetrics(50)).toEqual({
      start: 2000,
      size: 40,
      end: 2040,
    })
    expect(virtualizer.getItemMetrics(100)).toBeNull()
    expect(virtualizer.getItemMetrics(-1)).toBeNull()
  })

  test("getIndexAtOffset clamps to the list", () => {
    const virtualizer = new ListVirtualizer({
      count: 100,
      itemSize: 40,
      initialRect: viewport,
    })
    const empty = new ListVirtualizer({ count: 0, itemSize: 40 })

    expect(virtualizer.getIndexAtOffset(2010)).toBe(50)
    expect(virtualizer.getIndexAtOffset(1e9)).toBe(99)
    expect(empty.getIndexAtOffset(0)).toBeNull()
  })

  test("remeasure discards measured sizes", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedItemSize: () => 40,
      initialRect: viewport,
      initialMeasurements: { 5: 100 },
    })

    expect(virtualizer.getItemMetrics(5)?.size).toBe(100)

    virtualizer.remeasure()

    expect(virtualizer.getItemMetrics(5)?.size).toBe(40)
  })
})

describe("estimates", () => {
  const measureAll = (virtualizer: ListVirtualizer) => {
    for (const item of virtualizer.getVirtualItems()) {
      mountItem(virtualizer, item!.index, {} as HTMLElement)
    }
  }

  test("a numeric estimate is refined with the average measured size", () => {
    const raf = installAnimationFrameMock()
    vi.spyOn(resizeObserverBorderBox, "observe").mockReturnValue(vi.fn())
    const measureElement = vi.fn(() => 60)

    const virtualizer = new ListVirtualizer({
      count: 100,
      estimatedItemSize: 40,
      initialRect: viewport,
      measureElement,
    })

    measureAll(virtualizer)
    const measured = measureElement.mock.calls.length

    expect(virtualizer.getTotalSize()).toBe(measured * 60 + (100 - measured) * 40)

    raf.flushNextRaf()

    expect(virtualizer.getTotalSize()).toBe(6000)

    raf.restore()
  })

  test("a function estimate is not refined", () => {
    const raf = installAnimationFrameMock()
    vi.spyOn(resizeObserverBorderBox, "observe").mockReturnValue(vi.fn())

    const virtualizer = new ListVirtualizer({
      count: 100,
      estimatedItemSize: () => 40,
      initialRect: viewport,
      measureElement: () => 60,
    })

    measureAll(virtualizer)

    expect(raf.rafQueue).toHaveLength(0)

    raf.restore()
  })

  test("estimatedGroupHeaderSize is added to each group's first item", () => {
    const virtualizer = new ListVirtualizer({
      count: 20,
      estimatedItemSize: 40,
      estimatedGroupHeaderSize: 30,
      groups: [
        { id: "a", startIndex: 0 },
        { id: "b", startIndex: 10, headerSize: 20 },
      ],
      initialRect: viewport,
    })

    expect(virtualizer.getItemMetrics(0)?.size).toBe(70)
    expect(virtualizer.getItemMetrics(10)?.size).toBe(60)
    expect(virtualizer.getTotalSize()).toBe(20 * 40 + 30 + 20)
    expect(virtualizer.getGroupHeaderState(0)?.headerSize).toBe(30)
  })

  test("removing itemSize requires an estimate", () => {
    const virtualizer = new ListVirtualizer({ count: 10, itemSize: 40 })

    expect(() => virtualizer.updateOptions({ itemSize: undefined })).toThrow("estimatedItemSize")

    virtualizer.updateOptions({ itemSize: undefined, estimatedItemSize: 30 })

    expect(virtualizer.getTotalSize()).toBe(300)
  })
})
