import { GridCollection } from "../src"

interface Item {
  label: string
  value: string
  disabled?: boolean | undefined
}

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte", disabled: true },
  { label: "Node.js", value: "node" },
  { label: "Deno", value: "deno" },
  { label: "TypeScript", value: "ts" },
  { label: "JavaScript", value: "js" },
  { label: "Rust", value: "rust" },
  { label: "Go", value: "go" },
]

/**
+---------+-------------------------+------------+
| React   | Vue                     | Solid      |
| Angular | Svelte(disabled)        | Node.js    |
| Deno    | TypeScript              | JavaScript |
| Rust    | Go                      |            |
+---------+-------------------------+------------+
*/

let grid: GridCollection<Item>

beforeEach(() => {
  grid = new GridCollection({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    columnCount: 3,
  })
})

describe("grid collection", () => {
  test("get next row", () => {
    expect(grid.getNextRowValue("ts")).toMatchInlineSnapshot(`"go"`)
    expect(grid.getNextRowValue("js")).toMatchInlineSnapshot(`"go"`)
    expect(grid.getNextRowValue("deno")).toMatchInlineSnapshot(`"rust"`)
    expect(grid.getNextRowValue("vue")).toMatchInlineSnapshot(`"ts"`)
  })

  test("get prev row", () => {
    expect(grid.getPreviousRowValue("ts")).toMatchInlineSnapshot(`"vue"`)
    expect(grid.getPreviousRowValue("js")).toMatchInlineSnapshot(`"node"`)
    expect(grid.getPreviousRowValue("deno")).toMatchInlineSnapshot(`"angular"`)
    expect(grid.getPreviousRowValue("vue")).toMatchInlineSnapshot(`"vue"`)
  })

  test("get rows", () => {
    const rows = grid.getRows()
    expect(rows.map((items) => items.map((item) => item.value))).toMatchInlineSnapshot(`
      [
        [
          "react",
          "vue",
          "solid",
        ],
        [
          "angular",
          "svelte",
          "node",
        ],
        [
          "deno",
          "ts",
          "js",
        ],
        [
          "rust",
          "go",
        ],
      ]
    `)
  })
})
