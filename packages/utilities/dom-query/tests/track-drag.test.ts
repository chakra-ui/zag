// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  isDragStart,
  suppressNextClick,
  trackDrag,
  type DragEndDetails,
  type DragMoveDetails,
  type TrackDragOptions,
} from "../src/drag"

let frames = new Map<number, FrameRequestCallback>()
let nextId = 1
const runFrame = () => {
  const queued = Array.from(frames.values())
  frames = new Map()
  queued.forEach((fn) => fn(0))
}

beforeEach(() => {
  frames = new Map()
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((fn) => {
    const id = nextId++
    frames.set(id, fn)
    return id
  })
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => void frames.delete(id))
})

afterEach(() => {
  vi.restoreAllMocks()
})

interface PointerInit {
  x?: number
  y?: number
  time?: number
  pointerId?: number
  pointerType?: string
  buttons?: number
}

function pointer(type: string, init: PointerInit = {}, target: EventTarget = document) {
  const { x = 0, y = 0, time = 0, pointerId = 1, pointerType = "touch", buttons = 1 } = init
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, buttons })
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    pointerType: { value: pointerType },
    isPrimary: { value: true },
    timeStamp: { value: time },
  })
  target.dispatchEvent(event)
  return event
}

function setup(options: Partial<TrackDragOptions> = {}) {
  const moves: DragMoveDetails[] = []
  const ends: DragEndDetails[] = []
  const stop = trackDrag(document, {
    startPoint: { x: 10, y: 10 },
    pointerId: 1,
    onMove: (details) => moves.push(details),
    onEnd: (details) => ends.push(details),
    ...options,
  })
  return { moves, ends, stop }
}

describe("trackDrag / reports", () => {
  test("reports once a frame, with the offset from the press and the delta since the last report", () => {
    const { moves } = setup()
    pointer("pointermove", { x: 12, y: 10 })
    pointer("pointermove", { x: 15, y: 14 })
    expect(moves).toHaveLength(0)

    runFrame()
    expect(moves).toHaveLength(1)
    expect(moves[0]).toMatchObject({ point: { x: 15, y: 14 }, offset: { x: 5, y: 4 }, delta: { x: 5, y: 4 } })
    expect(moves[0].events).toHaveLength(2)

    pointer("pointermove", { x: 20, y: 14 })
    runFrame()
    expect(moves[1]).toMatchObject({ offset: { x: 10, y: 4 }, delta: { x: 5, y: 0 } })
    expect(moves[1].events).toHaveLength(1)
  })

  test("reports a pending move as it was, then ends where the pointer lifted", () => {
    const { moves, ends } = setup()
    pointer("pointermove", { x: 20, y: 10 })
    pointer("pointerup", { x: 25, y: 10 })

    expect(moves).toHaveLength(1)
    expect(moves[0].point).toEqual({ x: 20, y: 10 })
    expect(moves[0].event.clientX).toBe(20)
    expect(ends[0]).toMatchObject({ point: { x: 25, y: 10 }, offset: { x: 15, y: 0 }, started: true, moved: true })
  })

  test("reports a pending move before a cancel", () => {
    const { moves, ends } = setup()
    pointer("pointermove", { x: 20, y: 10 })
    pointer("pointercancel")
    expect(moves).toHaveLength(1)
    expect(ends).toEqual([expect.objectContaining({ cancelled: true })])
  })

  test("measures the speed over the last 100ms", () => {
    const { moves, ends } = setup()
    pointer("pointermove", { x: 20, time: 10 })
    pointer("pointermove", { x: 40, time: 20 })
    runFrame()
    expect(moves[0].velocity.x).toBeCloseTo(2)

    pointer("pointerup", { x: 40, time: 30 })
    expect(ends[0].velocity.x).toBeCloseTo(2)
  })

  test("reports no speed after holding still before the release", () => {
    const { ends } = setup()
    pointer("pointermove", { x: 40, time: 10 })
    pointer("pointerup", { x: 40, time: 400 })
    expect(ends[0].velocity).toEqual({ x: 0, y: 0 })
  })

  test("reports no speed after a pause of 50ms before the release", () => {
    const { ends } = setup()
    pointer("pointermove", { x: 20, time: 10 })
    pointer("pointermove", { x: 40, time: 20 })
    pointer("pointerup", { x: 40, time: 80 })
    expect(ends[0].velocity).toEqual({ x: 0, y: 0 })
  })

  test("maps points with transformPoint, but measures the threshold in screen pixels", () => {
    const { moves } = setup({ threshold: 4, transformPoint: ({ x, y }) => ({ x: x / 2, y: y / 2 }) })
    pointer("pointermove", { x: 13, y: 10 })
    runFrame()
    expect(moves).toHaveLength(0)

    pointer("pointermove", { x: 20, y: 10 })
    runFrame()
    expect(moves[0]).toMatchObject({ point: { x: 10, y: 5 }, offset: { x: 5, y: 0 } })
  })
})

