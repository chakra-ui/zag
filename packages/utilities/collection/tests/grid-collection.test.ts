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

  test("edits keep the grid", () => {
    const next = grid.append({ label: "Extra", value: "extra" }).setItems(items.slice(0, 4))
    expect(next).toBeInstanceOf(GridCollection)
    expect(next.columnCount).toBe(grid.columnCount)
    expect(next.getRowCount()).toBe(Math.ceil(4 / grid.columnCount))
  })

  test("copy keeps the grid type", () => {
    const grid = new GridCollection({ items, columnCount: 3 })
    const next = grid.update("vue", { label: "Vue 3", value: "vue3" })
    expect(next).toBeInstanceOf(GridCollection)
    expectTypeOf(next).toEqualTypeOf<GridCollection<Item>>()
    expect(next.columnCount).toBe(3)
    expect(next.getCell(0, 1)?.value).toBe("vue3")

    // grid API stays available through the mutation methods
    expect(grid.setItems(items.slice(0, 2)).getCell(0, 0)?.value).toBe("react")
    expect(grid.append({ label: "Zig", value: "zig" }).getNextRowValue("js")).toBe("zig")
    expect(
      grid
        .remove("react")
        .moveBefore("vue", "solid")
        .getRows()[0]
        .map((item) => item.value),
    ).toEqual(["solid", "vue", "angular"])
  })

  test("copy keeps the current column count", () => {
    const grid = new GridCollection({ items, columnCount: 2 })
    grid.columnCount = 4
    expect(grid.copy().columnCount).toBe(4)
    expect(grid.append({ label: "Zig", value: "zig" }).columnCount).toBe(4)
  })

  test("rows follow grouped order", () => {
    const grouped = new GridCollection({
      items: [
        { label: "A1", value: "a1", group: "a" },
        { label: "B1", value: "b1", group: "b" },
        { label: "A2", value: "a2", group: "a" },
        { label: "B2", value: "b2", group: "b" },
      ],
      columnCount: 2,
      groupBy: (item) => item.group,
    })
    expect(grouped.getRows().map((row) => row.map((item) => item.value))).toEqual([
      ["a1", "a2"],
      ["b1", "b2"],
    ])
    expect(grouped.getValueCell("a2")).toEqual({ row: 0, column: 1 })
    expect(grouped.getNextRowValue("a1")).toBe("b1")
  })
})
