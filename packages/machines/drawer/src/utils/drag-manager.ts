import type { Point } from "@zag-js/types"
import type { ResolvedSnapPoint } from "../drawer.types"
import { getScrollInfo } from "./get-scroll-info"
import { adjustReleaseVelocityAgainstDisplacement, adjustReleaseVelocityForOpenSwipe } from "./release-velocity"
import { findClosestSnapPoint } from "./snap-point"
import type { PhysicalSwipeDirection } from "./swipe"
import { isVerticalSwipeDirection } from "./swipe"

const DRAG_START_THRESHOLD = 0.3
/** Treat slightly diagonal moves as cross-axis–biased so nested horizontal scroll wins more often. */
const CROSS_AXIS_BIAS = 0.58
const SCROLL_SLACK_GATE = 0.5
const SEQUENTIAL_THRESHOLD = 24
const SNAP_VELOCITY_THRESHOLD = 400 // px/s
const SNAP_VELOCITY_MULTIPLIER = 0.4 // seconds
const MAX_SNAP_VELOCITY = 4000 // px/s

const VELOCITY_WINDOW_MS = 100
const MAX_RELEASE_VELOCITY_AGE_MS = 80
const MIN_GESTURE_DURATION_MS = 50
const MIN_VELOCITY_SAMPLES = 2

const SWIPE_STRENGTH_MAX_DURATION_MS = 360
const SWIPE_STRENGTH_MIN_SCALAR = 0.1
const SWIPE_STRENGTH_MAX_SCALAR = 1

interface VelocitySample {
  axis: number
  time: number
}

export class DragManager {
  private pointerStart: Point | null = null
  private dragOffset: number | null = null
  private velocity: number | null = null

  // Sliding window for velocity calculation
  private samples: VelocitySample[] = []

  // Gesture-level tracking for fallback velocity
  private gestureStartAxis: number | null = null
  private gestureStartTime: number | null = null
  private gestureSign: number = 1

  setPointerStart(point: Point) {
    this.pointerStart = point
  }

  clearPointerStart() {
    this.pointerStart = null
  }

  getPointerStart(): Point | null {
    return this.pointerStart
  }

  private getAxisValue(point: Point, direction: PhysicalSwipeDirection): number {
    return direction === "left" || direction === "right" ? point.x : point.y
  }

  private getDirectionSign(direction: PhysicalSwipeDirection): number {
    return direction === "up" || direction === "left" ? -1 : 1
  }

  private trackVelocity(axisValue: number, sign: number) {
    const now = performance.now()

    // Track gesture start for fallback velocity
    if (this.gestureStartAxis === null) {
      this.gestureStartAxis = axisValue
      this.gestureStartTime = now
      this.gestureSign = sign
    }

    this.samples.push({ axis: axisValue, time: now })

    // Prune samples older than the window
    const cutoff = now - VELOCITY_WINDOW_MS
    while (this.samples.length > 0 && this.samples[0].time < cutoff) {
      this.samples.shift()
    }

    if (this.samples.length < MIN_VELOCITY_SAMPLES) {
      this.velocity = 0
      return
    }

    // Compute velocity from oldest to newest sample in the window
    const oldest = this.samples[0]
    const newest = this.samples[this.samples.length - 1]
    const dt = newest.time - oldest.time

    if (dt <= 0) {
      this.velocity = 0
      return
    }

    const delta = (newest.axis - oldest.axis) * sign
    const v = (delta / dt) * 1000 // px/s
    this.velocity = Number.isFinite(v) ? v : 0
  }

  /**
   * Get the best available velocity for release decisions.
   * Prefers the sliding window velocity if the last sample is fresh.
   * Falls back to the overall gesture velocity if samples are stale
   * (e.g., user paused briefly before releasing).
   */
  getReleaseVelocity(): number {
    const now = performance.now()

    // Check if the sliding window velocity is fresh
    if (this.samples.length >= MIN_VELOCITY_SAMPLES) {
      const newest = this.samples[this.samples.length - 1]
      if (now - newest.time <= MAX_RELEASE_VELOCITY_AGE_MS) {
        return this.velocity ?? 0
      }
    }

    // Fallback: overall gesture velocity
    if (this.gestureStartAxis !== null && this.gestureStartTime !== null) {
      const lastSample = this.samples[this.samples.length - 1]
      if (lastSample) {
        const dt = Math.max(lastSample.time - this.gestureStartTime, MIN_GESTURE_DURATION_MS)
        const delta = (lastSample.axis - this.gestureStartAxis) * this.gestureSign
        const v = (delta / dt) * 1000
        return Number.isFinite(v) ? v : 0
      }
    }

    return this.velocity ?? 0
  }

