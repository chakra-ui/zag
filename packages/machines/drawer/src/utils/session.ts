import { addDomEvent, disableTextSelection, getEventPoint, getEventTarget } from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"

// Sliding window used to average recent movement into release velocity.
const VELOCITY_WINDOW_MS = 100
// Ignore stale samples so release velocity reflects the final part of the gesture.
const MAX_RELEASE_VELOCITY_AGE_MS = 80
// Very short gestures should not produce a trusted release velocity.
const MIN_GESTURE_DURATION_MS = 50
// Require at least two samples before computing a release velocity.
const MIN_VELOCITY_SAMPLES = 2
// Compact the sample buffer after enough expired samples accumulate.
const SAMPLE_BUFFER_COMPACT_THRESHOLD = 8

// Pending mouse/pen drags need a minimum main-axis movement before they arm.
const DEFERRED_DRAG_MIN_MAIN_AXIS_PX = 6
// Main-axis movement must dominate cross-axis movement before deferred drag commits.
const DEFERRED_DRAG_MAIN_OVER_CROSS_RATIO = 1.35

interface VelocitySample {
  axis: number
  time: number
}

interface PendingSwipe {
  pointerId: number
  startPoint: Point
  cleanups: Array<() => void>
}

export type GestureAxis = "x" | "y"
export type PhysicalSwipeDirection = "up" | "down" | "left" | "right"
export type SwipePointerType = "mouse" | "pen" | "touch"

export interface SwipeMoveDetails {
  point: Point
  target: Element | null
  event: PointerEvent | TouchEvent
  pointerType: SwipePointerType
  axis: GestureAxis
  swipeDirection: PhysicalSwipeDirection
}

export interface SwipeEndDetails {
  point: Point
  swipeDirection: PhysicalSwipeDirection
}

export interface SwipeStartDetails {
  point: Point
  target: Element | null
  event: PointerEvent | TouchEvent
  pointerType: SwipePointerType
  axis: GestureAxis
  swipeDirection: PhysicalSwipeDirection
}

export interface SwipeInterruptDetails {
  reason: "visibility-hidden" | "lost-pointer-capture"
  event: Event | Document
  target: Element | null
  pointerType: SwipePointerType | null
}

export interface SwipeTrackingOptions {
  getDoc: () => Document
  getSelectionTarget?: () => HTMLElement | null
  swipeDirection: PhysicalSwipeDirection
  onStart?: (details: SwipeStartDetails) => void
  onMove: (details: SwipeMoveDetails) => void
  onEnd: (details: SwipeEndDetails) => void
  onCancel: () => void
  preventDefault?: (details: SwipeMoveDetails) => boolean
  cancelOnInterrupt?: (details: SwipeInterruptDetails) => boolean
}

export interface PendingSwipeOptions {
  getWin: () => Window
  pointerId: number
  startPoint: Point
  swipeDirection: PhysicalSwipeDirection
  onCommit: (point: Point) => void
  canCommit?: () => boolean
  onCancel?: () => void
}

export function isVerticalSwipeDirection(direction: PhysicalSwipeDirection): boolean {
  return direction === "down" || direction === "up"
}

export function isNegativeSwipeDirection(direction: PhysicalSwipeDirection): boolean {
  return direction === "up" || direction === "left"
}

export class SwipeSession {
  private startPoint: Point | null = null
  private velocity: number | null = null
  private samples: VelocitySample[] = []
  private sampleStartIndex = 0
  private gestureStartAxis: number | null = null
  private gestureStartTime: number | null = null
  private gestureSign = 1
  private pendingSwipe: PendingSwipe | null = null

  setStartPoint(point: Point) {
    this.startPoint = point
  }

  clearStartPoint() {
    this.startPoint = null
  }

  getStartPoint(): Point | null {
    return this.startPoint
  }

  getGestureAxis(direction: PhysicalSwipeDirection): GestureAxis {
    return direction === "left" || direction === "right" ? "x" : "y"
  }

  getGestureSign(direction: PhysicalSwipeDirection): number {
    return isNegativeSwipeDirection(direction) ? -1 : 1
  }

  private getAxisValue(point: Point, axis: GestureAxis): number {
    return point[axis]
  }

  getMainAxisDisplacement(point: Point, axis: GestureAxis, sign: number): number {
    if (!this.startPoint) return 0
    const startAxis = this.getAxisValue(this.startPoint, axis)
    const currentAxis = this.getAxisValue(point, axis)
    return (startAxis - currentAxis) * sign
  }

