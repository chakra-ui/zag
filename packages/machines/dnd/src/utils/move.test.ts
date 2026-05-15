import { describe, expect, test } from "vitest"
import { getDestinationIndex, reorder } from "./move"

describe("getDestinationIndex", () => {
  test("keeps self before and self after as no-op destinations", () => {
    expect(getDestinationIndex(4, 2, 2, "before")).toBe(2)
    expect(getDestinationIndex(4, 2, 2, "after")).toBe(2)
  })
})

describe("reorder", () => {
  test("keeps self before and self after unchanged", () => {
    const items = ["a", "b", "c", "d"]
    const itemToValue = (item: string) => item

    expect(reorder(items, { source: "c", target: "c", placement: "before", itemToValue })).toEqual(items)
    expect(reorder(items, { source: "c", target: "c", placement: "after", itemToValue })).toEqual(items)
  })
})