describe("trackDrag / starting", () => {
  test("doesn't report moves under the threshold, and ends a press that never passed it as a click", () => {
    const { moves, ends } = setup({ threshold: 5 })
    pointer("pointermove", { x: 13, y: 13 })
    runFrame()
    expect(moves).toHaveLength(0)

    pointer("pointerup", { x: 13, y: 13 })
    expect(ends).toEqual([expect.objectContaining({ started: false, moved: false, cancelled: false })])
  })

  test("measures the threshold the same way in every direction", () => {
    const { moves } = setup({ threshold: 5 })
    pointer("pointermove", { x: 14, y: 14 })
    runFrame()
    expect(moves).toHaveLength(1)
  })

  test("says a press that barely moved didn't move, even without a threshold", () => {
    const { ends } = setup()
    pointer("pointermove", { x: 11, y: 10 })
    pointer("pointerup", { x: 11, y: 10 })
    expect(ends).toEqual([expect.objectContaining({ started: true, moved: false })])
  })

  test("waits while canStart is undefined and lets the press go when it says false", () => {
    const canStart = vi.fn((offset: { x: number; y: number }) => (Math.abs(offset.y) > 4 ? false : undefined))
    const { moves, ends } = setup({ canStart })

    pointer("pointermove", { x: 11, y: 12 })
    expect(ends).toHaveLength(0)

    pointer("pointermove", { x: 11, y: 20 })
    expect(canStart).toHaveBeenCalledTimes(2)
    runFrame()
    expect(moves).toHaveLength(0)
    expect(ends).toEqual([expect.objectContaining({ started: false, cancelled: true, event: undefined })])
  })

  test("calls onStart with the point and the move that started it", () => {
    const onStart = vi.fn()
    setup({ threshold: 5, onStart })
    pointer("pointermove", { x: 20, y: 10 })
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ point: { x: 10, y: 10 }, event: expect.any(MouseEvent) }),
    )
  })
})

describe("trackDrag / ending", () => {
  test("ignores other pointers", () => {
    const { moves, ends } = setup()
    pointer("pointermove", { x: 50, y: 50, pointerId: 2 })
    pointer("pointerup", { pointerId: 2 })
    runFrame()
    expect(moves).toHaveLength(0)
    expect(ends).toHaveLength(0)
  })

  test("ends even when something inside stops the release from propagating", () => {
    const { ends } = setup()
    const child = document.createElement("div")
    document.body.appendChild(child)
    child.addEventListener("pointerup", (event) => event.stopPropagation())

    pointer("pointerup", {}, child)
    expect(ends).toHaveLength(1)
    child.remove()
  })

  test("ends as cancelled on Escape when asked, without letting the key through", () => {
    const { ends } = setup({ cancelOnEscape: true })
    const outer = vi.fn()
    document.body.addEventListener("keydown", outer)

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))

    expect(ends).toEqual([expect.objectContaining({ cancelled: true, velocity: { x: 0, y: 0 } })])
    expect(outer).not.toHaveBeenCalled()
    document.body.removeEventListener("keydown", outer)
  })

  test("ends as cancelled when the window loses focus", () => {
    const { ends } = setup()
    window.dispatchEvent(new FocusEvent("blur"))
    expect(ends).toEqual([expect.objectContaining({ cancelled: true })])
  })

  test("ends a mouse drag whose button was released outside the window", () => {
    const { ends } = setup()
    pointer("pointermove", { x: 20, pointerType: "mouse", buttons: 0 })
    expect(ends).toEqual([expect.objectContaining({ cancelled: false })])
  })

  test("stops without calling onEnd when cleaned up", () => {
    const { moves, ends, stop } = setup()
    pointer("pointermove", { x: 20 })
    stop()
    runFrame()
    pointer("pointerup")
    expect(moves).toHaveLength(0)
    expect(ends).toHaveLength(0)
  })
})

