import { describe, expect, test } from "vitest"
import { ListCollection, PageListCollection } from "../src"

interface Item {
  value: string
  label: string
  parent?: string | undefined
  page?: boolean | undefined
  disabled?: boolean | undefined
}

const item = (value: string, parent?: string, extra: Partial<Item> = {}): Item => ({
  value,
  label: value,
  parent,
  ...extra,
})

const items: Item[] = [
  item("theme"),
  item("light", "theme"),
  item("dark", "theme", { disabled: true }),
  item("contrast", "theme"),
  item("high", "contrast"),
  item("projects", undefined, { page: true }),
  item("orphan", "missing"),
]

const create = () => new PageListCollection({ items })
const values = (list: Item[]) => list.map((item) => item.value)

describe("PageListCollection / structure", () => {
  test("shows the top-level items, including those with a missing parent", () => {
    const collection = create()
    expect(collection.page).toBeNull()
    expect(values(collection.items)).toEqual(["theme", "projects", "orphan"])
    expect(collection.allItems).toHaveLength(items.length)
  })

  test("is a list collection of the open page", () => {
    const collection = create().setPage("theme")
    expect(collection).toBeInstanceOf(ListCollection)
    expect(collection.firstValue).toBe("light")
    expect(collection.getNextValue("light")).toBe("contrast")
    expect(collection.find("high")).toBeNull()
    expect(collection.getItem("high")?.value).toBe("high")
  })

  test("opens the initial page", () => {
    expect(new PageListCollection({ items, page: "contrast" }).items.map((i) => i.value)).toEqual(["high"])
    expect(new PageListCollection({ items, page: "nope" }).page).toBeNull()
  })

  test("children, descendants, ancestors and path", () => {
    const collection = create().setPage("theme")
    expect(values(collection.getChildren())).toEqual(["light", "dark", "contrast"])
    expect(values(collection.getChildren(null))).toEqual(["theme", "projects", "orphan"])
    expect(values(collection.getDescendants())).toEqual(["light", "dark", "contrast", "high"])

    const high = collection.getItem("high")!
    expect(values(collection.getAncestors(high))).toEqual(["contrast"])
    expect(values(collection.getAncestors(high, null))).toEqual(["theme", "contrast"])
    expect(values(collection.setPage("contrast").getPath())).toEqual(["theme", "contrast"])
    expect(create().getPath()).toEqual([])
  })

  test("isPage", () => {
    const collection = create()
    expect(collection.isPage(collection.getItem("theme")!)).toBe(true)
    expect(collection.isPage(collection.getItem("projects")!)).toBe(true)
    expect(collection.isPage(collection.getItem("light")!)).toBe(false)
  })

  test("setItems keeps the page and history", () => {
    const collection = create().setPage("theme").setItems([items[3]])
    expect(collection).toBeInstanceOf(PageListCollection)
    expect(collection.page).toBe("theme")
    expect(values(collection.items)).toEqual(["contrast"])
    expect(collection.back().page).toBeNull()
  })

  test("custom accessors", () => {
    const collection = new PageListCollection({
      items: [{ id: "a" }, { id: "b", up: "a" }],
      itemToValue: (item) => item.id,
      itemToParent: (item) => item.up,
    })
    expect(collection.setPage("a").items).toEqual([{ id: "b", up: "a" }])
  })

  test("survives cycles", () => {
    const collection = new PageListCollection({
      items: [item("a", "b"), item("b", "a")],
    })
    expect(collection.items).toEqual([])
    expect(collection.getDescendants("a")).toHaveLength(2)
    expect(collection.getAncestors(collection.getItem("a")!, null)).toHaveLength(2)
  })
})

describe("PageListCollection / navigation", () => {
  test("opening a page records history and restores nothing", () => {
    const collection = create().setPage("theme", "the")
    expect(collection.page).toBe("theme")
    expect(collection.canGoBack).toBe(true)
    expect(collection.restore).toEqual({ query: "", highlightedValue: null })
  })

  test("going back restores the query and highlights the page we came from", () => {
    const deep = create().setPage("theme", "the").setPage("contrast", "con")
    const back = deep.back("hi")
    expect(back.page).toBe("theme")
    expect(back.restore).toEqual({ query: "con", highlightedValue: "contrast" })

    const root = back.back()
    expect(root.page).toBeNull()
    expect(root.restore).toEqual({ query: "the", highlightedValue: "theme" })
    expect(root.canGoBack).toBe(false)
    expect(root.back()).toBe(root)
  })

  test("going back after a jump restores the query and highlights the opened page", () => {
    const jumped = create().setPage("projects").setPage("high")
    expect(jumped.back().restore).toEqual({ query: "", highlightedValue: "high" })

    // deep-search hit from the top level
    const root = create().setPage("high", "hi").back()
    expect(root.page).toBeNull()
    expect(root.restore).toEqual({ query: "hi", highlightedValue: "high" })
  })

  test("going up follows the parent, not the history", () => {
    const up = create().setPage("contrast").up()
    expect(up.page).toBe("theme")
    expect(up.restore.highlightedValue).toBe("contrast")
    expect(create().up().page).toBeNull()
  })

  test("going to a visited page drops the history after it", () => {
    const collection = create().setPage("theme").setPage("contrast").setPage(null)
    expect(collection.canGoBack).toBe(false)
  })

  test("jumping across pages restores nothing", () => {
    const collection = create().setPage("theme", "x").setPage("projects", "y")
    expect(collection.restore).toEqual({ query: "", highlightedValue: null })
    expect(collection.back().page).toBe("theme")
  })

  test("ignores the current page and unknown pages", () => {
    const collection = create()
    expect(collection.setPage(null)).toBe(collection)
    expect(collection.setPage("nope")).toBe(collection)
  })

  test("reset forgets the history", () => {
    const collection = create().setPage("theme").setPage("contrast").reset()
    expect(collection.page).toBeNull()
    expect(collection.canGoBack).toBe(false)
    expect(create().reset("theme").page).toBe("theme")
  })

  test("does not mutate the previous collection", () => {
    const collection = create()
    collection.setPage("theme", "q")
    expect(collection.page).toBeNull()
    expect(collection.canGoBack).toBe(false)
  })
})
