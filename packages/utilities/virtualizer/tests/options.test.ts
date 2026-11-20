import { describe, expect, test, vi } from "vitest"
import { GridVirtualizer } from "../src/grid-virtualizer"
import { ListVirtualizer } from "../src/list-virtualizer"
import { TableVirtualizer } from "../src/table-virtualizer"

const viewport = { width: 600, height: 200 }

// Options passed fresh on every render: new arrays, objects and callbacks with the same meaning
const renderOptions = () => ({
  count: 100,
  retainedIndexes: [3],
  groups: [{ id: "a", startIndex: 0 }],
  indexToKey: (index: number) => `row-${index}`,
})

describe("updating options", () => {
  test("ignores options rebuilt with the same content", () => {
    const virtualizer = new ListVirtualizer({ ...renderOptions(), itemSize: 40, initialRect: viewport })
    const listener = vi.fn()
    virtualizer.subscribe(listener)

    virtualizer.updateOptions(renderOptions())

    expect(listener).not.toHaveBeenCalled()
  })

  test("keeps the latest callback", () => {
    const virtualizer = new ListVirtualizer({ ...renderOptions(), itemSize: 40, initialRect: viewport })

    virtualizer.updateOptions({ indexToKey: (index) => `next-${index}` })

    expect(virtualizer.getVirtualItems()[0]?.key).toBe("next-0")
  })

  test("re-renders when an option's content changes", () => {
    const virtualizer = new ListVirtualizer({ ...renderOptions(), itemSize: 40, initialRect: viewport })
    const listener = vi.fn()
    virtualizer.subscribe(listener)

    virtualizer.updateOptions({ ...renderOptions(), retainedIndexes: [4] })

    expect(listener).toHaveBeenCalled()
  })

  test("grid ignores unchanged options", () => {
    const options = () => ({ rowCount: 50, columnCount: 10, estimatedRowSize: () => 40, estimatedColumnSize: () => 80 })
    const virtualizer = new GridVirtualizer({ ...options(), initialRect: viewport })
    const listener = vi.fn()
    virtualizer.subscribe(listener)

    virtualizer.updateOptions(options())

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("table column sizes", () => {
  const createTable = () =>
    new TableVirtualizer({ count: 10, itemSize: 30, columnCount: 4, columnSize: () => 100, initialRect: viewport })

  test("ignore a new callback that sizes columns the same", () => {
    const virtualizer = createTable()
    const listener = vi.fn()
    virtualizer.subscribe(listener)

    virtualizer.updateOptions({ columnSize: () => 100 })

    expect(listener).not.toHaveBeenCalled()
  })

  test("follow a new callback that resizes a column", () => {
    const virtualizer = createTable()

    virtualizer.updateOptions({ columnSize: (index) => (index === 0 ? 200 : 100) })

    expect(virtualizer.getTotalWidth()).toBe(500)
  })
})
