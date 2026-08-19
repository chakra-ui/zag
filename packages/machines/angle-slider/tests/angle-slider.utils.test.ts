import { describe, expect, test } from "vitest"
import { clampAngle, constrainAngle, getDisplayAngle, snapAngleToStep } from "../src/angle-slider.utils"

describe("@zag-js/angle-slider constrainAngle", () => {
  test("snaps to the nearest step (not the ceiling step)", () => {
    // regression: previously always rounded up (Math.ceil), biasing the value upward
    expect(constrainAngle(12, 5)).toBe(10) // 2.4 → 2, not 3
    expect(constrainAngle(13, 5)).toBe(15)
    expect(constrainAngle(45.2, 1)).toBe(45) // not 46
    expect(constrainAngle(45.7, 1)).toBe(46)
    expect(constrainAngle(40, 30)).toBe(30) // 1.33 → 1
    expect(constrainAngle(50, 30)).toBe(60) // 1.67 → 2
  })

  test("wraps within [0, 360) so the control is circular", () => {
    expect(constrainAngle(360, 1)).toBe(0)
    expect(constrainAngle(359.6, 1)).toBe(0) // rounds to 360 → wraps to 0
    expect(constrainAngle(358, 5)).toBe(0) // 71.6 → 72 → 360 → 0 (never out-of-range 360)
    expect(constrainAngle(-5, 1)).toBe(355) // relative drag past 0° wraps instead of sticking
  })

  test("passes through exact step values unchanged", () => {
    expect(constrainAngle(0, 1)).toBe(0)
    expect(constrainAngle(90, 1)).toBe(90)
    expect(constrainAngle(180, 5)).toBe(180)
  })
})

describe("@zag-js/angle-slider misc utils", () => {
  test("clampAngle clamps to [0, 359]", () => {
    expect(clampAngle(400)).toBe(359)
    expect(clampAngle(-10)).toBe(0)
    expect(clampAngle(123)).toBe(123)
  })

  test("snapAngleToStep snaps to nearest", () => {
    expect(snapAngleToStep(23, 10)).toBe(20)
    expect(snapAngleToStep(27, 10)).toBe(30)
  })

  test("getDisplayAngle mirrors the angle in RTL", () => {
    expect(getDisplayAngle(90, "ltr")).toBe(90)
    expect(getDisplayAngle(90, "rtl")).toBe(270)
    expect(getDisplayAngle(0, "rtl")).toBe(0)
  })
})
