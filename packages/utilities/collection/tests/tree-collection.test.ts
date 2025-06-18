import { omit } from "@zag-js/utils"
import { filePathToTree, flattenedToTree, TreeCollection } from "../src/tree-collection"
import { diagram } from "./tree-diagram"

interface Node {
  value: string
  children?: Array<Node>
}

let tree: TreeCollection<Node>

const rootNode: Node = {
  value: "ROOT",
  children: [
    {
      value: "branch1",
      children: [
        { value: "child1-1" },
        { value: "child1-2" },
        { value: "child1-3" },
        { value: "branch1-1", children: [{ value: "child2-1" }] },
      ],
    },
    { value: "child1" },
    { value: "child2" },
  ],
}

const draw = (node: Node) => {
  return diagram(node, {
    getLabel: (node) => node.value,
    getChildren: (node) => node.children ?? [],
  })
}

beforeEach(() => {
  tree = new TreeCollection({
    nodeToChildren: (node) => node.children ?? [],
    rootNode,
  })
})

describe("tree / traversal", () => {
  it("visit the tree", () => {
    expect(tree.getFirstNode()).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "value": "child1-1",
          },
          {
            "value": "child1-2",
          },
          {
            "value": "child1-3",
          },
          {
            "children": [
              {
                "value": "child2-1",
              },
            ],
            "value": "branch1-1",
          },
        ],
        "value": "branch1",
      }
    `)

    expect(tree.getLastNode()).toMatchInlineSnapshot(`
      {
        "value": "child2",
      }
    `)

    expect(tree.getValues()).toMatchInlineSnapshot(`
      [
        "branch1",
        "child1-1",
        "child1-2",
        "child1-3",
        "branch1-1",
        "child2-1",
        "child1",
        "child2",
      ]
    `)

    const branch1 = tree.findNode("branch1")
    expect(tree.getValues(branch1)).toMatchInlineSnapshot(`
      [
        "child1-1",
        "child1-2",
        "child1-3",
        "branch1-1",
        "child2-1",
      ]
    `)

    expect(tree.getNextNode("branch1")).toMatchInlineSnapshot(`
      {
        "value": "child1-1",
      }
    `)

    expect(tree.getPreviousNode("child1-2")).toMatchInlineSnapshot(`
      {
        "value": "child1-1",
      }
    `)

    expect(tree.getParentNode("child1-2")).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "value": "child1-1",
          },
          {
            "value": "child1-2",
          },
          {
            "value": "child1-3",
          },
          {
            "children": [
              {
                "value": "child2-1",
              },
            ],
            "value": "branch1-1",
          },
        ],
        "value": "branch1",
      }
    `)
  })

  it("branch nodes", () => {
    const branch = tree.findNode("branch1")
    expect(branch).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "value": "child1-1",
          },
          {
            "value": "child1-2",
          },
          {
            "value": "child1-3",
          },
          {
            "children": [
              {
                "value": "child2-1",
              },
            ],
            "value": "branch1-1",
          },
        ],
        "value": "branch1",
      }
    `)

    expect(tree.getBranchValues()).toMatchInlineSnapshot(`
      [
        "branch1",
        "branch1-1",
      ]
    `)

    expect(tree.getFirstNode(branch)).toMatchInlineSnapshot(`
      {
        "value": "child1-1",
      }
    `)

    expect(tree.getLastNode(branch)).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "value": "child2-1",
          },
        ],
        "value": "branch1-1",
      }
    `)
  })

  it("index path and value path", () => {
    expect(tree.getIndexPath("child1-2")).toMatchInlineSnapshot(`
      [
        0,
        1,
      ]
    `)

    const indexPath = tree.getIndexPath("child1-2")

    expect(tree.getValuePath(indexPath)).toMatchInlineSnapshot(`
      [
        "branch1",
        "child1-2",
      ]
    `)
  })

  it("file path tree", () => {
    expect(filePathToTree(["a/b/c", "a/b/d", "a/e", "f"]).rootNode).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "label": "c",
                    "value": "a/b/c",
                  },
                  {
                    "label": "d",
                    "value": "a/b/d",
                  },
                ],
                "label": "b",
                "value": "a/b",
              },
              {
                "label": "e",
                "value": "a/e",
              },
            ],
            "label": "a",
            "value": "a",
          },
          {
            "label": "f",
            "value": "f",
          },
        ],
        "label": "",
        "value": "ROOT",
      }
    `)
  })

  it("skips disabled nodes", () => {
    const tree = new TreeCollection({
      nodeToChildren: (node) => node.children,
      rootNode: {
        value: "ROOT",
        children: [
          { value: "child1" },
          { value: "child2", disabled: true },
          { value: "child3" },
          { value: "child4", disabled: true },
        ],
      },
    })

    expect(tree.getFirstNode()).toMatchInlineSnapshot(`
      {
        "value": "child1",
      }
    `)

    expect(tree.getLastNode()).toMatchInlineSnapshot(`
      {
        "value": "child3",
      }
    `)

    expect(tree.getNextNode("child1")).toMatchInlineSnapshot(`
      {
        "value": "child3",
      }
    `)

    expect(tree.getPreviousNode("child3")).toMatchInlineSnapshot(`
      {
        "value": "child1",
      }
    `)
  })
})

describe("tree / remove", () => {
  const remove = (indexPath: number[][]) => {
    return draw(tree.remove(indexPath).rootNode)
  }

  it("remove branch", () => {
    expect(remove([[0]])).toMatchInlineSnapshot(`
      "ROOT
      ├── child1
      └── child2"
    `)
  })

  it("remove child", () => {
    // remove child1-2
    expect(remove([[0, 1]])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-3
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })

  it("remove nested child", () => {
    // remove child2-1
    expect(remove([[0, 3, 0]])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1
      ├── child1
      └── child2"
    `)
  })

  it("remove non-existent node", () => {
    // remove non-existent node
    expect(remove([[0, 0, 0]])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })
})

