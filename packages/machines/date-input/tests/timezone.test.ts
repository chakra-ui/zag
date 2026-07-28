import { CalendarDate, CalendarDateTime, DateFormatter, ZonedDateTime } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { createFormatFn, getValueAsString, toFormatterDate } from "../src/utils/formatting"
import { IncompleteDate } from "../src/utils/incomplete-date"
import { defaultTranslations } from "../src/utils/placeholders"
import { processSegments } from "../src/utils/segments"

const ZONES = ["UTC", "Asia/Tokyo", "America/New_York", "Europe/Rome", "Pacific/Kiritimati"]

describe("@zag-js/date-input timezone-naive formatting (#3187)", () => {
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
      expect(format(time)).toBe("00:00")
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
      expect(format(date)).toBe("03/15/2024")
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
    expect(createFormatFn(formatter)(zoned)).toBe("09:30")
  })
})

describe("@zag-js/date-input toFormatterDate (#3187)", () => {
  test("anchors a naive value to the formatter's zone so wall-clock round-trips", () => {
    const time = new CalendarDateTime(2024, 1, 1, 0, 0, 0)
    for (const timeZone of ZONES) {
      const formatter = new DateFormatter("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone })
      expect(formatter.format(toFormatterDate(time, formatter))).toBe("00:00")
    }
  })

  test("keeps a ZonedDateTime's absolute instant intact", () => {
    const zoned = new ZonedDateTime(2024, 1, 1, "America/New_York", -5 * 3600000, 9, 30, 0)
    const formatter = new DateFormatter("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "America/New_York",
    })
    expect(toFormatterDate(zoned, formatter).getTime()).toBe(zoned.toDate().getTime())
  })
})

// Mirrors the segment-display pipeline (jsdom can't drive the segment input directly).
describe("@zag-js/date-input segment display (#3187)", () => {
  function getSegmentText(value: CalendarDateTime, formatter: DateFormatter, type: string) {
    const displayValue = new IncompleteDate(value.calendar, "h23", value)
    const segments = processSegments({
      dateValue: toFormatterDate(value, formatter),
      displayValue,
      formatter,
      locale: "en-US",
      translations: defaultTranslations,
      granularity: "minute",
    })
    return segments.find((segment) => segment.type === type)?.text
  }

  test("hour segment shows the typed value regardless of the formatter's zone", () => {
    const time = new CalendarDateTime(2024, 1, 1, 0, 0, 0)
    for (const timeZone of ZONES) {
      const formatter = new DateFormatter("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone })
      expect(getSegmentText(time, formatter, "hour")).toBe("00")
    }
  })
})
