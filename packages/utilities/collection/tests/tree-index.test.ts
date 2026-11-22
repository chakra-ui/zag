import { createTreeCollection, getTreeCheckedStates } from "../src"

interface Item {
  value: string
  children?: Item[]
}

const create = () =>
  createTreeCollection<Item>({
    rootNode: {
      value: "root",
      children: [
        { value: "a", children: [{ value: "a/1" }, { value: "a/2" }] },
        { value: "b", children: [{ value: "b/1" }] },
      ],
    },
  })

describe("indexed tree snapshots", () => {
  it("keeps each subtree contiguous and reconstructs paths on demand", () => {
    const tree = create()
    expect(tree.getValues()).toEqual(["a", "a/1", "a/2", "b", "b/1"])
    expect(tree.getDescendantValues("a")).toEqual(["a/1", "a/2"])
    expect(tree.getIndexPath("b/1")).toEqual([1, 0])
    expect(tree.getDepth("b/1")).toBe(2)
    expect(tree.getParentNode("b/1")?.value).toBe("b")
  })

  it("queries a supplied root outside the indexed tree", () => {
    const tree = create()
    const leaf = { value: "external/leaf" }
    const branch = { value: "external/branch", children: [leaf] }
    const root = { value: "external", children: [branch, { value: "other" }] }

    expect(tree.findNode(leaf.value, root)).toBe(leaf)
    expect(tree.findNodes([root.value, leaf.value], root)).toEqual([root, leaf])
    expect(tree.getValues(root)).toEqual([branch.value, leaf.value, "other"])
    expect(tree.getBranchValues(root, { depth: 1 })).toEqual([branch.value])
    expect(tree.getFirstNode(root)).toBe(branch)
    expect(tree.getFirstNode(root, { skip: ({ indexPath }) => indexPath[0] === 0 })).toBe(root.children[1])
    expect(tree.getLastNode(root)).toBe(root.children[1])
  })

  it("queries the index without rereading children or values", () => {
    const nodeToValue = vi.fn((node: { value: string }) => node.value)
    const nodeToChildren = vi.fn((node: { children?: { value: string }[] }) => node.children)
    const tree = createTreeCollection({
      rootNode: { value: "root", children: [{ value: "leaf" }] },
      nodeToValue,
      nodeToChildren,
    })
    nodeToValue.mockClear()
    nodeToChildren.mockClear()
    expect(tree.findNode("leaf")?.value).toBe("leaf")
    expect(tree.getDepth("leaf")).toBe(1)
    expect(tree.getIndexPath("leaf")).toEqual([0])
    expect(tree.getVisibleNodes([]).map((row) => row.node.value)).toEqual(["leaf"])
    expect(nodeToChildren).not.toHaveBeenCalled()
    // The synthetic-root default does not need to invoke custom accessors either.
    expect(nodeToValue).not.toHaveBeenCalled()
  })

  it("allows duplicate values on separate paths and rejects cycles", () => {
    const tree = createTreeCollection({
      rootNode: {
        value: "root",
        children: [
          { value: "a", children: [{ value: "x" }] },
          { value: "b", children: [{ value: "x" }] },
        ],
      },
    })
    expect(tree.getIndexPath(["b", "x"])).toEqual([1, 0])
    expect(tree.getParentNode([1, 0])?.value).toBe("b")
    expect(tree.findNodes(["x"])).toHaveLength(2)
    const root: { value: string; children?: any[] } = { value: "root" }
    root.children = [root]
    expect(() => createTreeCollection({ rootNode: root })).toThrow("Cyclic tree data")
  })

  it("rebuilds edits as independent snapshots", () => {
    const before = create()
    const after = before.replace([0, 0], { value: "new" })
    expect(before.findNode("a/1")).toBeDefined()
    expect(before.findNode("new")).toBeUndefined()
    expect(after.findNode("a/1")).toBeUndefined()
    expect(after.findNode("new")).toBeDefined()
    expect(after.rootNode.children![1]).toBe(before.rootNode.children![1])
    expect(after.getParentNode("new")?.value).toBe("a")
  })

  it("edits and filters trees with custom child storage", () => {
    type Item = { id: string; items?: Item[] }
    const tree = createTreeCollection<Item>({
      rootNode: { id: "root", items: [{ id: "a", items: [{ id: "leaf" }] }, { id: "b" }] },
      nodeToValue: (node) => node.id,
      nodeToChildren: (node) => node.items,
      nodeToCreate: (node, items) => ({ ...node, items }),
    })
    const replaced = tree.replace([0, 0], { id: "new" })
    expect(replaced.getValues()).toEqual(["a", "new", "b"])
    expect(replaced.filter((node) => node.id === "new").getValues()).toEqual(["a", "new"])
    expect(tree.getValues()).toEqual(["a", "leaf", "b"])
  })

  it("rejects moving a node into its own subtree", () => {
    const tree = create()
    expect(() => tree.move([[0]], [0, 1])).toThrow("own subtree")
    expect(tree.getValues()).toEqual(["a", "a/1", "a/2", "b", "b/1"])
  })

  it("indexes and checks deep trees without recursive calls or eager paths", () => {
    type Item = { value: string; children?: Item[] }
    let node: Item = { value: "leaf" }
    for (let depth = 0; depth < 12000; depth++) node = { value: `branch-${depth}`, children: [node] }
    const tree = createTreeCollection({ rootNode: { value: "root", children: [node] } })
    expect(tree.getDepth("leaf")).toBe(12001)
    expect(getTreeCheckedStates(tree, ["leaf"]).get("branch-11999")).toBe(true)
    expect(tree.getIndexPath("leaf")).toHaveLength(12001)
  })
})
