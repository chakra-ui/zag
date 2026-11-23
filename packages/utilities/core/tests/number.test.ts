import {
  decrementValue,
  getPercentValue,
  getValuePercent,
  incrementValue,
  roundToStepPrecision,
  snapValueToStep,
  snapValueToStepDirection,
} from "../src"

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

    expect(snapValueToStep(0.4, 0, 0.3, 0.1)).toBe(0.3)
    expect(snapValueToStep(0.8, 0, 0.6, 0.2)).toBe(0.6)
    expect(snapValueToStep(5.2, 0, 4.6, 0.2)).toBe(4.6)
    expect(snapValueToStep(1.1, 0.1, 0.7, 0.2)).toBe(0.7)

    expect(snapValueToStep(0.4, 0, 0.2995, 0.1)).toBe(0.2)
  })

  test("step precision handles exponent steps", () => {
    expect(roundToStepPrecision(0.1 + 0.2, 1e-7)).toBe(0.3)
    expect(roundToStepPrecision(0.1 + 0.2, 0.1)).toBe(0.3)
    expect(roundToStepPrecision(1.25, 1)).toBe(1.25)
  })

  test("snapping keeps an off-grid max", () => {
    expect(snapValueToStep(0.97, 0, 0.95, 0.1)).toBe(0.9)
    expect(snapValueToStep(0.95, 0.05, 0.95, 0.1)).toBe(0.95)
  })

  test("percent of an empty range is 0", () => {
    expect(getValuePercent(5, 5, 5)).toBe(0)
    expect(getValuePercent(5, 0, 10)).toBe(0.5)
  })
})

describe("snapValueToStepDirection", () => {
  test("rounds toward where the step came from", () => {
    expect(snapValueToStepDirection(6.5, 0, 1, 1)).toBe(6)
    expect(snapValueToStepDirection(4.5, 0, 1, -1)).toBe(5)
  })

  test("keeps a value already on the grid despite float noise", () => {
    expect(snapValueToStepDirection(0.1 + 0.2, 0, 0.1, 1)).toBe(0.3)
    expect(snapValueToStepDirection(0.7 - 0.1, 0, 0.1, -1)).toBe(0.6)
  })

  test("measures the grid from the base", () => {
    expect(snapValueToStepDirection(2, 0.5, 1, 1)).toBe(1.5)
  })
})

describe("snapValueToStep", () => {
  test("returns clean values without float noise", () => {
    expect(snapValueToStep(-0.537, -10, 0, 1)).toBe(-1)
    expect(snapValueToStep(3.441, -10, 990, 5)).toBe(5)
    expect(snapValueToStep(0.42, -10, 90, 1)).toBe(0)
  })

  test("keeps the largest on-grid value below an off-grid max", () => {
    expect(snapValueToStep(100, -10, -9.05, 0.01)).toBe(-9.05)
    expect(snapValueToStep(100, 0.05, 1, 2.5)).toBe(1)
  })

  test("rounds a midpoint up", () => {
    expect(snapValueToStep(0.8, 0.05, 7.35, 0.1)).toBe(0.85)
  })
})

describe("scale", () => {
  test("a log scale puts the geometric middle at the center", () => {
    expect(getValuePercent(Math.sqrt(20 * 20000), 20, 20000, "log")).toBeCloseTo(0.5, 10)
    expect(getPercentValue(0.5, 20, 20000, 1, "log")).toBe(632)
  })

  test("a log scale maps the ends and stays inside the range", () => {
    expect(getValuePercent(20, 20, 20000, "log")).toBe(0)
    expect(getValuePercent(20000, 20, 20000, "log")).toBe(1)
    expect(getValuePercent(0, 20, 20000, "log")).toBe(0)
    expect(getPercentValue(1, 20, 20000, 1, "log")).toBe(20000)
  })

  test("a custom scale maps through its own curve", () => {
    const sqrt = { to: Math.sqrt, from: (p: number) => p * p }
    expect(getValuePercent(25, 0, 100, sqrt)).toBe(0.5)
    expect(getPercentValue(0.5, 0, 100, 1, sqrt)).toBe(25)
  })

  test("linear is unchanged", () => {
    expect(getValuePercent(25, 0, 100)).toBe(0.25)
    expect(getPercentValue(0.25, 0, 100, 1)).toBe(25)
  })
})
