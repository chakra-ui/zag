import {
  contains,
  getComputedStyle,
  getEventPoint,
  getEventTarget,
  isEditableElement,
  isHTMLElement,
  isInputElement,
  isLeftClick,
} from "@zag-js/dom-query"
import type { JSX, Point } from "@zag-js/types"
import { clampValue } from "@zag-js/utils"
import type { ResolvedSnapPoint, SwipeDirection } from "../drawer.types"
import { findClosestSnapPoint } from "./snap-point"
import { SwipeSession, isNegativeSwipeDirection, isVerticalSwipeDirection } from "./session"
import type { PhysicalSwipeDirection } from "./session"

// Ignore release velocity that contradicts a sufficiently clear drag displacement.
const RELEASE_DISPLACEMENT_TRUST_PX = 24

// Hidden drawers need a bit more visible progress before a weak opposite flick can reopen them.
const OPEN_SWIPE_HIDDEN_VISIBLE_RATIO = 0.22
// Require a stronger opposing flick when the drawer is still mostly hidden.
const OPEN_SWIPE_HIDDEN_VELOCITY_MULTIPLIER = 1.25
// Once half revealed, weak closing flicks should not overpower the visible open state.
const OPEN_SWIPE_REVEALED_VISIBLE_RATIO = 0.5
// Cap the opposing velocity we still treat as "not intentional" for a mostly open drawer.
const OPEN_SWIPE_REVEALED_OPPOSING_MAX_ABS_VELOCITY = 650

// Minimum main-axis movement before drag-vs-scroll arbitration should begin.
const DRAG_START_THRESHOLD = 0.3
// Cross-axis movement must stay below this ratio before the drag is considered dominant.
const CROSS_AXIS_BIAS = 0.58
// Small scroll remainders are treated as effectively exhausted.
const SCROLL_SLACK_GATE = 0.5
// General epsilon for scroll edge checks.
const SCROLL_SLACK_EPSILON = 1

// Distance needed to advance to an adjacent snap point without a strong velocity signal.
const SEQUENTIAL_THRESHOLD = 24
// Minimum release velocity that should influence snap-point projection.
const SNAP_VELOCITY_THRESHOLD = 400
// How much release velocity contributes to projected snap settling.
const SNAP_VELOCITY_MULTIPLIER = 0.4
// Clamp projected release velocity so snap math stays stable.
const MAX_SNAP_VELOCITY = 4000

// Normalize swipe strength against an animation duration ceiling.
const SWIPE_STRENGTH_MAX_DURATION_MS = 360
// Lower bound for swipe-strength driven animation timing.
const SWIPE_STRENGTH_MIN_SCALAR = 0.1
// Upper bound for swipe-strength driven animation timing.
const SWIPE_STRENGTH_MAX_SCALAR = 1

// Minimum opening displacement before a closed swipe area counts as intentional.
const SWIPE_AREA_OPEN_INTENT_MIN_PX = 5

// Attribute for opting specific targets out of drawer drag initiation.
const NO_DRAG_DATA_ATTR = "data-no-drag"
// Selector form of the no-drag attribute for composed-path/closest checks.
const NO_DRAG_SELECTOR = `[${NO_DRAG_DATA_ATTR}]`

interface ContentPointerDownOptions {
  event: JSX.PointerEvent<HTMLElement>
  getDoc: () => Document
  getContentEl: () => HTMLElement | null
  getWin: () => Window
  swipeDirection: PhysicalSwipeDirection
  canCommit: () => boolean
  onCommit: (point: Point) => void
}

interface GrabberPointerDownOptions {
  event: JSX.PointerEvent<HTMLElement>
  point: Point
  canCommit: () => boolean
  onCommit: (point: Point) => void
}

export class DrawerSwipeSession {
  readonly session = new SwipeSession()
  private dragOffset: number | null = null
  private readonly preventDragOnScroll: () => boolean

  constructor(options: DrawerSwipeSessionOptions) {
    this.preventDragOnScroll = options.preventDragOnScroll
  }

