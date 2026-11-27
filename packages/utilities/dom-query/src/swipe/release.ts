// Velocities are in px/ms

const FLICK_VELOCITY = 0.4
const PROJECTION_MS = 400
const MAX_VELOCITY = 4
const TRUSTED_DISPLACEMENT = 24
const SEQUENTIAL_DISTANCE = 24
const STRENGTH_MAX_MS = 360
const STRENGTH_MIN = 0.1

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/* -----------------------------------------------------------------------------
 * Dismissing
 * -----------------------------------------------------------------------------*/

export interface DismissSwipeOptions {
  /**
   * How far the swipe ended in the dismiss direction, in px. Negative when it ended the other way.
   */
  displacement: number
  /**
   * The furthest it got in the dismiss direction, in px
   * @default displacement
   */
  furthest?: number | undefined
  /**
   * The release velocity in px/ms, positive in the dismiss direction
   */
  velocity: number
  /**
   * How far a slow swipe has to go, in px
   * @default 40
   */
  distance?: number | undefined
  /**
   * How fast a release dismisses however short it was, in px/ms
   * @default 0.5
   */
  flickVelocity?: number | undefined
  /**
   * Pulling back this far from the furthest point changes the user's mind. `Infinity` never does, like when
   * pulling back may be a swipe the other way.
   * @default 10
   */
  pullBack?: number | undefined
}

/**
 * Whether a released swipe commits, like dismissing a toast or opening a drawer: it went far enough or was
 * flicked, and wasn't pulled back
 */
export function isDismissSwipe(options: DismissSwipeOptions) {
  const { displacement, velocity, distance = 40, flickVelocity = 0.5, pullBack = 10 } = options
  const furthest = options.furthest ?? displacement
  if (displacement <= 0) return false
  if (furthest - displacement >= pullBack) return false
  return displacement > distance || velocity >= flickVelocity
}

/* -----------------------------------------------------------------------------
 * Settling
 * -----------------------------------------------------------------------------*/

export interface SettleSwipeOptions {
  /**
   * Where it is at release
   */
  position: number
  /**
   * The release velocity in px/ms, positive toward larger positions
   */
  velocity: number
  /**
   * Where it can rest
   */
  points: readonly number[]
  /**
   * Where it rested before the swipe
   */
  current?: number | undefined
  /**
   * The position that dismisses it, like a drawer's closed position. Without it, it always rests on a point.
   */
  dismissAt?: number | undefined
  /**
   * Moves at most one point from `current`, like steps
   * @default false
   */
  sequential?: boolean | undefined
}

// A release flicked against a clear drag is noise from lifting the finger
function trust(velocity: number, displacement: number) {
  const against =
    Math.sign(velocity) !== 0 && Math.sign(displacement) !== 0 && Math.sign(velocity) !== Math.sign(displacement)
  return against && Math.abs(displacement) >= TRUSTED_DISPLACEMENT ? 0 : velocity
}

function nearestIndex(points: readonly number[], value: number) {
  let best = 0
  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i] - value) < Math.abs(points[best] - value)) best = i
  }
  return best
}

/**
 * Picks where a released swipe rests: the index of a point, or `null` to dismiss. A slow release goes to the
 * nearest point; a flick is projected forward first.
 */
export function settleSwipe(options: SettleSwipeOptions): number | null {
  const { position, points, current, dismissAt, sequential } = options
  if (points.length === 0) return null

  const velocity = trust(options.velocity, position - (current ?? 0))

  if (sequential && current != null) return settleSequential(options, velocity)

  if (dismissAt != null && position >= dismissAt) return null

  const flicked = Math.abs(velocity) >= FLICK_VELOCITY
  const lowest = Math.min(...points)
  const projected = flicked
    ? Math.max(lowest, position + clamp(velocity, -MAX_VELOCITY, MAX_VELOCITY) * PROJECTION_MS)
    : position

  const index = nearestIndex(points, projected)
  if (dismissAt != null && Math.abs(projected - dismissAt) < Math.abs(projected - points[index])) return null

  return index
}

function settleSequential(options: SettleSwipeOptions, velocity: number): number | null {
  const { position, points, current = 0, dismissAt } = options

  const order = points.map((point, index) => ({ point, index })).sort((a, b) => a.point - b.point)
  const from = nearestIndex(
    order.map((item) => item.point),
    current,
  )

  const delta = position - order[from].point
  const direction = Math.sign(delta)
  const flicked = direction !== 0 && Math.sign(velocity) === direction && Math.abs(velocity) >= FLICK_VELOCITY

  let to = from
  let resting = position

  if (flicked) {
    const next = clamp(from + direction, 0, order.length - 1)
    if (next === from && direction > 0 && dismissAt != null) return null
    to = next
    resting = order[to].point
  } else if (delta > SEQUENTIAL_DISTANCE) {
    to = Math.min(from + 1, order.length - 1)
    resting = order[to].point
  } else if (delta < -SEQUENTIAL_DISTANCE) {
    to = Math.max(from - 1, 0)
    resting = order[to].point
  }

  if (dismissAt != null && Math.abs(resting - dismissAt) < Math.abs(resting - order[to].point)) return null
  return order[to].index
}

/* -----------------------------------------------------------------------------
 * Motion
 * -----------------------------------------------------------------------------*/

/**
 * Keeps `value` within `min` and `max`, letting it go past them with resistance: `resistance` turns the
 * overshoot into what shows
 */
export function resistPast(
  value: number,
  bounds: { min?: number | undefined; max?: number | undefined },
  resistance: (overshoot: number) => number = Math.sqrt,
) {
  const { min, max } = bounds
  if (min != null && value < min) return min - resistance(min - value)
  if (max != null && value > max) return max + resistance(value - max)
  return value
}

/**
 * How long a release animation runs, from 0.1 to 1 of its length: shorter the sooner the release speed would
 * cover the `distance` left
 */
export function releaseStrength(options: { distance: number; velocity: number }) {
  const distance = Math.abs(options.distance)
  const speed = Math.abs(options.velocity)
  if (speed <= 0 || distance <= 0) return 1
  const ratio = clamp(distance / speed / STRENGTH_MAX_MS, 0, 1)
  return STRENGTH_MIN + ratio * (1 - STRENGTH_MIN)
}
