import type { Scope } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"
import type { SwipeDirection } from "../drawer.types"
import { isVerticalSwipeDirection } from "./swipe"

const DEFERRED_DRAG_MIN_MAIN_AXIS_PX = 6
/** Require main-axis movement to clearly dominate cross-axis (horizontal text drag stays off sheet drag). */
const DEFERRED_DRAG_MAIN_OVER_CROSS_RATIO = 1.35

interface PendingPointer {
  pointerId: number
  startPoint: Point
  cleanups: Array<() => void>
}

const pendingByScope = new WeakMap<Scope, PendingPointer>()

function clearPending(scope: Scope) {
  const p = pendingByScope.get(scope)
  if (!p) return
  p.cleanups.forEach((fn) => fn())
  pendingByScope.delete(scope)
}

/**
 * Cancel any in-progress deferred content pointer-down (e.g. new gesture starting).
 */
export function cancelDeferPointerDown(scope: Scope) {
  clearPending(scope)
}

export interface DeferPointerDownOptions {
  scope: Scope
  /** Called when movement reads as a sheet-axis drag; wire to `send({ type: "POINTER_DOWN", point })` at the call site. */
  onCommit: (point: Point) => void
  /** Drawer must still be open and not in closing animation before arming drag. */
  canCommitPointerDown: () => boolean
  swipeDirection: SwipeDirection
  pointerId: number
  startPoint: Point
}

/**
 * For mouse/pen on sheet content: wait until movement is clearly a sheet-axis drag before calling `onCommit`,
 * so click-drag to select text does not arm the drawer on the first pixel of movement.
 */
export function deferPointerDown(options: DeferPointerDownOptions): void {
  const { scope, onCommit, canCommitPointerDown, swipeDirection, pointerId, startPoint } = options

  clearPending(scope)

  const win = scope.getWin()
  const vertical = isVerticalSwipeDirection(swipeDirection)

  function onMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) return

    const dx = event.clientX - startPoint.x
    const dy = event.clientY - startPoint.y
    const mainDelta = vertical ? dy : dx
    const crossDelta = vertical ? dx : dy
    const absMain = Math.abs(mainDelta)
    const absCross = Math.abs(crossDelta)

    if (absMain >= DEFERRED_DRAG_MIN_MAIN_AXIS_PX && absMain >= absCross * DEFERRED_DRAG_MAIN_OVER_CROSS_RATIO) {
      if (canCommitPointerDown()) {
        onCommit(startPoint)
      }
      clearPending(scope)
    }
  }

  function onEnd(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    clearPending(scope)
  }

  const cleanups = [
    addDomEvent(win, "pointermove", onMove, { capture: true }),
    addDomEvent(win, "pointerup", onEnd, { capture: true }),
    addDomEvent(win, "pointercancel", onEnd, { capture: true }),
    addDomEvent(win, "lostpointercapture", onEnd, { capture: true }),
  ]

  pendingByScope.set(scope, { pointerId, startPoint, cleanups })
}