describe("tree / replace", () => {
  const replace = (indexPath: number[], node: Node) => {
    return draw(tree.replace(indexPath, node).rootNode)
  }

  it("replace child", () => {
    // replace child1-1
    expect(replace([0, 0], { value: "child1-1-new" })).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1-new
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })

  it("replace branch", () => {
    // replace branch1-1
    expect(replace([0, 3], { value: "branch1-1-new", children: [{ value: "child2-1-new" }] })).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1-new
      │       └── child2-1-new
      ├── child1
      └── child2"
    `)
  })

  it("replace root", () => {
    expect(replace([], { value: "root-new", children: [{ value: "child1-new" }] })).toMatchInlineSnapshot(`
      "root-new
      └── child1-new"
    `)
  })

  it("replace non-existing node", () => {
    expect(replace([0, 10, 0], { value: "child1-1-new" })).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })

  it("convert child to branch", () => {
    expect(replace([0, 0, 0], { value: "child1-1-new" })).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   │   └── child1-1-new
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })
})

describe("tree / move", () => {
  const move = (fromPath: number[][], toPath: number[]) => {
    return draw(tree.move(fromPath, toPath).rootNode)
  }

  it("moves node to different parent", () => {
    // Move child1-1 to be under branch1-1
    expect(move([[0, 0]], [0, 3])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-2
      │   ├── child1-3
      │   ├── child1-1
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })

  it("moves node within same parent", () => {
    // Move child1-3 before child1-1
    expect(move([[0, 2]], [0, 0])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-3
      │   ├── child1-1
      │   ├── child1-2
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })

  it("moves branch with children", () => {
    // Move branch1-1 to root level
    expect(move([[0, 3]], [0])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1-1
      │   └── child2-1
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   └── child1-3
      ├── child1
      └── child2"
    `)
  })

  it("handles invalid source path", () => {
    expect(move([[0, 10]], [0])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })

  it("handles invalid target path", () => {
    expect(move([[0, 0]], [0, 10])).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-2
      │   ├── child1-3
      │   ├── branch1-1
      │   │   └── child2-1
      │   └── child1-1
      ├── child1
      └── child2"
    `)
  })
})

describe("tree / siblings", () => {
  it("get previous sibling", () => {
    expect(tree.getPreviousSibling([0, 2])).toMatchInlineSnapshot(`
      {
        "value": "child1-2",
      }
    `)
  })

  it("get next sibling", () => {
    expect(tree.getNextSibling([0, 2])).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "value": "child2-1",
          },
        ],
        "value": "branch1-1",
      }
    `)
  })

  it("get sibling nodes", () => {
    expect(tree.getSiblingNodes([0, 2])).toMatchInlineSnapshot(`
      [
        {
          "value": "child1-1",
        },
        {
          "value": "child1-2",
        },
        {
          "value": "child1-3",
        },
        {
          "children": [
            {
              "value": "child2-1",
            },
          ],
          "value": "branch1-1",
        },
      ]
    `)
  })

  it("skips disabled siblings", () => {
    const tree = new TreeCollection({
      nodeToChildren: (node) => node.children,
      rootNode: {
        value: "ROOT",
        children: [
          { value: "child1" },
          { value: "child2", disabled: true },
          { value: "child3" },
          { value: "child4", disabled: true },
          { value: "child5" },
        ],
      },
    })

    expect(tree.getPreviousSibling([2])).toMatchInlineSnapshot(`
      {
        "value": "child1",
      }
    `)

    expect(tree.getNextSibling([2])).toMatchInlineSnapshot(`
      {
        "value": "child5",
      }
    `)

    // edges: no siblings

    expect(tree.getPreviousSibling([0])).toBeUndefined()

    expect(tree.getNextSibling([4])).toBeUndefined()
  })
})

