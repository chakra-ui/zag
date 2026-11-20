// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, type MockInstance, test, vi } from "vitest"
import { ListVirtualizer } from "../src/list-virtualizer"
import type { ListVirtualizerOptions } from "../src/types"
import { simulateScroll } from "./test-utils"

let warn: MockInstance<typeof console.warn>

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

const warnings = () => warn.mock.calls.map(([message]) => String(message))

function expectWarning(text: string) {
  expect(warnings().filter((message) => message.includes(text))).toHaveLength(1)
}

function expectNoWarnings() {
  expect(warnings()).toEqual([])
}

// jsdom's window is 768px tall
function createContainer(height: number) {
  const element = document.createElement("div")
  document.body.append(element)
  Object.defineProperty(element, "clientHeight", { value: height })
  element.getBoundingClientRect = () => ({ width: 300, height }) as DOMRect
  return element
}

function renderList(options: Partial<ListVirtualizerOptions>, height = 400) {
  const virtualizer = new ListVirtualizer({ count: 100, estimatedItemSize: 40, ...options } as ListVirtualizerOptions)
  const element = createContainer(height)
  virtualizer.init(element)

  return {
    virtualizer,
    element,

    scroll(scrollTop: number) {
      simulateScroll(virtualizer, { currentTarget: { scrollTop, scrollLeft: 0 } })
      vi.runAllTimers()
    },
  }
}

describe("warning about a container that grows to fit its items", () => {
  test("warns when the container is as tall as every item together", () => {
    renderList({ count: 100 }, 4000)

    expectWarning("grows to fit every item")
  })

  test("stays quiet for a container with a fixed height", () => {
    renderList({ count: 100 }, 400)

    expectNoWarnings()
  })

  test("stays quiet for a short list that fits on screen", () => {
    renderList({ count: 5 }, 200)

    expectNoWarnings()
  })
})

describe("warning about items that are never measured", () => {
  test("warns once scrolling ends without any item measured", () => {
    const list = renderList({ estimatedItemSize: 40 })

    list.scroll(400)

    expectWarning("No item has been measured")
  })

  test("stays quiet when items are measured", () => {
    const list = renderList({ estimatedItemSize: 40 })
    list.virtualizer.measureItem(0, 40)

    list.scroll(400)

    expectNoWarnings()
  })

  test("stays quiet for fixed-size items", () => {
    const list = renderList({ itemSize: 40 })

    list.scroll(400)

    expectNoWarnings()
  })

  test("warns for per-item estimates too, since they are measured", () => {
    const list = renderList({ estimatedItemSize: () => 40 })

    list.scroll(400)

    expectWarning("No item has been measured")
  })

  test("warns for grouped lists", () => {
    const list = renderList({
      estimatedItemSize: 40,
      estimatedGroupHeaderSize: 30,
      groups: [{ id: "a", startIndex: 0 }],
    })

    list.scroll(400)

    expectWarning("No item has been measured")
  })
})

describe("warning about duplicate keys", () => {
  test("warns when two rendered items share a key", () => {
    const { virtualizer } = renderList({ itemSize: 40, indexToKey: (index) => (index < 2 ? "same" : index) })

    virtualizer.getVirtualItems()

    expectWarning("returned the same key for two items")
  })

  test("stays quiet for unique keys", () => {
    const { virtualizer } = renderList({ itemSize: 40, indexToKey: (index) => `row-${index}` })

    virtualizer.getVirtualItems()

    expectNoWarnings()
  })
})

describe("setup warnings", () => {
  test("warn once per virtualizer", () => {
    const list = renderList({ estimatedItemSize: 40 })

    list.scroll(400)
    list.scroll(800)

    expectWarning("No item has been measured")
  })

  test("are silent in production", () => {
    vi.stubEnv("NODE_ENV", "production")

    const list = renderList({ count: 100, estimatedItemSize: 40 }, 4000)
    list.scroll(400)

    expectNoWarnings()
  })
})