  setDragOffsetForDirection(point: Point, resolvedActiveSnapPointOffset: number, direction: PhysicalSwipeDirection) {
    if (!this.pointerStart) return

    const sign = this.getDirectionSign(direction)
    const axisValue = this.getAxisValue(point, direction)

    this.trackVelocity(axisValue, sign)

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

  clearVelocityTracking() {
    this.samples = []
    this.velocity = null
    this.gestureStartAxis = null
    this.gestureStartTime = null
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
    direction: PhysicalSwipeDirection,
  ): boolean {
    if (!this.pointerStart || !container) return false

    if (preventDragOnScroll) {
      const sign = this.getDirectionSign(direction)
      const axis = this.getAxisValue(point, direction)
      const startAxis = this.getAxisValue(this.pointerStart, direction)
      const delta = (startAxis - axis) * sign

      if (Math.abs(delta) < DRAG_START_THRESHOLD) return false

      // If movement leans cross-axis, preserve native scrolling on that axis
      const isVertical = isVerticalSwipeDirection(direction)
      const crossDelta = isVertical ? Math.abs(point.x - this.pointerStart.x) : Math.abs(point.y - this.pointerStart.y)

      if (crossDelta > Math.abs(delta) * CROSS_AXIS_BIAS) {
        const crossDirection: PhysicalSwipeDirection = isVertical ? "right" : "down"
        const crossScroll = getScrollInfo(target, container, crossDirection)
        if (
          crossScroll.availableForwardScroll > SCROLL_SLACK_GATE ||
          crossScroll.availableBackwardScroll > SCROLL_SLACK_GATE
        ) {
          return false
        }
      }

      const { availableForwardScroll, availableBackwardScroll } = getScrollInfo(target, container, direction)

      if (
        (delta > 0 && availableForwardScroll > SCROLL_SLACK_GATE) ||
        (delta < 0 && availableBackwardScroll > SCROLL_SLACK_GATE)
      ) {
        return false
      }
    }

    return true
  }

  findClosestSnapPoint(
    snapPoints: ResolvedSnapPoint[],
    snapPoint: ResolvedSnapPoint | null,
    snapToSequentialPoints: boolean,
    contentSize: number,
  ): number | string | null {
    if (this.dragOffset === null) {
      return snapPoints[0]?.value ?? 1
    }

    if (snapToSequentialPoints && snapPoint) {
      // Sort by offset so index navigation matches drag direction
      // (offset 0 = fully open at index 0, highest offset = most closed at end)
      const ordered = [...snapPoints].sort((a, b) => a.offset - b.offset)

      // Find current index by closest offset (not value) since deduplication
      // may have replaced the original snap point value
      let currentIndex = 0
      let closestDist = Math.abs(snapPoint.offset - ordered[0].offset)
      for (let i = 1; i < ordered.length; i++) {
        const dist = Math.abs(snapPoint.offset - ordered[i].offset)
        if (dist < closestDist) {
          closestDist = dist
          currentIndex = i
        }
      }

      {
        const currentPoint = ordered[currentIndex]
        const delta = this.dragOffset - currentPoint.offset
        const dragDirection = Math.sign(delta)
        const velocityAdjusted = adjustReleaseVelocityAgainstDisplacement(this.getReleaseVelocity(), delta)
        const velocityDirection = Math.sign(velocityAdjusted)

        let targetSnapPoint = currentPoint
        let effectiveTargetOffset = this.dragOffset

        // Velocity-based advancement to adjacent snap point
        const shouldAdvance =
          dragDirection !== 0 &&
          velocityDirection === dragDirection &&
          Math.abs(velocityAdjusted) >= SNAP_VELOCITY_THRESHOLD

        if (shouldAdvance) {
          const adjacentIndex = Math.min(Math.max(currentIndex + dragDirection, 0), ordered.length - 1)
          if (adjacentIndex !== currentIndex) {
            const adjacentPoint = ordered[adjacentIndex]
            // Always step to the adjacent snap when velocity commits to that direction.
            // The old "only if not yet passed" check stranded flicks that overshot the
            // intermediate offset (common on touch), snapping back to the previous stop.
            targetSnapPoint = adjacentPoint
            effectiveTargetOffset = adjacentPoint.offset
          } else if (dragDirection > 0) {
            // Past the last snap point with velocity → dismiss
            return null
          }
        } else if (delta > SEQUENTIAL_THRESHOLD) {
          const nextPoint = ordered[Math.min(currentIndex + 1, ordered.length - 1)]
          if (nextPoint) {
            targetSnapPoint = nextPoint
            effectiveTargetOffset = nextPoint.offset
          }
        } else if (delta < -SEQUENTIAL_THRESHOLD) {
          const prevPoint = ordered[Math.max(currentIndex - 1, 0)]
          if (prevPoint) {
            targetSnapPoint = prevPoint
            effectiveTargetOffset = prevPoint.offset
          }
        }

        // Compare close distance vs snap distance
        const closeDistance = Math.abs(effectiveTargetOffset - contentSize)
        const snapDistance = Math.abs(effectiveTargetOffset - targetSnapPoint.offset)
        if (closeDistance < snapDistance) {
          return null // dismiss
        }

        return targetSnapPoint.value
      }
    }

    // Non-sequential: apply velocity offset for momentum-based skipping
    const snapRestOffset = snapPoint?.offset ?? 0
    const velocity = adjustReleaseVelocityAgainstDisplacement(
      this.getReleaseVelocity(),
      this.dragOffset - snapRestOffset,
    )
    let targetOffset = this.dragOffset
    if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
      const clamped = Math.min(MAX_SNAP_VELOCITY, Math.max(-MAX_SNAP_VELOCITY, velocity))
      targetOffset += clamped * SNAP_VELOCITY_MULTIPLIER
      targetOffset = Math.max(0, targetOffset)
    }

    const closest = findClosestSnapPoint(targetOffset, snapPoints)
    return closest.value
  }

