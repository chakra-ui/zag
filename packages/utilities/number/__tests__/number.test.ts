import { countDecimals, roundToPrecision } from ".."

describe("roundToPrecision", () => {
  test("with unit step", () => {
    expect(
      roundToPrecision(12.345678, {
        precision: 2,
        step: 1,
      }),
    ).toBe("12.35")
  })

  test("with fractional step", () => {
    expect(
      // will use the maximum of step decimals and precision
      roundToPrecision(12.345678, {
        precision: 2,
        step: 0.001,
      }),
    ).toBe("12.346")
  })
})

test("should count decimals", () => {
  expect(countDecimals(12.345678)).toBe(6)
})
