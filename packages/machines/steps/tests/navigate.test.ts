import { describe, expect, test } from "vitest"
import { COMPLETE, type StepItem } from "../src/steps.types"
import { getNextResult, isCompletingResult, getPrevResult, type NavContext } from "../src/utils"

const items: StepItem[] = [{ value: "a" }, { value: "b" }, { value: "c" }]

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

describe("getNextResult", () => {
  test("marks the departing step completed and advances", () => {
    expect(getNextResult(ctx())).toEqual({ ok: true, value: "b", completedValues: ["a"] })
  })

  test("does not double-add an already completed step", () => {
    const c = ctx({ completedValues: ["a"] })
    expect(getNextResult(c)).toEqual({ ok: true, value: "b", completedValues: ["a"] })
  })

  test("enters COMPLETE from the last step once everything is done", () => {
    const c = ctx({ value: "c", completedValues: ["a", "b"] })
    expect(getNextResult(c)).toEqual({ ok: true, value: COMPLETE, completedValues: ["a", "b", "c"] })
  })

  test("blocks completion while a required step is outstanding", () => {
    const c = ctx({ value: "c", completedValues: ["a"] })
    expect(getNextResult(c)).toMatchObject({ ok: false, reason: "incomplete", blockedBy: "b" })
  })

  test("commits nothing when blocked", () => {
    const c = ctx({ items: invalidate(items, "a") })
    const result = getNextResult(c)
    expect(result).toMatchObject({ ok: false, reason: "invalid", blockedBy: "a" })
    expect(c.completedValues).toEqual([])
  })

  test("jumps over a disabled step", () => {
    const c = ctx({ items: [{ value: "a" }, { value: "b", disabled: true }, { value: "c" }] })
    expect(getNextResult(c)).toMatchObject({ ok: true, value: "c" })
  })

  test("jumps over a locked step instead of stranding the user", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b", editable: false }, { value: "c" }],
      value: "a",
      completedValues: ["b"],
    })
    expect(getNextResult(c)).toMatchObject({ ok: true, value: "c" })
  })

  test("is a no-op once complete", () => {
    expect(getNextResult(ctx({ value: COMPLETE }))).toBeNull()
  })

  test("is a no-op when there is no current step", () => {
    expect(getNextResult(ctx({ items: [], value: null }))).toBeNull()
  })
})

describe("getNextResult: skip", () => {
  test("advances an optional step without completing it", () => {
    const c = ctx({ items: [{ value: "a", optional: true }, { value: "b" }], value: "a" })
    expect(getNextResult(c, { skip: true })).toEqual({ ok: true, value: "b", completedValues: [] })
  })

  test("refuses to skip a required step", () => {
    expect(getNextResult(ctx(), { skip: true })).toBeNull()
  })

  test("bypasses the invalid gate that plain next enforces", () => {
    const c = ctx({ items: [{ value: "a", optional: true, invalid: true }, { value: "b" }], value: "a" })
    expect(getNextResult(c, { skip: true })).toMatchObject({ ok: true, value: "b" })
    expect(getNextResult(c)).toMatchObject({ ok: false, reason: "invalid" })
  })
})

describe("getNextResult: linear", () => {
  test("a skipped invalid optional step does not block later steps", () => {
    const c = ctx({
      items: [{ value: "a", optional: true, invalid: true }, { value: "b" }, { value: "c" }],
      value: "b",
      linear: true,
    })
    expect(getNextResult(c)).toMatchObject({ ok: true, value: "c" })
  })

  test("completes from a valid last step that is not yet marked completed", () => {
    const c = ctx({ value: "c", completedValues: ["a", "b"], linear: true })
    expect(isCompletingResult(getNextResult(c))).toBe(true)
  })
})

describe("getPrevResult", () => {
  test("moves back one step", () => {
    expect(getPrevResult(ctx({ value: "b" }), 1)).toMatchObject({ ok: true, value: "a" })
  })

  test("never blocks on invalid steps", () => {
    const c = ctx({ items: invalidate(items, "a", "b"), value: "b" })
    expect(getPrevResult(c, 1)).toMatchObject({ ok: true, value: "a" })
  })

  test("skips disabled and locked steps", () => {
    const c = ctx({
      items: [{ value: "a" }, { value: "b", disabled: true }, { value: "c", editable: false }, { value: "d" }],
      value: "d",
      completedValues: ["c"],
    })
    expect(getPrevResult(c, 3)).toMatchObject({ ok: true, value: "a" })
  })

  test("explains a fully locked prefix instead of failing silently", () => {
    const c = ctx({
      items: [{ value: "a", editable: false }, { value: "b" }],
      value: "b",
      completedValues: ["a"],
    })
    expect(getPrevResult(c, 1)).toEqual({ ok: false, targetValue: "a", reason: "locked", blockedBy: "a" })
  })

  test("is a silent no-op at the first step", () => {
    expect(getPrevResult(ctx(), 0)).toBeNull()
  })

  test("steps back out of COMPLETE", () => {
    const c = ctx({ value: COMPLETE, completedValues: ["a", "b", "c"] })
    expect(getPrevResult(c, items.length)).toMatchObject({ ok: true, value: "c" })
  })
})
