import { describe, expect, test } from "vitest"
import { createToastStore } from "../src/toast.store"
import { createSwipeTracker, getDefaultSwipeDirections, SWIPE_THRESHOLD } from "../src/utils/swipe"

const drag = (tracker: ReturnType<typeof createSwipeTracker>, points: Array<[number, number]>) =>
  points.map(([x, y]) => tracker.move({ x, y })).at(-1)!

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

describe("createSwipeTracker", () => {
  test("dismisses past the threshold in an allowed direction", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    const result = drag(tracker, [
      [0, 0],
      [20, 0],
      [SWIPE_THRESHOLD + 5, 0],
    ])
    expect(result).toEqual({ offset: { x: SWIPE_THRESHOLD + 5, y: 0 }, direction: "right" })
    expect(tracker.end()).toBe("right")
  })

  test("snaps back below the threshold", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    drag(tracker, [
      [0, 0],
      [SWIPE_THRESHOLD - 5, 0],
    ])
    expect(tracker.end()).toBeNull()
  })

  test("a press without movement is not a swipe", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    expect(tracker.end()).toBeNull()
  })

  test("pulling back from the furthest point cancels the dismiss", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    drag(tracker, [
      [0, 0],
      [90, 0],
      [70, 0],
    ])
    expect(tracker.end()).toBeNull()
  })

  test("pulling back less than the cancel distance still dismisses", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    drag(tracker, [
      [0, 0],
      [90, 0],
      [84, 0],
    ])
    expect(tracker.end()).toBe("right")
  })

  test("pulling back is not a cancel when both directions on the axis can dismiss", () => {
    const tracker = createSwipeTracker(["left", "right"], { x: 0, y: 0 })
    drag(tracker, [
      [0, 0],
      [90, 0],
      [60, 0],
    ])
    expect(tracker.end()).toBe("right")
  })

  test("damps movement in directions that can't dismiss", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    const result = drag(tracker, [
      [0, 0],
      [-100, 0],
    ])
    expect(result.offset.x).toBeCloseTo(-10)
    expect(result.direction).toBeNull()
    expect(tracker.end()).toBeNull()
  })

  test("ignores the axis with no allowed directions", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    const result = drag(tracker, [
      [0, 0],
      [60, 30],
    ])
    expect(result.offset).toEqual({ x: 60, y: 0 })
  })

  test("locks to the first axis when both axes are allowed", () => {
    const tracker = createSwipeTracker(["down", "right"], { x: 0, y: 0 })
    const result = drag(tracker, [
      [0, 0],
      [10, 2],
      [20, 80],
    ])
    expect(result.offset.y).toBe(0)
    expect(result.direction).toBe("right")
    // Vertical movement can't dismiss once the gesture is locked horizontal
    expect(tracker.end()).toBeNull()
  })

  test("starts from the first move, not the press point", () => {
    const tracker = createSwipeTracker(["right"], { x: 0, y: 0 })
    const result = drag(tracker, [
      [30, 0],
      [50, 0],
    ])
    expect(result.offset.x).toBe(20)
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
