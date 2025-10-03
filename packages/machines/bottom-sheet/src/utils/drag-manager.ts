import type { Point } from "@zag-js/types"
import type { ResolvedSnapPoint } from "../bottom-sheet.types"
import { findClosestSnapPoint } from "./find-closest-snap-point"
import { getScrollInfo } from "./get-scroll-info"

const DRAG_START_THRESHOLD = 0.3

export class DragManager {
  private pointerStart: Point | null = null
  private dragOffset: number | null = null
  private lastPoint: Point | null = null
  private lastTimestamp: number | null = null
  private velocity: number | null = null

  setPointerStart(point: Point) {
    this.pointerStart = point
  }

  clearPointerStart() {
    this.pointerStart = null
  }

  getPointerStart(): Point | null {
    return this.pointerStart
  }

  setDragOffset(point: Point, resolvedActiveSnapPointOffset: number) {
    if (!this.pointerStart) return

    const currentTimestamp = new Date().getTime()

    if (this.lastPoint) {
      const dy = point.y - this.lastPoint.y

      if (this.lastTimestamp) {
        const dt = currentTimestamp - this.lastTimestamp
        if (dt > 0) {
          const calculatedVelocity = (dy / dt) * 1000
          // Handle edge cases: NaN or Infinity should be treated as 0
          this.velocity = Number.isFinite(calculatedVelocity) ? calculatedVelocity : 0
        }
      }
    }

    this.lastPoint = point
    this.lastTimestamp = currentTimestamp

    let delta = this.pointerStart.y - point.y - resolvedActiveSnapPointOffset
    if (delta > 0) delta = 0

    this.dragOffset = -delta
  }

  getDragOffset(): number | null {
    return this.dragOffset
  }

  clearDragOffset() {
    this.dragOffset = null
  }

  getVelocity(): number | null {
    return this.velocity
  }

  clearVelocityTracking() {
    this.lastPoint = null
    this.lastTimestamp = null
    this.velocity = null
  }

  clear() {
    this.clearPointerStart()
    this.clearDragOffset()
    this.clearVelocityTracking()
  }

  shouldStartDragging(
    point: Point,
    target: HTMLElement,
    container: HTMLElement | null,
    preventDragOnScroll: boolean,
  ): boolean {
    if (!this.pointerStart || !container) return false

    if (preventDragOnScroll) {
      const delta = this.pointerStart.y - point.y

      if (Math.abs(delta) < DRAG_START_THRESHOLD) return false

      const { availableScroll, availableScrollTop } = getScrollInfo(target, container)

      if ((delta > 0 && Math.abs(availableScroll) > 1) || (delta < 0 && Math.abs(availableScrollTop) > 0)) {
        return false
      }
    }

    return true
  }

  findClosestSnapPoint(snapPoints: ResolvedSnapPoint[]): number | string {
    if (this.dragOffset === null) {
      return snapPoints[0]?.value ?? 1
    }

    const closest = findClosestSnapPoint(this.dragOffset, snapPoints)
    return closest.value
  }

  shouldDismiss(
    contentHeight: number | null,
    snapPoints: ResolvedSnapPoint[],
    swipeVelocityThreshold: number,
    closeThreshold: number,
  ): boolean {
    if (this.dragOffset === null || this.velocity === null || contentHeight === null) return false

    const visibleHeight = contentHeight - this.dragOffset
    const smallestSnapPoint = snapPoints.reduce((acc, curr) => (curr.offset > acc.offset ? curr : acc))

    const isFastSwipe = this.velocity > 0 && this.velocity >= swipeVelocityThreshold

    const closeThresholdInPixels = contentHeight * (1 - closeThreshold)
    const isBelowSmallestSnapPoint = visibleHeight < contentHeight - smallestSnapPoint.offset
    const isBelowCloseThreshold = visibleHeight < closeThresholdInPixels

    const hasEnoughDragToDismiss = (isBelowCloseThreshold && isBelowSmallestSnapPoint) || visibleHeight === 0

    return isFastSwipe || hasEnoughDragToDismiss
  }
}
