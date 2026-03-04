import {
  ListCollection,
  createSelectedItemMap,
  deriveSelectionState,
  resolveSelectedItems,
  updateSelectedItemMap,
} from "../src"

type Item = { label: string; value: string }

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

const collection = new ListCollection<Item>({
  items,
  itemToValue: (item) => item.value,
  itemToString: (item) => item.label,
})

describe("Selection Map", () => {
  it("resolves selected items from collection first", () => {
    const selectedItemMap = new Map<string, Item>([["react", { label: "React (old)", value: "react" }]])
    const resolved = resolveSelectedItems({ values: ["react"], collection, selectedItemMap })
    expect(resolved).toEqual([{ label: "React", value: "react" }])
  })

  it("falls back to selected item map when collection misses value", () => {
    const filteredCollection = new ListCollection<Item>({
      items: [items[1]],
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    })

    const selectedItemMap = new Map<string, Item>([["react", items[0]]])
    const resolved = resolveSelectedItems({ values: ["react"], collection: filteredCollection, selectedItemMap })
    expect(resolved).toEqual([items[0]])
  })

  it("derives next state and prunes removed values", () => {
    const selectedItemMap = new Map<string, Item>([
      ["react", items[0]],
      ["vue", items[1]],
    ])

    const next = deriveSelectionState({
      values: ["react"],
      collection,
      selectedItemMap,
    })

    expect(next.selectedItems).toEqual([items[0]])
    expect(Array.from(next.nextSelectedItemMap.keys())).toEqual(["react"])
  })

  it("creates selected item map from selected items", () => {
    const selectedItemMap = createSelectedItemMap({
      selectedItems: [items[0], items[2]],
      collection,
    })

    expect(Array.from(selectedItemMap.keys())).toEqual(["react", "solid"])
  })

  it("updates selected item map with latest items and prunes stale values", () => {
    const selectedItemMap = new Map<string, Item>([
      ["react", { label: "React (old)", value: "react" }],
      ["vue", items[1]],
    ])

    const next = updateSelectedItemMap({
      selectedItemMap,
      values: ["react"],
      selectedItems: [items[0]],
      collection,
    })

    expect(next.get("react")).toEqual(items[0])
    expect(next.has("vue")).toBe(false)
  })
})
