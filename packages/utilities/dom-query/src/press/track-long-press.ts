import { suppressNextClick } from "../drag/press"
import { addGlobalEvent } from "../global-event"
import { contains, getWindow } from "../node"
import { Timeout } from "../timeout"
import type { LongPressInput, LongPressPhase, TrackLongPressOptions } from "./types"

/**
 * Styles for an element that can be long pressed. They must be on the element before a touch starts, since iOS
 * reads them then: no callout menu and no text selection.
 */
export const LONG_PRESS_STYLE = {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
} as const

/**
 * Follows a press until it lifts, calling `onHold` once it lasts past `delay`, and again every `interval` when
 * set: a long press, a button held to confirm, or a stepper that repeats. Every input goes through `send`,
 * which moves the press between its phases. Returns a cleanup that stops without calling `onEnd`.
 */
export function trackLongPress(doc: Document, options: TrackLongPressOptions): VoidFunction {
  const { startPoint, pointerId, target, delay = 500, interval, tolerance = 10, onHold } = options
  const win = getWindow(doc)
  const timer = Timeout.create()

  /* -----------------------------------------------------------------------------
   * State
   * -----------------------------------------------------------------------------*/

  const state = {
    phase: "pressed" as LongPressPhase,
    count: 0,
    held: false,
    // `onHold` asked to stop repeating
    stopped: false,
  }

  const isOurs = (event: PointerEvent) => pointerId == null || event.pointerId === pointerId
  const repeats = interval != null

  /* -----------------------------------------------------------------------------
   * Transitions: every input goes through here
   * -----------------------------------------------------------------------------*/

  function send(input: LongPressInput) {
    if (state.phase === "ended") return

    switch (input.type) {
      case "TIMER":
        if (state.phase === "paused") return
        state.phase = "held"
        return hold()

      case "MOVE": {
        if (state.phase !== "pressed") return
        const { clientX, clientY } = input.event
        const far = (clientX - startPoint.x) ** 2 + (clientY - startPoint.y) ** 2 > tolerance ** 2
        if (far) end(input.event, true)
        return
      }

      case "LEAVE":
        if (repeats) {
          state.phase = "paused"
          timer.cancel()
        } else if (state.phase === "pressed") {
          end(undefined, true)
        }
        return

      case "ENTER":
        if (state.phase !== "paused") return
        // coming back steps right away, then waits the delay again
        state.phase = "pressed"
        hold()
        if ((state.phase as LongPressPhase) !== "ended") timer.start(delay, () => send({ type: "TIMER" }))
        return

      case "RELEASE":
        return end(input.event, false)

      case "CANCEL":
        return end(input.event, true)
    }
  }

  /* -----------------------------------------------------------------------------
   * Steps
   * -----------------------------------------------------------------------------*/

  function hold() {
    // armed now, not on release: what onHold opens, like a menu, may stop the tracking before the lift
    if (!state.held) suppressNextClick(doc, { untilRelease: true, pointerId })

    state.held = true
    state.count += 1
    if (onHold({ count: state.count }) === false) state.stopped = true
    if (!repeats || state.stopped || state.phase !== "held") return

    const wait = typeof interval === "function" ? interval(state.count) : interval
    timer.start(wait, () => send({ type: "TIMER" }))
  }

  function end(event: Event | undefined, cancelled: boolean) {
    stop()
    options.onEnd?.({ held: state.held, cancelled, event })
  }

  function stop() {
    state.phase = "ended"
    timer.cancel()
    for (const cleanup of cleanups.splice(0)) cleanup()
  }

  /* -----------------------------------------------------------------------------
   * Listeners: they only turn DOM events into inputs
   * -----------------------------------------------------------------------------*/

  const capturePhase = { capture: true }

  const cleanups = [
    addGlobalEvent<PointerEvent>(
      doc,
      "pointermove",
      (event) => {
        if (isOurs(event)) send({ type: "MOVE", event })
      },
      capturePhase,
    ),

    addGlobalEvent<PointerEvent>(
      doc,
      "pointerup",
      (event) => {
        if (isOurs(event)) send({ type: "RELEASE", event })
      },
      capturePhase,
    ),

    addGlobalEvent<PointerEvent>(
      doc,
      "pointercancel",
      (event) => {
        if (isOurs(event)) send({ type: "CANCEL", event })
      },
      capturePhase,
    ),

    addGlobalEvent(win, "blur", (event) => send({ type: "CANCEL", event })),

    // a scroll that moves the target means the press was the start of a scroll
    addGlobalEvent(
      doc,
      "scroll",
      (event) => {
        const node = event.target as Node | null
        if (!target || !node || node === doc || contains(node as Element, target)) send({ type: "CANCEL", event })
      },
      capturePhase,
    ),

    // a finger near the edge can still open the browser's menu while held
    addGlobalEvent(win, "contextmenu", (event) => event.preventDefault(), capturePhase),
  ]

  if (target) {
    cleanups.push(
      addGlobalEvent(target, "pointerleave", () => send({ type: "LEAVE" })),
      addGlobalEvent(target, "pointerenter", () => send({ type: "ENTER" })),
    )
  }

  timer.start(delay, () => send({ type: "TIMER" }))

  return stop
}
