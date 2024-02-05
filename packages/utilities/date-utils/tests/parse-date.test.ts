import { parseDateString } from "../src"

describe("parse date", () => {
  test("with month", () => {
    const date = parseDateString("03", "en-US", "UTC")
    expect(date?.toString()).toMatchInlineSnapshot(`"2024-03-04"`)
  })

  test("with just month/day", () => {
    const date = parseDateString("03/28", "en-US", "UTC")
    expect(date?.toString()).toMatchInlineSnapshot(`"2024-03-28"`)
  })

  test("with just month/day/year", () => {
    const date = parseDateString("03/28/2023", "en-US", "UTC")
    expect(date?.toString()).toMatchInlineSnapshot(`"2023-03-28"`)
  })

  test("with just month/day/year [shortform]", () => {
    const date = parseDateString("03/28/23", "en-US", "UTC")
    expect(date?.toString()).toMatchInlineSnapshot(`"2023-03-28"`)
  })
})
