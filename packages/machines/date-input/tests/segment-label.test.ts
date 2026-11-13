import { describe, expect, test } from "vitest"
import { getSegmentLabel } from "../src/utils/segments"

describe("@zag-js/date-input segment labels", () => {
  test("keeps the English labels for en-US", () => {
    expect(
      ["year", "month", "day", "hour", "minute", "second", "dayPeriod", "era", "timeZoneName"].map((type) =>
        getSegmentLabel(type, "en-US"),
      ),
    ).toEqual(["Year", "Month", "Day", "Hour", "Minute", "Second", "AM/PM", "Era", "Time zone"])
  })

  test("localizes labels for the given locale", () => {
    expect(getSegmentLabel("month", "de-DE")).toBe("Monat")
    expect(getSegmentLabel("day", "fr-FR")).toBe("Jour")
    expect(getSegmentLabel("year", "ja-JP")).toBe("年")
  })

  test("falls back to English without a locale or for an invalid one", () => {
    expect(getSegmentLabel("month")).toBe("Month")
    expect(getSegmentLabel("month", "not a locale")).toBe("Month")
  })
})
