import { describe, expect, test } from "vitest"
import { getYearsRange } from "../src"

describe("Date utilities", () => {
  test("get year range", () => {
    expect(getYearsRange({ from: 2010, to: 2030 })).toMatchInlineSnapshot(`
      [
        2010,
        2011,
        2012,
        2013,
        2014,
        2015,
        2016,
        2017,
        2018,
        2019,
        2020,
        2021,
        2022,
        2023,
        2024,
        2025,
        2026,
        2027,
        2028,
        2029,
        2030,
      ]
    `)
  })
})
