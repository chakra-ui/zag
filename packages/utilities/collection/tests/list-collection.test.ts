import { ListCollection } from "../src"

interface Item {
  label: string
  value: string
  disabled?: boolean
}

interface GroupItem extends Item {
  type: "framework" | "runtime"
}

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid", disabled: true },
  { label: "Angular", value: "angular" },
]

let list: ListCollection

beforeEach(() => {
  list = new ListCollection({
    items: items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => !!item.disabled,
  })
})

describe("list collection", () => {
  test("get values", () => {
    expect(list.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("count", () => {
    expect(list.size).toMatchInlineSnapshot(`4`)
  })

  test("next item", () => {
    expect(list.getNextValue("react")).toMatchInlineSnapshot(`"vue"`)
    expect(list.getNextValue("angular")).toMatchInlineSnapshot(`null`)
  })

  test("prev item", () => {
    expect(list.getPreviousValue("solid")).toMatchInlineSnapshot(`"vue"`)
    expect(list.getPreviousValue("react")).toMatchInlineSnapshot(`null`)
  })

  test("set items", () => {
    const next = list.setItems([
      { label: "Svelte", value: "svelte" },
      { label: "Node.js", value: "node" },
    ])
    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "svelte",
        "node",
      ]
    `)
  })

  test("get value at index", () => {
    expect(list.at(1)).toMatchInlineSnapshot(`
      {
        "label": "Vue",
        "value": "vue",
      }
    `)
    expect(list.at(5)).toMatchInlineSnapshot(`null`)
  })

  test("sort", () => {
    expect(list.sort(["solid", "vue"])).toMatchInlineSnapshot(`
      [
        "vue",
        "solid",
      ]
    `)
  })

  test("item to value", () => {
    expect(list.getItemValue(items[0])).toMatchInlineSnapshot(`"react"`)
    expect(list.getItemValue(items[2])).toMatchInlineSnapshot(`"solid"`)
  })

  test("item to string", () => {
    expect(list.stringifyItem(items[0])).toMatchInlineSnapshot(`"React"`)
  })

  test("items to string", () => {
    expect(list.stringifyItems([items[0], items[3]])).toMatchInlineSnapshot(`"React, Angular"`)
  })

  test("item to disabled", () => {
    expect(list.getItemDisabled(items[0])).toMatchInlineSnapshot(`false`)
    expect(list.getItemDisabled(items[2])).toMatchInlineSnapshot(`true`)
  })

  test("first and last value", () => {
    expect(list.firstValue).toMatchInlineSnapshot(`"react"`)
    expect(list.lastValue).toMatchInlineSnapshot(`"angular"`)
  })

  test("has value", () => {
    expect(list.has("react")).toMatchInlineSnapshot(`true`)
    expect(list.has("<random>")).toMatchInlineSnapshot(`false`)
  })

  test("search finds a value based on a query", () => {
    const options = { state: { keysSoFar: "", timer: -1 }, currentValue: null, timeout: 350 }
    expect(list.search("r", options)).toMatchInlineSnapshot(`"react"`)
  })

  test("insert before / valid", () => {
    const next = list.insertBefore("react", { label: "Svelte", value: "svelte" })
    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "svelte",
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("insert before / invalid", () => {
    const next = list.insertBefore("<random>", { label: "Svelte", value: "svelte" })
    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("insert after / valid", () => {
    const next = list.insertAfter("solid", { label: "Svelte", value: "svelte" })
    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "svelte",
        "angular",
      ]
    `)
  })

  test("insert after / invalid", () => {
    const next = list.insertAfter("<random>", { label: "Svelte", value: "svelte" })
    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("reorder / valid", () => {
    const next = list.reorder(2, 1)
    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "solid",
        "vue",
        "angular",
      ]
    `)
  })

  test("reorder / invalid", () => {
    const next = list.reorder(2, 5)
    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "angular",
        "solid",
      ]
    `)
  })

  test("group entries", () => {
    const collection = new ListCollection<{ label: string; value: string; type: string; disabled?: boolean }>({
      items: [
        { label: "React", value: "react", type: "framework" },
        { label: "Vue", value: "vue", type: "framework" },
        { label: "Solid", value: "solid", type: "framework", disabled: true },
        { label: "Node.js", value: "node", type: "runtime" },
        { label: "Deno", value: "deno", type: "runtime" },
      ],
      groupBy: (item) => item.type,
    })

    const groups = collection.group()
    expect(groups).toMatchInlineSnapshot(`
      [
        [
          "framework",
          [
            {
              "label": "React",
              "type": "framework",
              "value": "react",
            },
            {
              "label": "Vue",
              "type": "framework",
              "value": "vue",
            },
            {
              "disabled": true,
              "label": "Solid",
              "type": "framework",
              "value": "solid",
            },
          ],
        ],
        [
          "runtime",
          [
            {
              "label": "Node.js",
              "type": "runtime",
              "value": "node",
            },
            {
              "label": "Deno",
              "type": "runtime",
              "value": "deno",
            },
          ],
        ],
      ]
    `)
  })

  const groupItems: GroupItem[] = [
    { label: "React", value: "react", type: "framework" },
    { label: "Node.js", value: "node", type: "runtime" },
    { label: "Vue", value: "vue", type: "framework" },
    { label: "Deno", value: "deno", type: "runtime" },
    { label: "Solid", value: "solid", type: "framework", disabled: true },
  ]

  test("group by", () => {
    const list = new ListCollection({
      items: groupItems,
      groupBy: (item) => item.type,
    })

    expect(list.group()).toMatchInlineSnapshot(`
      [
        [
          "framework",
          [
            {
              "label": "React",
              "type": "framework",
              "value": "react",
            },
            {
              "label": "Vue",
              "type": "framework",
              "value": "vue",
            },
            {
              "disabled": true,
              "label": "Solid",
              "type": "framework",
              "value": "solid",
            },
          ],
        ],
        [
          "runtime",
          [
            {
              "label": "Node.js",
              "type": "runtime",
              "value": "node",
            },
            {
              "label": "Deno",
              "type": "runtime",
              "value": "deno",
            },
          ],
        ],
      ]
    `)
  })

  test("group by / sort groups", () => {
    const list = new ListCollection({
      items: groupItems,
      groupBy: (item) => item.type,
      groupSort: ["runtime", "framework"],
    })

    expect(list.group()).toMatchInlineSnapshot(`
      [
        [
          "runtime",
          [
            {
              "label": "Node.js",
              "type": "runtime",
              "value": "node",
            },
            {
              "label": "Deno",
              "type": "runtime",
              "value": "deno",
            },
          ],
        ],
        [
          "framework",
          [
            {
              "label": "React",
              "type": "framework",
              "value": "react",
            },
            {
              "label": "Vue",
              "type": "framework",
              "value": "vue",
            },
            {
              "disabled": true,
              "label": "Solid",
              "type": "framework",
              "value": "solid",
            },
          ],
        ],
      ]
    `)
  })

  test("indexOf with grouped collection", () => {
    const list = new ListCollection({
      items: groupItems,
      groupBy: (item) => item.type,
      groupSort: ["runtime", "framework"],
    })

    expect(list.indexOf("node")).toMatchInlineSnapshot(`0`)
    expect(list.indexOf("deno")).toMatchInlineSnapshot(`1`)
    expect(list.indexOf("react")).toMatchInlineSnapshot(`2`)
    expect(list.indexOf("vue")).toMatchInlineSnapshot(`3`)
    expect(list.indexOf("solid")).toMatchInlineSnapshot(`4`)
    expect(list.indexOf("invalid")).toMatchInlineSnapshot(`-1`)
  })

  test("at with grouped collection", () => {
    const list = new ListCollection({
      items: groupItems,
      groupBy: (item) => item.type,
      groupSort: ["runtime", "framework"],
    })

    expect(list.at(0)).toMatchInlineSnapshot(`
      {
        "label": "Node.js",
        "type": "runtime",
        "value": "node",
      }
    `)
    expect(list.at(1)).toMatchInlineSnapshot(`
      {
        "label": "Deno",
        "type": "runtime",
        "value": "deno",
      }
    `)
    expect(list.at(2)).toMatchInlineSnapshot(`
      {
        "label": "React",
        "type": "framework",
        "value": "react",
      }
    `)
    expect(list.at(3)).toMatchInlineSnapshot(`
      {
        "label": "Vue",
        "type": "framework",
        "value": "vue",
      }
    `)
    expect(list.at(4)).toMatchInlineSnapshot(`
      {
        "disabled": true,
        "label": "Solid",
        "type": "framework",
        "value": "solid",
      }
    `)
  })
})
