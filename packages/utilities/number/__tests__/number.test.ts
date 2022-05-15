import { countDecimals, formatDecimal, increment, decrement } from ".."

describe("number utilities", () => {
  test("with unit step", () => {
    expect(formatDecimal(12.345678, { minFractionDigits: 2, maxFractionDigits: 2 })).toBe("12.35")
    expect(formatDecimal(12.345678, { maxFractionDigits: 3 })).toBe("12.346")
  })

  test("should count decimals", () => {
    expect(countDecimals(12.345678)).toBe(6)
  })

  test("should add numbers", () => {
    expect(increment(1.123, 0.004)).toBe(1.127)

    // handle regular overflow issue
    expect(12.01 + 0.04).not.toBe(12.05) // 12.049999999999999
    expect(increment(12.01, 0.04)).toBe(12.05)
    expect(increment(12.05, 0.05)).toBe(12.1)
  })

  test("should subtract numbers", () => {
    expect(12.015 - 0.004).not.toBe(12.019) // 12.011000000000001
    expect(decrement(12.015, 0.004)).toBe(12.011)
  })
})
