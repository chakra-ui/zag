import { resizeObserverBorderBox } from "@zag-js/dom-query"
import { afterEach, describe, expect, test, vi } from "vitest"
import { TableVirtualizer } from "../src/table-virtualizer"
import { createMockScrollContainer, simulateScroll, mountHeader } from "./test-utils"

afterEach(() => vi.restoreAllMocks())

const viewport = { width: 600, height: 200 }

const scrollHorizontally = (virtualizer: TableVirtualizer, scrollLeft: number) => {
  simulateScroll(virtualizer, { currentTarget: { scrollTop: 0, scrollLeft } })
}

const indexes = (virtualizer: TableVirtualizer) => virtualizer.getVirtualColumns().map((column) => column.index)

describe("table rows", () => {
  test("reserves the space of rows outside the rendered range", () => {
    const virtualizer = new TableVirtualizer({
      count: 100,
      itemSize: 40,
      headerSize: 30,
      initialRect: viewport,
    })

    virtualizer.scrollToOffset(400)
    virtualizer.getVirtualItems()

    expect(virtualizer.getRowSpacerProps("start").style).toEqual({ height: "240px" })
    expect(virtualizer.getRowSpacerProps("end").style).toEqual({ height: "3280px" })
    expect(virtualizer.getBodyProps().style).toEqual({
      position: "sticky",
      top: "-280px",
      bottom: "-310px",
    })
  })

  test("scrolls rows clear of the header", () => {
    const virtualizer = new TableVirtualizer({
      count: 100,
      itemSize: 40,
      headerSize: 30,
    })
    const container = createMockScrollContainer({ viewport })
    virtualizer.init(container.element)

    virtualizer.scrollToIndex(50, { align: "start" })

    expect(container.getScrollTop()).toBe(2000)
  })

  test("takes retained rows out of the table layout", () => {
    const virtualizer = new TableVirtualizer({
      count: 100,
      itemSize: 40,
      retainedIndexes: [0],
      initialRect: viewport,
    })

    virtualizer.scrollToOffset(400)
    const [retained, rendered] = virtualizer.getVirtualItems()

    expect(retained).toMatchObject({ index: 0, isRetained: true })
    expect(virtualizer.getRowProps(retained!).style).toMatchObject({
      position: "absolute",
    })

    expect(rendered).toMatchObject({ isRetained: false })
    expect(virtualizer.getRowProps(rendered!).style).toEqual({})
  })

  test("an empty table reserves no space", () => {
    const virtualizer = new TableVirtualizer({
      count: 0,
      itemSize: 40,
      initialRect: viewport,
    })

    expect(virtualizer.getRowSpacerProps("start").style).toEqual({ height: "0px" })
    expect(virtualizer.getRowSpacerProps("end").style).toEqual({ height: "0px" })
    expect(virtualizer.getBodyProps().style).toEqual({})
  })
})

describe("table header", () => {
  test("changing the header size keeps measured rows", () => {
    const virtualizer = new TableVirtualizer({
      count: 10,
      estimatedItemSize: () => 40,
      initialRect: viewport,
      initialMeasurements: { 5: 100 },
    })

    virtualizer.updateOptions({ headerSize: 50 })

    expect(virtualizer.getItemMetrics(5)).toEqual({
      start: 250,
      size: 100,
      end: 350,
    })
  })

  test("measureHeaderElement syncs the header size", () => {
    let onResize: ((entry: ResizeObserverEntry) => void) | undefined
    vi.spyOn(resizeObserverBorderBox, "observe").mockImplementation((_element, callback) => {
      onResize = callback as typeof onResize
      return vi.fn()
    })

    const virtualizer = new TableVirtualizer({
      count: 10,
      itemSize: 40,
      initialRect: viewport,
    })
    const thead = {
      getBoundingClientRect: () => ({ width: 600, height: 36 }),
    } as HTMLElement

    mountHeader(virtualizer, thead)

    expect(virtualizer.getItemMetrics(0)?.start).toBe(36)

    onResize!({
      borderBoxSize: [{ blockSize: 48, inlineSize: 600 }],
    } as unknown as ResizeObserverEntry)

    expect(virtualizer.getItemMetrics(0)?.start).toBe(48)
  })
})

