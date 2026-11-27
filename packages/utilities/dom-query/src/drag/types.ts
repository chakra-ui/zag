import type { Point } from "../types"

export interface DragMoveDetails {
  /**
   * The pointer's position, after `transformPoint`. Under pointer lock, it keeps counting past the screen's edges.
   */
  point: Point
  /**
   * How far the pointer is from where the press started
   */
  offset: Point
  /**
   * How far the pointer moved since the last report
   */
  delta: Point
  /**
   * How fast the pointer is moving, in units per millisecond, over the last 100ms
   */
  velocity: Point
  /**
   * Every pointer event since the last report, oldest first, including the ones the browser coalesced.
   * Read them for strokes that need each point and its pressure.
   */
  events: PointerEvent[]
  /**
   * Whether the pointer is locked, so the cursor is hidden and still
   */
  locked: boolean
  /**
   * The latest pointer event, for its modifier keys and target
   */
  event: PointerEvent
}

export interface DragStartDetails {
  /**
   * Where the drag started
   */
  point: Point
  /**
   * The move that started it. Missing when the press itself is the start, without a threshold.
   */
  event: PointerEvent | undefined
}

export interface DragEndDetails {
  /**
   * The pointer's last position, where it lifted
   */
  point: Point
  /**
   * How far the pointer ended from where the press started
   */
  offset: Point
  /**
   * How fast the pointer was moving when it lifted, in units per millisecond. Zero after holding still for 50ms.
   */
  velocity: Point
  /**
   * Whether the drag began: it passed `threshold` and `canStart` agreed
   */
  started: boolean
  /**
   * Whether the pointer moved past `DRAG_DISTANCE`. A press that didn't is a click.
   */
  moved: boolean
  /**
   * Whether the drag was cancelled: by Escape, the browser taking the pointer over, the window losing
   * focus, a context menu, or `canStart` letting the press go
   */
  cancelled: boolean
  /**
   * What ended it. Missing when `canStart` let the press go.
   */
  event: Event | undefined
}

export interface TrackDragOptions {
  /**
   * Where the press started, in client coordinates
   */
  startPoint: Point
  /**
   * The pointer to follow. Other pointers, like a second finger, are ignored.
   */
  pointerId?: number | undefined
  /**
   * How far, in screen pixels, the pointer moves before the drag starts. Moves before then aren't reported.
   * @default 0
   */
  threshold?: number | undefined
  /**
   * Decides, once past `threshold`, whether this press is a drag: `true` starts it, `false` lets it go
   * (like a scroll), and `undefined` keeps waiting. To lock a swipe to one axis:
   * `canStart: ({ x, y }) => Math.abs(x) > Math.abs(y) || undefined`
   */
  canStart?: ((offset: Point, event: PointerEvent) => boolean | undefined) | undefined
  /**
   * Maps a client point into the space the drag reports in, like a zoomed canvas's units.
   * `threshold` and `DRAG_DISTANCE` stay in screen pixels.
   */
  transformPoint?: ((point: Point) => Point) | undefined
  /**
   * Called once when the drag starts, before its first move
   */
  onStart?: ((details: DragStartDetails) => void) | undefined
  /**
   * Called at most once a frame while the pointer moves
   */
  onMove: (details: DragMoveDetails) => void
  /**
   * Called once when the press ends, whether it dragged or not. A pending move is reported first.
   */
  onEnd: (details: DragEndDetails) => void
  /**
   * Whether Escape cancels the drag. The key doesn't reach anything else, like a dialog around it.
   * @default false
   */
  cancelOnEscape?: boolean | undefined
  /**
   * The element that captures the pointer once the drag starts, so it keeps getting the events
   */
  capture?: Element | null | undefined
  /**
   * Which events to follow. `touch` reads touch events, which keep coming after the browser starts scrolling,
   * so a drag can take a touch over from a scroll; once dragging, it stops the scroll.
   * @default "pointer"
   */
  input?: "pointer" | "touch" | undefined
  /**
   * The element to lock the pointer to once it moves past `DRAG_DISTANCE`, so a scrub can travel without
   * limit. Falls back to plain movement where the browser refuses.
   */
  lock?: Element | null | undefined
}

/**
 * `pressed`: down, but not far enough (or not decided) to drag. `dragging`: following the pointer.
 * `ended`: released or cancelled; nothing moves it again.
 */
export type DragPhase = "pressed" | "dragging" | "ended"

export type DragInput =
  | { type: "MOVE"; event: PointerEvent }
  | { type: "RELEASE"; event: PointerEvent }
  | { type: "CANCEL"; event: Event | undefined }
  | { type: "ESCAPE"; event: KeyboardEvent }
