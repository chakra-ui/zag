import { getDecadeRange } from "../src"

describe("getDecadeRange", () => {
  it("returns the ten years of the decade", () => {
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
      ]
    `)
  })

  it("is anchored to the decade, not the year passed in", () => {
    expect(getDecadeRange(2020)).toEqual(getDecadeRange(2029))
    expect(getDecadeRange(2030).at(0)).toBe(2030)
  })
})
