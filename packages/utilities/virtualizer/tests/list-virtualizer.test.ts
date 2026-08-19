import { resizeObserverBorderBox } from "@zag-js/dom-query"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { ListVirtualizer } from "../src/list-virtualizer"
import {
  type AnimationFrameMock,
  createMeasuredElement,
  createMockScrollContainer,
  createResizeObserverEntry,
  installAnimationFrameMock,
} from "./test-utils"

function initialRect(height: number) {
  return { width: 0, height }
}

function horizontalRect(width: number) {
  return { width, height: 0 }
}

type RtlScrollMode = "negative" | "positive-descending" | "positive-ascending"

function createRtlHorizontalContainer(mode: RtlScrollMode, maxScroll = 200) {
  let logicalOffset = 0
  const clamp = (value: number) => Math.max(0, Math.min(maxScroll, value))
  const toRaw = (logical: number) => {
    switch (mode) {
      case "negative":
        return -logical
      case "positive-descending":
        return maxScroll - logical
      default:
        return logical
    }
  }
  const fromRaw = (raw: number) => {
    switch (mode) {
      case "negative":
        return -raw
      case "positive-descending":
        return maxScroll - raw
      default:
        return raw
    }
  }

  const element = {
    scrollTop: 0,
    clientWidth: 100,
    scrollWidth: maxScroll + 100,
    get scrollLeft() {
      return toRaw(logicalOffset)
    },
    set scrollLeft(value: number) {
      logicalOffset = clamp(fromRaw(value))
    },
    getBoundingClientRect: () => ({ width: 100, height: 20 }),
    scrollTo: ({ left }: ScrollToOptions) => {
      if (typeof left === "number") {
        element.scrollLeft = left
      }
    },
  } as unknown as HTMLElement

  return {
    element,
    getRawScrollLeft: () => element.scrollLeft,
  }
}

