// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { trackScrollEnd } from "../src/scroll/scroll-end"

const scroll = (el: EventTarget) => el.dispatchEvent(new Event("scroll"))
const touch = (el: EventTarget, type: "touchstart" | "touchend", touches = 0) => {
  const event = new Event(type, { bubbles: true })
  Object.defineProperty(event, "touches", { value: { length: touches } })
  el.dispatchEvent(event)
}

describe("trackScrollEnd", () => {
  let el: HTMLElement
  // jsdom has `onscrollend`; each test starts without it, and the native ones add it back
  const descriptor = Object.getOwnPropertyDescriptor(window, "onscrollend")
  beforeEach(() => {
    delete (window as any).onscrollend
    vi.useFakeTimers()
    el = document.createElement("div")
    document.body.appendChild(el)
  })
  afterEach(() => {
    vi.useRealTimers()
    el.remove()
    delete (window as any).onscrollend
    if (descriptor) Object.defineProperty(window, "onscrollend", descriptor)
  })

  test("without scrollend, calls back once scrolling pauses", () => {
    const fn = vi.fn()
    trackScrollEnd(el, fn, { delay: 100 })
    scroll(el)
    vi.advanceTimersByTime(60)
    scroll(el)
    vi.advanceTimersByTime(60)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("with scrollend, calls back on the event, not on a pause", () => {
    ;(window as any).onscrollend = null
    const fn = vi.fn()
    trackScrollEnd(el, fn, { delay: 100 })
    scroll(el)
    vi.advanceTimersByTime(500)
    expect(fn).not.toHaveBeenCalled()
    el.dispatchEvent(new Event("scrollend"))
    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("waits for a held finger to lift", () => {
    const fn = vi.fn()
    trackScrollEnd(el, fn, { delay: 100 })
    touch(el, "touchstart", 1)
    scroll(el)
    vi.advanceTimersByTime(500)
    expect(fn).not.toHaveBeenCalled()
    touch(el, "touchend", 0)
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("with scrollend, an end during a touch is reported when the finger lifts", () => {
    ;(window as any).onscrollend = null
    const fn = vi.fn()
    trackScrollEnd(el, fn)
    touch(el, "touchstart", 1)
    el.dispatchEvent(new Event("scrollend"))
    vi.advanceTimersByTime(10)
    expect(fn).not.toHaveBeenCalled()
    touch(el, "touchend", 0)
    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("with capture, waits for every scroller that moved to end", () => {
    ;(window as any).onscrollend = null
    const inner = document.createElement("div")
    el.appendChild(inner)
    const fn = vi.fn()
    trackScrollEnd(el, fn, { capture: true })
    scroll(el)
    scroll(inner)
    inner.dispatchEvent(new Event("scrollend"))
    vi.advanceTimersByTime(10)
    expect(fn).not.toHaveBeenCalled()
    el.dispatchEvent(new Event("scrollend"))
    vi.advanceTimersByTime(0)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("immediate reports even when nothing scrolls", () => {
    const fn = vi.fn()
    trackScrollEnd(el, fn, { delay: 100, immediate: true })
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test("cancelling the shared timeout drops a pending end", async () => {
    ;(window as any).onscrollend = null
    const { Timeout } = await import("../src/timeout")
    const timeout = Timeout.create()
    const fn = vi.fn()
    trackScrollEnd(el, fn, { timeout })
    el.dispatchEvent(new Event("scrollend"))
    timeout.cancel()
    vi.advanceTimersByTime(10)
    expect(fn).not.toHaveBeenCalled()
  })

  test("cleanup stops listening", () => {
    const fn = vi.fn()
    const cleanup = trackScrollEnd(el, fn, { delay: 100 })
    scroll(el)
    cleanup()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })
})
