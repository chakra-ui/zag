import { TreeNode, TreeNodePosition } from "../src/tree-collection"

let rootNode: TreeNode

beforeEach(() => {
  rootNode = new TreeNode({
    value: "root",
    children: [
      {
        value: "branch1",
        children: [{ value: "child1-1" }, { value: "child1-2" }],
      },
      { value: "child1" },
      { value: "child2" },
    ],
  })
})

describe("tree collection", () => {
  test("compare position", () => {
    const branchNode = rootNode.findNode("branch1")
    const childNode = rootNode.findNode("child1")
    expect(branchNode?.compareNodePosition(childNode)).toBe(TreeNodePosition.FOLLOWING)
  })

  test("insert child", () => {
    expect(rootNode.firstChild?.value).toBe("branch1")
    expect(rootNode.lastChild?.value).toBe("child2")

    rootNode.insertChild(new TreeNode({ value: "child3" }), "branch1")

    expect(rootNode).toMatchInlineSnapshot(`
      TreeNode {
        "children": [
          TreeNode {
            "children": [
              TreeNode {
                "children": [],
                "data": undefined,
                "expanded": false,
                "parentNode": [Circular],
                "selected": false,
                "value": "child3",
              },
              TreeNode {
                "children": [],
                "data": undefined,
                "expanded": false,
                "parentNode": [Circular],
                "selected": false,
                "value": "child1-1",
              },
              TreeNode {
                "children": [],
                "data": undefined,
                "expanded": false,
                "parentNode": [Circular],
                "selected": false,
                "value": "child1-2",
              },
            ],
            "data": undefined,
            "expanded": true,
            "parentNode": [Circular],
            "selected": false,
            "value": "branch1",
          },
          TreeNode {
            "children": [],
            "data": undefined,
            "expanded": false,
            "parentNode": [Circular],
            "selected": false,
            "value": "child1",
          },
          TreeNode {
            "children": [],
            "data": undefined,
            "expanded": false,
            "parentNode": [Circular],
            "selected": false,
            "value": "child2",
          },
        ],
        "data": undefined,
        "expanded": false,
        "parentNode": null,
        "selected": false,
        "value": "root",
      }
    `)

    expect(rootNode.findNode("branch1")?.firstChild?.value).toBe("child3")
  })

  test("get node path", () => {
    expect(rootNode.getNodePath("child1-1")).toMatchInlineSnapshot(`
      [
        "root",
        "branch1",
      ]
    `)
  })

  test("reparent: lvl 0 -> lvl 1", () => {
    rootNode.reparentNode("child1", { value: "child1-1", depth: 1 })

    expect(rootNode.children).toMatchInlineSnapshot(`
      [
        TreeNode {
          "children": [
            TreeNode {
              "children": [],
              "data": undefined,
              "expanded": false,
              "parentNode": [Circular],
              "selected": false,
              "value": "child1-1",
            },
            TreeNode {
              "children": [],
              "data": undefined,
              "expanded": false,
              "parentNode": [Circular],
              "selected": false,
              "value": "child1",
            },
            TreeNode {
              "children": [],
              "data": undefined,
              "expanded": false,
              "parentNode": [Circular],
              "selected": false,
              "value": "child1-2",
            },
          ],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "branch1",
        },
        TreeNode {
          "children": [],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "child2",
        },
      ]
    `)
  })

  test("reparent: lvl 1 -> lvl 0", () => {
    rootNode.reparentNode("child1-1", { value: "child1", depth: 0 })

    expect(rootNode.children).toMatchInlineSnapshot(`
      [
        TreeNode {
          "children": [
            TreeNode {
              "children": [],
              "data": undefined,
              "expanded": false,
              "parentNode": [Circular],
              "selected": false,
              "value": "child1-2",
            },
          ],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "branch1",
        },
        TreeNode {
          "children": [],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "child1",
        },
        TreeNode {
          "children": [],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "child1-1",
        },
        TreeNode {
          "children": [],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "child2",
        },
      ]
    `)
  })

  test("append child", () => {
    rootNode.findNode("branch1")?.appendChild(new TreeNode({ value: "child1-3" }))

    expect(rootNode.children).toMatchInlineSnapshot(`
      [
        TreeNode {
          "children": [
            TreeNode {
              "children": [],
              "data": undefined,
              "expanded": false,
              "parentNode": [Circular],
              "selected": false,
              "value": "child1-1",
            },
            TreeNode {
              "children": [],
              "data": undefined,
              "expanded": false,
              "parentNode": [Circular],
              "selected": false,
              "value": "child1-2",
            },
            TreeNode {
              "children": [],
              "data": undefined,
              "expanded": false,
              "parentNode": [Circular],
              "selected": false,
              "value": "child1-3",
            },
          ],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "branch1",
        },
        TreeNode {
          "children": [],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "child1",
        },
        TreeNode {
          "children": [],
          "data": undefined,
          "expanded": false,
          "parentNode": TreeNode {
            "children": [Circular],
            "data": undefined,
            "expanded": false,
            "parentNode": null,
            "selected": false,
            "value": "root",
          },
          "selected": false,
          "value": "child2",
        },
      ]
    `)
  })

  test("get root node", () => {
    const node = rootNode.findNode("child1-1")?.getRootNode()
    expect(node?.value).toBe("root")
  })
})

describe("tree walker", () => {
  test("walk", () => {
    const walker = rootNode.walk()
    const seen = new Set<string>()
    let node: TreeNode | null
    while ((node = walker.nextNode())) {
      seen.add(node.value)
    }
    expect(seen).toMatchInlineSnapshot(`
      Set {
        "branch1",
        "child1-1",
        "child1-2",
        "child1",
        "child2",
      }
    `)
  })

  test("walk + acceptNode", () => {
    const walker = rootNode.walk({
      acceptNode(node) {
        if (node.value === "child1-1") return false
        return true
      },
    })

    const seen = new Set<string>()
    let node: TreeNode | null
    while ((node = walker.nextNode())) {
      seen.add(node.value)
    }

    expect(seen).toMatchInlineSnapshot(`
      Set {
        "branch1",
        "child1-2",
        "child1",
        "child2",
      }
    `)
  })
})
