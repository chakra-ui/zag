import { decrementValue, incrementValue } from "../src"

describe("number", () => {
  test("increment", () => {
    expect(incrementValue(1.123, 0.004)).toBe(1.127)
    expect(incrementValue(12.01, 0.04)).toBe(12.05)
    expect(incrementValue(12.05, 0.05)).toBe(12.1)
  })

  test("decrement", () => {
    expect(decrementValue(12.015, 0.004)).toBe(12.011)
  })
})
