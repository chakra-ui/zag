import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { ListVirtualizer } from "../src/list-virtualizer"
import { type AnimationFrameMock, createMockScrollContainer, installAnimationFrameMock } from "./test-utils"

const VIEWPORT_SIZE = 200
const ROW_SIZE = 40

let raf: AnimationFrameMock

beforeEach(() => {
  raf = installAnimationFrameMock()
})

afterEach(() => {
  raf.restore()
})

/**
 * Plays the part of the browser after each render: rows in the rendered window report
 * their real size, then pending frames run so the virtualizer can settle.
 */
function renderList(estimatedItemSize: number | (() => number)) {
  const container = createMockScrollContainer({ viewport: { width: 300, height: VIEWPORT_SIZE } })
  const virtualizer = new ListVirtualizer({ count: 500, estimatedItemSize })
  virtualizer.init(container.element)

  const paint = () => {
    for (let frame = 0; frame < 10; frame++) {
      for (const item of virtualizer.getVirtualItems()) {
        if (item.size !== ROW_SIZE) virtualizer.measureItem(item.index, ROW_SIZE)
      }
      if (raf.rafQueue.length === 0) break
      raf.flushNextRaf()
    }
  }

  paint()

  return {
    virtualizer,
    paint,

    /** The row's edges relative to the viewport. */
    getRow(index: number) {
      const metrics = virtualizer.getItemMetrics(index)!
      const scrollTop = container.getScrollTop()
      return { top: metrics.start - scrollTop, bottom: metrics.end - scrollTop }
    },
  }
}

describe.each([
  ["a fixed", 20],
  ["a per-item", () => 20],
] as const)("keyboard navigation with %s estimate at half the row size", (_, estimatedItemSize) => {
  test("keeps the active row fully visible moving down", () => {
    const list = renderList(estimatedItemSize)

    for (let index = 1; index <= 300; index++) {
      list.virtualizer.scrollToIndex(index)
      list.paint()

      const row = list.getRow(index)
      expect(row.top, `row ${index}`).toBeGreaterThanOrEqual(0)
      expect(row.bottom, `row ${index}`).toBeLessThanOrEqual(VIEWPORT_SIZE)
    }
  })

  test("keeps the active row fully visible moving back up", () => {
    const list = renderList(estimatedItemSize)
    list.virtualizer.scrollToIndex(300)
    list.paint()

    for (let index = 299; index >= 0; index--) {
      list.virtualizer.scrollToIndex(index)
      list.paint()

      const row = list.getRow(index)
      expect(row.top, `row ${index}`).toBeGreaterThanOrEqual(0)
      expect(row.bottom, `row ${index}`).toBeLessThanOrEqual(VIEWPORT_SIZE)
    }
  })

  test("only scrolls once the active row reaches an edge", () => {
    const list = renderList(estimatedItemSize)
    const rowsPerViewport = VIEWPORT_SIZE / ROW_SIZE

    for (let index = 1; index < rowsPerViewport; index++) {
      list.virtualizer.scrollToIndex(index)
      list.paint()
    }

    expect(list.getRow(0).top).toBe(0)
  })

  test("lands a jump to a distant row at the bottom edge", () => {
    const list = renderList(estimatedItemSize)

    list.virtualizer.scrollToIndex(250)
    list.paint()

    expect(list.getRow(250).bottom).toBe(VIEWPORT_SIZE)
  })
})
