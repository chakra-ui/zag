import { TreeCollection } from "../src/tree-collection"

interface Item {
  id: string
  name: string
  children?: Item[]
}

let tree: TreeCollection<Item>

beforeEach(() => {
  // @ts-expect-error
  tree = new TreeCollection({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "ROOT",
      name: "",
      children: [
        {
          id: "node_modules",
          name: "node_modules",
          children: [
            { id: "node_modules/zag-js", name: "zag-js" },
            { id: "node_modules/pandacss", name: "panda" },
            {
              id: "node_modules/@types",
              name: "@types",
              children: [
                { id: "node_modules/@types/react", name: "react" },
                { id: "node_modules/@types/react-dom", name: "react-dom" },
              ],
            },
          ],
        },
        {
          id: "src",
          name: "src",
          children: [
            { id: "src/app.tsx", name: "app.tsx" },
            { id: "src/index.ts", name: "index.ts" },
          ],
        },
        { id: "panda.config", name: "panda.config" },
        { id: "package.json", name: "package.json" },
        { id: "renovate.json", name: "renovate.json" },
        { id: "readme.md", name: "README.md" },
      ],
    },
  })
})

describe("tree traversal / skip", () => {
  it("next node", () => {
    const expanded: string[] = ["node_modules"]
    const current = "node_modules"

    const node = tree.getNextNode(current, {
      skip({ indexPath }) {
        const paths = tree.getValuePath(indexPath).slice(0, -1)
        return paths.some((value) => !expanded.includes(value))
      },
    })

    const value = node ? tree.getNodeValue(node) : undefined
    expect(value).toMatchInlineSnapshot(`"node_modules/zag-js"`)
  })

  it("previous node", () => {
    const expanded: string[] = ["node_modules", "node_modules/@types"]
    const current = "src"

    const node = tree.getPreviousNode(current, {
      skip({ indexPath }) {
        const paths = tree.getValuePath(indexPath).slice(0, -1)
        return paths.some((value) => !expanded.includes(value))
      },
    })

    const value = node ? tree.getNodeValue(node) : undefined
    expect(value).toMatchInlineSnapshot(`"node_modules/@types/react-dom"`)
  })
})

describe("tree / operations", () => {
  it("replace", () => {
    const rootNode = tree.replace([0, 1], { id: "---------> test", name: "test" })
    expect(tree.getValues(rootNode)).toMatchInlineSnapshot(`
      [
        "node_modules",
        "node_modules/zag-js",
        "---------> test",
        "node_modules/@types",
        "node_modules/@types/react",
        "node_modules/@types/react-dom",
        "src",
        "src/app.tsx",
        "src/index.ts",
        "panda.config",
        "package.json",
        "renovate.json",
        "readme.md",
      ]
    `)
  })

  it("insert before", () => {
    const rootNode = tree.insertBefore([0, 0], [{ id: "---------> test", name: "test" }])
    expect(tree.getValues(rootNode!)).toMatchInlineSnapshot(`
      [
        "node_modules",
        "---------> test",
        "node_modules/zag-js",
        "node_modules/pandacss",
        "node_modules/@types",
        "node_modules/@types/react",
        "node_modules/@types/react-dom",
        "src",
        "src/app.tsx",
        "src/index.ts",
        "panda.config",
        "package.json",
        "renovate.json",
        "readme.md",
      ]
    `)
  })

  it("insert after", () => {
    const rootNode = tree.insertAfter([0, 2], [{ id: "---------> test", name: "test" }])
    expect(tree.getValues(rootNode!)).toMatchInlineSnapshot(`
      [
        "node_modules",
        "node_modules/zag-js",
        "node_modules/pandacss",
        "node_modules/@types",
        "node_modules/@types/react",
        "node_modules/@types/react-dom",
        "---------> test",
        "src",
        "src/app.tsx",
        "src/index.ts",
        "panda.config",
        "package.json",
        "renovate.json",
        "readme.md",
      ]
    `)
  })
})
