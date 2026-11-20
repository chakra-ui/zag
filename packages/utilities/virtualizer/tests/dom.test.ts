// @vitest-environment jsdom
import { createNormalizer } from "@zag-js/types"
import { afterEach, describe, expect, test, vi } from "vitest"
import { ListVirtualizer } from "../src/list-virtualizer"
import { TableVirtualizer } from "../src/table-virtualizer"

afterEach(() => {
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

const flushMutations = () => new Promise((resolve) => setTimeout(resolve))

function applyProps(element: HTMLElement, props: Record<string, any>) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "style") Object.assign(element.style, value)
    else if (value != null) element.setAttribute(key, String(value))
  }
  return element
}

// Each item reports the height in its `data-size`
const measureElement = (element: HTMLElement) => Number(element.dataset.size)

async function renderList(options: { count?: number; estimatedItemSize?: number; id?: string } = {}) {
  const virtualizer = new ListVirtualizer({ count: 100, estimatedItemSize: 20, measureElement, ...options })

  const root = applyProps(document.createElement("div"), virtualizer.getRootProps())
  Object.defineProperty(root, "clientHeight", { value: 200 })
  root.getBoundingClientRect = () => ({ width: 300, height: 200 }) as DOMRect
  const content = applyProps(document.createElement("div"), virtualizer.getContentProps())
  root.append(content)
  document.body.append(root)

  const render = () => {
    content.replaceChildren(
      ...virtualizer.getVirtualItems().map((item) => {
        const element = applyProps(document.createElement("div"), virtualizer.getItemProps(item))
        element.dataset.size = "40"
        return element
      }),
    )
  }

  virtualizer.init(root)
  render()
  await flushMutations()

  return { virtualizer, root, content, render }
}

describe("scrolling", () => {
  test("follows the container's scroll without a handler being attached", async () => {
    const { virtualizer, root } = await renderList({ estimatedItemSize: 40 })

    root.scrollTop = 2000
    root.dispatchEvent(new Event("scroll"))

    expect(virtualizer.getRange().startIndex).toBeGreaterThan(40)
  })

  test("stops listening once destroyed", async () => {
    const { virtualizer, root } = await renderList({ estimatedItemSize: 40 })
    const before = virtualizer.getSnapshot()

    virtualizer.destroy()
    root.scrollTop = 2000
    root.dispatchEvent(new Event("scroll"))

    expect(virtualizer.getSnapshot()).toBe(before)
  })
})

describe("measuring rendered items", () => {
  test("measures rendered items", async () => {
    const { virtualizer } = await renderList()

    expect(virtualizer.getItemMetrics(1)).toEqual({ start: 40, size: 40, end: 80 })
  })

  test("measures items rendered later", async () => {
    const { virtualizer, root, content, render } = await renderList()

    root.scrollTop = 1200
    root.dispatchEvent(new Event("scroll"))
    render()
    await flushMutations()

    const index = Number((content.firstElementChild as HTMLElement).dataset.index)
    expect(index).toBeGreaterThan(20)
    expect(virtualizer.getItemMetrics(index)?.size).toBe(40)
  })

  test("re-measures a node a framework reuses for another item", async () => {
    const { virtualizer, content } = await renderList()
    const node = content.firstElementChild as HTMLElement

    node.dataset.size = "70"
    node.dataset.index = "50"
    await flushMutations()

    expect(virtualizer.getItemMetrics(50)?.size).toBe(70)
  })

  test("ignores the items of another virtualizer nested inside", async () => {
    const outer = await renderList({ id: "outer" })
    const inner = new ListVirtualizer({
      count: 10,
      estimatedItemSize: 20,
      id: "inner",
      measureElement,
      initialRect: { width: 300, height: 100 },
    })
    const nested = applyProps(document.createElement("div"), inner.getItemProps(inner.getVirtualItems()[0]!))
    nested.dataset.size = "500"
    outer.content.firstElementChild!.append(nested)
    await flushMutations()

    expect(outer.virtualizer.getItemMetrics(0)?.size).toBe(40)
  })

  test("measures trailing content", async () => {
    const { virtualizer, content } = await renderList({ count: 3 })
    const trailing = applyProps(document.createElement("div"), virtualizer.getTrailingProps())
    trailing.getBoundingClientRect = () => ({ width: 300, height: 30 }) as DOMRect
    content.append(trailing)
    await flushMutations()

    expect(virtualizer.getTotalSize()).toBe(3 * 40 + 30)
  })
})

describe("prop getters", () => {
  test("stamp the virtualizer's id so its elements can be found", () => {
    const virtualizer = new ListVirtualizer({
      count: 10,
      itemSize: 20,
      id: "people",
      initialRect: { width: 300, height: 100 },
    })

    expect(virtualizer.getItemProps(virtualizer.getVirtualItems()[0]!)).toMatchObject({
      "data-virtualizer-item": "people",
      "data-index": 0,
    })
  })

  test("run through normalizeProps", () => {
    const normalizeProps = createNormalizer((props) => ({ ...props, normalized: true }))
    const virtualizer = new ListVirtualizer({ count: 10, itemSize: 20, normalizeProps })

    expect(virtualizer.getRootProps()).toMatchObject({ normalized: true })
  })
})

describe("table header", () => {
  test("is measured so rows scroll clear of it", async () => {
    const virtualizer = new TableVirtualizer({ count: 50, itemSize: 30 })
    const root = document.createElement("div")
    const table = applyProps(document.createElement("table"), virtualizer.getTableProps())
    const thead = applyProps(document.createElement("thead"), virtualizer.getHeaderProps())
    thead.getBoundingClientRect = () => ({ width: 300, height: 36 }) as DOMRect
    table.append(thead)
    root.append(table)
    document.body.append(root)

    virtualizer.init(root)

    expect(virtualizer.getItemMetrics(0)?.start).toBe(36)
  })
})
