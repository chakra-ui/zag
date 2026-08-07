import { AnimationFrame, addDomEvent, getDocument, getWindow, raf } from "@zag-js/dom-query"
import type { Point, Polygon, Rect } from "./geometry"
import { getSafeAreaPolygon, isMeasuredRect, isPointInPolygon, isPointInRect } from "./geometry"

/**
 * `unengaged`: the pointer has never been on either element, so moving around the page must not
 * close the overlay. `departed` keeps listening, so a pointer that comes back cancels the close.
 */
export type SafeAreaState = "unengaged" | "anchored" | "traversing" | "settled" | "departed"

export interface SafeAreaOptions {
  /** A getter, since the active trigger can change while the overlay stays open. */
  getTriggerEl: () => Element | null | undefined
  getContentEl: () => Element | null | undefined
  /** @default 8 */
  padding?: number | undefined
  /** Abandon the journey if the pointer lingers in the corridor this long. Off by default. */
  travelTimeout?: number | undefined
  /**
   * Whether the overlay was opened by hovering its trigger, meaning the pointer is already on it.
   * Otherwise tracking starts `unengaged` and engages once the pointer reaches either element.
   *
   * A getter, so it is read at setup rather than when the effect is created — the flag it reads
   * is often set by the very transition that starts tracking.
   */
  openedByPointer?: (() => boolean) | undefined
  onEnter?: VoidFunction | undefined
  onLeave?: VoidFunction | undefined
  defer?: boolean | undefined
}

/**
 * Tracks whether the pointer is still committed to an open overlay, so it survives the journey
 * from trigger to content instead of relying on a close delay alone.
 *
 * Emits on edges only. Anything uncertain resolves to `departed`, so the failure mode is always
 * "close normally", never "stay open forever".
 */
export function trackSafeArea(options: SafeAreaOptions): VoidFunction {
  const { getTriggerEl, getContentEl, padding = 8, travelTimeout, openedByPointer, onEnter, onLeave, defer } = options

  const cleanups: (VoidFunction | undefined)[] = []

  const setup = () => {
    const triggerEl = getTriggerEl()
    if (!triggerEl) return

    const win = getWindow(triggerEl)
    const doc = getDocument(triggerEl)
    const frame = AnimationFrame.create()

    let state: SafeAreaState = openedByPointer?.() ? "anchored" : "unengaged"
    let exitPoint: Point | null = null
    let travelTimer: ReturnType<typeof setTimeout> | undefined
    let pendingPoint: Point | null = null

    const clearTravelTimer = () => {
      if (travelTimer == null) return
      clearTimeout(travelTimer)
      travelTimer = undefined
    }

    const transition = (next: SafeAreaState) => {
      if (next === state) return
      const prev = state
      state = next

      if (next !== "traversing") clearTravelTimer()

      if (prev !== "departed" && next === "departed") onLeave?.()
      else if (prev === "departed") onEnter?.()

      if (next === "traversing" && travelTimeout != null && travelTimer == null) {
        travelTimer = setTimeout(() => transition("departed"), travelTimeout)
      }
    }

    // Live, not cached: the content may still be animating into place.
    const rectOf = (el: Element | null | undefined): Rect | null => {
      if (!el || !el.isConnected) return null
      const { x, y, width, height } = el.getBoundingClientRect()
      const rect: Rect = [x, y, width, height]
      return isMeasuredRect(rect) ? rect : null
    }

    const resolve = (point: Point): SafeAreaState => {
      const triggerRect = rectOf(getTriggerEl())
      const contentRect = rectOf(getContentEl())

      if (!triggerRect || !contentRect) return "departed"

      if (isPointInRect(triggerRect, point, padding)) return "anchored"
      if (isPointInRect(contentRect, point, padding)) return "settled"

      if (!exitPoint) return "departed"
      const polygon: Polygon = getSafeAreaPolygon({ exitPoint, contentRect, padding })
      return isPointInPolygon(polygon, point) ? "traversing" : "departed"
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      // One geometry read per frame; latest position wins.
      pendingPoint = [event.clientX, event.clientY]
      frame.request(() => {
        const point = pendingPoint
        if (!point) return
        // Record the exit point only once confirmed inside: a corridor built around a point
        // already outside would always contain the pointer.
        const next = resolve(point)
        const inside = next === "anchored" || next === "settled"
        if (inside) exitPoint = point
        if (state === "unengaged" && !inside) return
        transition(next)
      })
    }

    cleanups.push(
      addDomEvent(win, "pointermove", onPointerMove, { passive: true }),
      addDomEvent(doc.documentElement, "pointerleave", () => {
        if (state === "unengaged") return
        transition("departed")
      }),
      frame.cleanup,
      clearTravelTimer,
    )
  }

  cleanups.push(defer ? raf(setup) : (setup(), undefined))

  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
