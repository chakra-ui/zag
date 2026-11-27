// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { trackSwipe, type SwipeEndDetails, type SwipeMoveDetails, type TrackSwipeOptions } from "../src/swipe"

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

function pointer(type: string, x = 0, y = 0, time = 0) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, buttons: 1 })
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: "touch" },
    isPrimary: { value: true },
    timeStamp: { value: time },
  })
  document.dispatchEvent(event)
}

function setup(options: Partial<TrackSwipeOptions> = {}) {
  const moves: SwipeMoveDetails[] = []
  const ends: SwipeEndDetails[] = []
  const stop = trackSwipe(document, {
    startPoint: { x: 0, y: 0 },
    pointerId: 1,
    directions: ["down"],
    onMove: (details) => moves.push(details),
    onEnd: (details) => ends.push(details),
    ...options,
  })
  return { moves, ends, stop }
}

describe("trackSwipe / shape", () => {
  test("follows an allowed direction 1:1 and resists the opposite way", () => {
    const { moves } = setup()
    pointer("pointermove", 0, 30)
    runFrame()
    expect(moves.at(-1)).toMatchObject({ offset: { x: 0, y: 30 }, direction: "down" })

    pointer("pointermove", 0, -16)
    runFrame()
    expect(moves.at(-1)?.offset).toEqual({ x: 0, y: -4 })
  })

  test("keeps a single-axis swipe on its axis once started", () => {
    const { moves } = setup()
    pointer("pointermove", 5, 20)
    pointer("pointermove", 40, 30)
    runFrame()
    expect(moves.at(-1)?.offset).toEqual({ x: 0, y: 30 })
  })

  test("locks to the axis the first move favors when both are allowed", () => {
    const { moves } = setup({ directions: ["down", "right"] })
    pointer("pointermove", 20, 5)
    pointer("pointermove", 30, 60)
    runFrame()
    expect(moves.at(-1)).toMatchObject({ offset: { x: 30, y: 0 }, direction: "right" })
  })

  test("uses a custom resistance", () => {
    const { moves } = setup({ resistance: (overshoot) => overshoot / 10 })
    pointer("pointermove", 0, -50)
    runFrame()
    expect(moves.at(-1)?.offset.y).toBe(-5)
  })
})

describe("trackSwipe / starting", () => {
  test("lets a press go along the other axis when asked, so the page can scroll", () => {
    const { moves, ends } = setup({ directions: ["left", "right"], releaseOffAxis: true, threshold: 5 })
    pointer("pointermove", 2, 12)
    runFrame()
    expect(moves).toHaveLength(0)
    expect(ends).toEqual([expect.objectContaining({ started: false, cancelled: true, direction: null })])
  })

  test("waits while the press leads along an axis it can't go", () => {
    const { moves } = setup()
    pointer("pointermove", 30, 5)
    runFrame()
    expect(moves).toHaveLength(0)

    pointer("pointermove", 30, 40)
    runFrame()
    expect(moves).toHaveLength(1)
  })

  test("waits while nested content can still scroll the way the finger moves", () => {
    const container = document.body.appendChild(document.createElement("div"))
    const scroller = container.appendChild(document.createElement("div"))
    const target = scroller.appendChild(document.createElement("button"))
    scroller.style.overflowY = "auto"
    Object.defineProperties(scroller, {
      scrollHeight: { value: 500 },
      clientHeight: { value: 100 },
      scrollTop: { value: 50, writable: true },
    })

    const { moves } = setup({ target, scrollContainer: container })
    pointer("pointermove", 0, 20)
    runFrame()
    expect(moves).toHaveLength(0)

    scroller.scrollTop = 0
    pointer("pointermove", 0, 30)
    runFrame()
    expect(moves).toHaveLength(1)
    container.remove()
  })

  test("asks canStart first, and waits while it's undecided", () => {
    const canStart = vi.fn().mockReturnValueOnce(undefined).mockReturnValue(true)
    const { moves } = setup({ canStart })
    pointer("pointermove", 0, 10)
    runFrame()
    expect(moves).toHaveLength(0)

    pointer("pointermove", 0, 20)
    runFrame()
    expect(moves).toHaveLength(1)
  })
})

describe("trackSwipe / ending", () => {
  test("reports distance, furthest and velocity along the direction", () => {
    const { ends } = setup()
    pointer("pointermove", 0, 30, 10)
    pointer("pointermove", 0, 80, 20)
    pointer("pointermove", 0, 60, 30)
    pointer("pointerup", 0, 60, 30)
    expect(ends[0]).toMatchObject({ direction: "down", displacement: 60, furthest: 80, started: true })
    expect(ends[0].velocity).toBeGreaterThan(0)
  })

  test("ends in the allowed direction it finished in, on a two-way axis", () => {
    const { ends } = setup({ directions: ["left", "right"] })
    pointer("pointermove", 30, 0)
    pointer("pointermove", -50, 0)
    pointer("pointerup", -50, 0)
    expect(ends[0]).toMatchObject({ direction: "left", displacement: 50, furthest: 50 })
  })

  test("keeps the first direction when pulled back past the start, with a negative displacement", () => {
    const { ends } = setup()
    pointer("pointermove", 0, 40)
    pointer("pointermove", 0, -20)
    pointer("pointerup", 0, -20)
    expect(ends[0]).toMatchObject({ direction: "down", displacement: -20, furthest: 40 })
  })

  test("measures a swipe that only went the other way along the allowed direction", () => {
    const { moves, ends } = setup({ resistance: (overshoot) => overshoot })
    pointer("pointermove", 0, -30, 10)
    pointer("pointermove", 0, -60, 20)
    runFrame()
    expect(moves.at(-1)).toMatchObject({ direction: null, displacement: -60, offset: { x: 0, y: -60 } })

    pointer("pointerup", 0, -60, 25)
    expect(ends[0]).toMatchObject({ direction: "down", displacement: -60 })
    expect(ends[0].velocity).toBeLessThan(0)
  })

  test("reports no direction for a press that never moved", () => {
    const { ends } = setup({ threshold: 5 })
    pointer("pointerup", 0, 0)
    expect(ends).toEqual([expect.objectContaining({ direction: null, displacement: 0, started: false })])
  })
})
