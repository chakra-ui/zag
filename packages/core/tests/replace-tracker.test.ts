import { describe, expect, test } from "vitest"
import { createReplaceTracker } from "../src/replace-tracker"

describe("replace tracker", () => {
  test("a lone claim is not replaced", () => {
    const tracker = createReplaceTracker()
    const token = tracker.claim("open")
    expect(tracker.isReplaced("open", token)).toBe(false)
  })

  test("a later claim replaces the earlier one", () => {
    const tracker = createReplaceTracker()
    const first = tracker.claim("open")
    const second = tracker.claim("open")

    expect(tracker.isReplaced("open", first)).toBe(true)
    expect(tracker.isReplaced("open", second)).toBe(false)
  })

  test("only the newest of many claims survives", () => {
    const tracker = createReplaceTracker()
    const tokens = Array.from({ length: 5 }, () => tracker.claim("open"))

    const survivors = tokens.filter((token) => !tracker.isReplaced("open", token))
    expect(survivors).toEqual([tokens.at(-1)])
  })

  test("keys are independent", () => {
    const tracker = createReplaceTracker()
    const open = tracker.claim("open")
    tracker.claim("snapPoint")

    expect(tracker.isReplaced("open", open)).toBe(false)
  })

  test("a token from another key is treated as replaced", () => {
    const tracker = createReplaceTracker()
    const open = tracker.claim("open")
    tracker.claim("snapPoint")

    expect(tracker.isReplaced("snapPoint", open)).toBe(true)
  })
})
