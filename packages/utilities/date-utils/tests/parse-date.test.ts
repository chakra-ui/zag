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

  test("with just month/day/year [shortform - different locale]", () => {
    const date = parseDateString("10.1.23", "de-DE", "UTC")
    expect(date).contain({
      month: 1,
      day: 10,
      year: 2023,
    })
  })

  test("with just month/day/year [malformed year - different locale]", () => {
    const date = parseDateString("10.1.293", "de-DE", "UTC")
    expect(date).contain({
      month: 1,
      day: 10,
      year: 2930,
    })
  })

  test("cs-CZ full format with dot-space separators", () => {
    const date = parseDateString("20. 10. 2000", "cs-CZ", "UTC")
    expect(date).contain({
      day: 20,
      month: 10,
      year: 2000,
    })
  })

  test("cs-CZ short form without spaces", () => {
    const date = parseDateString("20.10.2000", "cs-CZ", "UTC")
    expect(date).contain({
      day: 20,
      month: 10,
      year: 2000,
    })
  })

  test("sk-SK full format with dot-space separators", () => {
    const date = parseDateString("20. 10. 2000", "sk-SK", "UTC")
    expect(date).contain({
      day: 20,
      month: 10,
      year: 2000,
    })
  })
})
