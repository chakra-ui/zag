import { createTreeCollection } from "@zag-js/collection"
import { createVisibleTreeCache, VisibleTree } from "../src/utils/visible-tree"

function createCollection() {
  return createTreeCollection({
    rootNode: {
      value: "root",
      children: [
        { value: "disabled-first", disabled: true },
        {
          value: "branch",
          children: [{ value: "disabled-child", disabled: true }, { value: "child" }],
        },
        { value: "last" },
        { value: "disabled-last", disabled: true },
      ],
    },
  })
}

describe("visible tree navigation", () => {
  it("keeps disabled rows in the render list and skips them during navigation", () => {
    const tree = new VisibleTree(createCollection(), ["branch"])
    expect(tree.nodes).toHaveLength(6)
    expect(tree.getFirstNode()?.value).toBe("branch")
    expect(tree.getLastNode()?.value).toBe("last")
    expect(tree.getNextNode("branch")?.value).toBe("child")
    expect(tree.getPreviousNode("child")?.value).toBe("branch")
    expect(tree.getNextNode("disabled-child")?.value).toBe("child")
    expect(tree.getPreviousNode("disabled-child")?.value).toBe("branch")
    expect(tree.getIndex("child")).toBe(3)
    expect(tree.getNode("child")?.indexPath).toEqual([1, 1])
  })

  it("stops at the ends and does not navigate from missing or hidden nodes", () => {
    const tree = new VisibleTree(createCollection(), [])
    expect(tree.getNextNode("branch")?.value).toBe("last")
    expect(tree.getNextNode("last")).toBeUndefined()
    expect(tree.getPreviousNode("branch")).toBeUndefined()
    expect(tree.getNode("child")).toBeUndefined()
    expect(tree.getNextNode("child")).toBeUndefined()
    expect(tree.getPreviousNode("missing")).toBeUndefined()
  })

  it("handles empty trees and trees with only disabled rows", () => {
    for (const children of [[], [{ value: "disabled", disabled: true }]]) {
      const tree = new VisibleTree(createTreeCollection({ rootNode: { value: "root", children } }), [])
      expect(tree.getFirstNode()).toBeUndefined()
      expect(tree.getLastNode()).toBeUndefined()
    }
  })
})

describe("visible tree cache", () => {
  it("reuses rows and their index for equivalent expansion arrays", () => {
    const collection = createCollection()
    const read = createVisibleTreeCache()
    const tree = read(collection, ["branch"])
    expect(read(collection, ["branch"])).toBe(tree)
    expect(read(collection, ["branch"]).nodes).toBe(tree.nodes)
  })

  it("invalidates on expansion changes, including edits to the same array", () => {
    const collection = createCollection()
    const expanded: string[] = []
    const read = createVisibleTreeCache()
    const collapsed = read(collection, expanded)
    expanded.push("branch")
    const open = read(collection, expanded)
    expect(open).not.toBe(collapsed)
    expect(open.getNode("child")).toBeDefined()
    expanded[0] = "last"
    expect(read(collection, expanded).getNode("child")).toBeUndefined()
    expect(read(collection, []).getNode("child")).toBeUndefined()
  })

  it("invalidates on collection replacement, including lazy-loaded children", () => {
    const collection = createCollection()
    const read = createVisibleTreeCache()
    const tree = read(collection, ["branch"])
    const next = collection.replace([1], { value: "branch", children: [{ value: "loaded" }] })
    const loaded = read(next, ["branch"])
    expect(loaded).not.toBe(tree)
    expect(loaded.getNode("loaded")?.indexPath).toEqual([1, 0])
    expect(loaded.getNode("child")).toBeUndefined()
  })

  it("invalidates when the collection's root is replaced", () => {
    const collection = createCollection()
    const read = createVisibleTreeCache()
    const tree = read(collection, [])
    const updated = collection.copy({ value: "root", children: [{ value: "new" }] })
    const next = read(updated, [])
    expect(next).not.toBe(tree)
    expect(next.getFirstNode()?.value).toBe("new")
    expect(next.getNode("branch")).toBeUndefined()
  })

  it("keeps caches independent between machines", () => {
    const collection = createCollection()
    const first = createVisibleTreeCache()
    const second = createVisibleTreeCache()
    expect(first(collection, [])).not.toBe(second(collection, []))
  })
})
