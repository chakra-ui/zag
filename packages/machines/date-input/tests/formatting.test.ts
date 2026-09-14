import { describe, expect, test } from "vitest"
import { getFormatterOptions } from "../src/utils/segments"

const defaults = {
  granularity: "minute",
  maxGranularity: "year",
  digitStyle: "numeric",
  hourCycle: undefined,
  timeZone: "UTC",
} as const

describe("@zag-js/date-input formatting", () => {
  test("includes fields from maxGranularity through granularity", () => {
    expect(getFormatterOptions(defaults)).toMatchObject({
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })

    expect(getFormatterOptions({ ...defaults, maxGranularity: "hour" })).toEqual({
      timeZone: "UTC",
      hourCycle: undefined,
      hour: "numeric",
      minute: "2-digit",
    })
  })

  test("rejects a maxGranularity smaller than granularity", () => {
    expect(() => getFormatterOptions({ ...defaults, granularity: "day", maxGranularity: "hour" })).toThrowError(
      "maxGranularity must be greater than granularity",
    )
  })
})
