import { describe, expect, test } from "vitest"
import { SizeTracker } from "../src/utils/size-tracker"

describe("SizeTracker", () => {
  test("getSize returns estimate before measurement", () => {
    const tracker = new SizeTracker(5, 0, () => 40)
    expect(tracker.getSize(0)).toBe(40)
    expect(tracker.getSize(4)).toBe(40)
  })

  test("getSize returns measured size after measurement", () => {
    const tracker = new SizeTracker(5, 0, () => 40)
    tracker.setMeasuredSize(2, 60)
    expect(tracker.getSize(2)).toBe(60)
    expect(tracker.getSize(1)).toBe(40)
  })

  test("setMeasuredSize returns false when size unchanged", () => {
    const tracker = new SizeTracker(3, 0, () => 40)
    expect(tracker.setMeasuredSize(0, 40)).toBe(false)
    expect(tracker.setMeasuredSize(0, 50)).toBe(true)
    expect(tracker.setMeasuredSize(0, 50)).toBe(false)
  })

  test("getPrefixSum with no gap", () => {
    const tracker = new SizeTracker(4, 0, () => 50)
    expect(tracker.getPrefixSum(0)).toBe(50)
    expect(tracker.getPrefixSum(1)).toBe(100)
    expect(tracker.getPrefixSum(3)).toBe(200)
  })

  test("getPrefixSum with gap", () => {
    const tracker = new SizeTracker(3, 10, () => 40)
    // [40+10, 40+10, 40] = [50, 50, 40] -> prefix: [50, 100, 140]
    expect(tracker.getPrefixSum(0)).toBe(50)
    expect(tracker.getPrefixSum(1)).toBe(100)
    expect(tracker.getPrefixSum(2)).toBe(140)
  })

  test("getPrefixSum negative index returns 0", () => {
    const tracker = new SizeTracker(3, 0, () => 40)
    expect(tracker.getPrefixSum(-1)).toBe(0)
  })

  test("prefix sums update after measurement", () => {
    const tracker = new SizeTracker(3, 0, () => 40)
    tracker.getPrefixSum(0) // force init

    tracker.setMeasuredSize(0, 60) // delta = 20
    expect(tracker.getPrefixSum(0)).toBe(60)
    expect(tracker.getPrefixSum(1)).toBe(100)
    expect(tracker.getPrefixSum(2)).toBe(140)
  })

  test("findIndexAtOffset with padding", () => {
    const tracker = new SizeTracker(4, 0, () => 50)
    expect(tracker.findIndexAtOffset(0, 0)).toBe(0)
    expect(tracker.findIndexAtOffset(25, 0)).toBe(0)
    expect(tracker.findIndexAtOffset(51, 0)).toBe(1)

    // With 20px padding
    expect(tracker.findIndexAtOffset(20, 20)).toBe(0)
    expect(tracker.findIndexAtOffset(71, 20)).toBe(1)
  })

  test("getTotalSize includes padding", () => {
    const tracker = new SizeTracker(3, 0, () => 40)
    expect(tracker.getTotalSize(10, 20)).toBe(150)
  })

  test("getTotalSize with gap", () => {
    const tracker = new SizeTracker(3, 10, () => 40)
    // [40+10, 40+10, 40] = 140
    expect(tracker.getTotalSize(0, 0)).toBe(140)
    expect(tracker.getTotalSize(12, 8)).toBe(160)
  })

  test("getTotalSize empty tracker", () => {
    const tracker = new SizeTracker(0, 0, () => 40)
    expect(tracker.getTotalSize(10, 20)).toBe(30)
  })

  test("reset clears measurements", () => {
    const tracker = new SizeTracker(3, 0, () => 40)
    tracker.setMeasuredSize(0, 60)
    expect(tracker.getSize(0)).toBe(60)

    tracker.reset(5)
    expect(tracker.getSize(0)).toBe(40)
  })

  test("reindex shifts measured sizes for prepend", () => {
    const tracker = new SizeTracker(3, 0, () => 40)
    tracker.setMeasuredSize(0, 60)
    tracker.setMeasuredSize(1, 70)

    tracker.reindex(2, 5)
    expect(tracker.getSize(0)).toBe(40) // new
    expect(tracker.getSize(1)).toBe(40) // new
    expect(tracker.getSize(2)).toBe(60) // shifted from 0
    expect(tracker.getSize(3)).toBe(70) // shifted from 1
  })

  test("variable estimated sizes", () => {
    const tracker = new SizeTracker(3, 0, (i) => (i === 0 ? 100 : 50))
    expect(tracker.getSize(0)).toBe(100)
    expect(tracker.getSize(1)).toBe(50)
    expect(tracker.getPrefixSum(2)).toBe(200)
  })
})
