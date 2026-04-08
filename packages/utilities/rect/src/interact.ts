import type { CompassDirection } from "./compass"
import type { Point, RectInit, Size } from "./types"

export type HandlePosition = CompassDirection

/* -----------------------------------------------------------------------------
 * Handle direction helpers
 * ---------------------------------------------------------------------------*/

export const isLeftHandle = (h: HandlePosition): boolean => h === "w" || h === "nw" || h === "sw"

export const isRightHandle = (h: HandlePosition): boolean => h === "e" || h === "ne" || h === "se"

export const isTopHandle = (h: HandlePosition): boolean => h === "n" || h === "nw" || h === "ne"

export const isBottomHandle = (h: HandlePosition): boolean => h === "s" || h === "sw" || h === "se"

export const isCornerHandle = (h: HandlePosition): boolean =>
  (isLeftHandle(h) || isRightHandle(h)) && (isTopHandle(h) || isBottomHandle(h))

export const isHorizontalHandle = (h: HandlePosition): boolean =>
  (isLeftHandle(h) || isRightHandle(h)) && !isTopHandle(h) && !isBottomHandle(h)

export const isVerticalHandle = (h: HandlePosition): boolean =>
  (isTopHandle(h) || isBottomHandle(h)) && !isLeftHandle(h) && !isRightHandle(h)

/* -----------------------------------------------------------------------------
 * Options
 * ---------------------------------------------------------------------------*/

export interface MoveOptions {
  /** Containing boundary rect. Move is unconstrained if omitted. */
  boundary?: RectInit | undefined
  /** Snap-to-grid step size. Default: 1 (no snapping). */
  gridSize?: number | undefined
}

export interface ResizeOptions {
  /** Containing boundary rect. Resize is unconstrained if omitted. */
  boundary?: RectInit | undefined
  /** Minimum allowed size. */
  minSize?: Size | undefined
  /** Maximum allowed size. */
  maxSize?: Size | undefined
  /** Fixed width/height ratio. Omit for free resize. */
  aspectRatio?: number | undefined
  /** Scale from the opposite corner ("extent") or center ("center"). Default: "extent". */
  origin?: "extent" | "center" | undefined
}

/* -----------------------------------------------------------------------------
 * Internal helpers
 * ---------------------------------------------------------------------------*/

const { min, max, abs, round } = Math
const clamp = (v: number, lo: number, hi: number): number => min(max(v, lo), hi)

interface Edges {
  left: number
  top: number
  right: number
  bottom: number
}

interface Limits {
  minW: number
  minH: number
  maxW: number
  maxH: number
}

function resolveLimits(opts: ResizeOptions): Limits {
  const minW = opts.minSize?.width ?? 0
  const minH = opts.minSize?.height ?? 0
  let maxW = opts.maxSize?.width ?? Infinity
  let maxH = opts.maxSize?.height ?? Infinity

  if (opts.boundary) {
    if (Number.isFinite(maxW)) maxW = min(maxW, opts.boundary.width)
    else maxW = opts.boundary.width
    if (Number.isFinite(maxH)) maxH = min(maxH, opts.boundary.height)
    else maxH = opts.boundary.height
  }

  return { minW: max(0, minW), minH: max(0, minH), maxW: max(minW, maxW), maxH: max(minH, maxH) }
}

function resolveLimitsWithAspect(limits: Limits, boundary: RectInit | undefined, ar: number): Limits {
  let { minW, minH, maxW, maxH } = limits
  const bw = boundary?.width ?? Infinity
  const bh = boundary?.height ?? Infinity

  const minWa = max(minW, minH * ar)
  const minHa = minWa / ar
  minW = min(minWa, bw)
  minH = min(minHa, bh)

  let cmw = min(maxW, maxH * ar, bw)
  let cmh = cmw / ar
  if (cmh > maxH || cmh > bh) {
    cmh = min(maxH, bh)
    cmw = cmh * ar
  }
  maxW = max(minW, min(cmw, bw))
  maxH = max(minH, min(cmh, bh))

  return { minW, minH, maxW, maxH }
}

