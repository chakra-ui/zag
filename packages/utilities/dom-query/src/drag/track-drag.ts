import { getWindow } from "../node"
import { addGlobalEvent } from "../global-event"
import { AnimationFrame } from "../raf"
import { disableTextSelection } from "../text-selection"
import type { Point } from "../types"
import { suppressNextClick } from "./press"
import type { DragInput, DragPhase, TrackDragOptions } from "./types"
import { createVelocity } from "./velocity"

/**
 * How far, in CSS pixels, a press moves before it counts as a drag rather than a click.
 */
export const DRAG_DISTANCE = 3

const identity = (point: Point) => point

/**
 * Follows a pointer from a press until it lifts, for a drag: a slider thumb, a splitter, a box being moved.
 * Every input goes through `send`, which moves the gesture between its phases. Moves are reported at most once
 * a frame. Returns a cleanup that stops following without calling `onEnd`.
 */
export function trackDrag(doc: Document, options: TrackDragOptions): VoidFunction {
  const { startPoint, pointerId, threshold = 0, canStart, cancelOnEscape, capture, lock } = options
  const transform = options.transformPoint ?? identity

  const win = getWindow(doc)
  const frame = AnimationFrame.create()
  const velocity = createVelocity()
  const start = transform(startPoint)

  /* -----------------------------------------------------------------------------
   * State
   * -----------------------------------------------------------------------------*/

  const state = {
    phase: (threshold || canStart ? "pressed" : "dragging") as DragPhase,

    // client coordinates, where `threshold` and `DRAG_DISTANCE` are measured
    client: startPoint,
    point: start,

    // what the last report saw, and the events since
    reported: start,
    events: [] as PointerEvent[],
    latest: null as PointerEvent | null,

    started: false,
    dragged: false,
  }

  let capturedId: number | undefined
  let restoreSelection: VoidFunction | undefined

  const isOurs = (event: PointerEvent) => pointerId == null || event.pointerId === pointerId
  const isLocked = () => !!lock && doc.pointerLockElement === lock
  const offsetOf = ({ x, y }: Point) => ({ x: x - start.x, y: y - start.y })
  const isFar = (a: Point, b: Point, distance: number) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 >= distance ** 2

  /* -----------------------------------------------------------------------------
   * Transitions: every input goes through here
   * -----------------------------------------------------------------------------*/

  function send(input: DragInput) {
    if (state.phase === "ended") return

    switch (input.type) {
      case "MOVE": {
        const { event } = input

        if (state.phase === "pressed") {
          const client = { x: event.clientX, y: event.clientY }
          if (!isFar(client, startPoint, threshold)) return

          const decision = canStart ? canStart(offsetOf(transform(client)), event) : true
          if (decision === undefined) return
          if (decision === false) return end(undefined, true)

          begin(event)
        }

        record(event)
        if (!frame.isActive()) frame.request(report)
        return
      }

      case "RELEASE": {
        const { event } = input

        // the pending move goes out as it was, before the release moves the point
        report()

        if (state.phase === "dragging" && !isLocked()) {
          state.client = { x: event.clientX, y: event.clientY }
          state.point = transform(state.client)
        }

        if (state.dragged) suppressNextClick(doc)

        return end(event, false)
      }

      case "CANCEL":
        report()
        return end(input.event, true)

      case "ESCAPE": {
        if (state.phase !== "dragging") return

        input.event.preventDefault()
        input.event.stopPropagation()

        if (state.dragged) suppressNextClick(doc, { untilRelease: true, pointerId })

        report()
        return end(input.event, true)
      }
    }
  }

  /* -----------------------------------------------------------------------------
   * Steps
   * -----------------------------------------------------------------------------*/

  function begin(event: PointerEvent | undefined) {
    state.phase = "dragging"
    state.started = true

    restoreSelection = disableTextSelection({ doc })

    const id = event?.pointerId ?? pointerId
    if (capture && id != null) {
      try {
        capture.setPointerCapture(id)
        capturedId = id
      } catch {
        // synthetic events have no active pointer to capture
      }
    }

    if (event) velocity.add(start, event.timeStamp)
    options.onStart?.({ point: state.point, event })
  }

  function record(event: PointerEvent) {
    state.client = isLocked()
      ? { x: state.client.x + event.movementX, y: state.client.y + event.movementY }
      : { x: event.clientX, y: event.clientY }
    state.point = transform(state.client)

    state.latest = event

    const coalesced = event.getCoalescedEvents?.()
    if (coalesced?.length) state.events.push(...coalesced)
    else state.events.push(event)

    velocity.add(state.point, event.timeStamp)

    if (!state.dragged && isFar(state.client, startPoint, DRAG_DISTANCE)) {
      state.dragged = true
      if (lock && event.pointerType === "mouse") requestLock(lock)
    }
  }

  function report() {
    frame.cancel()
    const { events, latest, point, reported } = state
    if (!latest) return

    state.reported = point
    state.events = []
    state.latest = null

    options.onMove({
      point,
      offset: offsetOf(point),
      delta: { x: point.x - reported.x, y: point.y - reported.y },
      velocity: velocity.get(latest.timeStamp),
      events,
      locked: isLocked(),
      event: latest,
    })
  }

  function end(event: Event | undefined, cancelled: boolean) {
    stop()

    options.onEnd({
      point: state.point,
      offset: offsetOf(state.point),
      velocity: cancelled || !event ? { x: 0, y: 0 } : velocity.get(event.timeStamp),
      started: state.started,
      moved: state.dragged,
      cancelled,
      event,
    })
  }

  function stop() {
    state.phase = "ended"
    frame.cancel()

    for (const cleanup of cleanups.splice(0)) cleanup()

    restoreSelection?.()
    restoreSelection = undefined

    if (capturedId != null && capture?.hasPointerCapture?.(capturedId)) {
      capture.releasePointerCapture(capturedId)
    }

    if (isLocked()) doc.exitPointerLock()
  }

  /* -----------------------------------------------------------------------------
   * Listeners: they only turn DOM events into inputs
   * -----------------------------------------------------------------------------*/

  const cancel = (event: Event) => send({ type: "CANCEL", event })

  // capture, so a descendant that stops propagation can't keep the drag from ending
  const capturePhase = { capture: true }

  const cleanups = [
    addGlobalEvent<PointerEvent>(
      doc,
      "pointermove",
      (event) => {
        if (!isOurs(event)) return

        // released outside the window
        if (event.pointerType === "mouse" && event.buttons === 0) send({ type: "RELEASE", event })
        else send({ type: "MOVE", event })
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
        if (isOurs(event)) cancel(event)
      },
      capturePhase,
    ),

    // the release won't arrive
    addGlobalEvent(win, "blur", cancel),
    addGlobalEvent(doc, "contextmenu", cancel, capturePhase),
  ]

  if (cancelOnEscape) {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") send({ type: "ESCAPE", event })
    }
    cleanups.push(addGlobalEvent(doc, "keydown", onKeyDown, capturePhase))
  }

  if (state.phase === "dragging") begin(undefined)

  return stop
}

// Safari can refuse the lock
function requestLock(el: Element) {
  if (typeof el.requestPointerLock !== "function") return
  try {
    const result = el.requestPointerLock() as unknown
    if (result instanceof Promise) result.catch(() => {})
  } catch {}
}
