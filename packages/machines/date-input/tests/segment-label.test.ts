import { expect, test } from "vitest"
import { getSegmentLabel } from "../src/utils/segments"

test("getSegmentLabel / uses the locale's field names", () => {
  expect(["month", "dayPeriod", "timeZoneName"].map((type: any) => getSegmentLabel(type, "en-US"))).toEqual([
    "Month",
    "AM/PM",
    "Time zone",
  ])
  expect(getSegmentLabel("month", "de-DE")).toBe("Monat")
  expect(getSegmentLabel("month", "de-DE", { segmentLabel: () => "Mon." })).toBe("Mon.")
})
