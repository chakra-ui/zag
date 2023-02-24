import { getDecadeRange } from "../src"

describe("getDecadeRange", () => {
  it("returns correct decade range", () => {
    expect(getDecadeRange(2023)).toMatchInlineSnapshot(`
      [
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