describe("ListVirtualizer", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("renders the calculated range by default", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 2])
  })

  test("keeps list layout even when legacy lanes option is passed", () => {
    const virtualizer = new ListVirtualizer({
      count: 6,
      estimatedSize: () => 20,
      overscan: 0,
      initialRect: { width: 300, height: 60 },
      ...({ lanes: 3 } as any),
    } as any)

    const items = virtualizer.getVirtualItems()

    expect(items.map((item) => item.lane)).toEqual([0, 0, 0])
    expect(virtualizer.getItemStyle(items[1]!).transform).toBe("translate3d(0, 20px, 0)")
    expect(virtualizer.getTotalSize()).toBe(120)
  })

  test("applies initialMeasurements seeds before initial range calculation", () => {
    const keys = ["item-0", "item-1", "item-2", "item-3", "item-4"]
    const virtualizer = new ListVirtualizer({
      count: keys.length,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(25),
      indexToKey: (index) => keys[index]!,
      initialMeasurements: new Map<string | number, number>([
        ["item-0", 40],
        ["item-1", 30],
      ]),
    })

    expect(virtualizer.getTotalSize()).toBe(100)
    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 0, endIndex: 0 })
    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0])
  })

  test("measureItem overrides seeded initialMeasurements", () => {
    const virtualizer = new ListVirtualizer({
      count: 5,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(25),
      initialMeasurements: { 0: 40, 1: 30 },
    })

    expect(virtualizer.getTotalSize()).toBe(100)
    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 0, endIndex: 0 })

    virtualizer.measureItem(0, 15)

    expect(virtualizer.getTotalSize()).toBe(75)
    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 0, endIndex: 1 })
    expect(virtualizer.getVirtualItems()[0]?.size).toBe(15)
  })

  test("uses rangeExtractor to customize rendered indexes", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialOffset: 20,
      initialRect: initialRect(20),
      rangeExtractor: (range) => [range.startIndex - 1, range.startIndex, range.endIndex, 8],
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 3, 8])
  })

  test("passes the overscanned range to rangeExtractor", () => {
    const ranges: Array<{ startIndex: number; endIndex: number }> = []
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 1,
      initialOffset: 20,
      initialRect: initialRect(20),
      rangeExtractor: (range) => {
        ranges.push(range)
        return [range.startIndex, range.endIndex]
      },
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 4])
    expect(ranges).toEqual([{ startIndex: 0, endIndex: 4 }])
  })

  test("passes scroll velocity and direction to rangeExtractor", () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    try {
      const contexts: Array<{ velocity: number; direction: "forward" | "backward" | null }> = []
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 10,
        overscan: 0,
        initialRect: initialRect(30),
        rangeExtractor: (range, context) => {
          contexts.push(context)
          const extraAfter =
            context.direction === "forward" && context.velocity > 2 ? [range.endIndex + 1, range.endIndex + 2] : []
          return [range.startIndex, range.endIndex, ...extraAfter]
        },
      })

      expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 2])
      expect(contexts.at(-1)).toEqual({ velocity: 0, direction: null })

      vi.advanceTimersByTime(50)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 100, scrollLeft: 0 } })
      vi.advanceTimersByTime(50)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 250, scrollLeft: 0 } })

      expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([24, 27, 28, 29])
      expect(contexts.at(-1)).toEqual({ velocity: 3, direction: "forward" })
    } finally {
      vi.useRealTimers()
    }
  })

  test("uses orientation for horizontal scrolling", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: horizontalRect(30),
      orientation: "horizontal",
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 2])
    expect(virtualizer.getContentStyle()).toMatchObject({ width: 100, height: "100%" })
    expect(virtualizer.scrollToIndex(5, { align: "start" })).toEqual({ scrollLeft: 50, scrollTop: 0 })
    expect(virtualizer.getScrollState()).toMatchObject({
      offset: { x: 50, y: 0 },
      direction: { x: "forward", y: "idle" },
    })
  })

  test("uses dir for horizontal RTL positioning and rangeExtractor direction", () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    try {
      const contexts: Array<{ velocity: number; direction: "forward" | "backward" | null }> = []
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 10,
        overscan: 0,
        initialRect: horizontalRect(30),
        orientation: "horizontal",
        dir: "rtl",
        rangeExtractor: (range, context) => {
          contexts.push(context)
          return [range.startIndex, range.endIndex]
        },
      })

      const [, second] = virtualizer.getVirtualItems()
      expect(virtualizer.getItemStyle(second!).transform).toBe("translate3d(-20px, 0, 0)")

      vi.advanceTimersByTime(10)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 0, scrollLeft: 10 } })
      vi.advanceTimersByTime(10)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 0, scrollLeft: 30 } })
      virtualizer.getVirtualItems()

      expect(contexts.at(-1)).toEqual({ velocity: 2, direction: "backward" })
    } finally {
      vi.useRealTimers()
    }
  })

  test.each([
    ["negative", -60],
    ["positive-descending", 140],
    ["positive-ascending", 60],
  ] as const)("normalizes RTL scroll writes for %s mode", (mode, expectedRawScrollLeft) => {
    const virtualizer = new ListVirtualizer({
      count: 20,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: horizontalRect(30),
      orientation: "horizontal",
      dir: "rtl",
    })
    const { element, getRawScrollLeft } = createRtlHorizontalContainer(mode)
    virtualizer.init(element)

    expect(virtualizer.scrollToOffset(60)).toEqual({ scrollLeft: 60, scrollTop: 0 })
    expect(getRawScrollLeft()).toBe(expectedRawScrollLeft)
  })

  test("normalizes RTL negative-mode scroll events into logical offsets", () => {
    const virtualizer = new ListVirtualizer({
      count: 20,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: horizontalRect(30),
      orientation: "horizontal",
      dir: "rtl",
    })
    const { element } = createRtlHorizontalContainer("negative")
    virtualizer.init(element)

    // Prime RTL mode detection from the attached scroll element.
    virtualizer.scrollToOffset(1)
    virtualizer.handleScroll({ currentTarget: { scrollTop: 0, scrollLeft: -40 } })

    expect(virtualizer.getScrollState().offset.x).toBe(40)
  })

  test("resets rangeExtractor motion context after scroll end", () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    try {
      const contexts: Array<{ velocity: number; direction: "forward" | "backward" | null }> = []
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 10,
        overscan: 0,
        initialRect: initialRect(30),
        scrollEndDelay: 100,
        rangeExtractor: (range, context) => {
          contexts.push(context)
          return [range.startIndex, range.endIndex]
        },
      })

      vi.advanceTimersByTime(10)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 100, scrollLeft: 0 } })
      vi.advanceTimersByTime(10)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 150, scrollLeft: 0 } })
      virtualizer.getVirtualItems()

      expect(contexts.at(-1)).toEqual({ velocity: 5, direction: "forward" })

      vi.advanceTimersByTime(100)
      virtualizer.updateOptions({ overscan: 1 })
      virtualizer.getVirtualItems()

      expect(contexts.at(-1)).toEqual({ velocity: 0, direction: null })
    } finally {
      vi.useRealTimers()
    }
  })

  test("starts rangeExtractor motion context from a clean baseline after idle", () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)

    try {
      const contexts: Array<{ velocity: number; direction: "forward" | "backward" | null }> = []
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 10,
        overscan: 0,
        initialRect: initialRect(30),
        scrollEndDelay: 100,
        rangeExtractor: (range, context) => {
          contexts.push(context)
          return [range.startIndex, range.endIndex]
        },
      })

      vi.advanceTimersByTime(10)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 100, scrollLeft: 0 } })
      virtualizer.getVirtualItems()

      expect(contexts.at(-1)).toEqual({ velocity: 0, direction: null })

      vi.advanceTimersByTime(10)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 150, scrollLeft: 0 } })
      virtualizer.getVirtualItems()

      expect(contexts.at(-1)).toEqual({ velocity: 5, direction: "forward" })

      vi.advanceTimersByTime(5100)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 170, scrollLeft: 0 } })
      virtualizer.getVirtualItems()

      expect(contexts.at(-1)).toEqual({ velocity: 0, direction: null })
    } finally {
      vi.useRealTimers()
    }
  })

  test("reports range change reasons", async () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const changes: Array<{ range: { startIndex: number; endIndex: number }; reason: string }> = []
    const { element } = createMockScrollContainer({ viewport: { width: 100, height: 30 } })
    const virtualizer = new ListVirtualizer({
      count: 100,
      estimatedSize: () => 10,
      overscan: 0,
      onRangeChange: ({ range, reason }) => {
        changes.push({ range: { ...range }, reason })
      },
    })

    virtualizer.init(element)
    virtualizer.handleScroll({ currentTarget: { scrollTop: 20, scrollLeft: 0 } })
    virtualizer.updateOptions({ count: 3 })
    virtualizer.updateOptions({ overscan: 1 })

    const measured = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      onRangeChange: ({ range, reason }) => {
        changes.push({ range: { ...range }, reason })
      },
    })
    measured.init(element)
    measured.getVirtualItems()[0]!.measureElement(createMeasuredElement(50))
    await Promise.resolve()

    expect(changes.map((change) => change.reason)).toEqual(["resize", "scroll", "count", "manual", "measurement"])
    expect(changes.at(-1)).toEqual({ range: { startIndex: 0, endIndex: 0 }, reason: "measurement" })
  })

  test("fires onScrollEnd once after scrolling settles", () => {
    vi.useFakeTimers()

    try {
      const onScrollEnd = vi.fn()
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 10,
        initialRect: initialRect(30),
        scrollEndDelay: 100,
        onScrollEnd,
      })

      virtualizer.handleScroll({ currentTarget: { scrollTop: 20, scrollLeft: 0 } })
      vi.advanceTimersByTime(50)
      virtualizer.handleScroll({ currentTarget: { scrollTop: 40, scrollLeft: 0 } })
      vi.advanceTimersByTime(99)

      expect(onScrollEnd).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)

      expect(onScrollEnd).toHaveBeenCalledTimes(1)
      expect(onScrollEnd).toHaveBeenLastCalledWith({
        offset: { x: 0, y: 40 },
        direction: { x: "idle", y: "forward" },
        isScrolling: false,
      })
    } finally {
      vi.useRealTimers()
    }
  })

  test("does not fire onScrollEnd after destroy", () => {
    vi.useFakeTimers()

    try {
      const onScrollEnd = vi.fn()
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 10,
        initialRect: initialRect(30),
        scrollEndDelay: 100,
        onScrollEnd,
      })

      virtualizer.handleScroll({ currentTarget: { scrollTop: 20, scrollLeft: 0 } })
      virtualizer.destroy()
      vi.advanceTimersByTime(100)

      expect(onScrollEnd).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  test("exposes visible and rendered range metadata", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 1,
      initialOffset: 20,
      initialRect: initialRect(20),
    })

    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 1, endIndex: 3 })
    expect(virtualizer.getRenderedRange()).toEqual({ startIndex: 0, endIndex: 4 })
    expect(
      virtualizer.getVirtualItems().map((item) => ({
        index: item.index,
        isVisible: item.isVisible,
        isOverscan: item.isOverscan,
      })),
    ).toEqual([
      { index: 0, isVisible: false, isOverscan: "before" },
      { index: 1, isVisible: true, isOverscan: false },
      { index: 2, isVisible: true, isOverscan: false },
      { index: 3, isVisible: true, isOverscan: false },
      { index: 4, isVisible: false, isOverscan: "after" },
    ])
  })

  test("sanitizes rangeExtractor results", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      rangeExtractor: () => [2, 1, 1, -1, 10, 3.5, Number.NaN, 0],
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 2])
  })

  test("applies scrollMargin to item transforms", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      scrollMargin: 8,
    })

    const [item] = virtualizer.getVirtualItems()
    expect(virtualizer.getItemStyle(item).transform).toBe("translate3d(0, -8px, 0)")
  })

  test("applies scrollMargin to visible and rendered range metadata", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 1,
      initialOffset: 20,
      initialRect: initialRect(20),
      scrollMargin: 10,
    })

    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 2, endIndex: 4 })
    expect(virtualizer.getRenderedRange()).toEqual({ startIndex: 1, endIndex: 5 })
    expect(
      virtualizer.getVirtualItems().map((item) => ({
        index: item.index,
        isVisible: item.isVisible,
        isOverscan: item.isOverscan,
      })),
    ).toEqual([
      { index: 1, isVisible: false, isOverscan: "before" },
      { index: 2, isVisible: true, isOverscan: false },
      { index: 3, isVisible: true, isOverscan: false },
      { index: 4, isVisible: true, isOverscan: false },
      { index: 5, isVisible: false, isOverscan: "after" },
    ])
  })

  test("resolves function scrollMargin lazily", () => {
    let scrollMargin = 8
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      scrollMargin: () => scrollMargin,
    })

    const [item] = virtualizer.getVirtualItems()
    expect(virtualizer.getItemStyle(item).transform).toBe("translate3d(0, -8px, 0)")

    scrollMargin = 12
    expect(virtualizer.scrollToIndex(5, { align: "start" })).toEqual({ scrollTop: 38, scrollLeft: 0 })
  })

  test("recalculates visible range when function scrollMargin changes", () => {
    let scrollMargin = 0
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      scrollMargin: () => scrollMargin,
    })

    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 0, endIndex: 2 })
    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 2])

    scrollMargin = 20

    expect(virtualizer.getVisibleRange()).toEqual({ startIndex: 1, endIndex: 4 })
    expect(virtualizer.getRenderedRange()).toEqual({ startIndex: 1, endIndex: 4 })
    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([1, 2, 3, 4])
  })

  test("applies scrollMargin and scrollPaddingStart to start alignment", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      initialRect: initialRect(30),
      scrollMargin: 8,
      scrollPaddingStart: 4,
    })

    expect(virtualizer.scrollToIndex(5, { align: "start" })).toEqual({ scrollTop: 38, scrollLeft: 0 })
  })

  test("applies scrollPaddingEnd to end alignment", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      initialRect: initialRect(30),
      scrollPaddingEnd: 6,
    })

    expect(virtualizer.scrollToIndex(5, { align: "end" })).toEqual({ scrollTop: 36, scrollLeft: 0 })
  })

  test("uses scroll padding for auto alignment visibility checks", () => {
    const createVirtualizer = () =>
      new ListVirtualizer({
        count: 10,
        estimatedSize: () => 10,
        initialOffset: 20,
        initialRect: initialRect(30),
        scrollPaddingStart: 6,
        scrollPaddingEnd: 4,
      })

    expect(createVirtualizer().scrollToIndex(2, { align: "auto" })).toEqual({ scrollTop: 14, scrollLeft: 0 })
    expect(createVirtualizer().scrollToIndex(3, { align: "auto" })).toEqual({ scrollTop: 20 })
    expect(createVirtualizer().scrollToIndex(5, { align: "auto" })).toEqual({ scrollTop: 34, scrollLeft: 0 })
  })

  test("scrollBy scrolls relative to the current offset", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      initialOffset: 20,
      initialRect: initialRect(30),
    })

    expect(virtualizer.scrollBy(15)).toEqual({ scrollTop: 35, scrollLeft: 0 })
    expect(virtualizer.scrollBy(-50)).toEqual({ scrollTop: 0, scrollLeft: 0 })
  })

  test("applies initialOffset on init and retries once when clamped", () => {
    const { rafQueue, flushNextRaf, restore } = installAnimationFrameMock()
    const { element, getScrollToCount } = createMockScrollContainer({ firstScrollToTop: 100 })

    try {
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 20,
        initialRect: initialRect(200),
        initialOffset: 500,
      })

      virtualizer.init(element)

      expect(getScrollToCount()).toBe(1)
      expect(element.scrollTop).toBe(100)
      expect(rafQueue.length).toBe(1)

      flushNextRaf()

      expect(getScrollToCount()).toBe(2)
      expect(element.scrollTop).toBe(500)
      expect(virtualizer.getScrollState().offset.y).toBe(500)
    } finally {
      restore()
    }
  })

  test("skips initialOffset DOM writes when disableScrollOnInit is true", () => {
    const { element, getScrollToCount } = createMockScrollContainer()

    const virtualizer = new ListVirtualizer({
      count: 100,
      estimatedSize: () => 20,
      initialRect: initialRect(200),
      initialOffset: 500,
      disableScrollOnInit: true,
    })

    virtualizer.init(element)

    expect(getScrollToCount()).toBe(0)
    expect(virtualizer.getScrollState().offset.y).toBe(500)
  })

  test("disables native scroll anchoring on the scroll container by default", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      initialRect: initialRect(30),
    })

    expect(virtualizer.getContainerStyle().overflowAnchor).toBe("none")

    virtualizer.updateOptions({ overflowAnchor: "auto" })
    expect(virtualizer.getContainerStyle().overflowAnchor).toBe("auto")
  })

  test("preserves a keyed visible anchor when count updates after prepend", () => {
    const initialItems = ["a", "b", "c", "d", "e", "f"]
    const nextItems = ["x", "y", ...initialItems]

    const virtualizer = new ListVirtualizer({
      count: initialItems.length,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      indexToKey: (index) => initialItems[index]!,
      keyToIndex: (key) => initialItems.indexOf(key as string),
    })

    virtualizer.scrollToOffset(25)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: "c", offset: 5 })

    virtualizer.updateOptions({
      count: nextItems.length,
      indexToKey: (index) => nextItems[index]!,
      keyToIndex: (key) => nextItems.indexOf(key as string),
    })

    expect(virtualizer.getScrollState().offset.y).toBe(45)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: "c", offset: 5 })
  })

  test("prependItems preserves a keyed visible anchor after data is prepended", () => {
    const initialItems = ["a", "b", "c", "d", "e", "f"]
    let items = initialItems

    const virtualizer = new ListVirtualizer({
      count: items.length,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      indexToKey: (index) => items[index]!,
      keyToIndex: (key) => items.indexOf(key as string),
    })

    virtualizer.scrollToOffset(25)

    items = ["x", "y", ...initialItems]
    virtualizer.prependItems(2)

    expect(virtualizer.getScrollState().offset.y).toBe(45)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: "c", offset: 5 })
  })

  test("prependItems restores by stable key instead of shifted index", () => {
    const initialItems = [
      { id: 100, size: 10 },
      { id: 101, size: 15 },
      { id: 102, size: 20 },
      { id: 103, size: 25 },
    ]
    let items = initialItems

    const virtualizer = new ListVirtualizer({
      count: items.length,
      estimatedSize: (index) => items[index]?.size ?? 10,
      overscan: 0,
      initialRect: initialRect(30),
      indexToKey: (index) => items[index]!.id,
      keyToIndex: (key) => items.findIndex((item) => item.id === key),
    })

    virtualizer.scrollToOffset(30)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: 102, offset: 5 })

    items = [{ id: 200, size: 12 }, { id: 201, size: 18 }, ...initialItems]
    virtualizer.prependItems(2)

    expect(virtualizer.getScrollState().offset.y).toBe(60)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: 102, offset: 5 })
  })

  test("keeps the visible anchor stable when prepended items are later measured", () => {
    const initialItems = ["a", "b", "c", "d", "e", "f"]
    let items = initialItems

    const virtualizer = new ListVirtualizer({
      count: items.length,
      estimatedSize: () => 20,
      overscan: 0,
      initialRect: initialRect(60),
      indexToKey: (index) => items[index]!,
      keyToIndex: (key) => items.indexOf(key as string),
    })

    virtualizer.scrollToOffset(70)

    items = ["x", "y", ...initialItems]
    virtualizer.prependItems(2)

    expect(virtualizer.getScrollState().offset.y).toBe(110)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: "d", offset: 10 })

    virtualizer.measureItem(0, 30)
    expect(virtualizer.getScrollState().offset.y).toBe(120)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: "d", offset: 10 })

    virtualizer.measureItem(1, 10)
    expect(virtualizer.getScrollState().offset.y).toBe(110)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: "d", offset: 10 })
  })

  test("lets shouldAdjustScrollOnSizeChange disable and re-enable compensation", () => {
    const initialItems = ["a", "b", "c", "d", "e", "f"]
    let items = initialItems
    let shouldAdjust = false
    const adjustmentKeys: Array<string | number> = []

    const virtualizer = new ListVirtualizer({
      count: items.length,
      estimatedSize: () => 20,
      overscan: 0,
      initialRect: initialRect(60),
      indexToKey: (index) => items[index]!,
      keyToIndex: (key) => items.indexOf(key as string),
      shouldAdjustScrollOnSizeChange: ({ key }) => {
        adjustmentKeys.push(key)
        return shouldAdjust
      },
    })

    virtualizer.scrollToOffset(70)
    items = ["x", "y", ...initialItems]
    virtualizer.prependItems(2)

    expect(virtualizer.getScrollState().offset.y).toBe(110)

    virtualizer.measureItem(0, 30)
    expect(virtualizer.getScrollState().offset.y).toBe(110)

    shouldAdjust = true
    virtualizer.measureItem(1, 30)
    expect(virtualizer.getScrollState().offset.y).toBe(120)
    expect(adjustmentKeys).toEqual(["x", "y"])
  })

  test("prependItems does not restore an anchor when preserveScrollAnchor is false", () => {
    const initialItems = ["a", "b", "c", "d", "e", "f"]
    let items = initialItems

    const virtualizer = new ListVirtualizer({
      count: items.length,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      preserveScrollAnchor: false,
      indexToKey: (index) => items[index]!,
      keyToIndex: (key) => items.indexOf(key as string),
    })

    virtualizer.scrollToOffset(25)

    items = ["x", "y", ...initialItems]
    virtualizer.prependItems(2)

    expect(virtualizer.getScrollState().offset.y).toBe(25)
    expect(virtualizer.getScrollAnchor()).toEqual({ key: "a", offset: 5 })
  })

  test("preserves groups initialized during construction", () => {
    const virtualizer = new ListVirtualizer({
      count: 100,
      estimatedSize: () => 40,
      groups: [
        { id: "group-0", startIndex: 0, headerSize: 32 },
        { id: "group-1", startIndex: 50, headerSize: 32 },
      ],
    })

    expect(virtualizer.getGroupForIndex(0)?.id).toBe("group-0")
    expect(virtualizer.getGroupForIndex(75)?.id).toBe("group-1")
    expect(virtualizer.getGroupHeaderState(0, 32)?.group.id).toBe("group-0")
  })

  test("supports sticky group opt-out", () => {
    const virtualizer = new ListVirtualizer({
      count: 100,
      estimatedSize: () => 40,
      initialRect: initialRect(120),
      groups: [
        { id: "group-0", startIndex: 0, headerSize: 32 },
        { id: "group-1", startIndex: 10, headerSize: 32, sticky: false },
        { id: "group-2", startIndex: 20, headerSize: 32 },
      ],
    })

    virtualizer.scrollToOffset(450)
    expect(virtualizer.getStickyGroupHeader()?.group.id).toBeUndefined()

    virtualizer.scrollToOffset(850)
    expect(virtualizer.getStickyGroupHeader()?.group.id).toBe("group-2")
  })

  test("forceUpdate remeasures tracked elements after resetting measurements", () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const virtualizer = new ListVirtualizer({
      count: 3,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
    })

    const [item] = virtualizer.getVirtualItems()
    const element = createMeasuredElement(25)

    item.measureElement(element)
    expect(virtualizer.getTotalSize()).toBe(45)

    virtualizer.forceUpdate()

    expect(virtualizer.getTotalSize()).toBe(45)
  })

  test("batches ResizeObserver measurements into one animation frame", () => {
    const listeners: Array<(entry: ResizeObserverEntry) => void> = []
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation((_element, listener) => {
      listeners.push(listener)
      return vi.fn()
    })

    const { rafQueue, flushNextRaf, restore } = installAnimationFrameMock()

    try {
      const virtualizer = new ListVirtualizer({
        count: 3,
        estimatedSize: () => 10,
        overscan: 0,
        initialRect: initialRect(30),
      })
      let notifications = 0
      virtualizer.subscribe(() => {
        notifications++
      })

      const elements = [createMeasuredElement(10), createMeasuredElement(10), createMeasuredElement(10)]

      virtualizer.getVirtualItems().forEach((item, index) => {
        item.measureElement(elements[index]!)
      })

      listeners[0]?.(createResizeObserverEntry(elements[0]!, 20))
      listeners[1]?.(createResizeObserverEntry(elements[1]!, 30))
      listeners[2]?.(createResizeObserverEntry(elements[2]!, 40))

      expect(rafQueue).toHaveLength(1)
      expect(virtualizer.getTotalSize()).toBe(30)
      expect(notifications).toBe(0)

      flushNextRaf()

      expect(virtualizer.getTotalSize()).toBe(90)
      expect(notifications).toBe(1)
    } finally {
      restore()
    }
  })

  test("destroy cancels pending ResizeObserver measurement flush", () => {
    const listeners: Array<(entry: ResizeObserverEntry) => void> = []
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation((_element, listener) => {
      listeners.push(listener)
      return vi.fn()
    })

    const { rafQueue, cancelled, flushNextRaf, restore } = installAnimationFrameMock()

    try {
      const virtualizer = new ListVirtualizer({
        count: 1,
        estimatedSize: () => 10,
        overscan: 0,
        initialRect: initialRect(10),
      })
      let notifications = 0
      virtualizer.subscribe(() => {
        notifications++
      })

      const [item] = virtualizer.getVirtualItems()
      const element = createMeasuredElement(10)
      item!.measureElement(element)

      listeners[0]?.(createResizeObserverEntry(element, 40))

      expect(rafQueue).toHaveLength(1)
      virtualizer.destroy()
      flushNextRaf()

      expect(cancelled.size).toBe(1)
      expect(virtualizer.getTotalSize()).toBe(10)
      expect(notifications).toBe(0)
    } finally {
      restore()
    }
  })

  test("destroy prevents queued sync measurement notification", async () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const virtualizer = new ListVirtualizer({
      count: 1,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: { width: 100, height: 10 },
    })
    let notifications = 0
    virtualizer.subscribe(() => {
      notifications++
    })

    const [item] = virtualizer.getVirtualItems()
    const element = createMeasuredElement(40)

    item!.measureElement(element)
    virtualizer.destroy()

    await Promise.resolve()

    expect(notifications).toBe(0)
  })

  test("destroy prevents queued sync measurement onRangeChange callback", async () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const onRangeChange = vi.fn()
    const virtualizer = new ListVirtualizer({
      count: 1,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: { width: 100, height: 10 },
      onRangeChange,
    })

    const [item] = virtualizer.getVirtualItems()
    item!.measureElement(createMeasuredElement(40))
    virtualizer.destroy()

    await Promise.resolve()

    expect(onRangeChange).not.toHaveBeenCalled()
  })

  test("uses measureElement override for zero-sized elements and eager remeasure", () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const contexts: Array<{ index: number; orientation: "vertical" | "horizontal" }> = []
    const virtualizer = new ListVirtualizer({
      count: 3,
      estimatedSize: () => 10,
      overscan: 0,
      initialRect: initialRect(30),
      measureElement: (element, context) => {
        contexts.push(context)
        return Number((element as any).dataset.size)
      },
    })

    const [item] = virtualizer.getVirtualItems()
    const element = { offsetHeight: 0, offsetWidth: 0, dataset: { size: "40" } } as unknown as HTMLElement

    item!.measureElement(element)
    expect(virtualizer.getTotalSize()).toBe(60)

    element.dataset.size = "55"
    virtualizer.forceUpdate()
    expect(virtualizer.getTotalSize()).toBe(75)

    expect(contexts.some((context) => context.orientation === "vertical")).toBe(true)
  })

  describe("scrollToIndex convergence pass", () => {
    let rafQueue: Array<() => void> = []
    let flushNextRaf: () => void
    let rafMock: AnimationFrameMock

    beforeEach(() => {
      rafMock = installAnimationFrameMock()
      rafQueue = rafMock.rafQueue
      flushNextRaf = rafMock.flushNextRaf
    })

    afterEach(() => {
      rafMock.restore()
    })

    test("corrects scroll offset when measurements shift after the initial scroll", () => {
      // preserveScrollAnchor: false so we exercise the convergence path, not
      // the auto-anchor compensation path.
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 40,
        overscan: 0,
        initialRect: initialRect(200),
        preserveScrollAnchor: false,
      })

      const first = virtualizer.scrollToIndex(50, { align: "start" })
      // All-estimated: 50 × 40 = 2000
      expect(first).toEqual({ scrollTop: 2000, scrollLeft: 0 })

      // Simulate item 5 being measured larger than estimated (80 vs 40, +40 delta)
      // — shifts target offset for index 50 to 2040.
      virtualizer.measureItem(5, 80)

      // Drain the convergence RAF — should detect drift and re-scroll.
      expect(rafQueue.length).toBe(1)
      flushNextRaf()

      expect(virtualizer.getScrollState().offset.y).toBe(2040)
    })

    test("skips convergence when settle is false", () => {
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 40,
        overscan: 0,
        initialRect: initialRect(200),
      })

      virtualizer.scrollToIndex(50, { align: "start", settle: false })
      expect(rafQueue.length).toBe(0)
    })

    test("treats smooth scroll as best-effort by default", () => {
      const { element } = createMockScrollContainer({ omitScrollTo: true })

      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 40,
        overscan: 0,
        initialRect: initialRect(200),
      })

      ;(globalThis as any).requestAnimationFrame = undefined
      ;(globalThis as any).cancelAnimationFrame = undefined

      virtualizer.init(element)
      virtualizer.scrollToIndex(50, { align: "start", smooth: true })

      expect(rafQueue.length).toBe(0)
    })

    test("caps convergence attempts", () => {
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 40,
        overscan: 0,
        initialRect: initialRect(200),
        preserveScrollAnchor: false,
      })

      virtualizer.scrollToIndex(50, { align: "start" })

      virtualizer.measureItem(5, 80)
      flushNextRaf()
      expect(virtualizer.getScrollState().offset.y).toBe(2040)

      virtualizer.measureItem(6, 80)
      flushNextRaf()
      expect(virtualizer.getScrollState().offset.y).toBe(2080)

      virtualizer.measureItem(7, 80)
      expect(rafQueue.length).toBe(0)
      expect(virtualizer.getScrollState().offset.y).toBe(2080)
    })

    test("does not apply stale convergence after a later scroll command", () => {
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 40,
        overscan: 0,
        initialRect: initialRect(200),
        preserveScrollAnchor: false,
      })

      virtualizer.scrollToIndex(50, { align: "start" })
      virtualizer.measureItem(5, 80)

      virtualizer.scrollBy(-1990)
      expect(virtualizer.getScrollState().offset.y).toBe(10)

      flushNextRaf()

      expect(virtualizer.getScrollState().offset.y).toBe(10)
    })

    test("cancels convergence after destroy", () => {
      const virtualizer = new ListVirtualizer({
        count: 100,
        estimatedSize: () => 40,
        overscan: 0,
        initialRect: initialRect(200),
        preserveScrollAnchor: false,
      })

      virtualizer.scrollToIndex(50, { align: "start" })
      virtualizer.measureItem(5, 80)

      virtualizer.destroy()
      flushNextRaf()

      expect(virtualizer.getScrollState().offset.y).toBe(2000)
    })
  })
})
