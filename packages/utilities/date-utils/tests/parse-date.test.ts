import { parseDateString } from "../src"

describe("parse date", () => {
  test("with month", () => {
    const today = new Date()
    const date = parseDateString("03", "en-US", "UTC")
    expect(date).contain({
      month: 3,
      day: today.getDate(),
      year: today.getFullYear(),
    })
  })

  test("with just month/day", () => {
    const today = new Date()
    const date = parseDateString("03/28", "en-US", "UTC")
    expect(date).contain({
      month: 3,
      day: 28,
      year: today.getFullYear(),
    })
  })

  test("with just month/day/year", () => {
    const date = parseDateString("03/28/2023", "en-US", "UTC")
    expect(date).contain({
      month: 3,
      day: 28,
      year: 2023,
    })
  })

  test("with just month/day/year [shortform]", () => {
    const date = parseDateString("03/28/23", "en-US", "UTC")
    expect(date).contain({
      month: 3,
      day: 28,
      year: 2023,
    })
  })
})
