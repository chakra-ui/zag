import { describe, expect, test } from "vitest"
import { COMPLETE, type StepItem } from "../src/steps.types"
import {
  findEffectiveIndex,
  findItemIndex,
  isFlowComplete,
  findNavigableIndex,
  findNearestNavigable,
  getReachability,
  validateItems,
  type NavContext,
} from "../src/utils"

const items: StepItem[] = [{ value: "a" }, { value: "b" }, { value: "c" }, { value: "d" }]

const ctx = (overrides: Partial<NavContext> = {}): NavContext => ({
  items,
  value: "a",
  completedValues: [],
  linear: false,
  ...overrides,
})

/** Marks the given steps invalid */
const invalidate = (list: StepItem[], ...values: string[]): StepItem[] =>
  list.map((item) => (values.includes(item.value) ? { ...item, invalid: true } : item))

describe("findItemIndex", () => {
  test("resolves COMPLETE to the position past the last item", () => {
    expect(findItemIndex(items, COMPLETE)).toBe(items.length)
  })

  test("resolves null and unknown values to -1", () => {
    expect(findItemIndex(items, null)).toBe(-1)
    expect(findItemIndex(items, "nope")).toBe(-1)
  })
})

describe("isFlowComplete", () => {
  test("requires every required step in the flow to be completed", () => {
    const list = [{ value: "a" }, { value: "b", optional: true }, { value: "c", disabled: true }]
    expect(isFlowComplete({ items: list, completedValues: ["a"] })).toBe(true)
    expect(isFlowComplete({ items: list, completedValues: [] })).toBe(false)
  })

  test("an empty flow is never complete", () => {
    expect(isFlowComplete({ items: [], completedValues: [] })).toBe(false)
  })
})

describe("findEffectiveIndex", () => {
  test("counts only steps in the flow", () => {
    const list = [{ value: "a" }, { value: "b", disabled: true }, { value: "c" }]
    expect(findEffectiveIndex(list, "c")).toBe(1)
    expect(findEffectiveIndex(list, "b")).toBe(-1)
    expect(findEffectiveIndex(list, null)).toBe(-1)
  })
})

describe("getReachability: target gates", () => {
  test("blocks a disabled target in both directions", () => {
    const c = ctx({ items: [{ value: "a" }, { value: "b", disabled: true }, { value: "c" }], value: "c" })
    expect(getReachability(c, "b")).toEqual({ ok: false, reason: "disabled", blockedBy: "b" })
  })

  test("blocks an unknown target", () => {
    expect(getReachability(ctx(), "nope")).toMatchObject({ ok: false, reason: "disabled" })
  })

  test("blocks a completed non-editable target", () => {
    const c = ctx({
      items: [{ value: "a", editable: false }, { value: "b" }],
      value: "b",
      completedValues: ["a"],
    })
    expect(getReachability(c, "a")).toEqual({ ok: false, reason: "locked", blockedBy: "a" })
  })

  test("does not lock a step that was never completed", () => {
    const c = ctx({ items: [{ value: "a", editable: false }, { value: "b" }], value: "b" })
    expect(getReachability(c, "a").ok).toBe(true)
  })

  test("the current step is never locked against itself", () => {
    const c = ctx({
      items: [{ value: "a", editable: false }, { value: "b" }],
      value: "a",
      completedValues: ["a"],
    })
    expect(getReachability(c, "a").ok).toBe(true)
  })
})

describe("getReachability: direction", () => {
  test("backward movement is unconditional", () => {
    const c = ctx({ items: invalidate(items, "c"), value: "c", linear: true })
    expect(getReachability(c, "a").ok).toBe(true)
  })

  test("cannot leave an invalid step forwards, even when not linear", () => {
    const c = ctx({ items: invalidate(items, "a"), value: "a" })
    expect(getReachability(c, "b")).toEqual({ ok: false, reason: "invalid", blockedBy: "a" })
  })

  test("an optional current step still blocks next when invalid", () => {
    const c = ctx({ items: [{ value: "a", optional: true, invalid: true }, { value: "b" }], value: "a" })
    expect(getReachability(c, "b")).toMatchObject({ ok: false, reason: "invalid" })
  })
})