  getCrossAxisDisplacement(point: Point, axis: GestureAxis): number {
    if (!this.startPoint) return 0
    const crossAxis: GestureAxis = axis === "x" ? "y" : "x"
    const startAxis = this.getAxisValue(this.startPoint, crossAxis)
    const currentAxis = this.getAxisValue(point, crossAxis)
    return currentAxis - startAxis
  }

  track(point: Point, axis: GestureAxis, sign: number) {
    const axisValue = this.getAxisValue(point, axis)
    const now = performance.now()

    if (this.gestureStartAxis === null) {
      this.gestureStartAxis = axisValue
      this.gestureStartTime = now
      this.gestureSign = sign
    }

    this.samples.push({ axis: axisValue, time: now })

    const cutoff = now - VELOCITY_WINDOW_MS
    while (this.sampleStartIndex < this.samples.length && this.samples[this.sampleStartIndex].time < cutoff) {
      this.sampleStartIndex += 1
    }

    if (this.sampleStartIndex >= SAMPLE_BUFFER_COMPACT_THRESHOLD) {
      this.samples = this.samples.slice(this.sampleStartIndex)
      this.sampleStartIndex = 0
    }

    const sampleCount = this.samples.length - this.sampleStartIndex
    if (sampleCount < MIN_VELOCITY_SAMPLES) {
      this.velocity = 0
      return
    }

    const oldest = this.samples[this.sampleStartIndex]
    const newest = this.samples[this.samples.length - 1]
    const dt = newest.time - oldest.time

    if (dt <= 0) {
      this.velocity = 0
      return
    }

    const delta = (newest.axis - oldest.axis) * sign
    const velocity = (delta / dt) * 1000
    this.velocity = Number.isFinite(velocity) ? velocity : 0
  }

  getReleaseVelocity(): number {
    const now = performance.now()
    const sampleCount = this.samples.length - this.sampleStartIndex

    if (sampleCount >= MIN_VELOCITY_SAMPLES) {
      const newest = this.samples[this.samples.length - 1]
      if (now - newest.time <= MAX_RELEASE_VELOCITY_AGE_MS) {
        return this.velocity ?? 0
      }
    }

    if (this.gestureStartAxis !== null && this.gestureStartTime !== null) {
      const lastSample = this.samples[this.samples.length - 1]
      if (lastSample) {
        const dt = Math.max(lastSample.time - this.gestureStartTime, MIN_GESTURE_DURATION_MS)
        const delta = (lastSample.axis - this.gestureStartAxis) * this.gestureSign
        const velocity = (delta / dt) * 1000
        return Number.isFinite(velocity) ? velocity : 0
      }
    }

    return this.velocity ?? 0
  }

  clearVelocityTracking() {
    this.samples = []
    this.sampleStartIndex = 0
    this.velocity = null
    this.gestureStartAxis = null
    this.gestureStartTime = null
    this.gestureSign = 1
  }

  clear() {
    this.cancelDeferredSwipe()
    this.clearStartPoint()
    this.clearVelocityTracking()
  }

  startDeferredSwipe(options: PendingSwipeOptions) {
    const { getWin, pointerId, startPoint, swipeDirection, onCommit, canCommit, onCancel } = options

    this.cancelDeferredSwipe()

    const win = getWin()
    const vertical = isVerticalSwipeDirection(swipeDirection)

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return

      const dx = event.clientX - startPoint.x
      const dy = event.clientY - startPoint.y
      const mainDelta = vertical ? dy : dx
      const crossDelta = vertical ? dx : dy
      const absMain = Math.abs(mainDelta)
      const absCross = Math.abs(crossDelta)

      if (absMain >= DEFERRED_DRAG_MIN_MAIN_AXIS_PX && absMain >= absCross * DEFERRED_DRAG_MAIN_OVER_CROSS_RATIO) {
        if (!canCommit || canCommit()) {
          onCommit(startPoint)
        }
        this.cancelDeferredSwipe()
      }
    }

