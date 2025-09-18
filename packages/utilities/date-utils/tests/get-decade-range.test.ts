import { getDecadeRange } from "../src"

describe("getDecadeRange", () => {
  it("strict=false returns 12 years", () => {
    expect(getDecadeRange(2023)).toMatchInlineSnapshot(`
      [
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
        2031,
      ]
    `)
  })

  it("strict=true returns 10 years", () => {
    expect(getDecadeRange(2023, { strict: true })).toMatchInlineSnapshot(`
      [
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
      ]
    `)
  })
})
