import { resizeObserverBorderBox } from "@zag-js/dom-query"
import { afterEach, describe, expect, test, vi } from "vitest"
import { GridVirtualizer } from "../src/grid-virtualizer"
import {
  createMeasuredElement as createElement,
  createMockScrollContainer,
  createResizeObserverEntry,
  installAnimationFrameMock,
} from "./test-utils"

type GridVirtualizerInternals = {
  readonly scrollTop: number
}

function getInternalScrollTop(virtualizer: GridVirtualizer): number {
  return (virtualizer as unknown as GridVirtualizerInternals).scrollTop
}

function createVirtualizer() {
  return new GridVirtualizer({
    rowCount: 3,
    columnCount: 1,
    estimatedRowSize: () => 20,
    estimatedColumnSize: () => 50,
    overscan: 0,
    initialRect: { width: 50, height: 60 },
  })
}

describe("GridVirtualizer", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("ignores stale ResizeObserver callbacks after a row element is replaced", () => {
    const listeners: Array<(entry: ResizeObserverEntry) => void> = []
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation((_element, listener) => {
      listeners.push(listener)
      return vi.fn()
    })

    const virtualizer = createVirtualizer()
    let notifications = 0
    virtualizer.subscribe(() => {
      notifications++
    })

    const [row] = virtualizer.getVirtualRows()
    const staleElement = createElement(20)
    const currentElement = createElement(20)

    row.measureRow(staleElement)
    row.measureRow(currentElement)
    listeners[0]?.(createResizeObserverEntry(staleElement, 80, 50))

    expect(notifications).toBe(0)
  })

  test("notifies subscribers after eager row measurement changes row height", async () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const virtualizer = createVirtualizer()
    let notifications = 0
    virtualizer.subscribe(() => {
      notifications++
    })

    const [row] = virtualizer.getVirtualRows()
    row.measureRow(createElement(40))

    expect(virtualizer.getTotalHeight()).toBe(80)
    expect(notifications).toBe(0)

    await Promise.resolve()

    expect(notifications).toBe(1)
  })

  test("applies function scrollMargin to vertical range, row transforms, and scroll targets", () => {
    let scrollMargin = 10
    const virtualizer = new GridVirtualizer({
      rowCount: 10,
      columnCount: 1,
      estimatedRowSize: () => 10,
      estimatedColumnSize: () => 50,
      overscan: 0,
      initialOffset: 20,
      initialRect: { width: 50, height: 20 },
      scrollMargin: () => scrollMargin,
    })

    let rows = virtualizer.getVirtualRows()
    expect(rows.map((row) => row.row)).toEqual([2, 3, 4])
    expect(virtualizer.getRowStyle(rows[0]!).transform).toBe("translate3d(0, 10px, 0)")

    scrollMargin = 20
    rows = virtualizer.getVirtualRows()
    expect(rows.map((row) => row.row)).toEqual([3, 4, 5])
    expect(virtualizer.scrollToRow(5)).toEqual({ scrollTop: 30 })
    expect(virtualizer.scrollToCell(5, 0)).toEqual({ scrollTop: 30, scrollLeft: 0 })
  })

  test("batches row ResizeObserver measurements into one animation frame", () => {
    const listeners: Array<(entry: ResizeObserverEntry) => void> = []
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation((_element, listener) => {
      listeners.push(listener)
      return vi.fn()
    })

    const { rafQueue, flushNextRaf, restore } = installAnimationFrameMock()

    try {
      const virtualizer = createVirtualizer()
      let notifications = 0
      virtualizer.subscribe(() => {
        notifications++
      })

      const rows = virtualizer.getVirtualRows()
      const elements = [createElement(20), createElement(20), createElement(20)]
      rows.forEach((row, index) => {
        row.measureRow(elements[index]!)
      })

      listeners[0]?.(createResizeObserverEntry(elements[0]!, 30, 50))
      listeners[1]?.(createResizeObserverEntry(elements[1]!, 40, 50))
      listeners[2]?.(createResizeObserverEntry(elements[2]!, 50, 50))

      expect(rafQueue).toHaveLength(1)
      expect(virtualizer.getTotalHeight()).toBe(60)
      expect(notifications).toBe(0)

      flushNextRaf()

      expect(virtualizer.getTotalHeight()).toBe(120)
      expect(notifications).toBe(1)
    } finally {
      restore()
    }
  })

  test("destroy cancels pending row ResizeObserver measurement flush", () => {
    const listeners: Array<(entry: ResizeObserverEntry) => void> = []
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation((_element, listener) => {
      listeners.push(listener)
      return vi.fn()
    })

    const { rafQueue, cancelled, flushNextRaf, restore } = installAnimationFrameMock()

    try {
      const virtualizer = createVirtualizer()
      let notifications = 0
      virtualizer.subscribe(() => {
        notifications++
      })

      const [row] = virtualizer.getVirtualRows()
      const element = createElement(20)
      row!.measureRow(element)

      listeners[0]?.(createResizeObserverEntry(element, 50, 50))

      expect(rafQueue).toHaveLength(1)
      virtualizer.destroy()
      flushNextRaf()

      expect(cancelled.size).toBe(1)
      expect(virtualizer.getTotalHeight()).toBe(60)
      expect(notifications).toBe(0)
    } finally {
      restore()
    }
  })

  test("updateOptions remeasures tracked rows after resetting measurements", () => {
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation(() => vi.fn())

    const virtualizer = createVirtualizer()
    const [row] = virtualizer.getVirtualRows()

    row.measureRow(createElement(35))
    expect(virtualizer.getTotalHeight()).toBe(75)

    virtualizer.updateOptions({ rowCount: 4 })

    expect(virtualizer.getTotalHeight()).toBe(95)
  })

  test("reports range change reasons", () => {
    const changes: Array<{ range: { startIndex: number; endIndex: number }; reason: string }> = []
    const virtualizer = new GridVirtualizer({
      rowCount: 10,
      columnCount: 1,
      estimatedRowSize: () => 10,
      estimatedColumnSize: () => 50,
      overscan: 0,
      initialRect: { width: 50, height: 30 },
      onRangeChange: ({ range, reason }) => {
        changes.push({ range: { ...range }, reason })
      },
    })

    virtualizer.setViewportSize(50, 30)
    virtualizer.handleScroll({ currentTarget: { scrollTop: 20, scrollLeft: 0 } })
    virtualizer.updateOptions({ rowCount: 3 })
    virtualizer.updateOptions({ overscan: 1 })

    expect(changes.map((change) => change.reason)).toEqual(["resize", "scroll", "count", "manual"])
  })

  test("fires onScrollEnd once after scrolling settles", () => {
    vi.useFakeTimers()

    try {
      const onScrollEnd = vi.fn()
      const virtualizer = new GridVirtualizer({
        rowCount: 100,
        columnCount: 1,
        estimatedRowSize: () => 10,
        estimatedColumnSize: () => 50,
        initialRect: { width: 50, height: 30 },
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
      const virtualizer = new GridVirtualizer({
        rowCount: 100,
        columnCount: 1,
        estimatedRowSize: () => 10,
        estimatedColumnSize: () => 50,
        initialRect: { width: 50, height: 30 },
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

  test("disables native scroll anchoring on the scroll container by default", () => {
    const virtualizer = createVirtualizer()

    expect(virtualizer.getContainerStyle().overflowAnchor).toBe("none")

    virtualizer.updateOptions({ overflowAnchor: "auto" })
    expect(virtualizer.getContainerStyle().overflowAnchor).toBe("auto")
  })

  test("applies initialOffset on init and retries once when clamped", () => {
    const { rafQueue, flushNextRaf, restore } = installAnimationFrameMock()
    const { element, getScrollToCount } = createMockScrollContainer({
      viewport: { width: 50, height: 60 },
      firstScrollToTop: 20,
    })

    try {
      const virtualizer = new GridVirtualizer({
        rowCount: 10,
        columnCount: 1,
        estimatedRowSize: () => 20,
        estimatedColumnSize: () => 50,
        overscan: 0,
        initialRect: { width: 50, height: 60 },
        initialOffset: 80,
      })

      expect(getInternalScrollTop(virtualizer)).toBe(80)

      virtualizer.init(element)

      expect(getScrollToCount()).toBe(1)
      expect(element.scrollTop).toBe(20)
      expect(rafQueue.length).toBe(1)

      flushNextRaf()

      expect(getScrollToCount()).toBe(2)
      expect(element.scrollTop).toBe(80)
    } finally {
      restore()
    }
  })
})
