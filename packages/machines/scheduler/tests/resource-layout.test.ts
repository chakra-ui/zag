import { CalendarDateTime } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { getEventConflicts, getEventLayout } from "../src/utils/layout"

const at = (hour: number, minute = 0) => new CalendarDateTime(2026, 9, 15, hour, minute)

const acrossResources = [
  { id: "a", title: "A", resourceId: "amelia", start: at(9), end: at(10) },
  { id: "b", title: "B", resourceId: "brooke", start: at(9, 30), end: at(11) },
] as any

const sameResource = [
  { id: "a", title: "A", resourceId: "amelia", start: at(9), end: at(10) },
  { id: "b", title: "B", resourceId: "amelia", start: at(9, 30), end: at(11) },
] as any

const noResources = [
  { id: "a", title: "A", start: at(9), end: at(10) },
  { id: "b", title: "B", start: at(9, 30), end: at(11) },
] as any

describe("resource-aware layout", () => {
  test("events on different resources do not conflict", () => {
    expect(getEventConflicts(acrossResources).size).toBe(0)
  })

  test("events on the same resource still conflict", () => {
    expect(getEventConflicts(sameResource)).toEqual(new Set(["a", "b"]))
  })

  test("different resources each keep full width", () => {
    const layout = getEventLayout({ events: acrossResources, dayStartHour: 8, dayEndHour: 18 })
    expect(layout.get("a")!.width).toBe(1)
    expect(layout.get("b")!.width).toBe(1)
  })

  test("the same resource splits into columns", () => {
    const layout = getEventLayout({ events: sameResource, dayStartHour: 8, dayEndHour: 18 })
    expect(layout.get("a")!.width).toBeLessThan(1)
    expect(layout.get("b")!.width).toBeLessThan(1)
  })

  test("without resources the ungrouped behaviour is unchanged", () => {
    expect(getEventConflicts(noResources)).toEqual(new Set(["a", "b"]))
    expect(getEventLayout({ events: noResources, dayStartHour: 8, dayEndHour: 18 }).get("a")!.width).toBeLessThan(1)
  })
})
