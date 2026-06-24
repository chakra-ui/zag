import { CalendarDate, CalendarDateTime, DateFormatter, ZonedDateTime } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { createFormatFn, getValueAsString } from "../src/utils/formatting"

describe("@zag-js/date-input timezone-naive formatting (#3187)", () => {
  const ZONES = ["UTC", "Asia/Tokyo", "America/New_York", "Europe/Rome", "Pacific/Kiritimati"]

  test("createFormatFn preserves the typed hour across formatter time zones", () => {
    const time = new CalendarDateTime(2024, 1, 1, 0, 0, 0)
    for (const timeZone of ZONES) {
      const formatter = new DateFormatter("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone,
      })
      const format = createFormatFn(formatter)
      expect(format(time, { locale: "en-US", timeZone: "UTC" })).toBe("00:00")
    }
  })

  test("createFormatFn preserves a naive date across formatter time zones", () => {
    const date = new CalendarDate(2024, 3, 15)
    for (const timeZone of ZONES) {
      const formatter = new DateFormatter("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone,
      })
      const format = createFormatFn(formatter)
      expect(format(date, { locale: "en-US", timeZone: "UTC" })).toBe("03/15/2024")
    }
  })

  test("getValueAsString preserves the typed hour with a consumer formatter", () => {
    const formatter = new DateFormatter("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    const props: Record<string, unknown> = {
      format: createFormatFn(formatter),
      locale: "en-US",
      timeZone: "UTC",
    }
    const prop = ((key: string) => props[key]) as any
    expect(getValueAsString([new CalendarDateTime(2024, 1, 1, 0, 0, 0)], prop)).toEqual(["00:00"])
  })

  test("ZonedDateTime instants are unaffected (absolute, formatter zone honored)", () => {
    const formatter = new DateFormatter("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "America/New_York",
    })
    const zoned = new ZonedDateTime(2024, 1, 1, "America/New_York", -5 * 3600000, 9, 30, 0)
    expect(createFormatFn(formatter)(zoned, { locale: "en-US", timeZone: "UTC" })).toBe("09:30")
  })
})
