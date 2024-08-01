import { ListCollection } from "../src"

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
    list.setItems([
      { label: "Svelte", value: "svelte" },
      { label: "Node.js", value: "node" },
    ])
    expect(list.getValues()).toMatchInlineSnapshot(`
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
    list.insertBefore("react", { label: "Svelte", value: "svelte" })
    expect(list.getValues()).toMatchInlineSnapshot(`
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
    list.insertBefore("<random>", { label: "Svelte", value: "svelte" })
    expect(list.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("insert after / valid", () => {
    list.insertAfter("solid", { label: "Svelte", value: "svelte" })
    expect(list.getValues()).toMatchInlineSnapshot(`
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
    list.insertAfter("<random>", { label: "Svelte", value: "svelte" })
    expect(list.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "solid",
        "angular",
      ]
    `)
  })

  test("reorder / valid", () => {
    list.reorder(2, 1)
    expect(list.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "solid",
        "vue",
        "angular",
      ]
    `)
  })

  test("reorder / invalid", () => {
    list.reorder(2, 5)
    expect(list.getValues()).toMatchInlineSnapshot(`
      [
        "react",
        "vue",
        "angular",
        "solid",
      ]
    `)
  })
})
