import type { TrackDragOptions } from "../drag/types"
import type { Point } from "../types"

export type SwipeDirection = "up" | "down" | "left" | "right"

export type SwipeAxis = "x" | "y"

export interface SwipeMoveDetails {
  /**
   * How far it moved, kept to the locked axis, with movement toward directions that aren't allowed resisted
   */
  offset: Point
  /**
   * The allowed direction the swipe went first, once it's known
   */
  direction: SwipeDirection | null
  /**
   * How far it moved along `direction`, or along the allowed direction on its axis before it has one. Negative
   * when it moved the other way, and never resisted.
   */
  displacement: number
  /**
   * How fast the pointer is moving, in px/ms
   */
  velocity: Point
  /**
   * The latest pointer event
   */
  event: PointerEvent
}

export interface SwipeEndDetails {
  /**
   * The allowed direction the swipe ended in, or where it went first when it ended elsewhere. A swipe that
   * only went the other way is measured along the allowed direction on its axis. Missing when it never started.
   */
  direction: SwipeDirection | null
  /**
   * How far it ended along `direction`, in px. Negative when pulled back past the start.
   */
  displacement: number
  /**
   * The furthest it got along `direction`, in px
   */
  furthest: number
  /**
   * The release velocity along `direction`, in px/ms
   */
  velocity: number
  /**
   * Where it ended, shaped the same way as the moves
   */
  offset: Point
  /**
   * Whether the swipe started
   */
  started: boolean
  /**
   * Whether it was cancelled, like by the browser taking the pointer over
   */
  cancelled: boolean
  /**
   * What ended it
   */
  event: Event | undefined
}

export interface TrackSwipeOptions extends Pick<
  TrackDragOptions,
  "startPoint" | "pointerId" | "threshold" | "capture" | "cancelOnEscape" | "input"
> {
  /**
   * The directions it can swipe. With directions on both axes, the first move locks it to one.
   */
  directions: SwipeDirection[]
  /**
   * How far movement toward a direction that isn't allowed shows, for the px it moved
   * @default Math.sqrt
   */
  resistance?: ((overshoot: number) => number) | undefined
  /**
   * The element pressed. With `scrollContainer`, content under it scrolls first.
   */
  target?: EventTarget | null | undefined
  /**
   * Where nested scrolling stops: while content between `target` and here can still scroll the way the
   * finger moves, the swipe waits, so it starts at the scroll's edge
   */
  scrollContainer?: Element | null | undefined
  /**
   * Lets a press that goes along an axis with no allowed direction go, so the page can scroll. Otherwise it
   * waits until the press leads along an allowed axis.
   * @default false
   */
  releaseOffAxis?: boolean | undefined
  /**
   * Decides whether the swipe can start, before the axis is checked: `true` starts it, `false` lets it go
   * (like a scroll), and `undefined` keeps waiting
   */
  canStart?: ((offset: Point, event: PointerEvent) => boolean | undefined) | undefined
  /**
   * Called once when the swipe starts
   */
  onStart?: (() => void) | undefined
  /**
   * Called at most once a frame while it moves
   */
  onMove: (details: SwipeMoveDetails) => void
  /**
   * Called once when the press ends
   */
  onEnd: (details: SwipeEndDetails) => void
}
