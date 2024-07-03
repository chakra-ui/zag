import { Collection } from "../src"

interface Item {
  label: string
  value: string
  disabled?: boolean
}

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid", disabled: true },
  { label: "Angular", value: "angular" },
]

let collection: Collection

beforeEach(() => {
  collection = new Collection({
    items: items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => !!item.disabled,
  })
})

describe("collection", () => {
  test("get values", () => {
    expect(collection.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("count", () => {
    expect(collection.size).toMatchInlineSnapshot(`4`)
  })

  test("next item", () => {
    expect(collection.getNextValue("react")).toMatchInlineSnapshot(`"vue"`)
    expect(collection.getNextValue("angular")).toMatchInlineSnapshot(`null`)
  })

  test("prev item", () => {
    expect(collection.getPreviousValue("solid")).toMatchInlineSnapshot(`"vue"`)
    expect(collection.getPreviousValue("react")).toMatchInlineSnapshot(`null`)
  })

  test("set items", () => {
    collection.setItems([
      { label: "Svelte", value: "svelte" },
      { label: "Node.js", value: "node" },
    ])
    expect(collection.getValues()).toMatchInlineSnapshot(`
      [
        "svelte",
        "node",
      ]
    `)
  })

  test("get value at index", () => {
    expect(collection.at(1)).toMatchInlineSnapshot(`
      {
        "label": "Vue",
        "value": "vue",
      }
    `)
    expect(collection.at(5)).toMatchInlineSnapshot(`null`)
  })

  test("sort", () => {
    expect(collection.sort(["solid", "vue"])).toMatchInlineSnapshot(`
      [
        "vue",
        "solid",
      ]
    `)
  })

  test("item to value", () => {
    expect(collection.getItemValue(items[0])).toMatchInlineSnapshot(`"react"`)
    expect(collection.getItemValue(items[2])).toMatchInlineSnapshot(`"solid"`)
  })

  test("item to string", () => {
    expect(collection.stringifyItem(items[0])).toMatchInlineSnapshot(`"React"`)
  })

  test("items to string", () => {
    expect(collection.stringifyItems([items[0], items[3]])).toMatchInlineSnapshot(`"React, Angular"`)
  })

  test("item to disabled", () => {
    expect(collection.getItemDisabled(items[0])).toMatchInlineSnapshot(`false`)
    expect(collection.getItemDisabled(items[2])).toMatchInlineSnapshot(`true`)
  })

  test("first and last value", () => {
    expect(collection.firstValue).toMatchInlineSnapshot(`"react"`)
    expect(collection.lastValue).toMatchInlineSnapshot(`"angular"`)
  })

  test("has value", () => {
    expect(collection.has("react")).toMatchInlineSnapshot(`true`)
    expect(collection.has("<random>")).toMatchInlineSnapshot(`false`)
  })

  test("search finds a value based on a query", () => {
    const options = { state: { keysSoFar: "", timer: -1 }, currentValue: null, timeout: 350 }
    expect(collection.search("r", options)).toMatchInlineSnapshot(`"react"`)
  })

  test("insert before / valid", () => {
    collection.insertBefore("react", { label: "Svelte", value: "svelte" })
    expect(collection.getValues()).toMatchInlineSnapshot(`
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
    collection.insertBefore("<random>", { label: "Svelte", value: "svelte" })
    expect(collection.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("insert after / valid", () => {
    collection.insertAfter("solid", { label: "Svelte", value: "svelte" })
    expect(collection.getValues()).toMatchInlineSnapshot(`
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
    collection.insertAfter("<random>", { label: "Svelte", value: "svelte" })
    expect(collection.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("reorder / valid", () => {
    collection.reorder(2, 1)
    expect(collection.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "solid",
        "vue",
        "angular",
      ]
    `)
  })

  test("reorder / invalid", () => {
    collection.reorder(2, 5)
    expect(collection.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "angular",
        "solid",
      ]
    `)
  })
})
