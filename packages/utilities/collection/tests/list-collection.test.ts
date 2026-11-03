import { ListCollection } from "../src"

interface Item {
  label: string
  value: string
  disabled?: boolean | undefined
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
    const collection = new ListCollection<{
      label: string
      value: string
      type: string
      disabled?: boolean | undefined
    }>({
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

  test("update, upsert, insert and move with grouped collection", () => {
    const list = new ListCollection({
      items: groupItems,
      groupBy: (item) => item.type,
    })

    const bun: GroupItem = { label: "Bun", value: "bun", type: "runtime" }
    const values = (collection: ListCollection<GroupItem>) => collection.items.map((item) => item.value)

    expect(values(list.update("node", bun))).toEqual(["react", "bun", "vue", "deno", "solid"])
    expect(values(list.upsert("node", bun))).toEqual(["react", "bun", "vue", "deno", "solid"])
    expect(values(list.insertBefore("node", bun))).toEqual(["react", "bun", "node", "vue", "deno", "solid"])
    expect(values(list.insertAfter("node", bun))).toEqual(["react", "node", "bun", "vue", "deno", "solid"])
    expect(values(list.move("node", 0))).toEqual(["node", "react", "vue", "deno", "solid"])
  })

  test("search with grouped collection follows the grouped order", () => {
    const list = new ListCollection({
      items: [
        { label: "Apple", value: "apple", type: "fruit" },
        { label: "Avocado", value: "avocado", type: "vegetable" },
        { label: "Apricot", value: "apricot", type: "fruit" },
      ],
      groupBy: (item) => item.type,
    })

    const search = (currentValue: string | null) =>
      list.search("a", { state: { keysSoFar: "", timer: -1 }, currentValue })

    expect(search(null)).toBe("apple")
    expect(search("apple")).toBe("apricot")
    expect(search("apricot")).toBe("avocado")
    expect(search("avocado")).toBe("apple")
  })

  test("grouped caches rebuild when items is reassigned", () => {
    const list = new ListCollection({ items: groupItems, groupBy: (item) => item.type })
    expect(list.at(0)?.value).toBe("react")
    expect(list.indexOf("vue")).toBe(1)

    list.items = [{ label: "Bun", value: "bun", type: "runtime" }, ...groupItems.slice(1)]

    // "runtime" now appears first: bun, node, deno, vue, solid
    expect(list.at(0)?.value).toBe("bun")
    expect(list.indexOf("bun")).toBe(0)
    expect(list.indexOf("vue")).toBe(3)
    expect(list.indexOf("react")).toBe(-1)
  })

  test("indexOf stays correct past the lookup map threshold", () => {
    const list = new ListCollection({ items: [...items, { label: "Dup", value: "react" }] })
    for (let i = 0; i < 6; i++) {
      expect(list.indexOf("react")).toBe(0)
      expect(list.indexOf("angular")).toBe(3)
      expect(list.indexOf("missing")).toBe(-1)
    }

    list.items = list.items.slice(1)
    for (let i = 0; i < 6; i++) expect(list.indexOf("react")).toBe(list.items.length - 1)
  })

  test("mutations work on subclasses with custom constructors", () => {
    class TaggedCollection extends ListCollection<Item, TaggedCollection> {
      constructor(
        options: { items: Item[] },
        public tag: string,
      ) {
        super(options)
      }
      protected override createCollection(items: Item[]): TaggedCollection {
        return new TaggedCollection({ ...this.options, items }, this.tag)
      }
    }

    class PlainSubclass extends ListCollection<Item> {
      constructor(
        options: { items: Item[] },
        private required: string,
      ) {
        super(options)
      }
      getTag() {
        return this.required
      }
    }

    const tagged = new TaggedCollection({ items }, "x").append({ label: "Svelte", value: "svelte" })
    expect(tagged).toBeInstanceOf(TaggedCollection)
    expect(tagged.tag).toBe("x")
    expect(tagged.size).toBe(5)

    // Without an override, mutations fall back to a plain ListCollection instead of crashing
    const plain = new PlainSubclass({ items }, "y").append({ label: "Svelte", value: "svelte" })
    expect(plain.size).toBe(5)
    expect(plain).not.toBeInstanceOf(PlainSubclass)
    expectTypeOf(plain).toEqualTypeOf<ListCollection<Item>>()
    expectTypeOf(tagged).toEqualTypeOf<TaggedCollection>()
  })

  test("upsert / update existing item", () => {
    const updatedItem = { label: "React 18", value: "react", disabled: false }
    const next = list.upsert("react", updatedItem)

    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)

    expect(next.find("react")).toMatchInlineSnapshot(`
      {
        "disabled": false,
        "label": "React 18",
        "value": "react",
      }
    `)

    expect(next.size).toBe(4)
  })

  test("upsert / insert new item", () => {
    const newItem = { label: "Svelte", value: "svelte", disabled: false }
    const next = list.upsert("svelte", newItem)

    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
        "svelte",
      ]
    `)

    expect(next.find("svelte")).toMatchInlineSnapshot(`
      {
        "disabled": false,
        "label": "Svelte",
        "value": "svelte",
      }
    `)

    expect(next.size).toBe(5)
  })

  test("upsert / preserves original collection", () => {
    const originalSize = list.size
    const originalValues = list.getValues()

    const newItem = { label: "Svelte", value: "svelte", disabled: false }
    const next = list.upsert("svelte", newItem)

    // Original collection should be unchanged
    expect(list.size).toBe(originalSize)
    expect(list.getValues()).toEqual(originalValues)
    expect(list.has("svelte")).toBe(false)

    // New collection should have the upserted item
    expect(next.size).toBe(originalSize + 1)
    expect(next.has("svelte")).toBe(true)
  })

  test("upsert / update with different value should not work", () => {
    // This test ensures that upsert uses the value parameter to find the item,
    // not the item's value property
    const updatedItem = { label: "React 18", value: "react-new", disabled: false }
    const next = list.upsert("react", updatedItem)

    expect(next.getValues()).toMatchInlineSnapshot(`
      [
        "react-new",
        "vue",
        "solid",
        "angular",
      ]
    `)

    expect(next.find("react")).toBe(null)
    expect(next.find("react-new")).toMatchInlineSnapshot(`
      {
        "disabled": false,
        "label": "React 18",
        "value": "react-new",
      }
    `)
  })
})
