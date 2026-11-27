import type { Point } from "../types"

export interface LongPressHoldDetails {
  /**
   * How many times `onHold` has run in this press, starting at 1
   */
  count: number
}

export interface LongPressEndDetails {
  /**
   * Whether the press lasted past `delay`. A press that didn't is a tap.
   */
  held: boolean
  /**
   * Whether the press was cancelled: it moved past `tolerance`, a scroll took it over, the browser cancelled
   * the pointer, the window lost focus, or the pointer left `target` before a long press without `interval`
   */
  cancelled: boolean
  /**
   * What ended it
   */
  event: Event | undefined
}

export interface TrackLongPressOptions {
  /**
   * Where the press started, in client coordinates
   */
  startPoint: Point
  /**
   * The pointer to follow. Other pointers, like a second finger, are ignored.
   */
  pointerId?: number | undefined
  /**
   * The element that was pressed. Scrolling an ancestor cancels the press, and leaving it pauses a repeating
   * press or cancels a long press.
   */
  target?: Element | null | undefined
  /**
   * How long the press lasts before it's held, in milliseconds
   * @default 500
   */
  delay?: number | undefined
  /**
   * Runs `onHold` again this often while held, in milliseconds, like a stepper's button. A function gets the
   * count so far, to speed up over time. Without it, `onHold` runs once.
   */
  interval?: number | ((count: number) => number) | undefined
  /**
   * How far, in screen pixels, the pointer can move before it's held
   * @default 10
   */
  tolerance?: number | undefined
  /**
   * Runs once the press is held, then every `interval`. Return `false` to stop repeating, like at a bound.
   */
  onHold: (details: LongPressHoldDetails) => boolean | void
  /**
   * Runs once when the press ends, whether it was held or not
   */
  onEnd?: ((details: LongPressEndDetails) => void) | undefined
}

/**
 * `pressed`: down, waiting for `delay`. `held`: `onHold` has run. `paused`: a repeating press left its target.
 * `ended`: released or cancelled; nothing runs again.
 */
export type LongPressPhase = "pressed" | "held" | "paused" | "ended"

export type LongPressInput =
  | { type: "TIMER" }
  | { type: "MOVE"; event: PointerEvent }
  | { type: "LEAVE" }
  | { type: "ENTER" }
  | { type: "RELEASE"; event: PointerEvent }
  | { type: "CANCEL"; event: Event }
