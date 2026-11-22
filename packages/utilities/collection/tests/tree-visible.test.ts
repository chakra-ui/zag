import { createTreeCollection } from "../src"
interface Node {
  id: string
  children?: Node[]
  disabled?: boolean
}

function createTree() {
  return createTreeCollection<Node>({
    nodeToValue: (node) => node.id,
    rootNode: {
      id: "root",
      children: [
        {
          id: "a",
          children: [
            { id: "a/1", disabled: true },
            { id: "a/2", children: [{ id: "a/2/1" }] },
          ],
        },
        { id: "b", children: [{ id: "b/1" }] },
      ],
    },
  })
}

describe("visible tree nodes", () => {
  it("includes collapsed branches and excludes the root and hidden descendants", () => {
    const tree = createTree()
    expect(tree.getVisibleNodes([]).map(({ node }) => node.id)).toEqual(["a", "b"])
    // Expanding a hidden descendant cannot make it visible.
    expect(tree.getVisibleNodes(["a/2"]).map(({ node }) => node.id)).toEqual(["a", "b"])
  })

  it("preserves tree order, disabled rows, and independent absolute index paths", () => {
    const tree = createTree()
    const rows = tree.getVisibleNodes(new Set(["a", "a/2", "b"]))
    expect(rows.map(({ node, indexPath }) => [node.id, indexPath])).toEqual([
      ["a", [0]],
      ["a/1", [0, 0]],
      ["a/2", [0, 1]],
      ["a/2/1", [0, 1, 0]],
      ["b", [1]],
      ["b/1", [1, 0]],
    ])
    for (const { node, indexPath } of rows) expect(tree.at(indexPath)).toBe(node)
    rows[0].indexPath.push(99)
    expect(rows[1].indexPath).toEqual([0, 0])
  })

  it("does not read children of collapsed nodes and supports custom accessors", () => {
    type Item = { key: string; items?: Item[] }
    const readChildren = vi.fn((node: Item) => node.items)
    const tree = createTreeCollection<Item>({
      nodeToValue: (node) => node.key,
      nodeToChildren: readChildren,
      rootNode: { key: "root", items: [{ key: "branch", items: [{ key: "leaf" }] }] },
    })
    readChildren.mockClear()
    expect(tree.getVisibleNodes([]).map(({ node }) => node.key)).toEqual(["branch"])
    expect(readChildren).not.toHaveBeenCalled()
  })

  it("handles an empty tree", () => {
    const tree = createTreeCollection({ rootNode: { value: "root" } })
    expect(tree.getVisibleNodes([])).toEqual([])
  })

  it("supports deep trees without recursive calls", () => {
    let node: Node = { id: "leaf" }
    const expanded: string[] = []
    for (let index = 0; index < 2000; index++) {
      const id = `branch-${index}`
      expanded.push(id)
      node = { id, children: [node] }
    }
    const tree = createTreeCollection<Node>({
      nodeToValue: (node) => node.id,
      rootNode: { id: "root", children: [node] },
    })
    const rows = tree.getVisibleNodes(expanded)
    expect(rows).toHaveLength(2001)
    expect(rows.at(-1)?.node.id).toBe("leaf")
  })
})
