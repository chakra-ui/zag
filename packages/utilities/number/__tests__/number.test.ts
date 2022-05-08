import { countDecimals, roundToPrecision } from ".."

test("should round to precision", () => {
  expect(
    roundToPrecision(12.345678, {
      precision: 2,
      step: 1,
    }),
  ).toBe("12.35")
})

test("should count decimals", () => {
  expect(countDecimals(12.345678)).toBe(6)
})
