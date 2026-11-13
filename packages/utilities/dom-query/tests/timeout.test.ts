import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { AnimationFrameInterval, AnimationFrameTimeout, Timeout } from "../src/timeout"

beforeEach(() => {
  // Node has no animation frames; fake timers replace these stubs with a 16ms frame clock
  vi.stubGlobal("requestAnimationFrame", () => 0)
  vi.stubGlobal("cancelAnimationFrame", () => {})
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"],
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe.each([
  ["Timeout", () => Timeout.create()],
  ["AnimationFrameTimeout", () => AnimationFrameTimeout.create()],
])("%s", (_, create) => {
  test("runs after the delay", () => {
    const timeout = create()
    const fn = vi.fn()
    timeout.start(100, fn)
    expect(timeout.isActive()).toBe(true)
    vi.advanceTimersByTime(90)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(30)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(timeout.isActive()).toBe(false)
  })

  test("start replaces the pending call", () => {
    const timeout = create()
    const first = vi.fn()
    const second = vi.fn()
    timeout.start(100, first)
    vi.advanceTimersByTime(50)
    timeout.start(100, second)
    vi.advanceTimersByTime(150)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  test("cancel stops the pending call", () => {
    const timeout = create()
    const fn = vi.fn()
    timeout.start(100, fn)
    timeout.cancel()
    expect(timeout.isActive()).toBe(false)
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })

  test("cancel is safe to pass around and call when idle", () => {
    const timeout = create()
    const { cancel } = timeout
    expect(() => cancel()).not.toThrow()
    timeout.start(10, vi.fn())
    cancel()
    expect(timeout.isActive()).toBe(false)
  })
})

describe("AnimationFrameInterval", () => {
  test("calls back once per interval with the elapsed time", () => {
    const interval = AnimationFrameInterval.create()
    const fn = vi.fn()
    interval.start(100, fn)
    vi.advanceTimersByTime(350)
    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn.mock.calls[0][0]).toBeGreaterThanOrEqual(100)
  })

  test("stops when the callback cancels it", () => {
    const interval = AnimationFrameInterval.create()
    const fn = vi.fn(() => interval.cancel())
    interval.start(100, fn)
    vi.advanceTimersByTime(500)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(interval.isActive()).toBe(false)
  })
})