describe("tree / flatten", () => {
  interface TestNode {
    value: string
    label?: string
    disabled?: boolean
    customProp?: string
    children?: TestNode[]
  }

  const complexTree: TestNode = {
    value: "ROOT",
    children: [
      {
        value: "branch1",
        label: "Branch 1",
        customProp: "custom1",
        children: [
          { value: "child1-1", label: "Child 1-1", disabled: false },
          { value: "child1-2", label: "Child 1-2", customProp: "nested" },
        ],
      },
      { value: "child1", label: "Child 1", disabled: true },
      { value: "child2", label: "Child 2" },
    ],
  }

  let complexTreeCollection: TreeCollection<TestNode>

  beforeEach(() => {
    complexTreeCollection = new TreeCollection({
      nodeToChildren: (node) => node.children ?? [],
      rootNode: complexTree,
    })
  })

  it("preserves all node properties", () => {
    const flattened = complexTreeCollection.flatten().map((node) => omit(node, ["children"]) as typeof node)

    expect(flattened).toMatchInlineSnapshot(`
      [
        {
          "_children": [
            1,
            2,
            3,
          ],
          "_index": 0,
          "_parent": undefined,
          "value": "ROOT",
        },
        {
          "_children": [
            4,
            5,
          ],
          "_index": 1,
          "_parent": 0,
          "customProp": "custom1",
          "label": "Branch 1",
          "value": "branch1",
        },
        {
          "_children": undefined,
          "_index": 4,
          "_parent": 1,
          "disabled": false,
          "label": "Child 1-1",
          "value": "child1-1",
        },
        {
          "_children": undefined,
          "_index": 5,
          "_parent": 1,
          "customProp": "nested",
          "label": "Child 1-2",
          "value": "child1-2",
        },
        {
          "_children": undefined,
          "_index": 2,
          "_parent": 0,
          "disabled": true,
          "label": "Child 1",
          "value": "child1",
        },
        {
          "_children": undefined,
          "_index": 3,
          "_parent": 0,
          "label": "Child 2",
          "value": "child2",
        },
      ]
    `)
  })

  it("includes parent references", () => {
    const flattened = complexTreeCollection.flatten()

    // Check that child nodes have correct parent references
    const child11 = flattened.find((node) => node.value === "child1-1")
    const child12 = flattened.find((node) => node.value === "child1-2")
    const child1 = flattened.find((node) => node.value === "child1")
    const branch1 = flattened.find((node) => node.value === "branch1")

    expect(child11?._parent).toBe(branch1?._index)
    expect(child12?._parent).toBe(branch1?._index)
    expect(child1?._parent).toMatchInlineSnapshot(`0`) // Root level node
  })

  it("includes children references", () => {
    const flattened = complexTreeCollection.flatten()

    const branch1 = flattened.find((node) => node.value === "branch1")
    const child11 = flattened.find((node) => node.value === "child1-1")
    const child12 = flattened.find((node) => node.value === "child1-2")

    expect(branch1?._children).toEqual([child11?._index, child12?._index])

    const leafNode = flattened.find((node) => node.value === "child1-1")
    expect(leafNode?._children).toBeUndefined()
  })

  it("reconstructs original structure", () => {
    const flattened = complexTreeCollection.flatten()
    const reconstructed = flattenedToTree(flattened)

    // Should preserve the tree structure and custom properties
    expect(reconstructed.rootNode).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "disabled": false,
                "label": "Child 1-1",
                "value": "child1-1",
              },
              {
                "customProp": "nested",
                "label": "Child 1-2",
                "value": "child1-2",
              },
            ],
            "customProp": "custom1",
            "label": "Branch 1",
            "value": "branch1",
          },
          {
            "disabled": true,
            "label": "Child 1",
            "value": "child1",
          },
          {
            "label": "Child 2",
            "value": "child2",
          },
        ],
        "value": "ROOT",
      }
    `)
  })

  it("roundtrip preserves all data (flatten -> reconstruct)", () => {
    const flattened = complexTreeCollection.flatten()
    const reconstructed = flattenedToTree(flattened)

    expect(draw(reconstructed.rootNode)).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   └── child1-2
      ├── child1
      └── child2"
    `)

    //check that customProps are preserved
    const branch1 = reconstructed.findNode("branch1")
    expect((branch1 as any)?.customProp).toBe("custom1")

    const child11 = reconstructed.findNode("child1-2")
    expect((child11 as any)?.customProp).toBe("nested")
  })

  it("handles empty tree", () => {
    const emptyTree = new TreeCollection({
      nodeToChildren: (node) => node.children ?? [],
      rootNode: { value: "EMPTY", children: [] },
    })

    const flattened = emptyTree.flatten().map((node) => omit(node, ["children"]) as typeof node)
    expect(flattened).toMatchInlineSnapshot(`
      [
        {
          "_children": undefined,
          "_index": 0,
          "_parent": undefined,
          "value": "EMPTY",
        },
      ]
    `)

    const reconstructed = flattenedToTree(flattened)
    expect(reconstructed.getValues()).toMatchInlineSnapshot(`[]`)
  })

  it("preserves complex nested structures", () => {
    const deepTree = {
      value: "ROOT",
      children: [
        {
          value: "level1",
          data: { level: 1, info: "first" },
          children: [
            {
              value: "level2",
              data: { level: 2, info: "second" },
              children: [{ value: "level3", data: { level: 3, info: "third" } }],
            },
          ],
        },
      ],
    }

    const deepTreeCollection = new TreeCollection({
      nodeToChildren: (node) => node?.children ?? [],
      rootNode: deepTree,
    })

    const flattened = deepTreeCollection.flatten()
    const reconstructed = flattenedToTree(flattened)

    const level3Node = reconstructed.findNode("level3")
    expect((level3Node as any)?.data).toEqual({ level: 3, info: "third" })
  })
})

