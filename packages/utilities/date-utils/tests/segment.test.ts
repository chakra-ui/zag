import { parseDate } from "@internationalized/date"
import { describe, expect, test } from "vitest"
import { addSegment, getSegmentLimits, setSegment } from "../src"

const focusedDate = parseDate("2023-01-10")

describe("Date utilities", () => {
  test("segment / limits", () => {
    expect(getSegmentLimits(focusedDate, "day")).toMatchInlineSnapshot(`
      {
        "max": 31,
        "min": 1,
        "value": 10,
      }
    `)

    expect(getSegmentLimits(focusedDate, "month")).toMatchInlineSnapshot(`
      {
        "max": 12,
        "min": 1,
        "value": 1,
      }
    `)

    expect(getSegmentLimits(focusedDate, "year")).toMatchInlineSnapshot(`
      {
        "max": 9999,
        "min": 1,
        "value": 2023,
      }
    `)
  })

  test("segment / add", () => {
    expect(addSegment(focusedDate, "day", 1).toString()).toMatchInlineSnapshot(`"2023-01-11"`)
    expect(addSegment(focusedDate, "month", 1).toString()).toMatchInlineSnapshot(`"2023-02-10"`)
    expect(addSegment(focusedDate, "year", 1).toString()).toMatchInlineSnapshot(`"2024-01-10"`)
  })

  test("segment / set", () => {
    expect(setSegment(focusedDate, "day", 12).toString()).toMatchInlineSnapshot(`"2023-01-12"`)
  })
})