function applyDelta(edges: Edges, delta: Point, handle: HandlePosition, limits: Limits, boundary?: RectInit): Edges {
  let { left, top, right, bottom } = edges
  const { minW, minH, maxW, maxH } = limits

  if (isLeftHandle(handle)) {
    const lo = boundary ? max(boundary.x, right - maxW) : right - maxW
    const hi = right - minW
    left = clamp(left + delta.x, lo, hi)
  }

  if (isRightHandle(handle)) {
    const lo = left + minW
    const hi = boundary ? min(boundary.x + boundary.width, left + maxW) : left + maxW
    right = clamp(right + delta.x, lo, hi)
  }

  if (isTopHandle(handle)) {
    const lo = boundary ? max(boundary.y, bottom - maxH) : bottom - maxH
    const hi = bottom - minH
    top = clamp(top + delta.y, lo, hi)
  }

  if (isBottomHandle(handle)) {
    const lo = top + minH
    const hi = boundary ? min(boundary.y + boundary.height, top + maxH) : top + maxH
    bottom = clamp(bottom + delta.y, lo, hi)
  }

  return { left, top, right, bottom }
}

/* -----------------------------------------------------------------------------
 * Aspect ratio enforcement
 * ---------------------------------------------------------------------------*/

function clampAspectSize(wHint: number, hHint: number, ar: number, lim: Limits, bw: number, bh: number): Size {
  const fromHeight = (h: number): Size => {
    const w = clamp(h * ar, lim.minW, min(lim.maxW, bw))
    return { width: w, height: w / ar }
  }

  const tryWidth = (value: number): Size => {
    let w = clamp(value, lim.minW, min(lim.maxW, bw))
    let h = w / ar

    if (h < lim.minH) ({ width: w, height: h } = fromHeight(lim.minH))
    if (h > min(lim.maxH, bh)) ({ width: w, height: h } = fromHeight(min(lim.maxH, bh)))
    if (h > bh) {
      ;({ width: w, height: h } = fromHeight(bh))
      if (h < lim.minH) ({ width: w, height: h } = fromHeight(lim.minH))
    }

    return { width: w, height: h }
  }

  const tryHeight = (value: number): Size => {
    let h = clamp(value, lim.minH, min(lim.maxH, bh))
    let w = clamp(h * ar, lim.minW, min(lim.maxW, bw))
    let ah = w / ar

    if (ah < lim.minH) ({ width: w, height: ah } = fromHeight(lim.minH))
    if (ah > min(lim.maxH, bh)) ({ width: w, height: ah } = fromHeight(min(lim.maxH, bh)))
    if (w > bw) {
      w = bw
      ah = w / ar
      if (ah > min(lim.maxH, bh)) ({ width: w, height: ah } = fromHeight(min(lim.maxH, bh)))
      if (ah < lim.minH) ({ width: w, height: ah } = fromHeight(lim.minH))
    }

    return { width: w, height: ah }
  }

  const byW = tryWidth(wHint)
  const byH = tryHeight(hHint)
  const dw = abs(byW.width - wHint) + abs(byW.height - hHint)
  const dh = abs(byH.width - wHint) + abs(byH.height - hHint)
  return dh < dw ? byH : byW
}

