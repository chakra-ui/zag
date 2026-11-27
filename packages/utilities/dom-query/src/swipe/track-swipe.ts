import { trackDrag } from "../drag/track-drag"
import type { Point } from "../types"
import { axisOf, crossAxisOf, directionOf, getSwipeDisplacement } from "./direction"
import { canScrollWithFinger } from "../scroll/nested-scroll"
import type { SwipeAxis, SwipeDirection, TrackSwipeOptions } from "./types"

const SCROLL_CHECK_DISTANCE = 0.3
const CROSS_SCROLL_BIAS = 0.58

/**
 * Follows a swipe: a drag kept to the directions it can go, like a toast swiped away or a drawer pulled
 * closed. It locks to one axis, waits while nested content can still scroll, resists movement toward
 * directions that aren't allowed, and reports how far and how fast it went, so the caller decides what a
 * release does. Returns a cleanup that stops without calling `onEnd`.
 */
export function trackSwipe(doc: Document, options: TrackSwipeOptions): VoidFunction {
  const { directions, resistance = Math.sqrt, releaseOffAxis = false, canStart, target, scrollContainer } = options

  const allows = (direction: SwipeDirection) => directions.includes(direction)
  const hasX = allows("left") || allows("right")
  const hasY = allows("up") || allows("down")

  /* -----------------------------------------------------------------------------
   * State
   * -----------------------------------------------------------------------------*/

  const state = {
    axis: (hasX && hasY ? null : hasX ? "x" : "y") as SwipeAxis | null,
    direction: null as SwipeDirection | null,
    furthest: {} as Partial<Record<SwipeDirection, number>>,
  }

  /* -----------------------------------------------------------------------------
   * Starting
   * -----------------------------------------------------------------------------*/

  function decide(offset: Point, event: PointerEvent) {
    const decision = canStart ? canStart(offset, event) : true
    if (decision !== true) return decision

    if (offset.x === 0 && offset.y === 0) return undefined

    const leading: SwipeAxis = Math.abs(offset.x) > Math.abs(offset.y) ? "x" : "y"
    if (state.axis === null) state.axis = leading
    else if (leading !== state.axis) return releaseOffAxis ? false : undefined

    if (scrollContainer && waitsForScroll(offset, state.axis)) return undefined

    return true
  }

  function waitsForScroll(offset: Point, axis: SwipeAxis) {
    const main = offset[axis]
    const cross = offset[crossAxisOf(axis)]
    if (Math.abs(main) < SCROLL_CHECK_DISTANCE) return true

    const crossAxis = crossAxisOf(axis)
    if (Math.abs(cross) > Math.abs(main) * CROSS_SCROLL_BIAS) {
      const either = [directionOf(crossAxis, 1), directionOf(crossAxis, -1)]
      if (either.some((direction) => canScrollWithFinger(target ?? null, scrollContainer!, direction))) return true
    }

    return canScrollWithFinger(target ?? null, scrollContainer!, directionOf(axis, main))
  }

  /* -----------------------------------------------------------------------------
   * Steps
   * -----------------------------------------------------------------------------*/

  function resist(value: number) {
    return Math.sign(value) * resistance(Math.abs(value))
  }

  function shape(offset: Point): Point {
    const x = state.axis === "x" ? offset.x : 0
    const y = state.axis === "y" ? offset.y : 0
    return {
      x: x === 0 || allows(directionOf("x", x)) ? x : resist(x),
      y: y === 0 || allows(directionOf("y", y)) ? y : resist(y),
    }
  }

  const offsetOf = (event: PointerEvent): Point => ({
    x: event.clientX - options.startPoint.x,
    y: event.clientY - options.startPoint.y,
  })

  function record(offset: Point) {
    const axis = state.axis
    if (!axis) return

    const value = offset[axis]
    if (!state.direction && value !== 0 && allows(directionOf(axis, value))) {
      state.direction = directionOf(axis, value)
    }

    for (const direction of directions) {
      if (axisOf(direction) !== axis) continue
      state.furthest[direction] = Math.max(state.furthest[direction] ?? 0, getSwipeDisplacement(direction, offset))
    }
  }

  function measuredDirection() {
    if (state.direction) return state.direction
    return directions.find((direction) => axisOf(direction) === state.axis) ?? null
  }

  function endDirection(offset: Point) {
    const axis = state.axis
    if (axis && state.direction) {
      const value = offset[axis]
      if (value !== 0 && allows(directionOf(axis, value))) return directionOf(axis, value)
    }
    return measuredDirection()
  }

  /* -----------------------------------------------------------------------------
   * Drag
   * -----------------------------------------------------------------------------*/

  return trackDrag(doc, {
    startPoint: options.startPoint,
    pointerId: options.pointerId,
    threshold: options.threshold,
    capture: options.capture,
    cancelOnEscape: options.cancelOnEscape,
    input: options.input,
    canStart: decide,
    onStart: options.onStart,

    onMove({ offset, velocity, events, event }) {
      // moves are batched per frame, so read every event for the direction and the furthest point
      for (const each of events) record(offsetOf(each))
      const measured = measuredDirection()
      options.onMove({
        offset: shape(offset),
        direction: state.direction,
        displacement: measured ? getSwipeDisplacement(measured, offset) : 0,
        velocity,
        event,
      })
    },

    onEnd({ offset, velocity, started, cancelled, event }) {
      if (started) record(offset)
      const direction = started ? endDirection(offset) : null

      options.onEnd({
        direction,
        displacement: direction ? getSwipeDisplacement(direction, offset) : 0,
        furthest: direction ? (state.furthest[direction] ?? 0) : 0,
        velocity: direction ? getSwipeDisplacement(direction, velocity) : 0,
        offset: shape(offset),
        started,
        cancelled,
        event,
      })
    },
  })
}
