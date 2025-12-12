import { describe, expect, test } from "vitest"
import { SizeTracker } from "../src/utils/size-tracker"

describe("@zag-js/virtualizer - SizeTracker", () => {
  test("getTotalSize returns sum of sizes + gaps (no trailing gap)", () => {
    const tracker = new SizeTracker(3, 10, () => 40) // [40,40,40] with 10px gaps => 40+10+40+10+40 = 140
    expect(tracker.getTotalSize(0, 0)).toBe(140)
  })

  test("getTotalSize includes padding", () => {
    const tracker = new SizeTracker(2, 0, () => 50) // total 100
    expect(tracker.getTotalSize(12, 8)).toBe(120)
  })
})
