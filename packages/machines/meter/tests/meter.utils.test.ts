import { describe, expect, test } from "vitest"
import { getMeterValueState, resolveMeterBounds, validateMeterBounds } from "../src/meter.utils"

describe("validateMeterBounds", () => {
  test("accepts valid min/max and optional low/high/optimum", () => {
    expect(() => validateMeterBounds(0, 100)).not.toThrow()
    expect(() => validateMeterBounds(0, 100, 20, 80, 50)).not.toThrow()
  })

  test("rejects a non-number min, max, low, high, or optimum", () => {
    expect(() => validateMeterBounds(Number.NaN, 100)).toThrow(/min/)
    expect(() => validateMeterBounds(0, Number.NaN)).toThrow(/max/)
    expect(() => validateMeterBounds(0, 100, Number.NaN)).toThrow(/low/)
    expect(() => validateMeterBounds(0, 100, 20, Number.NaN)).toThrow(/high/)
    expect(() => validateMeterBounds(0, 100, 20, 80, Number.NaN)).toThrow(/optimum/)
  })

  test("rejects min >= max", () => {
    expect(() => validateMeterBounds(100, 100)).toThrow(/min value/)
    expect(() => validateMeterBounds(120, 100)).toThrow(/min value/)
  })
})

describe("resolveMeterBounds", () => {
  test("defaults low to min, high to max, and optimum to the midpoint", () => {
    expect(resolveMeterBounds(0, 100)).toEqual({ min: 0, max: 100, low: 0, high: 100, optimum: 50 })
  })

  test("clamps low/high/optimum into min/max and keeps high >= low", () => {
    expect(resolveMeterBounds(0, 100, -10, 200, 150)).toEqual({
      min: 0,
      max: 100,
      low: 0,
      high: 100,
      optimum: 100,
    })
    expect(resolveMeterBounds(0, 100, 80, 20)).toEqual({ min: 0, max: 100, low: 80, high: 80, optimum: 50 })
  })
})

describe("getMeterValueState", () => {
  test("optimum below low: low is preferred, high is least-optimal", () => {
    const bounds = resolveMeterBounds(0, 100, 60, 85, 10)
    expect(getMeterValueState(10, bounds)).toBe("optimal")
    expect(getMeterValueState(59, bounds)).toBe("optimal")
    expect(getMeterValueState(60, bounds)).toBe("suboptimal")
    expect(getMeterValueState(85, bounds)).toBe("suboptimal")
    expect(getMeterValueState(86, bounds)).toBe("least-optimal")
  })

  test("optimum above high: high is preferred, low is least-optimal", () => {
    const bounds = resolveMeterBounds(0, 100, 20, 80, 90)
    expect(getMeterValueState(90, bounds)).toBe("optimal")
    expect(getMeterValueState(81, bounds)).toBe("optimal")
    expect(getMeterValueState(80, bounds)).toBe("suboptimal")
    expect(getMeterValueState(20, bounds)).toBe("suboptimal")
    expect(getMeterValueState(19, bounds)).toBe("least-optimal")
  })

  test("optimum in the middle: the low–high band is preferred", () => {
    const bounds = resolveMeterBounds(0, 100, 30, 70, 50)
    expect(getMeterValueState(50, bounds)).toBe("optimal")
    expect(getMeterValueState(30, bounds)).toBe("optimal")
    expect(getMeterValueState(70, bounds)).toBe("optimal")
    expect(getMeterValueState(29, bounds)).toBe("suboptimal")
    expect(getMeterValueState(71, bounds)).toBe("suboptimal")
  })
})
