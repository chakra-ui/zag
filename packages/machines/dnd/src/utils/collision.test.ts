import { createRect } from "@zag-js/rect-utils"
import { describe, expect, test } from "vitest"
import { closestGrid, midpointPlacement } from "./collision"
import type { DropEntry } from "../dnd.types"

function createGridEntries(): DropEntry[] {
  return Array.from({ length: 9 }, (_, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    return {
      value: String(index + 1),
      rect: createRect({
        x: col * 100,
        y: row * 60,
        width: 90,
        height: 50,
      }),
    }
  })
}

function project(entry: DropEntry) {
  return entry.rect
}

describe("closestGrid", () => {
  test("maps projected grid slots to dnd-kit style destination indexes", () => {
    const entries = createGridEntries()
    const dragValues = new Set(["1"])

    expect(
      closestGrid(entries[0].rect.center, entries, {
        activeValue: "1",
        activeRect: project(entries[0]),
        dragValues,
        edgeThreshold: 5,
        allowDropOn: false,
        orientation: "horizontal",
      }),
    ).toEqual({ value: "2", placement: "before" })

    expect(
      closestGrid(entries[2].rect.center, entries, {
        activeValue: "1",
        activeRect: project(entries[2]),
        dragValues,
        edgeThreshold: 5,
        allowDropOn: false,
        orientation: "horizontal",
      }),
    ).toEqual({ value: "4", placement: "before" })

    expect(
      closestGrid(entries[3].rect.center, entries, {
        activeValue: "1",
        activeRect: project(entries[3]),
        dragValues,
        edgeThreshold: 5,
        allowDropOn: false,
        orientation: "horizontal",
      }),
    ).toEqual({ value: "5", placement: "before" })

    expect(
      closestGrid(entries[8].rect.center, entries, {
        activeValue: "1",
        activeRect: project(entries[8]),
        dragValues,
        edgeThreshold: 5,
        allowDropOn: false,
        orientation: "horizontal",
      }),
    ).toEqual({ value: "9", placement: "after" })
  })

  test("maps backward movement to the same destination index as arrayMove", () => {
    const entries = createGridEntries()

    expect(
      closestGrid(entries[1].rect.center, entries, {
        activeValue: "6",
        activeRect: project(entries[1]),
        dragValues: new Set(["6"]),
        edgeThreshold: 5,
        allowDropOn: false,
        orientation: "horizontal",
      }),
    ).toEqual({ value: "2", placement: "before" })
  })
})

describe("midpointPlacement", () => {
  const rect = createRect({ x: 0, y: 0, width: 100, height: 40 })

  test("splits a vertical target at the midpoint", () => {
    expect(midpointPlacement({ x: 50, y: 10 }, rect, "vertical")).toBe("before")
    expect(midpointPlacement({ x: 50, y: 30 }, rect, "vertical")).toBe("after")
  })

  test("splits a horizontal target at the midpoint", () => {
    expect(midpointPlacement({ x: 20, y: 20 }, rect, "horizontal")).toBe("before")
    expect(midpointPlacement({ x: 80, y: 20 }, rect, "horizontal")).toBe("after")
  })
})