describe("trackDrag / clicks", () => {
  test("swallows the click after a drag, not after a press that barely moved", () => {
    const onClick = vi.fn()
    document.addEventListener("click", onClick)

    setup()
    pointer("pointermove", { x: 30, y: 10 })
    pointer("pointerup", { x: 30, y: 10 })
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).not.toHaveBeenCalled()

    setup()
    pointer("pointermove", { x: 11, y: 10 })
    pointer("pointerup", { x: 11, y: 10 })
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).toHaveBeenCalledTimes(1)

    document.removeEventListener("click", onClick)
  })

  test("swallows the release's click after Escape cancels a drag", () => {
    const onClick = vi.fn()
    document.addEventListener("click", onClick)

    const { ends } = setup({ cancelOnEscape: true })
    pointer("pointermove", { x: 30, y: 10 })
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))
    expect(ends).toEqual([expect.objectContaining({ cancelled: true })])

    pointer("pointerup", { x: 30, y: 10 })
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).not.toHaveBeenCalled()

    document.removeEventListener("click", onClick)
  })
})

function touch(type: string, points: Array<{ x: number; y: number }>, lifted = points) {
  const list = (items: Array<{ x: number; y: number }>) =>
    items.map(({ x, y }, identifier) => ({ clientX: x, clientY: y, identifier }))
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    touches: { value: type === "touchend" ? [] : list(points) },
    changedTouches: { value: list(lifted) },
  })
  document.dispatchEvent(event)
  return event
}

describe("trackDrag / touch input", () => {
  test("follows touch events and ignores pointer events", () => {
    const { moves, ends } = setup({ input: "touch" })
    pointer("pointermove", { x: 90, y: 90 })
    runFrame()
    expect(moves).toHaveLength(0)

    touch("touchmove", [{ x: 30, y: 10 }])
    runFrame()
    expect(moves[0]).toMatchObject({ point: { x: 30, y: 10 }, offset: { x: 20, y: 0 } })

    touch("touchend", [], [{ x: 40, y: 10 }])
    expect(ends[0]).toMatchObject({ point: { x: 40, y: 10 }, cancelled: false })
  })

  test("stops the scroll once dragging, not while it's still deciding", () => {
    let ready: boolean | undefined
    setup({ input: "touch", canStart: () => ready })

    expect(touch("touchmove", [{ x: 10, y: 30 }]).defaultPrevented).toBe(false)
    ready = true
    expect(touch("touchmove", [{ x: 10, y: 40 }]).defaultPrevented).toBe(true)
  })

  test("ends when the last finger lifts, and cancels on touchcancel", () => {
    const a = setup({ input: "touch" })
    const lift = new Event("touchend", { bubbles: true })
    Object.defineProperties(lift, { touches: { value: [{ clientX: 0, clientY: 0 }] }, changedTouches: { value: [{}] } })
    document.dispatchEvent(lift)
    expect(a.ends).toHaveLength(0)
    touch("touchend", [], [{ x: 10, y: 10 }])
    expect(a.ends).toHaveLength(1)

    const b = setup({ input: "touch" })
    document.dispatchEvent(new Event("touchcancel", { bubbles: true }))
    expect(b.ends).toEqual([expect.objectContaining({ cancelled: true })])
  })
})

describe("isDragStart", () => {
  const press = (init: Partial<PointerEvent>) =>
    isDragStart({ button: 0, isPrimary: true, pointerType: "mouse", defaultPrevented: false, ...init })

  test("accepts the main button of a primary pointer", () => {
    expect(press({})).toBe(true)
    expect(press({ pointerType: "touch" })).toBe(true)
  })

  test("refuses other buttons, a second finger and a handled press", () => {
    expect(press({ button: 2 })).toBe(false)
    expect(press({ pointerType: "touch", isPrimary: false })).toBe(false)
    expect(press({ defaultPrevented: true })).toBe(false)
  })
})

describe("suppressNextClick", () => {
  test("swallows a touch's click that comes a few milliseconds after the release, then lets clicks through", () => {
    const onClick = vi.fn()
    document.addEventListener("click", onClick)
    vi.useFakeTimers()

    suppressNextClick(document)
    vi.advanceTimersByTime(5)
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).not.toHaveBeenCalled()

    suppressNextClick(document)
    vi.advanceTimersByTime(150)
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(onClick).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
    document.removeEventListener("click", onClick)
  })

  test("with untilRelease, waits for the release and leaves other pointers' clicks alone", () => {
    const onClick = vi.fn()
    document.addEventListener("click", onClick)
    vi.useFakeTimers()

    suppressNextClick(document, { untilRelease: true, pointerId: 1 })
    vi.runAllTimers()

    const other = new MouseEvent("click", { bubbles: true })
    Object.defineProperty(other, "pointerId", { value: 2 })
    document.body.dispatchEvent(other)
    expect(onClick).toHaveBeenCalledTimes(1)

    pointer("pointerup", { pointerId: 1 })
    const ours = new MouseEvent("click", { bubbles: true })
    Object.defineProperty(ours, "pointerId", { value: 1 })
    document.body.dispatchEvent(ours)
    expect(onClick).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
    document.removeEventListener("click", onClick)
  })
})