describe("tree / filter", () => {
  const filter = (predicate: (node: Node, indexPath: number[]) => boolean) => {
    return draw(tree.filter(predicate).rootNode)
  }

  it("filters nodes by value pattern", () => {
    // Filter nodes that contain "child1"
    expect(filter((node) => node.value.includes("child1"))).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   └── child1-3
      └── child1"
    `)
  })

  it("filters branch nodes only", () => {
    // Filter only branch nodes (nodes with children)
    expect(filter((node) => (node.children?.length ?? 0) > 0)).toMatchInlineSnapshot(`
      "ROOT
      └── branch1
          └── branch1-1"
    `)
  })

  it("filters leaf nodes only", () => {
    // Filter only leaf nodes (nodes without children)
    expect(filter((node) => !node.children || node.children.length === 0)).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   ├── child1-1
      │   ├── child1-2
      │   ├── child1-3
      │   └── branch1-1
      │       └── child2-1
      ├── child1
      └── child2"
    `)
  })

  it("filters by depth", () => {
    // Filter nodes at depth 1 (direct children of root)
    expect(filter((node, indexPath) => indexPath.length === 1)).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      ├── child1
      └── child2"
    `)

    // Filter nodes at depth 2
    expect(filter((node, indexPath) => indexPath.length === 2)).toMatchInlineSnapshot(`
      "ROOT
      └── branch1
          ├── child1-1
          ├── child1-2
          ├── child1-3
          └── branch1-1"
    `)
  })

  it("preserves tree structure for parent nodes", () => {
    // Filter only deep nested nodes - should preserve parent structure
    expect(filter((node) => node.value === "child2-1")).toMatchInlineSnapshot(`
      "ROOT
      └── branch1
          └── branch1-1
              └── child2-1"
    `)
  })

  it("returns empty structure when no nodes match", () => {
    // Filter nodes that don't exist
    expect(filter((node) => node.value === "non-existent")).toMatchInlineSnapshot(`
      "ROOT"
    `)
  })

  it("filters with complex conditions", () => {
    // Filter nodes that are either branches or contain "child2"
    expect(filter((node) => (node.children?.length ?? 0) > 0 || node.value.includes("child2"))).toMatchInlineSnapshot(`
      "ROOT
      ├── branch1
      │   └── branch1-1
      │       └── child2-1
      └── child2"
    `)
  })
})
