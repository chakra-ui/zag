import { describe, expect, test } from "vitest"
import { createPageState, PageTree, type PageState } from "../src"

interface Item {
  value: string
  parent?: string
  page?: boolean
}

const items: Item[] = [
  { value: "theme" },
  { value: "light", parent: "theme" },
  { value: "dark", parent: "theme" },
  { value: "contrast", parent: "theme" },
  { value: "high", parent: "contrast" },
  { value: "projects", page: true },
  { value: "orphan", parent: "missing" },
]

const tree = new PageTree({ items })
const values = (list: Item[]) => list.map((item) => item.value)

const walk = (state: PageState, steps: Array<(state: PageState) => ReturnType<typeof tree.navigate>>) => {
  for (const step of steps) {
    const change = step(state)
    if (!change) throw new Error("expected a page change")
    state = change.state
  }
  return state
}

describe("PageTree / structure", () => {
  test("top-level items include those with a missing parent", () => {
    expect(values(tree.getChildren(null))).toEqual(["theme", "projects", "orphan"])
  })

  test("children and descendants", () => {
    expect(values(tree.getChildren("theme"))).toEqual(["light", "dark", "contrast"])
    expect(values(tree.getDescendants("theme"))).toEqual(["light", "dark", "contrast", "high"])
    expect(tree.getDescendants(null)).toHaveLength(items.length)
  })

  test("isPage", () => {
    expect(tree.isPage(tree.find("theme")!)).toBe(true)
    expect(tree.isPage(tree.find("projects")!)).toBe(true)
    expect(tree.isPage(tree.find("light")!)).toBe(false)
  })

  test("ancestors and path", () => {
    const high = tree.find("high")!
    expect(values(tree.getAncestors(high))).toEqual(["theme", "contrast"])
    expect(values(tree.getAncestors(high, "theme"))).toEqual(["contrast"])
    expect(values(tree.getPath("contrast"))).toEqual(["theme", "contrast"])
    expect(tree.getPath(null)).toEqual([])
  })

  test("custom accessors", () => {
    const custom = new PageTree({
      items: [{ id: "a" }, { id: "b", up: "a" }],
      itemToValue: (item) => item.id,
      itemToParent: (item) => item.up,
      isItemPage: () => false,
    })
    expect(custom.getChildren("a").map((item) => item.id)).toEqual(["b"])
  })

  test("survives cycles", () => {
    const cyclic = new PageTree({
      items: [
        { value: "a", parent: "b" },
        { value: "b", parent: "a" },
      ],
    })
    expect(cyclic.getAncestors(cyclic.find("a")!)).toHaveLength(2)
    expect(cyclic.getDescendants("a")).toHaveLength(2)
  })
})

describe("PageTree / navigation", () => {
  test("opening a page clears the query and records history", () => {
    const change = tree.navigate(createPageState(), "theme", "the")!
    expect(change.state.page).toBe("theme")
    expect(change.state.history).toEqual([null])
    expect(change.query).toBe("")
    expect(change.highlightedValue).toBeNull()
  })

  test("going back restores the query and highlights the page we came from", () => {
    const state = walk(createPageState(), [
      (s) => tree.navigate(s, "theme", "the"),
      (s) => tree.navigate(s, "contrast", "con"),
    ])
    const back = tree.back(state, "hi")!
    expect(back.state.page).toBe("theme")
    expect(back.query).toBe("con")
    expect(back.highlightedValue).toBe("contrast")

    const root = tree.back(back.state, "")!
    expect(root.state.page).toBeNull()
    expect(root.query).toBe("the")
    expect(root.highlightedValue).toBe("theme")
    expect(tree.back(root.state, "")).toBeNull()
  })

  test("going back after a jump restores the query and highlights the opened page", () => {
    const state = walk(createPageState(), [
      (s) => tree.navigate(s, "theme", ""),
      (s) => tree.navigate(s, "projects", ""),
    ])
    const jumped = tree.navigate(state, "high", "")!
    const back = tree.back(jumped.state, "")!
    expect(back.state.page).toBe("projects")
    expect(back.highlightedValue).toBe("high")

    // deep-search hit from the top level
    const deep = tree.navigate(createPageState(), "high", "hi")!
    const root = tree.back(deep.state, "")!
    expect(root.state.page).toBeNull()
    expect(root.query).toBe("hi")
    expect(root.highlightedValue).toBe("high")
  })

  test("going up follows the parent, not the history", () => {
    const state = walk(createPageState(), [(s) => tree.navigate(s, "contrast", "")])
    const up = tree.up(state, "")!
    expect(up.state.page).toBe("theme")
    expect(up.highlightedValue).toBe("contrast")
    expect(tree.up(createPageState(), "")).toBeNull()
  })

  test("going back to a visited page drops the history after it", () => {
    const state = walk(createPageState(), [
      (s) => tree.navigate(s, "theme", ""),
      (s) => tree.navigate(s, "contrast", ""),
      (s) => tree.navigate(s, null, ""),
    ])
    expect(state.history).toEqual([])
  })

  test("jumping across pages doesn't restore a query", () => {
    const state = walk(createPageState(), [(s) => tree.navigate(s, "theme", "x")])
    const change = tree.navigate(state, "projects", "y")!
    expect(change.query).toBe("")
    expect(change.highlightedValue).toBeNull()
    expect(change.state.history).toEqual([null, "theme"])
  })

  test("ignores the current page and unknown pages", () => {
    expect(tree.navigate(createPageState(), null, "")).toBeNull()
    expect(tree.navigate(createPageState(), "nope", "")).toBeNull()
  })

  test("does not mutate the previous state", () => {
    const initial = createPageState()
    tree.navigate(initial, "theme", "q")
    expect(initial).toEqual(createPageState())
  })
})