function enforceAspect(edges: Edges, handle: HandlePosition, ar: number, lim: Limits, boundary?: RectInit): Edges {
  const { left, top, right, bottom } = edges
  const bw = boundary?.width ?? Infinity
  const bh = boundary?.height ?? Infinity
  const bx = boundary?.x ?? 0
  const by = boundary?.y ?? 0

  if (isCornerHandle(handle)) {
    let w = right - left
    let h = w / ar

    if (h > bottom - top || (boundary && (top + h > by + bh || left + w > bx + bw))) {
      h = bottom - top
      w = h * ar
    }

    const s = clampAspectSize(w, h, ar, lim, bw, bh)
    w = s.width
    h = s.height

    if (isRightHandle(handle) && isBottomHandle(handle)) {
      return { left, top, right: left + w, bottom: top + h }
    }
    if (isRightHandle(handle) && isTopHandle(handle)) {
      return { left, top: bottom - h, right: left + w, bottom }
    }
    if (isLeftHandle(handle) && isBottomHandle(handle)) {
      return { left: right - w, top, right, bottom: top + h }
    }
    return { left: right - w, top: bottom - h, right, bottom }
  }

  if (isHorizontalHandle(handle)) {
    const centerY = (top + bottom) / 2
    let w = right - left
    let h = w / ar

    const s = clampAspectSize(w, h, ar, lim, bw, bh)
    w = s.width
    h = s.height

    const halfH = h / 2
    let newTop = centerY - halfH
    let newBottom = centerY + halfH

    if (boundary) {
      if (newTop < by) {
        newTop = by
        newBottom = newTop + h
      }
      if (newBottom > by + bh) {
        newBottom = by + bh
        newTop = newBottom - h
      }
    }

    return {
      left: isRightHandle(handle) ? left : right - w,
      top: newTop,
      right: isRightHandle(handle) ? left + w : right,
      bottom: newBottom,
    }
  }

  if (isVerticalHandle(handle)) {
    const centerX = (left + right) / 2
    let h = bottom - top
    let w = h * ar

    const s = clampAspectSize(w, h, ar, lim, bw, bh)
    w = s.width
    h = s.height

    const halfW = w / 2
    let newLeft = centerX - halfW
    let newRight = centerX + halfW

    if (boundary) {
      if (newLeft < bx) {
        newLeft = bx
        newRight = newLeft + w
      }
      if (newRight > bx + bw) {
        newRight = bx + bw
        newLeft = newRight - w
      }
    }

    return {
      left: newLeft,
      top: isBottomHandle(handle) ? top : bottom - h,
      right: newRight,
      bottom: isBottomHandle(handle) ? top + h : bottom,
    }
  }

  return edges
}

/* -----------------------------------------------------------------------------
 * Public API: centerInRect / centerOnPoint
 * ---------------------------------------------------------------------------*/

/**
 * Compute the position that centers a `size` within a boundary rect.
 */
export function centerInRect(size: Size, boundary: RectInit): Point {
  return {
    x: boundary.x + max(0, (boundary.width - size.width) / 2),
    y: boundary.y + max(0, (boundary.height - size.height) / 2),
  }
}

/**
 * Center a rect (given by size) on a point, then clamp within a boundary.
 */
export function centerOnPoint(size: Size, center: Point, boundary: RectInit): Point {
  const pos = {
    x: center.x - size.width / 2,
    y: center.y - size.height / 2,
  }
  return {
    x: clamp(pos.x, boundary.x, boundary.x + boundary.width - size.width),
    y: clamp(pos.y, boundary.y, boundary.y + boundary.height - size.height),
  }
}

/* -----------------------------------------------------------------------------
 * Public API: clampPointInRange
 * ---------------------------------------------------------------------------*/

/**
 * Clamp a point's x/y independently between a min and max point.
 * Useful for constraining offsets, positions, or pan values.
 */
export function clampPointInRange(point: Point, minPoint: Point, maxPoint: Point): Point {
  return {
    x: clamp(point.x, minPoint.x, maxPoint.x),
    y: clamp(point.y, minPoint.y, maxPoint.y),
  }
}

/* -----------------------------------------------------------------------------
 * Public API: applyMove
 * ---------------------------------------------------------------------------*/

/**
 * Compute a new rect after moving by a pointer delta.
 * Grid-snaps the delta and clamps within the boundary.
 */
export function applyMove(rect: RectInit, delta: Point, options: MoveOptions = {}): RectInit {
  const { boundary, gridSize = 1 } = options

  const dx = round(delta.x / gridSize) * gridSize
  const dy = round(delta.y / gridSize) * gridSize

  let x = rect.x + dx
  let y = rect.y + dy

  if (boundary) {
    x = clamp(x, boundary.x, boundary.x + boundary.width - rect.width)
    y = clamp(y, boundary.y, boundary.y + boundary.height - rect.height)
  }

  return { x, y, width: rect.width, height: rect.height }
}

/* -----------------------------------------------------------------------------
 * Public API: applyResize
 * ---------------------------------------------------------------------------*/

/**
 * Compute a new rect after resizing via a handle drag.
 * Handles size limits, boundary containment, aspect ratio, and scaling origin.
 */