  setSwipeOpenOffset(point: Point, contentSize: number, direction: PhysicalSwipeDirection) {
    if (!this.pointerStart) return

    const sign = this.getDirectionSign(direction)
    const axisValue = this.getAxisValue(point, direction)

    this.trackVelocity(axisValue, sign)

    // Opening displacement: how far user has swiped in the opening direction
    const pointerStartAxis = this.getAxisValue(this.pointerStart, direction)
    const openDisplacement = (pointerStartAxis - axisValue) * sign

    let dragOffset = contentSize - Math.max(0, openDisplacement)

    // Rubber-band: sqrt damping when dragged past fully open
    if (dragOffset < 0) {
      dragOffset = -Math.sqrt(Math.abs(dragOffset))
    }

    this.dragOffset = dragOffset
  }

  shouldOpen(contentSize: number | null, swipeVelocityThreshold: number, openThreshold: number): boolean {
    if (this.dragOffset === null || contentSize === null) return false

    const visibleSize = contentSize - this.dragOffset
    const visibleRatio = visibleSize / contentSize
    const velocity = adjustReleaseVelocityForOpenSwipe(this.getReleaseVelocity(), visibleRatio, swipeVelocityThreshold)

    // Fast swipe in opening direction (negative velocity = opening)
    const isFastSwipe = velocity < 0 && Math.abs(velocity) >= swipeVelocityThreshold

    // Dragged past threshold
    const hasEnoughDisplacement = visibleSize >= contentSize * openThreshold

    return isFastSwipe || hasEnoughDisplacement
  }

  computeSwipeStrength(targetOffset: number, resolvedSnapOffset: number | null = null): number {
    if (this.dragOffset === null) return SWIPE_STRENGTH_MAX_SCALAR

    let velocity = this.getReleaseVelocity()
    if (resolvedSnapOffset != null) {
      velocity = adjustReleaseVelocityAgainstDisplacement(velocity, this.dragOffset - resolvedSnapOffset)
    }
    const distance = Math.abs(this.dragOffset - targetOffset)
    const absVelocity = Math.abs(velocity)

    if (absVelocity <= 0 || distance <= 0) return SWIPE_STRENGTH_MAX_SCALAR

    const estimatedTimeMs = (distance / absVelocity) * 1000
    const normalized = Math.min(1, Math.max(0, estimatedTimeMs / SWIPE_STRENGTH_MAX_DURATION_MS))
    return SWIPE_STRENGTH_MIN_SCALAR + normalized * (SWIPE_STRENGTH_MAX_SCALAR - SWIPE_STRENGTH_MIN_SCALAR)
  }

  shouldDismiss(contentSize: number | null, snapPoints: ResolvedSnapPoint[], resolvedSnapOffset: number): boolean {
    if (this.dragOffset === null || contentSize === null) return false

    const velocity = adjustReleaseVelocityAgainstDisplacement(
      this.getReleaseVelocity(),
      this.dragOffset - resolvedSnapOffset,
    )
    const visibleSize = contentSize - this.dragOffset

    if (visibleSize <= 0) return true

    // Apply velocity to target offset (same as findClosestSnapPoint)
    let targetOffset = this.dragOffset
    if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
      const clamped = Math.min(MAX_SNAP_VELOCITY, Math.max(-MAX_SNAP_VELOCITY, velocity))
      targetOffset += clamped * SNAP_VELOCITY_MULTIPLIER
      targetOffset = Math.max(0, targetOffset)
    }

    // Compare: is the velocity-adjusted target closer to "fully closed"
    // than to any snap point? If so, dismiss.
    const closeDistance = Math.abs(targetOffset - contentSize)
    const closest = findClosestSnapPoint(targetOffset, snapPoints)
    const snapDistance = Math.abs(targetOffset - closest.offset)

    return closeDistance < snapDistance
  }
}