  contentPointerDown(options: ContentPointerDownOptions) {
    const { event, getDoc, getContentEl, getWin, swipeDirection, canCommit, onCommit } = options
    if (shouldIgnorePointerDownForDrag(event)) return
    if (isTextSelectionInDrawer(getDoc(), getContentEl())) return
    if (!canCommit()) return

    const point = getEventPoint(event)
    const shouldDefer = event.pointerType === "mouse" || event.pointerType === "pen"
    if (!shouldDefer) {
      onCommit(point)
      return
    }

    this.session.startDeferredSwipe({
      getWin,
      pointerId: event.pointerId,
      startPoint: point,
      swipeDirection,
      onCommit,
      canCommit,
    })
  }

  grabberPointerDown(options: GrabberPointerDownOptions) {
    const { event, point, canCommit, onCommit } = options
    if (shouldIgnorePointerDownForDrag(event)) return
    this.session.cancelDeferredSwipe()
    if (!canCommit()) return
    onCommit(point)
  }

  private adjustReleaseVelocityAgainstDisplacement(velocity: number, displacementFromSnap: number): number {
    const displacementSign = Math.sign(displacementFromSnap)
    const velocitySign = Math.sign(velocity)

    if (
      displacementSign !== 0 &&
      Math.abs(displacementFromSnap) >= RELEASE_DISPLACEMENT_TRUST_PX &&
      velocitySign !== 0 &&
      velocitySign !== displacementSign
    ) {
      return 0
    }

    return velocity
  }

  private adjustReleaseVelocityForOpenSwipe(
    velocity: number,
    visibleRatio: number,
    swipeVelocityThreshold: number,
  ): number {
    if (
      visibleRatio < OPEN_SWIPE_HIDDEN_VISIBLE_RATIO &&
      velocity < 0 &&
      Math.abs(velocity) < swipeVelocityThreshold * OPEN_SWIPE_HIDDEN_VELOCITY_MULTIPLIER
    ) {
      return 0
    }

    if (
      visibleRatio > OPEN_SWIPE_REVEALED_VISIBLE_RATIO &&
      velocity > 0 &&
      Math.abs(velocity) < OPEN_SWIPE_REVEALED_OPPOSING_MAX_ABS_VELOCITY
    ) {
      return 0
    }

    return velocity
  }

  beginSwipe(point: Point) {
    this.session.setStartPoint(point)
  }

  clearSwipeStart() {
    this.session.clearStartPoint()
  }

  getSwipeStart(): Point | null {
    return this.session.getStartPoint()
  }

  getDragOffset(): number | null {
    return this.dragOffset
  }

  resetDragOffset() {
    this.dragOffset = null
  }

  resetVelocity() {
    this.session.clearVelocityTracking()
  }

  reset() {
    this.dragOffset = null
    this.session.clear()
  }

  setDragOffset(point: Point, resolvedActiveSnapPointOffset: number, direction: PhysicalSwipeDirection) {
    if (!this.session.getStartPoint()) {
      this.dragOffset = null
      return
    }

    const axis = this.session.getGestureAxis(direction)
    const sign = this.session.getGestureSign(direction)
    let delta = this.session.getMainAxisDisplacement(point, axis, sign) - resolvedActiveSnapPointOffset

    if (delta > 0) {
      delta = Math.sqrt(delta)
    }

    this.dragOffset = -delta
  }

  setSwipeOpenOffset(point: Point, contentSize: number, direction: PhysicalSwipeDirection) {
    if (!this.session.getStartPoint()) {
      this.dragOffset = null
      return
    }

    const axis = this.session.getGestureAxis(direction)
    const sign = this.session.getGestureSign(direction)
    const openDisplacement = this.session.getMainAxisDisplacement(point, axis, sign)

    let dragOffset = contentSize - Math.max(0, openDisplacement)
    if (dragOffset < 0) {
      dragOffset = -Math.sqrt(Math.abs(dragOffset))
    }

    this.dragOffset = dragOffset
  }