describe("getReachability: linear prefix", () => {
  test("blocks a jump over an incomplete required step", () => {
    const c = ctx({ value: "a", linear: true, completedValues: ["a"] })
    expect(getReachability(c, "c")).toEqual({ ok: false, reason: "incomplete", blockedBy: "b" })
  })

  test("allows a jump when every step before the target is completed", () => {
    const c = ctx({ value: "a", linear: true, completedValues: ["a", "b"] })
    expect(getReachability(c, "c").ok).toBe(true)
  })

  test("an unvisited optional step satisfies the prefix", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b", optional: true }, { value: "c" }],
      value: "a",
      linear: true,
      completedValues: ["a"],
    })
    expect(getReachability(c, "c").ok).toBe(true)
  })

  test("a disabled step never holds up the prefix", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b", disabled: true }, { value: "c" }],
      value: "a",
      linear: true,
      completedValues: ["a"],
    })
    expect(getReachability(c, "c").ok).toBe(true)
  })

  test("reports the first offender, not the last", () => {
    const c = ctx({ value: "a", linear: true, completedValues: ["a"] })
    expect(getReachability(c, "d")).toMatchObject({ blockedBy: "b" })
  })

  test("invalid outranks incomplete within the prefix", () => {
    const c = ctx({ items: invalidate(items, "b"), value: "a", linear: true, completedValues: ["a"] })
    expect(getReachability(c, "d")).toEqual({ ok: false, reason: "invalid", blockedBy: "b" })
  })

  test("blocks a jump past the current step when it is not yet completed", () => {
    const c = ctx({ value: "a", linear: true })
    expect(getReachability(c, "c")).toEqual({ ok: false, reason: "incomplete", blockedBy: "a" })
  })

  test("no prefix rule applies when linear is off", () => {
    const c = ctx({ value: "a", linear: false })
    expect(getReachability(c, "d").ok).toBe(true)
  })
})

describe("getReachability: completion gate", () => {
  test("blocks completion while a required step is outstanding, in both modes", () => {
    for (const linear of [true, false]) {
      const c = ctx({ value: "d", linear, completedValues: ["a", "b"] })
      expect(getReachability(c, COMPLETE)).toEqual({ ok: false, reason: "incomplete", blockedBy: "c" })
    }
  })

  test("allows completion when the outstanding steps are optional or disabled", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b", optional: true }, { value: "c", disabled: true }, { value: "d" }],
      value: "d",
      completedValues: ["a", "d"],
    })
    expect(getReachability(c, COMPLETE).ok).toBe(true)
  })

  test("does not exempt the step the user is standing on", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b" }],
      value: "b",
      completedValues: ["a"],
    })
    expect(getReachability(c, COMPLETE)).toEqual({ ok: false, reason: "incomplete", blockedBy: "b" })
  })

  test("an empty flow is never completable", () => {
    const c = ctx({ items: [], value: null })
    expect(getReachability(c, COMPLETE)).toEqual({ ok: false, reason: "incomplete", blockedBy: null })
  })
})

describe("getReachability: precedence", () => {
  test("disabled beats locked", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b", disabled: true, editable: false }],
      value: "a",
      completedValues: ["b"],
    })
    expect(getReachability(c, "b")).toMatchObject({ reason: "disabled" })
  })

  test("locked beats invalid on the source step", () => {
    const c = ctx({
      items: [{ value: "a", invalid: true }, { value: "b", editable: false }, { value: "c" }],
      value: "a",
      completedValues: ["b"],
    })
    expect(getReachability(c, "b")).toMatchObject({ reason: "locked" })
  })
})

describe("findNavigableIndex", () => {
  test("skips disabled and locked items without wrapping", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b", disabled: true }, { value: "c", editable: false }, { value: "d" }],
      value: "a",
      completedValues: ["c"],
    })
    expect(findNavigableIndex(c, 0, 1)).toBe(3)
  })

  test("returns -1 at the boundary rather than the index itself", () => {
    expect(findNavigableIndex(ctx({ value: "d" }), items.length - 1, 1)).toBe(-1)
    expect(findNavigableIndex(ctx(), 0, -1)).toBe(-1)
  })
})

describe("findNearestNavigable", () => {
  const lockedB: StepItem[] = [{ value: "a" }, { value: "b", editable: false }, { value: "c" }]

  test("skips a completed, non-editable step", () => {
    expect(findNearestNavigable(ctx({ items: lockedB, value: null, completedValues: ["b"] }), 1)).toBe("c")
  })

  test("falls back to an earlier step", () => {
    const list: StepItem[] = [{ value: "a" }, { value: "b", editable: false }]
    expect(findNearestNavigable(ctx({ items: list, value: null, completedValues: ["b"] }), 1)).toBe("a")
  })

  test("returns null when every step is locked", () => {
    const list: StepItem[] = [
      { value: "a", editable: false },
      { value: "b", disabled: true },
    ]
    expect(findNearestNavigable(ctx({ items: list, value: null, completedValues: ["a"] }), 0)).toBeNull()
  })
})

describe("validateItems", () => {
  test("throws on duplicate values", () => {
    expect(() => validateItems([{ value: "a" }, { value: "a" }])).toThrow(/duplicate/)
  })

  test("throws when an item claims the reserved completion value", () => {
    expect(() => validateItems([{ value: COMPLETE }])).toThrow(/reserved/)
  })

  test("accepts a well-formed list", () => {
    expect(() => validateItems(items)).not.toThrow()
  })
})
