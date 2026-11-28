import { describe, expect, test } from "vitest"
import { createToastStore } from "../src/toast.store"
import { getDefaultSwipeDirections, isTwoWay } from "../src/toast.utils"

describe("getDefaultSwipeDirections", () => {
  test("swipes toward the nearest edges of the placement", () => {
    expect(getDefaultSwipeDirections("bottom-end")).toEqual(["down", "right"])
    expect(getDefaultSwipeDirections("bottom-start")).toEqual(["down", "left"])
    expect(getDefaultSwipeDirections("top-end")).toEqual(["up", "right"])
    expect(getDefaultSwipeDirections("top")).toEqual(["up"])
    expect(getDefaultSwipeDirections("bottom")).toEqual(["down"])
  })

  test("mirrors the aligned edge in rtl", () => {
    expect(getDefaultSwipeDirections("bottom-end", "rtl")).toEqual(["down", "left"])
    expect(getDefaultSwipeDirections("top-start", "rtl")).toEqual(["up", "right"])
  })
})

// a two-way axis keeps pulling back from counting as a change of mind
describe("isTwoWay", () => {
  test("is true when both directions on the axis can dismiss", () => {
    expect(isTwoWay(["left", "right"], "right")).toBe(true)
    expect(isTwoWay(["up", "down", "left"], "up")).toBe(true)
  })

  test("is false when only one direction on the axis can dismiss", () => {
    expect(isTwoWay(["right"], "right")).toBe(false)
    expect(isTwoWay(["down", "right"], "down")).toBe(false)
  })
})

describe("store", () => {
  test("passes swipe directions to new toasts", () => {
    const store = createToastStore({ swipeDirections: ["left"] })
    store.create({ title: "Hello" })
    store.create({ title: "Override", swipeDirections: [] })
    const byTitle = (title: string) => store.getVisibleToasts().find((toast) => toast.title === title)
    expect(byTitle("Hello")?.swipeDirections).toEqual(["left"])
    expect(byTitle("Override")?.swipeDirections).toEqual([])
  })
})