export function applyResize(
  rect: RectInit,
  delta: Point,
  handle: HandlePosition,
  options: ResizeOptions = {},
): RectInit {
  const { boundary, aspectRatio, origin = "extent" } = options

  const baseLimits = resolveLimits(options)

  const effectiveDelta = origin === "center" ? { x: delta.x * 2, y: delta.y * 2 } : delta

  // Step 1: Apply delta to edges with size constraints
  let edges = applyDelta(
    { left: rect.x, top: rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height },
    effectiveDelta,
    handle,
    baseLimits,
    boundary,
  )

  // Step 2: Enforce aspect ratio
  if (aspectRatio != null && aspectRatio > 0) {
    const arLimits = resolveLimitsWithAspect(baseLimits, boundary, aspectRatio)
    edges = enforceAspect(edges, handle, aspectRatio, arLimits, boundary)
  }

  let { left, top, right, bottom } = edges

  // Step 3: Re-center for center origin
  if (origin === "center") {
    const cx = rect.x + rect.width / 2
    const cy = rect.y + rect.height / 2
    const w = right - left
    const h = bottom - top
    left = cx - w / 2
    top = cy - h / 2
    right = cx + w / 2
    bottom = cy + h / 2

    if (boundary) {
      if (left < boundary.x) {
        right += boundary.x - left
        left = boundary.x
      }
      if (right > boundary.x + boundary.width) {
        left -= right - (boundary.x + boundary.width)
        right = boundary.x + boundary.width
      }
      if (top < boundary.y) {
        bottom += boundary.y - top
        top = boundary.y
      }
      if (bottom > boundary.y + boundary.height) {
        top -= bottom - (boundary.y + boundary.height)
        bottom = boundary.y + boundary.height
      }
    }
  }

  // Step 4: Final safety clamp
  if (boundary) {
    const maxLeft = max(boundary.x, boundary.x + boundary.width - baseLimits.minW)
    const maxTop = max(boundary.y, boundary.y + boundary.height - baseLimits.minH)
    left = clamp(left, boundary.x, maxLeft)
    top = clamp(top, boundary.y, maxTop)
    right = clamp(right, left + baseLimits.minW, min(boundary.x + boundary.width, left + baseLimits.maxW))
    bottom = clamp(bottom, top + baseLimits.minH, min(boundary.y + boundary.height, top + baseLimits.maxH))
  }

  return { x: left, y: top, width: right - left, height: bottom - top }
}

/* -----------------------------------------------------------------------------
 * Public API: getDirectionDelta
 * ---------------------------------------------------------------------------*/

/**
 * Convert an arrow-key direction and step into a Point delta.
 * Useful for keyboard-driven move/resize.
 */
export function getDirectionDelta(direction: "left" | "right" | "up" | "down", step: number): Point {
  switch (direction) {
    case "left":
      return { x: -step, y: 0 }
    case "right":
      return { x: step, y: 0 }
    case "up":
      return { x: 0, y: -step }
    case "down":
      return { x: 0, y: step }
  }
}

/**
 * Convert an ArrowKey event key and step into a Point delta.
 * Like `getDirectionDelta` but accepts `"ArrowLeft"` / `"ArrowRight"` / etc.
 */
export function getArrowKeyDelta(key: string, step: number): Point {
  switch (key) {
    case "ArrowLeft":
      return { x: -step, y: 0 }
    case "ArrowRight":
      return { x: step, y: 0 }
    case "ArrowUp":
      return { x: 0, y: -step }
    case "ArrowDown":
      return { x: 0, y: step }
    default:
      return { x: 0, y: 0 }
  }
}

/**
 * Compute the delta for a keyboard-driven resize given an arrow key and handle.
 *
 * The convention: pressing an arrow key in the handle's "outward" direction
 * expands the rect; pressing inward shrinks it. For corners, both axes move.
 */
export function getKeyboardResizeDelta(key: string, handle: HandlePosition, step: number): Point {
  let x = 0
  let y = 0

  if (isLeftHandle(handle)) {
    if (key === "ArrowLeft") x = -step
    else if (key === "ArrowRight") x = step
  }

  if (isRightHandle(handle)) {
    if (key === "ArrowRight") x = step
    else if (key === "ArrowLeft") x = -step
  }

  if (isTopHandle(handle)) {
    if (key === "ArrowUp") y = -step
    else if (key === "ArrowDown") y = step
  }

  if (isBottomHandle(handle)) {
    if (key === "ArrowDown") y = step
    else if (key === "ArrowUp") y = -step
  }

  return { x, y }
}
