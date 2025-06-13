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

  it("value path", () => {
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

    expect(tree.flatten()).toMatchInlineSnapshot(`
      [
        {
          "children": [
            "child1-1",
            "child1-2",
            "child1-3",
            "branch1-1",
          ],
          "indexPath": [
            0,
          ],
          "label": "branch1",
          "value": "branch1",
        },
        {
          "indexPath": [
            0,
            0,
          ],
          "label": "child1-1",
          "value": "child1-1",
        },
        {
          "indexPath": [
            0,
            1,
          ],
          "label": "child1-2",
          "value": "child1-2",
        },
        {
          "indexPath": [
            0,
            2,
          ],
          "label": "child1-3",
          "value": "child1-3",
        },
        {
          "children": [
            "child2-1",
          ],
          "indexPath": [
            0,
            3,
          ],
          "label": "branch1-1",
          "value": "branch1-1",
        },
        {
          "indexPath": [
            0,
            3,
            0,
          ],
          "label": "child2-1",
          "value": "child2-1",
        },
        {
          "indexPath": [
            1,
          ],
          "label": "child1",
          "value": "child1",
        },
        {
          "indexPath": [
            2,
          ],
          "label": "child2",
          "value": "child2",
        },
      ]
    `)

    expect(
      flattenedToTree([
        {
          indexPath: [],
          value: "ROOT",
        },
        {
          indexPath: [0],
          value: "branch1",
        },
        {
          indexPath: [0, 0],
          value: "child1-1",
        },
        {
          indexPath: [0, 1],
          value: "child1-2",
        },
        {
          indexPath: [0, 2],
          value: "child1-3",
        },
        {
          indexPath: [0, 3],
          value: "branch1-1",
        },
        {
          indexPath: [0, 3, 0],
          value: "child2-1",
        },
        {
          indexPath: [1],
          value: "child1",
        },
        {
          indexPath: [2],
          value: "child2",
        },
      ]).rootNode,
    ).toMatchInlineSnapshot(`
      {
        "children": [
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
          },
          {
            "value": "child1",
          },
          {
            "value": "child2",
          },
        ],
        "value": "ROOT",
      }
    `)

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