describe("table columns", () => {
  const createTable = () =>
    new TableVirtualizer({
      count: 100,
      itemSize: 40,
      columnCount: 100,
      columnSize: 100,
      pinnedColumns: { start: 1 },
      initialRect: viewport,
    })

  test("renders pinned columns and the visible window", () => {
    const virtualizer = createTable()

    expect(indexes(virtualizer)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(virtualizer.getColumnSpacerProps("start").style).toMatchObject({
      width: "0px",
    })
    expect(virtualizer.getColumnSpacerProps("end").style).toMatchObject({
      width: "9200px",
    })
    expect(virtualizer.getTableProps().style).toMatchObject({
      tableLayout: "fixed",
      width: "10000px",
    })
  })

  test("windows columns on horizontal scroll", () => {
    const virtualizer = createTable()
    const listener = vi.fn()
    virtualizer.subscribe(listener)

    scrollHorizontally(virtualizer, 1000)

    expect(listener).toHaveBeenCalled()
    expect(indexes(virtualizer)).toEqual([0, 9, 10, 11, 12, 13, 14, 15, 16, 17])
    expect(virtualizer.getColumnSpacerProps("start").style).toMatchObject({
      width: "800px",
    })
    expect(virtualizer.getColumnSpacerProps("end").style).toMatchObject({
      width: "8200px",
    })
  })

  test("does not notify while the column window is unchanged", () => {
    const virtualizer = createTable()
    scrollHorizontally(virtualizer, 1010)

    const listener = vi.fn()
    virtualizer.subscribe(listener)

    scrollHorizontally(virtualizer, 1050)

    expect(listener).not.toHaveBeenCalled()
  })

  test("pinned cells stick to their edge", () => {
    const virtualizer = new TableVirtualizer({
      count: 10,
      itemSize: 40,
      columnCount: 10,
      columnSize: 100,
      pinnedColumns: { start: 1, end: 1 },
      initialRect: viewport,
    })

    const columns = virtualizer.getVirtualColumns()
    const first = columns[0]!
    const last = columns[columns.length - 1]!

    expect(virtualizer.getCellProps(first).style).toEqual({
      position: "sticky",
      insetInlineStart: "0px",
      zIndex: 1,
    })
    expect(virtualizer.getCellProps(last).style).toEqual({
      position: "sticky",
      insetInlineEnd: "0px",
      zIndex: 1,
    })
    expect(virtualizer.getCellProps(columns[1]!).style).toEqual({})
  })

  test("scrollToColumn scrolls a column clear of pinned columns", () => {
    const virtualizer = createTable()
    const container = createMockScrollContainer({ viewport })
    Object.assign(container.element, { clientWidth: 600 })
    virtualizer.init(container.element)

    virtualizer.scrollToColumn(50, { align: "start" })

    expect(container.getScrollLeft()).toBe(4900)
    expect(indexes(virtualizer)).toContain(50)
  })

  test("supports per-column sizes", () => {
    const virtualizer = new TableVirtualizer({
      count: 10,
      itemSize: 40,
      columnCount: 4,
      columnSize: (index) => (index + 1) * 10,
      initialRect: viewport,
    })

    expect(virtualizer.getTotalWidth()).toBe(100)
    expect(virtualizer.getVirtualColumns().map((column) => column.size)).toEqual([10, 20, 30, 40])
  })

  test("column updates keep row measurements", () => {
    const virtualizer = new TableVirtualizer({
      count: 10,
      estimatedItemSize: () => 40,
      columnCount: 10,
      columnSize: 100,
      initialRect: viewport,
      initialMeasurements: { 5: 100 },
    })

    virtualizer.updateOptions({ columnSize: 50 })

    expect(virtualizer.getTotalWidth()).toBe(500)
    expect(virtualizer.getItemMetrics(5)?.size).toBe(100)
  })

  test("re-rendering with equal column options keeps the same columns", () => {
    const virtualizer = createTable()
    const columns = virtualizer.getVirtualColumns()

    virtualizer.updateOptions({ pinnedColumns: { start: 1 }, columnSize: 100 })

    expect(virtualizer.getVirtualColumns()).toBe(columns)
  })

  test("returns stable styles until the column window changes", () => {
    const virtualizer = createTable()
    const [pinned] = virtualizer.getVirtualColumns()
    const spacer = virtualizer.getColumnSpacerProps("end").style

    expect(virtualizer.getCellProps(pinned!).style).toBe(virtualizer.getCellProps(pinned!).style)
    expect(virtualizer.getColumnSpacerProps("end").style).toBe(spacer)

    scrollHorizontally(virtualizer, 1000)

    expect(virtualizer.getColumnSpacerProps("end").style).not.toBe(spacer)
  })

  test("requires columnSize with columnCount", () => {
    expect(() => new TableVirtualizer({ count: 10, itemSize: 40, columnCount: 5 })).toThrow("columnSize")
  })
})

describe("right-to-left table columns", () => {
  const createTable = (dir: "ltr" | "rtl" = "rtl") =>
    new TableVirtualizer({
      count: 100,
      itemSize: 40,
      columnCount: 100,
      columnSize: 100,
      pinnedColumns: { start: 1 },
      dir,
      initialRect: viewport,
    })

  test("windows the same columns as left-to-right from a negative scroll position", () => {
    const rtl = createTable("rtl")
    const ltr = createTable("ltr")

    scrollHorizontally(rtl, -1000)
    scrollHorizontally(ltr, 1000)

    expect(indexes(rtl)).toEqual(indexes(ltr))
  })

  test("scrollToColumn scrolls toward the inline end", () => {
    const virtualizer = createTable()
    const container = createMockScrollContainer({ viewport })
    Object.assign(container.element, { clientWidth: 600 })
    virtualizer.init(container.element)

    virtualizer.scrollToColumn(50, { align: "start" })

    expect(container.getScrollLeft()).toBe(-4900)
    expect(indexes(virtualizer)).toContain(50)
  })

  test("scrollToColumn leaves a visible column where it is", () => {
    const virtualizer = createTable()
    const container = createMockScrollContainer({ viewport })
    Object.assign(container.element, { clientWidth: 600 })
    virtualizer.init(container.element)

    virtualizer.scrollToColumn(3)

    expect(container.getScrollLeft()).toBe(0)
  })
})
