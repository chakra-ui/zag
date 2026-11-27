// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { trackLongPress, type LongPressEndDetails, type TrackLongPressOptions } from "../src/press"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ""
})

function pointer(
  type: string,
  init: { x?: number; y?: number; pointerId?: number } = {},
  target: EventTarget = document,
) {
  const { x = 10, y = 10, pointerId = 1 } = init
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(event, "pointerId", { value: pointerId })
  target.dispatchEvent(event)
  return event
}

function setup(options: Partial<TrackLongPressOptions> = {}) {
  const holds: number[] = []
  const ends: LongPressEndDetails[] = []
  const stop = trackLongPress(document, {
    startPoint: { x: 10, y: 10 },
    pointerId: 1,
    onHold: ({ count }) => void holds.push(count),
    onEnd: (details) => ends.push(details),
    ...options,
  })
  return { holds, ends, stop }
}

describe("trackLongPress / long press", () => {
  test("holds once after the delay, and ends held on release", () => {
    const { holds, ends } = setup({ delay: 500 })
    vi.advanceTimersByTime(499)
    expect(holds).toEqual([])

    vi.advanceTimersByTime(1)
    vi.advanceTimersByTime(2000)
    expect(holds).toEqual([1])

    pointer("pointerup")
    expect(ends).toEqual([expect.objectContaining({ held: true, cancelled: false })])
  })

  test("ends a release before the delay as a tap", () => {
    const { holds, ends } = setup()
    pointer("pointerup")
    vi.advanceTimersByTime(1000)
    expect(holds).toEqual([])
    expect(ends).toEqual([expect.objectContaining({ held: false, cancelled: false })])
  })

  test("cancels when the pointer moves past the tolerance, not within it", () => {
    const { holds, ends } = setup({ tolerance: 10 })
    pointer("pointermove", { x: 16, y: 18 })
    expect(ends).toEqual([])

    pointer("pointermove", { x: 18, y: 18 })
    vi.advanceTimersByTime(1000)
    expect(holds).toEqual([])
    expect(ends).toEqual([expect.objectContaining({ held: false, cancelled: true })])
  })

  test("ignores movement once held", () => {
    const { ends } = setup()
    vi.advanceTimersByTime(500)
    pointer("pointermove", { x: 100, y: 100 })
    expect(ends).toEqual([])
  })

  test("cancels when leaving the target before it's held", () => {
    const target = document.body.appendChild(document.createElement("button"))
    const { holds, ends } = setup({ target })
    target.dispatchEvent(new Event("pointerleave"))
    vi.advanceTimersByTime(1000)
    expect(holds).toEqual([])
    expect(ends).toEqual([expect.objectContaining({ cancelled: true })])
  })

  test("ignores other pointers", () => {
    const { ends } = setup()
    pointer("pointerup", { pointerId: 2 })
    pointer("pointermove", { x: 100, pointerId: 2 })
    expect(ends).toEqual([])
  })

  test("swallows the click after a hold, not after a tap", () => {
    const onClick = vi.fn()
    document.addEventListener("click", onClick)

    setup()
    vi.advanceTimersByTime(500)
    pointer("pointerup")
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).not.toHaveBeenCalled()

    setup()
    pointer("pointerup")
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).toHaveBeenCalledTimes(1)

    document.removeEventListener("click", onClick)
  })

  test("swallows the lift's click even when the tracking stopped once held", () => {
    const onClick = vi.fn()
    document.addEventListener("click", onClick)

    const { stop } = setup()
    vi.advanceTimersByTime(500)
    stop()
    pointer("pointerup")
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).not.toHaveBeenCalled()

    document.removeEventListener("click", onClick)
  })
})

describe("trackLongPress / repeat", () => {
  test("repeats every interval once held", () => {
    const { holds } = setup({ delay: 400, interval: 60 })
    vi.advanceTimersByTime(400)
    expect(holds).toEqual([1])
    vi.advanceTimersByTime(180)
    expect(holds).toEqual([1, 2, 3, 4])
  })

  test("speeds up with an interval function", () => {
    const interval = vi.fn((count: number) => (count < 2 ? 100 : 10))
    const { holds } = setup({ delay: 100, interval })
    vi.advanceTimersByTime(100)
    vi.advanceTimersByTime(100)
    expect(holds).toEqual([1, 2])
    vi.advanceTimersByTime(30)
    expect(holds).toEqual([1, 2, 3, 4, 5])
    expect(interval).toHaveBeenCalledWith(1)
  })

  test("stops repeating when onHold returns false, but keeps the press", () => {
    const { ends } = setup({
      delay: 100,
      interval: 10,
      onHold: ({ count }) => count < 3,
    })
    vi.advanceTimersByTime(1000)
    expect(ends).toEqual([])
    pointer("pointerup")
    expect(ends).toEqual([expect.objectContaining({ held: true, cancelled: false })])
  })

  test("pauses while off the target and steps right away on return", () => {
    const target = document.body.appendChild(document.createElement("button"))
    const { holds, ends } = setup({ target, delay: 100, interval: 10 })
    vi.advanceTimersByTime(100)
    expect(holds).toEqual([1])

    target.dispatchEvent(new Event("pointerleave"))
    vi.advanceTimersByTime(500)
    expect(holds).toEqual([1])
    expect(ends).toEqual([])

    target.dispatchEvent(new Event("pointerenter"))
    expect(holds).toEqual([1, 2])
    vi.advanceTimersByTime(99)
    expect(holds).toEqual([1, 2])
    vi.advanceTimersByTime(1)
    expect(holds).toEqual([1, 2, 3])
  })
})

describe("trackLongPress / cancelling", () => {
  test("cancels on pointercancel and blur", () => {
    const a = setup()
    pointer("pointercancel")
    expect(a.ends).toEqual([expect.objectContaining({ cancelled: true })])

    const b = setup()
    window.dispatchEvent(new FocusEvent("blur"))
    expect(b.ends).toEqual([expect.objectContaining({ cancelled: true })])
  })

  test("cancels when something holding the target scrolls, not an unrelated scroller", () => {
    const scroller = document.body.appendChild(document.createElement("div"))
    const other = document.body.appendChild(document.createElement("div"))
    const target = scroller.appendChild(document.createElement("button"))
    const { ends } = setup({ target })

    other.dispatchEvent(new Event("scroll"))
    expect(ends).toEqual([])

    scroller.dispatchEvent(new Event("scroll"))
    expect(ends).toEqual([expect.objectContaining({ cancelled: true })])
  })

  test("blocks the context menu only while pressed", () => {
    const fire = () => {
      const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true })
      document.body.dispatchEvent(event)
      return event.defaultPrevented
    }
    setup()
    expect(fire()).toBe(true)
    pointer("pointerup")
    expect(fire()).toBe(false)
  })

  test("stops without calling onEnd when cleaned up", () => {
    const { holds, ends, stop } = setup()
    stop()
    vi.advanceTimersByTime(1000)
    pointer("pointerup")
    expect(holds).toEqual([])
    expect(ends).toEqual([])
  })
})
