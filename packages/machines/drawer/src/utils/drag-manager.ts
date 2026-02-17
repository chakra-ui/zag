import type { Point } from "@zag-js/types"
import type { ResolvedSnapPoint, SwipeDirection } from "../drawer.types"
import { findClosestSnapPoint } from "./find-closest-snap-point"
import { getScrollInfo } from "./get-scroll-info"

const DRAG_START_THRESHOLD = 0.3
const SEQUENTIAL_THRESHOLD = 14
const SNAP_VELOCITY_THRESHOLD = 500 // px/s
const SNAP_VELOCITY_MULTIPLIER = 0.3 // seconds
const MAX_SNAP_VELOCITY = 4000 // px/s

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

  private getAxisValue(point: Point, direction: SwipeDirection): number {
    return direction === "left" || direction === "right" ? point.x : point.y
  }

  private getDirectionSign(direction: SwipeDirection): number {
    return direction === "up" || direction === "left" ? -1 : 1
  }

  setDragOffsetForDirection(point: Point, resolvedActiveSnapPointOffset: number, direction: SwipeDirection) {
    if (!this.pointerStart) return

    const currentTimestamp = new Date().getTime()
    const sign = this.getDirectionSign(direction)
    const axisValue = this.getAxisValue(point, direction)

    if (this.lastPoint) {
      const lastAxisValue = this.getAxisValue(this.lastPoint, direction)
      const delta = (axisValue - lastAxisValue) * sign

      if (this.lastTimestamp) {
        const dt = currentTimestamp - this.lastTimestamp
        if (dt > 0) {
          const calculatedVelocity = (delta / dt) * 1000
          // Handle edge cases: NaN or Infinity should be treated as 0
          this.velocity = Number.isFinite(calculatedVelocity) ? calculatedVelocity : 0
        }
      }
    }

    this.lastPoint = point
    this.lastTimestamp = currentTimestamp

    const pointerStartAxis = this.getAxisValue(this.pointerStart, direction)
    let delta = (pointerStartAxis - axisValue) * sign - resolvedActiveSnapPointOffset

    // Rubber-band: sqrt damping when dragging past fully-open
    if (delta > 0) {
      delta = Math.sqrt(delta)
    }

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
    direction: SwipeDirection,
  ): boolean {
    if (!this.pointerStart || !container) return false

    if (preventDragOnScroll) {
      const sign = this.getDirectionSign(direction)
      const axis = this.getAxisValue(point, direction)
      const startAxis = this.getAxisValue(this.pointerStart, direction)
      const delta = (startAxis - axis) * sign

      if (Math.abs(delta) < DRAG_START_THRESHOLD) return false

      const { availableForwardScroll, availableBackwardScroll } = getScrollInfo(target, container, direction)

      if ((delta > 0 && Math.abs(availableForwardScroll) > 1) || (delta < 0 && Math.abs(availableBackwardScroll) > 0)) {
        return false
      }
    }

    return true
  }

  findClosestSnapPoint(
    snapPoints: ResolvedSnapPoint[],
    snapPoint: ResolvedSnapPoint | null,
    snapToSequentialPoints: boolean,
  ): number | string {
    if (this.dragOffset === null) {
      return snapPoints[0]?.value ?? 1
    }

    if (snapToSequentialPoints && snapPoint) {
      const currentIndex = snapPoints.findIndex((item) => Object.is(item.value, snapPoint.value))
      if (currentIndex >= 0) {
        const delta = this.dragOffset - snapPoint.offset
        const dragDirection = Math.sign(delta)
        const velocityDirection = this.velocity !== null ? Math.sign(this.velocity) : 0

        // Velocity-based skip: fast swipe in drag direction jumps to adjacent point
        const shouldAdvance =
          dragDirection !== 0 &&
          velocityDirection === dragDirection &&
          Math.abs(this.velocity ?? 0) >= SNAP_VELOCITY_THRESHOLD

        if (shouldAdvance) {
          const nextIndex = Math.min(Math.max(currentIndex + dragDirection, 0), snapPoints.length - 1)
          if (nextIndex !== currentIndex) {
            return snapPoints[nextIndex].value
          }
        }

        if (delta > SEQUENTIAL_THRESHOLD) {
          return snapPoints[Math.min(currentIndex + 1, snapPoints.length - 1)]?.value ?? snapPoint.value
        }
        if (delta < -SEQUENTIAL_THRESHOLD) {
          return snapPoints[Math.max(currentIndex - 1, 0)]?.value ?? snapPoint.value
        }
        return snapPoint.value
      }
    }

    // Non-sequential: apply velocity offset for momentum-based skipping
    let targetOffset = this.dragOffset
    if (this.velocity !== null && Math.abs(this.velocity) >= SNAP_VELOCITY_THRESHOLD) {
      const clamped = Math.min(MAX_SNAP_VELOCITY, Math.max(-MAX_SNAP_VELOCITY, this.velocity))
      targetOffset += clamped * SNAP_VELOCITY_MULTIPLIER
      targetOffset = Math.max(0, targetOffset)
    }

    const closest = findClosestSnapPoint(targetOffset, snapPoints)
    return closest.value
  }

  computeSwipeStrength(targetOffset: number): number {
    const MAX_DURATION_MS = 360
    const MIN_SCALAR = 0.1
    const MAX_SCALAR = 1

    if (this.dragOffset === null || this.velocity === null) return MAX_SCALAR

    const distance = Math.abs(this.dragOffset - targetOffset)
    const absVelocity = Math.abs(this.velocity)

    if (absVelocity <= 0 || distance <= 0) return MAX_SCALAR

    const estimatedTimeMs = (distance / absVelocity) * 1000
    const normalized = Math.min(1, Math.max(0, estimatedTimeMs / MAX_DURATION_MS))
    return MIN_SCALAR + normalized * (MAX_SCALAR - MIN_SCALAR)
  }

  shouldDismiss(
    contentSize: number | null,
    snapPoints: ResolvedSnapPoint[],
    swipeVelocityThreshold: number,
    closeThreshold: number,
  ): boolean {
    if (this.dragOffset === null || this.velocity === null || contentSize === null) return false

    const visibleSize = contentSize - this.dragOffset
    const smallestSnapPoint = snapPoints.reduce((acc, curr) => (curr.offset > acc.offset ? curr : acc))

    const isFastSwipe = this.velocity > 0 && this.velocity >= swipeVelocityThreshold

    const closeThresholdInPixels = contentSize * (1 - closeThreshold)
    const smallestSnapPointVisibleSize = contentSize - smallestSnapPoint.offset
    const isBelowSmallestSnapPoint = visibleSize < smallestSnapPointVisibleSize
    const isBelowCloseThreshold = visibleSize < closeThresholdInPixels

    // With multiple snap points, prefer snapping during regular drags,
    // but still allow a fast swipe down to dismiss from below the lowest snap point.
    if (snapPoints.length > 1) {
      return visibleSize <= 0 || (isFastSwipe && isBelowSmallestSnapPoint)
    }

    const hasEnoughDragToDismiss = (isBelowCloseThreshold && isBelowSmallestSnapPoint) || visibleSize === 0

    return (isFastSwipe && isBelowSmallestSnapPoint) || hasEnoughDragToDismiss
  }
}
