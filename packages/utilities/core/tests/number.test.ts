import { decrementValue, incrementValue, snapValueToStep } from "../src"

describe("number", () => {
  test("increment", () => {
    expect(incrementValue(1.123, 0.004)).toBe(1.127)
    expect(incrementValue(12.01, 0.04)).toBe(12.05)
    expect(incrementValue(12.05, 0.05)).toBe(12.1)
  })

  test("decrement", () => {
    expect(decrementValue(12.015, 0.004)).toBe(12.011)
  })

  test("snapValueToStep", () => {
    // When value exceeds max and step is larger than range, should clamp to max
    expect(snapValueToStep(240, 0, 100, 200)).toBe(100)

    // When value is below min, should clamp to min
    expect(snapValueToStep(-50, 0, 100, 10)).toBe(0)

    // Normal snapping within range
    expect(snapValueToStep(23, 0, 100, 10)).toBe(20)
    expect(snapValueToStep(27, 0, 100, 10)).toBe(30)

    // When value equals a step boundary
    expect(snapValueToStep(50, 0, 100, 10)).toBe(50)

    // When step fits evenly in range
    expect(snapValueToStep(150, 0, 100, 25)).toBe(100)
  })
})
