import { describe, expect, test } from "vitest"
import { reorder } from "./reorder"

describe("reorder", () => {
  test("keeps self before and self after unchanged", () => {
    const items = ["a", "b", "c", "d"]
    const itemToValue = (item: string) => item

    expect(reorder(items, { source: "c", target: "c", placement: "before", itemToValue })).toEqual(items)
    expect(reorder(items, { source: "c", target: "c", placement: "after", itemToValue })).toEqual(items)
  })
})
