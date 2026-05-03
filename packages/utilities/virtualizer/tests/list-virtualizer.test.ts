import { describe, expect, test } from "vitest"
import { ListVirtualizer } from "../src/list-virtualizer"

describe("ListVirtualizer", () => {
  test("renders the calculated range by default", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialSize: 30,
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 2])
  })

  test("uses rangeExtractor to customize rendered indexes", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialOffset: 20,
      initialSize: 20,
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
      initialSize: 20,
      rangeExtractor: (range) => {
        ranges.push(range)
        return [range.startIndex, range.endIndex]
      },
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 4])
    expect(ranges).toEqual([{ startIndex: 0, endIndex: 4 }])
  })

  test("sanitizes rangeExtractor results", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialSize: 30,
      rangeExtractor: () => [2, 1, 1, -1, 10, 3.5, Number.NaN, 0],
    })

    expect(virtualizer.getVirtualItems().map((item) => item.index)).toEqual([0, 1, 2])
  })

  test("applies scrollMargin to item transforms", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      overscan: 0,
      initialSize: 30,
      scrollMargin: 8,
    })

    const [item] = virtualizer.getVirtualItems()
    expect(virtualizer.getItemStyle(item).transform).toBe("translate3d(0, -8px, 0)")
  })

  test("applies scrollMargin and scrollPaddingStart to start alignment", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      initialSize: 30,
      scrollMargin: 8,
      scrollPaddingStart: 4,
    })

    expect(virtualizer.scrollToIndex(5, { align: "start" })).toEqual({ scrollTop: 38, scrollLeft: 0 })
  })

  test("applies scrollPaddingEnd to end alignment", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      estimatedSize: () => 10,
      initialSize: 30,
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
        initialSize: 30,
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
      initialSize: 30,
    })

    expect(virtualizer.scrollBy(15)).toEqual({ scrollTop: 35, scrollLeft: 0 })
    expect(virtualizer.scrollBy(-50)).toEqual({ scrollTop: 0, scrollLeft: 0 })
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
})