  canStartDrag(
    point: Point,
    target: EventTarget | null,
    container: HTMLElement | null,
    preventDragOnScroll: boolean,
    direction: PhysicalSwipeDirection,
  ): boolean {
    if (!isHTMLElement(target)) return false
    if (isDragExemptElement(target)) return false
    if (!this.session.getStartPoint() || !container) return false
    if (!preventDragOnScroll) return true

    const axis = this.session.getGestureAxis(direction)
    const sign = this.session.getGestureSign(direction)
    const delta = this.session.getMainAxisDisplacement(point, axis, sign)

    if (Math.abs(delta) < DRAG_START_THRESHOLD) return false

    const crossDelta = Math.abs(this.session.getCrossAxisDisplacement(point, axis))
    if (crossDelta > Math.abs(delta) * CROSS_AXIS_BIAS) {
      const crossDirection: PhysicalSwipeDirection = isVerticalSwipeDirection(direction) ? "right" : "down"
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

    return true
  }

  resolveSnapPointOnRelease(
    snapPoints: ResolvedSnapPoint[],
    snapPoint: ResolvedSnapPoint | null,
    snapToSequentialPoints: boolean,
    contentSize: number,
  ): number | string | null {
    const dragOffset = this.dragOffset
    if (dragOffset === null) return snapPoints[0]?.value ?? 1

    const releaseVelocity = this.session.getReleaseVelocity()

    if (snapToSequentialPoints && snapPoint) {
      const ordered = [...snapPoints].sort((a, b) => a.offset - b.offset)

      let currentIndex = 0
      let closestDist = Math.abs(snapPoint.offset - ordered[0].offset)
      for (let i = 1; i < ordered.length; i++) {
        const dist = Math.abs(snapPoint.offset - ordered[i].offset)
        if (dist < closestDist) {
          closestDist = dist
          currentIndex = i
        }
      }

      const currentPoint = ordered[currentIndex]
      const delta = dragOffset - currentPoint.offset
      const dragDirection = Math.sign(delta)
      const velocityAdjusted = this.adjustReleaseVelocityAgainstDisplacement(releaseVelocity, delta)
      const velocityDirection = Math.sign(velocityAdjusted)

      let targetSnapPoint = currentPoint
      let effectiveTargetOffset = dragOffset

      const shouldAdvance =
        dragDirection !== 0 &&
        velocityDirection === dragDirection &&
        Math.abs(velocityAdjusted) >= SNAP_VELOCITY_THRESHOLD

      if (shouldAdvance) {
        const adjacentIndex = Math.min(Math.max(currentIndex + dragDirection, 0), ordered.length - 1)
        if (adjacentIndex !== currentIndex) {
          targetSnapPoint = ordered[adjacentIndex]
          effectiveTargetOffset = targetSnapPoint.offset
        } else if (dragDirection > 0) {
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

      const closeDistance = Math.abs(effectiveTargetOffset - contentSize)
      const snapDistance = Math.abs(effectiveTargetOffset - targetSnapPoint.offset)
      if (closeDistance < snapDistance) return null

      return targetSnapPoint.value
    }

    const snapRestOffset = snapPoint?.offset ?? 0
    const velocity = this.adjustReleaseVelocityAgainstDisplacement(releaseVelocity, dragOffset - snapRestOffset)
    let targetOffset = dragOffset
    if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
      const clamped = clampValue(velocity, -MAX_SNAP_VELOCITY, MAX_SNAP_VELOCITY)
      targetOffset += clamped * SNAP_VELOCITY_MULTIPLIER
      targetOffset = Math.max(0, targetOffset)
    }

    return findClosestSnapPoint(targetOffset, snapPoints).value
  }

  shouldOpenOnRelease(contentSize: number | null, swipeVelocityThreshold: number, openThreshold: number): boolean {
    const dragOffset = this.dragOffset
    if (dragOffset === null || contentSize === null) return false

    const visibleSize = contentSize - dragOffset
    const visibleRatio = visibleSize / contentSize
    const velocity = this.adjustReleaseVelocityForOpenSwipe(
      this.session.getReleaseVelocity(),
      visibleRatio,
      swipeVelocityThreshold,
    )

    return (velocity < 0 && Math.abs(velocity) >= swipeVelocityThreshold) || visibleSize >= contentSize * openThreshold
  }

  shouldDismissOnRelease(
    contentSize: number | null,
    snapPoints: ResolvedSnapPoint[],
    resolvedSnapOffset: number,
  ): boolean {
    const dragOffset = this.dragOffset
    if (dragOffset === null || contentSize === null) return false

    const velocity = this.adjustReleaseVelocityAgainstDisplacement(
      this.session.getReleaseVelocity(),
      dragOffset - resolvedSnapOffset,
    )
    const visibleSize = contentSize - dragOffset

    if (visibleSize <= 0) return true

    let targetOffset = dragOffset
    if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
      const clamped = clampValue(velocity, -MAX_SNAP_VELOCITY, MAX_SNAP_VELOCITY)
      targetOffset += clamped * SNAP_VELOCITY_MULTIPLIER
      targetOffset = Math.max(0, targetOffset)
    }

    const closeDistance = Math.abs(targetOffset - contentSize)
    const closest = findClosestSnapPoint(targetOffset, snapPoints)
    const snapDistance = Math.abs(targetOffset - closest.offset)

    return closeDistance < snapDistance
  }

  getSwipeStrength(targetOffset: number, resolvedSnapOffset: number | null = null): number {
    const dragOffset = this.dragOffset
    if (dragOffset === null) return SWIPE_STRENGTH_MAX_SCALAR

    let velocity = this.session.getReleaseVelocity()
    if (resolvedSnapOffset != null) {
      velocity = this.adjustReleaseVelocityAgainstDisplacement(velocity, dragOffset - resolvedSnapOffset)
    }

    const distance = Math.abs(dragOffset - targetOffset)
    const absVelocity = Math.abs(velocity)
    if (absVelocity <= 0 || distance <= 0) return SWIPE_STRENGTH_MAX_SCALAR

    const estimatedTimeMs = (distance / absVelocity) * 1000
    const normalized = clampValue(estimatedTimeMs / SWIPE_STRENGTH_MAX_DURATION_MS, 0, 1)
    return SWIPE_STRENGTH_MIN_SCALAR + normalized * (SWIPE_STRENGTH_MAX_SCALAR - SWIPE_STRENGTH_MIN_SCALAR)
  }

  bindDragTracking(options: DragTrackingOptions) {
    const { getDoc, getContentEl, getSwipeAreaEl, swipeDirection, onMove, onEnd, onCancel } = options
    const preventDragOnScroll = this.preventDragOnScroll
    const isVertical = isVerticalSwipeDirection(swipeDirection)
    let lastAxis = 0
    return this.session.bind({
      getDoc,
      getSelectionTarget: getContentEl,
      swipeDirection,
      onMove,
      onEnd,
      onCancel,
      cancelOnInterrupt: ({ reason, target }) => {
        if (reason !== "lost-pointer-capture") return true
        return isWithinDrawerInteractionSurface(target, getContentEl(), getSwipeAreaEl())
      },
      onStart({ pointerType, point }) {
        if (pointerType !== "touch") return
        lastAxis = isVertical ? point.y : point.x
      },
      preventDefault({ event, pointerType, point, target }) {
        if (pointerType !== "touch") return false
        const contentEl = getContentEl()
        const resolvedTarget = (target as HTMLElement | null) ?? (event.target as HTMLElement | null)

        if (!preventDragOnScroll()) return false
        if (!contentEl || !resolvedTarget || isDragExemptElement(resolvedTarget)) return false

        const scrollParent = findClosestScrollableAncestorOnSwipeAxis(resolvedTarget, contentEl, swipeDirection)
        if (scrollParent) {
          const currentAxis = isVertical ? point.y : point.x
          const shouldPrevent = shouldPreventTouchScroll({
            scrollParent,
            swipeDirection,
            lastMainAxis: lastAxis,
            currentMainAxis: currentAxis,
          })
          lastAxis = currentAxis
          return shouldPrevent
        }

        lastAxis = isVertical ? point.y : point.x
        return false
      },
    })
  }

  bindSwipeOpenTracking(options: SwipeOpenTrackingOptions) {
    const { getDoc, getContentEl, getSwipeAreaEl, swipeDirection, onMove, onEnd, onCancel } = options
    return this.session.bind({
      getDoc,
      getSelectionTarget: getSwipeAreaEl,
      swipeDirection,
      onMove({ point }) {
        onMove({ point })
      },
      onEnd,
      onCancel,
      cancelOnInterrupt: ({ reason, target }) => {
        if (reason !== "lost-pointer-capture") return true
        return isWithinDrawerInteractionSurface(target, getContentEl(), getSwipeAreaEl())
      },
    })
  }
}

interface DrawerSwipeSessionOptions {
  preventDragOnScroll: () => boolean
}

interface DragTrackingOptions {
  getDoc: () => Document
  getContentEl: () => HTMLElement | null
  getSwipeAreaEl: () => HTMLElement | null
  swipeDirection: PhysicalSwipeDirection
  onMove: (details: { point: Point; target: Element | null; swipeDirection: PhysicalSwipeDirection }) => void
  onEnd: (details: { point: Point; swipeDirection: PhysicalSwipeDirection }) => void
  onCancel: () => void
}

interface SwipeOpenTrackingOptions {
  getDoc: () => Document
  getContentEl: () => HTMLElement | null
  getSwipeAreaEl: () => HTMLElement | null
  swipeDirection: PhysicalSwipeDirection
  onMove: (details: { point: Point }) => void
  onEnd: (details: { point: Point; swipeDirection: PhysicalSwipeDirection }) => void
  onCancel: () => void
}

function isWithinDrawerInteractionSurface(
  target: Element | null,
  contentEl: HTMLElement | null,
  swipeAreaEl: HTMLElement | null,
) {
  if (!target) return false
  return contains(contentEl, target) || contains(swipeAreaEl, target)
}

export const oppositeSwipeDirection: Record<SwipeDirection, SwipeDirection> = {
  up: "down",
  down: "up",
  start: "end",
  end: "start",
}

export function resolveSwipeDirection(direction: SwipeDirection, dir?: "ltr" | "rtl"): PhysicalSwipeDirection {
  if (direction === "start") return dir === "rtl" ? "right" : "left"
  if (direction === "end") return dir === "rtl" ? "left" : "right"
  return direction
}

export function getSwipeDirectionSize(rect: DOMRect, direction: PhysicalSwipeDirection): number {
  return isVerticalSwipeDirection(direction) ? rect.height : rect.width
}

export function resolveSwipeProgress(
  contentSize: number | null,
  dragOffset: number | null,
  snapPointOffset: number,
): number {
  if (!contentSize || contentSize <= 0) return 0
  const currentOffset = dragOffset ?? snapPointOffset
  return clampValue(1 - currentOffset / contentSize, 0, 1)
}

export function hasOpeningSwipeIntent(start: Point, current: Point, direction: PhysicalSwipeDirection): boolean {
  const axis = isVerticalSwipeDirection(direction) ? "y" : "x"
  const sign = isNegativeSwipeDirection(direction) ? -1 : 1
  const displacement = (start[axis] - current[axis]) * sign
  return displacement > SWIPE_AREA_OPEN_INTENT_MIN_PX
}

function overflowAllowsScroll(overflow: string): boolean {
  return overflow === "auto" || overflow === "scroll" || overflow === "overlay"
}

function canScrollAlongY(el: HTMLElement): boolean {
  const style = getComputedStyle(el)
  if (!overflowAllowsScroll(style.overflowY)) return false
  return el.scrollHeight > el.clientHeight + SCROLL_SLACK_EPSILON
}

function canScrollAlongX(el: HTMLElement): boolean {
  const style = getComputedStyle(el)
  if (!overflowAllowsScroll(style.overflowX)) return false
  return el.scrollWidth > el.clientWidth + SCROLL_SLACK_EPSILON
}

function canScrollOnSwipeAxis(el: HTMLElement, direction: PhysicalSwipeDirection): boolean {
  return isVerticalSwipeDirection(direction) ? canScrollAlongY(el) : canScrollAlongX(el)
}

function findClosestScrollableAncestorOnSwipeAxis(
  target: HTMLElement,
  container: HTMLElement | null,
  direction: PhysicalSwipeDirection,
): HTMLElement | null {
  if (!container) return null
  let el: HTMLElement | null = target
  while (el && el !== container) {
    if (canScrollOnSwipeAxis(el, direction)) return el
    el = el.parentElement
  }
  return null
}

function getScrollInfo(target: HTMLElement, container: HTMLElement | null, direction: PhysicalSwipeDirection) {
  let availableForwardScroll = 0
  let availableBackwardScroll = 0
  if (!container) return { availableForwardScroll, availableBackwardScroll }

  const vertical = isVerticalSwipeDirection(direction)
  let element: HTMLElement | null = target

  while (element) {
    if (vertical ? canScrollAlongY(element) : canScrollAlongX(element)) {
      const clientSize = vertical ? element.clientHeight : element.clientWidth
      const scrollPos = vertical ? element.scrollTop : element.scrollLeft
      const scrollSize = vertical ? element.scrollHeight : element.scrollWidth
      const scrolled = scrollSize - scrollPos - clientSize
      availableForwardScroll += scrolled
      availableBackwardScroll += scrollPos
    }

    if (element === container || element === element.ownerDocument.documentElement) break
    element = element.parentElement
  }

  return { availableForwardScroll, availableBackwardScroll }
}

function shouldPreventTouchScroll(options: {
  scrollParent: HTMLElement
  swipeDirection: PhysicalSwipeDirection
  lastMainAxis: number
  currentMainAxis: number
}): boolean {
  const { scrollParent, swipeDirection, lastMainAxis, currentMainAxis } = options
  const vertical = isVerticalSwipeDirection(swipeDirection)
  const movingPositive = currentMainAxis > lastMainAxis

  if (vertical) {
    const scrollPos = scrollParent.scrollTop
    const maxScroll = Math.max(0, scrollParent.scrollHeight - scrollParent.clientHeight)

    if (swipeDirection === "down") return scrollPos <= SCROLL_SLACK_EPSILON && movingPositive
    if (swipeDirection === "up") return scrollPos >= maxScroll - SCROLL_SLACK_EPSILON && !movingPositive
  } else {
    const scrollPos = scrollParent.scrollLeft
    const maxScroll = Math.max(0, scrollParent.scrollWidth - scrollParent.clientWidth)

    if (swipeDirection === "right") return scrollPos <= SCROLL_SLACK_EPSILON && movingPositive
    if (swipeDirection === "left") return scrollPos >= maxScroll - SCROLL_SLACK_EPSILON && !movingPositive
  }

  return false
}

function isDragExemptElement(el: EventTarget | null | undefined): boolean {
  if (!isHTMLElement(el)) return false
  if (el.closest(NO_DRAG_SELECTOR)) return true

  let node: HTMLElement | null = el
  while (node) {
    if (isEditableElement(node)) return true
    node = node.parentElement
  }

  const input = el.closest("input")
  if (isInputElement(input)) {
    const type = input.type
    if (type === "range" || type === "file") return true
  }

  return false
}

export function isTextSelectionInDrawer(doc: Document, contentEl: HTMLElement | null): boolean {
  if (!contentEl) return false
  const selection = doc.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false

  try {
    const range = selection.getRangeAt(0)
    if (contains(contentEl, range.commonAncestorContainer)) return true
    if (contains(contentEl, selection.anchorNode)) return true
    if (contains(contentEl, selection.focusNode)) return true
    if (typeof range.intersectsNode === "function" && range.intersectsNode(contentEl)) return true
  } catch {
    return false
  }

  return false
}

function isDragExemptFromComposedPath(event: {
  target: EventTarget | null
  composedPath?: () => EventTarget[]
}): boolean {
  const path = typeof event.composedPath === "function" ? event.composedPath() : []
  for (const node of path) {
    if (isDragExemptElement(node)) return true
  }
  return isDragExemptElement(event.target)
}

export function shouldIgnorePointerDownForDrag(event: JSX.PointerEvent<HTMLElement>): boolean {
  if (!isLeftClick(event)) return true
  const target = getEventTarget<HTMLElement>(event)
  if (target?.hasAttribute(NO_DRAG_DATA_ATTR) || target?.closest(NO_DRAG_SELECTOR)) return true
  return isDragExemptFromComposedPath(event)
}
