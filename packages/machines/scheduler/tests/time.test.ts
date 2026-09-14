import { CalendarDateTime } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { getDaysBetween, getMinutesBetween } from "../src/utils/time"

const dt = (y: number, m: number, d: number, h = 0, min = 0) => new CalendarDateTime(y, m, d, h, min)

describe("getMinutesBetween", () => {
  test("same day", () => {
    expect(getMinutesBetween(dt(2026, 9, 15, 9), dt(2026, 9, 15, 10, 30))).toBe(90)
  })

  test("spans midnight", () => {
    expect(getMinutesBetween(dt(2026, 9, 15, 23), dt(2026, 9, 16, 1))).toBe(120)
  })

  test("spans a month boundary", () => {
    expect(getMinutesBetween(dt(2026, 2, 28, 10), dt(2026, 3, 1, 10))).toBe(1440)
  })

  test("spans a leap day", () => {
    expect(getMinutesBetween(dt(2024, 2, 28, 10), dt(2024, 3, 1, 11, 30))).toBe(2 * 1440 + 90)
  })

  test("spans a year boundary", () => {
    expect(getMinutesBetween(dt(2026, 12, 31, 22), dt(2027, 1, 1, 2))).toBe(240)
  })

  test("is signed", () => {
    expect(getMinutesBetween(dt(2026, 9, 16, 1), dt(2026, 9, 15, 23))).toBe(-120)
  })
})

describe("getDaysBetween", () => {
  test("counts whole days and ignores time", () => {
    expect(getDaysBetween(dt(2026, 9, 15, 23), dt(2026, 9, 16, 1))).toBe(1)
    expect(getDaysBetween(dt(2026, 2, 28), dt(2026, 3, 1))).toBe(1)
    expect(getDaysBetween(dt(2024, 2, 28), dt(2024, 3, 1))).toBe(2)
  })
})
