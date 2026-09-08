import { TreeCollection } from "@zag-js/collection"
import { describe, expect, test } from "vitest"
import { getCheckedState } from "../src/utils/checked-state"

const collection = new TreeCollection({
  rootNode: {
    value: "ROOT",
    children: [
      {
        value: "fruits",
        children: [{ value: "apple" }, { value: "banana" }],
      },
      { value: "veg" },
      // A branch whose children haven't loaded yet (e.g. async): it reports a
      // childrenCount but has no descendants.
      { value: "empty", childrenCount: 0 },
    ],
  },
})

function node(value: string) {
  const found = collection.findNode(value)
  if (!found) throw new Error(`node "${value}" not found`)
  return found
}

describe("getCheckedState", () => {
  test("childless branch with nothing checked is unchecked", () => {
    expect(getCheckedState(collection, node("empty"), [])).toBe(false)
  })

  test("childless branch stays unchecked even when unrelated nodes are checked", () => {
    expect(getCheckedState(collection, node("empty"), ["apple", "banana", "veg"])).toBe(false)
  })

  test("branch with all descendants checked is checked", () => {
    expect(getCheckedState(collection, node("fruits"), ["apple", "banana"])).toBe(true)
  })

  test("branch with some descendants checked is indeterminate", () => {
    expect(getCheckedState(collection, node("fruits"), ["apple"])).toBe("indeterminate")
  })

  test("branch with no descendants checked is unchecked", () => {
    expect(getCheckedState(collection, node("fruits"), [])).toBe(false)
  })

  test("leaf reflects its own membership in the checked set", () => {
    expect(getCheckedState(collection, node("apple"), ["apple"])).toBe(true)
    expect(getCheckedState(collection, node("apple"), ["banana"])).toBe(false)
  })
})
