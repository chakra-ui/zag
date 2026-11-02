import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { Timeout } from "../src/timeout"

describe("Timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("runs after the delay", () => {
    const timeout = Timeout.create()
    const fn = vi.fn()
    timeout.start(100, fn)
    expect(timeout.isStarted()).toBe(true)
    vi.advanceTimersByTime(99)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(timeout.isStarted()).toBe(false)
  })

  test("start replaces the pending call", () => {
    const timeout = Timeout.create()
    const first = vi.fn()
    const second = vi.fn()
    timeout.start(100, first)
    vi.advanceTimersByTime(50)
    timeout.start(100, second)
    vi.advanceTimersByTime(100)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  test("clear cancels the pending call", () => {
    const timeout = Timeout.create()
    const fn = vi.fn()
    timeout.start(100, fn)
    timeout.clear()
    expect(timeout.isStarted()).toBe(false)
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })

  test("clear is safe to pass around and call when idle", () => {
    const timeout = Timeout.create()
    const { clear } = timeout
    expect(() => clear()).not.toThrow()
    timeout.start(10, vi.fn())
    clear()
    expect(timeout.isStarted()).toBe(false)
  })
})