    const onEnd = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      onCancel?.()
      this.cancelDeferredSwipe()
    }

    const cleanups = [
      addDomEvent(win, "pointermove", onMove, { capture: true }),
      addDomEvent(win, "pointerup", onEnd, { capture: true }),
      addDomEvent(win, "pointercancel", onEnd, { capture: true }),
      addDomEvent(win, "lostpointercapture", onEnd, { capture: true }),
    ]

    this.pendingSwipe = { pointerId, startPoint, cleanups }
  }

  cancelDeferredSwipe() {
    if (!this.pendingSwipe) return
    this.pendingSwipe.cleanups.forEach((cleanup) => cleanup())
    this.pendingSwipe = null
  }

  bind(options: SwipeTrackingOptions) {
    const {
      getDoc,
      getSelectionTarget,
      swipeDirection,
      onStart,
      onMove,
      onEnd,
      onCancel,
      preventDefault,
      cancelOnInterrupt,
    } = options

    const doc = getDoc()
    let usingTouchEvents = false
    let restoreSelection: (() => void) | undefined
    const axis = this.getGestureAxis(swipeDirection)
    const sign = this.getGestureSign(swipeDirection)

    const trackPoint = (point: Point) => {
      this.track(point, axis, sign)
    }

    const startSelectionGuard = () => {
      restoreSelection ??= disableTextSelection({
        doc,
        target: getSelectionTarget?.(),
      })
    }

    const stopSelectionGuard = () => {
      restoreSelection?.()
      restoreSelection = undefined
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch" && usingTouchEvents) return
      const point = getEventPoint(event)
      const target = getEventTarget<Element>(event)
      startSelectionGuard()
      trackPoint(point)
      onMove({
        point,
        target,
        event,
        pointerType: event.pointerType as SwipePointerType,
        axis,
        swipeDirection,
      })
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === "touch" && usingTouchEvents) {
        usingTouchEvents = false
        return
      }
      stopSelectionGuard()
      onEnd({ point: getEventPoint(event), swipeDirection })
    }

    function onPointerCancel(event: PointerEvent) {
      if (event.pointerType === "touch" && usingTouchEvents) {
        usingTouchEvents = false
        return
      }
      stopSelectionGuard()
      onCancel()
    }

    function onTouchStartEvent(event: TouchEvent) {
      if (!event.touches[0]) return
      usingTouchEvents = true
      const point = getEventPoint(event)
      const target = getEventTarget<Element>(event)
      onStart?.({ point, target, event, pointerType: "touch", axis, swipeDirection })
    }

    function onTouchMoveEvent(event: TouchEvent) {
      if (!event.touches[0]) return
      usingTouchEvents = true
      const point = getEventPoint(event)
      const target = getEventTarget<Element>(event)
      const details = { point, target, event, pointerType: "touch" as const, axis, swipeDirection }
      if (preventDefault?.(details) && event.cancelable) {
        event.preventDefault()
      }
      startSelectionGuard()
      trackPoint(point)
      onMove(details)
    }

    function onTouchEnd(event: TouchEvent) {
      if (event.touches.length !== 0) return
      stopSelectionGuard()
      onEnd({ point: getEventPoint(event), swipeDirection })
    }

    function onTouchCancel() {
      stopSelectionGuard()
      onCancel()
    }

    function onVisibilityChange() {
      if (doc.visibilityState !== "hidden") return
      const shouldCancel = cancelOnInterrupt?.({
        reason: "visibility-hidden",
        event: doc,
        target: null,
        pointerType: null,
      })
      if (shouldCancel === false) return
      stopSelectionGuard()
      onCancel()
    }

    function onLostPointerCapture(event: PointerEvent) {
      if (event.pointerType === "touch") return
      const target = getEventTarget<Element>(event)
      const shouldCancel = cancelOnInterrupt?.({
        reason: "lost-pointer-capture",
        event,
        target,
        pointerType: event.pointerType as SwipePointerType,
      })
      if (shouldCancel === false) return
      onCancel()
    }

    const cleanups = [
      addDomEvent(doc, "pointermove", onPointerMove),
      addDomEvent(doc, "pointerup", onPointerUp),
      addDomEvent(doc, "pointercancel", onPointerCancel),
      addDomEvent(doc, "touchstart", onTouchStartEvent, { capture: true, passive: false }),
      addDomEvent(doc, "touchmove", onTouchMoveEvent, { capture: true, passive: false }),
      addDomEvent(doc, "touchend", onTouchEnd, { capture: true }),
      addDomEvent(doc, "touchcancel", onTouchCancel, { capture: true }),
      addDomEvent(doc, "visibilitychange", onVisibilityChange),
      addDomEvent(doc, "lostpointercapture", onLostPointerCapture, true),
    ]

    return () => {
      stopSelectionGuard()
      cleanups.forEach((cleanup) => cleanup())
    }
  }
}
