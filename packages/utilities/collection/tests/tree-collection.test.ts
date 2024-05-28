import { TreeNode } from "../src/tree-collection"

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
  test("insert child", () => {
    expect(rootNode.firstChild.value).toBe("branch1")
    expect(rootNode.lastChild.value).toBe("child2")

    rootNode.insertChild(new TreeNode({ value: "child3" }), "branch1")

    expect(rootNode).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "parent": "branch1",
                "value": "child3",
              },
              {
                "parent": "branch1",
                "value": "child1-1",
              },
              {
                "parent": "branch1",
                "value": "child1-2",
              },
            ],
            "parent": "root",
            "value": "branch1",
          },
          {
            "parent": "root",
            "value": "child1",
          },
          {
            "parent": "root",
            "value": "child2",
          },
        ],
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

  test("reparent: root -> level 1", () => {
    rootNode.reparentNode("child1", { value: "child1-1", depth: 1 })

    expect(rootNode.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "parent": "branch1",
              "value": "child1-1",
            },
            {
              "parent": "branch1",
              "value": "child1",
            },
            {
              "parent": "branch1",
              "value": "child1-2",
            },
          ],
          "parent": "root",
          "value": "branch1",
        },
        {
          "parent": "root",
          "value": "child2",
        },
      ]
    `)
  })

  test("reparent: level 1 -> root", () => {
    rootNode.reparentNode("child1-1", { value: "child1", depth: 0 })

    expect(rootNode.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "parent": "branch1",
              "value": "child1-2",
            },
          ],
          "parent": "root",
          "value": "branch1",
        },
        {
          "parent": "root",
          "value": "child1",
        },
        {
          "parent": "root",
          "value": "child1-1",
        },
        {
          "parent": "root",
          "value": "child2",
        },
      ]
    `)
  })

  test("append child", () => {
    rootNode.findNode("branch1")?.appendChild(new TreeNode({ value: "child1-3" }))

    expect(rootNode.children).toMatchInlineSnapshot(`
      [
        {
          "children": [
            {
              "parent": "branch1",
              "value": "child1-1",
            },
            {
              "parent": "branch1",
              "value": "child1-2",
            },
            {
              "parent": "branch1",
              "value": "child1-3",
            },
          ],
          "parent": "root",
          "value": "branch1",
        },
        {
          "parent": "root",
          "value": "child1",
        },
        {
          "parent": "root",
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
