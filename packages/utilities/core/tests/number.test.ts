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

    // Decimal steps past max stay at max instead of dropping a step
    expect(snapValueToStep(0.4, 0, 0.3, 0.1)).toBe(0.3)
    expect(snapValueToStep(0.8, 0, 0.6, 0.2)).toBe(0.6)
    expect(snapValueToStep(5.2, 0, 4.6, 0.2)).toBe(4.6)
    expect(snapValueToStep(1.1, 0.1, 0.7, 0.2)).toBe(0.7)

    // A max off the step grid still snaps down to the last step
    expect(snapValueToStep(0.4, 0, 0.2995, 0.1)).toBe(0.2)
  })
})
