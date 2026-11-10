import { describe, expect, test } from "vitest"
import { getMoveTarget } from "./move-target"

const order = ["a", "b", "c", "d"]

describe("getMoveTarget", () => {
  test("moves one step back or forward", () => {
    expect(getMoveTarget(order, ["b"], { value: "b", to: "prev" })).toEqual({ target: "a", placement: "before" })
    expect(getMoveTarget(order, ["b"], { value: "b", to: "next" })).toEqual({ target: "c", placement: "after" })
  })

  test("moves to the start or end", () => {
    expect(getMoveTarget(order, ["c"], { value: "c", to: "first" })).toEqual({ target: "a", placement: "before" })
    expect(getMoveTarget(order, ["b"], { value: "b", to: "last" })).toEqual({ target: "d", placement: "after" })
  })

  test("does nothing at the edges", () => {
    expect(getMoveTarget(order, ["a"], { value: "a", to: "prev" })).toBeNull()
    expect(getMoveTarget(order, ["a"], { value: "a", to: "first" })).toBeNull()
    expect(getMoveTarget(order, ["d"], { value: "d", to: "next" })).toBeNull()
    expect(getMoveTarget(order, ["d"], { value: "d", to: "last" })).toBeNull()
  })

  test("skips the other items moving with it", () => {
    expect(getMoveTarget(order, ["b", "c"], { value: "c", to: "prev" })).toEqual({ target: "a", placement: "before" })
    expect(getMoveTarget(order, ["b", "c"], { value: "b", to: "next" })).toEqual({ target: "d", placement: "after" })
  })

  test("does nothing for an unknown value", () => {
    expect(getMoveTarget(order, ["x"], { value: "x", to: "next" })).toBeNull()
  })
})
