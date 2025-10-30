import type { PropFn } from "@zag-js/core"
import type { Point, Rect, Size } from "@zag-js/types"
import { clampValue, isBoolean } from "@zag-js/utils"
import type { FlipState, HandlePosition, ImageCropperProps, ImageCropperSchema } from "./image-cropper.types"

const { min, max, abs, round, hypot, PI, cos, sin } = Math

/* -----------------------------------------------------------------------------
 * Handle Direction Utilities
 * ---------------------------------------------------------------------------*/

export const isLeftHandle = (handlePosition: HandlePosition): boolean =>
  handlePosition === "w" || handlePosition === "nw" || handlePosition === "sw"

export const isRightHandle = (handlePosition: HandlePosition): boolean =>
  handlePosition === "e" || handlePosition === "ne" || handlePosition === "se"

export const isTopHandle = (handlePosition: HandlePosition): boolean =>
  handlePosition === "n" || handlePosition === "nw" || handlePosition === "ne"

export const isBottomHandle = (handlePosition: HandlePosition): boolean =>
  handlePosition === "s" || handlePosition === "sw" || handlePosition === "se"

export const isCornerHandle = (handlePosition: HandlePosition): boolean =>
  (isLeftHandle(handlePosition) || isRightHandle(handlePosition)) &&
  (isTopHandle(handlePosition) || isBottomHandle(handlePosition))

export const isHorizontalEdgeHandle = (handlePosition: HandlePosition): boolean =>
  (isLeftHandle(handlePosition) || isRightHandle(handlePosition)) &&
  !(isTopHandle(handlePosition) || isBottomHandle(handlePosition))

export const isVerticalEdgeHandle = (handlePosition: HandlePosition): boolean =>
  (isTopHandle(handlePosition) || isBottomHandle(handlePosition)) &&
  !(isLeftHandle(handlePosition) || isRightHandle(handlePosition))

/* -----------------------------------------------------------------------------
 * Size Limit Utilities
 * ---------------------------------------------------------------------------*/

interface SizeLimits {
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  hasAspect: boolean
}

const hasAspectRatio = (value: number | undefined): value is number => typeof value === "number" && value > 0

const resolveSizeLimits = (options: {
  minSize: Size
  maxSize: Size
  viewportSize: Size
  aspectRatio?: number | undefined
}): SizeLimits => {
  const { minSize, maxSize, viewportSize, aspectRatio } = options

  let minWidth = min(minSize.width, viewportSize.width)
  let minHeight = min(minSize.height, viewportSize.height)

  let maxWidth = maxSize?.width ?? viewportSize.width
  if (!Number.isFinite(maxWidth)) maxWidth = viewportSize.width
  maxWidth = min(maxWidth, viewportSize.width)

  let maxHeight = maxSize?.height ?? viewportSize.height
  if (!Number.isFinite(maxHeight)) maxHeight = viewportSize.height
  maxHeight = min(maxHeight, viewportSize.height)

  maxWidth = max(minWidth, maxWidth)
  maxHeight = max(minHeight, maxHeight)

  const hasAspect = hasAspectRatio(aspectRatio)

  if (hasAspect) {
    const minWidthWithAspect = max(minWidth, minHeight * aspectRatio)
    const minHeightWithAspect = minWidthWithAspect / aspectRatio
    minWidth = min(minWidthWithAspect, viewportSize.width)
    minHeight = min(minHeightWithAspect, viewportSize.height)

    let constrainedMaxWidth = min(maxWidth, maxHeight * aspectRatio, viewportSize.width)
    let constrainedMaxHeight = constrainedMaxWidth / aspectRatio

    if (constrainedMaxHeight > maxHeight || constrainedMaxHeight > viewportSize.height) {
      constrainedMaxHeight = min(maxHeight, viewportSize.height)
      constrainedMaxWidth = constrainedMaxHeight * aspectRatio
    }

    maxWidth = max(minWidth, min(constrainedMaxWidth, viewportSize.width))
    maxHeight = max(minHeight, min(constrainedMaxHeight, viewportSize.height))
  } else {
    maxWidth = max(minWidth, min(maxWidth, viewportSize.width))
    maxHeight = max(minHeight, min(maxHeight, viewportSize.height))
  }

  return { minWidth, minHeight, maxWidth, maxHeight, hasAspect }
}

/* -----------------------------------------------------------------------------
 * Aspect Ratio Clamping Utilities
 * ---------------------------------------------------------------------------*/

interface ClampAspectParams {
  widthValue: number
  heightValue: number
  limits: SizeLimits
  viewportRect: Size
  aspectRatio: number
}

const clampAspectSize = (params: ClampAspectParams): Size => {
  const { widthValue, heightValue, limits, viewportRect, aspectRatio } = params
  const { minWidth, minHeight, maxWidth, maxHeight } = limits

  const constrainWidthFromHeight = (height: number): Size => {
    let width = clampValue(height * aspectRatio, minWidth, maxWidth)
    width = min(width, viewportRect.width)
    return { width, height: width / aspectRatio }
  }

  const clampByWidth = (value: number) => {
    let width = clampValue(value, minWidth, maxWidth)
    width = min(width, viewportRect.width)
    let height = width / aspectRatio

    if (height < minHeight) {
      const constrained = constrainWidthFromHeight(minHeight)
      width = constrained.width
      height = constrained.height
    }

    if (height > maxHeight) {
      const clampedHeight = min(maxHeight, viewportRect.height)
      const constrained = constrainWidthFromHeight(clampedHeight)
      width = constrained.width
      height = constrained.height
    }

    if (height > viewportRect.height) {
      const constrained = constrainWidthFromHeight(viewportRect.height)
      width = constrained.width
      height = constrained.height
      if (height < minHeight) {
        const reconstrainted = constrainWidthFromHeight(minHeight)
        width = reconstrainted.width
        height = reconstrainted.height
      }
    }

    return { width, height }
  }

  const clampByHeight = (value: number) => {
    let height = clampValue(value, minHeight, maxHeight)
    height = min(height, viewportRect.height)

    let width = height * aspectRatio
    width = clampValue(width, minWidth, maxWidth)
    width = min(width, viewportRect.width)

    let adjustedHeight = width / aspectRatio

    if (adjustedHeight < minHeight) {
      const constrained = constrainWidthFromHeight(minHeight)
      width = constrained.width
      adjustedHeight = constrained.height
    }

    if (adjustedHeight > maxHeight) {
      const clampedHeight = min(maxHeight, viewportRect.height)
      const constrained = constrainWidthFromHeight(clampedHeight)
      width = constrained.width
      adjustedHeight = constrained.height
    }

    if (width > viewportRect.width) {
      width = viewportRect.width
      adjustedHeight = width / aspectRatio
      if (adjustedHeight > maxHeight) {
        const clampedHeight = min(maxHeight, viewportRect.height)
        const constrained = constrainWidthFromHeight(clampedHeight)
        width = constrained.width
        adjustedHeight = constrained.height
      }
      if (adjustedHeight < minHeight) {
        const constrained = constrainWidthFromHeight(minHeight)
        width = constrained.width
        adjustedHeight = constrained.height
      }
    }

    return { width, height: adjustedHeight }
  }

  const byWidth = clampByWidth(widthValue)
  const byHeight = clampByHeight(heightValue)

  const deltaWidth = abs(byWidth.width - widthValue) + abs(byWidth.height - heightValue)
  const deltaHeight = abs(byHeight.width - widthValue) + abs(byHeight.height - heightValue)

  return deltaHeight < deltaWidth ? byHeight : byWidth
}

/* -----------------------------------------------------------------------------
 * Crop Resize Utilities
 * ---------------------------------------------------------------------------*/

interface EdgeBounds {
  left: number
  top: number
  right: number
  bottom: number
}

interface EdgeDeltaParams {
  bounds: EdgeBounds
  delta: Point
  handlePosition: HandlePosition
  viewportRect: Size
  minSize: Size
  maxSize: Size
}

interface AspectResizeParams {
  bounds: EdgeBounds
  limits: SizeLimits
  viewportRect: Size
  aspectRatio: number
  handlePosition: HandlePosition
}

interface CornerResizeParams {
  bounds: EdgeBounds
  width: number
  height: number
  handlePosition: HandlePosition
}

interface ResizeOptions {
  cropStart: Rect
  handlePosition: HandlePosition
  delta: { x: number; y: number }
  viewportRect: Size
  minSize: Size
  maxSize: Size
  aspectRatio?: number | undefined
}

const applyDeltaToEdges = (params: EdgeDeltaParams): EdgeBounds => {
  const { bounds, delta, handlePosition, viewportRect, minSize, maxSize } = params
  let { left, top, right, bottom } = bounds

  if (isLeftHandle(handlePosition)) {
    const minLeft = max(0, right - maxSize.width)
    const maxLeft = right - minSize.width
    left = clampValue(left + delta.x, minLeft, maxLeft)
  }

  if (isRightHandle(handlePosition)) {
    const minRight = left + minSize.width
    const maxRight = min(viewportRect.width, left + maxSize.width)
    right = clampValue(right + delta.x, minRight, maxRight)
  }

  if (isTopHandle(handlePosition)) {
    const minTop = max(0, bottom - maxSize.height)
    const maxTop = bottom - minSize.height
    top = clampValue(top + delta.y, minTop, maxTop)
  }

  if (isBottomHandle(handlePosition)) {
    const minBottom = top + minSize.height
    const maxBottom = min(viewportRect.height, top + maxSize.height)
    bottom = clampValue(bottom + delta.y, minBottom, maxBottom)
  }

  return { left, top, right, bottom }
}

const applyAspectToHorizontalResize = (params: AspectResizeParams): EdgeBounds => {
  const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params
  const { left, top, right, bottom } = bounds

  const centerY = (top + bottom) / 2
  let nextWidth = right - left
  let nextHeight = nextWidth / aspectRatio

  const constrained = clampAspectSize({
    widthValue: nextWidth,
    heightValue: nextHeight,
    limits,
    viewportRect,
    aspectRatio,
  })
  nextWidth = constrained.width
  nextHeight = constrained.height

  const halfH = nextHeight / 2
  let newTop = centerY - halfH
  let newBottom = centerY + halfH

  if (newTop < 0) {
    newTop = 0
    newBottom = nextHeight
  }

  if (newBottom > viewportRect.height) {
    newBottom = viewportRect.height
    newTop = newBottom - nextHeight
  }

  return {
    left: isRightHandle(handlePosition) ? left : right - nextWidth,
    top: newTop,
    right: isRightHandle(handlePosition) ? left + nextWidth : right,
    bottom: newBottom,
  }
}

const applyAspectToVerticalResize = (params: AspectResizeParams): EdgeBounds => {
  const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params
  const { left, top, right, bottom } = bounds

  const centerX = (left + right) / 2
  let nextHeight = bottom - top
  let nextWidth = nextHeight * aspectRatio

  const constrained = clampAspectSize({
    widthValue: nextWidth,
    heightValue: nextHeight,
    limits,
    viewportRect,
    aspectRatio,
  })
  nextWidth = constrained.width
  nextHeight = constrained.height

  const halfW = nextWidth / 2
  let newLeft = centerX - halfW
  let newRight = centerX + halfW

  if (newLeft < 0) {
    newLeft = 0
    newRight = nextWidth
  }

  if (newRight > viewportRect.width) {
    newRight = viewportRect.width
    newLeft = newRight - nextWidth
  }

  return {
    left: newLeft,
    top: isBottomHandle(handlePosition) ? top : bottom - nextHeight,
    right: newRight,
    bottom: isBottomHandle(handlePosition) ? top + nextHeight : bottom,
  }
}

const applyCornerResize = (params: CornerResizeParams): EdgeBounds => {
  const { bounds, width, height, handlePosition } = params
  const { left, top, right, bottom } = bounds

  if (isRightHandle(handlePosition) && isBottomHandle(handlePosition)) {
    return { left, top, right: left + width, bottom: top + height }
  } else if (isRightHandle(handlePosition) && isTopHandle(handlePosition)) {
    return { left, top: bottom - height, right: left + width, bottom }
  } else if (isBottomHandle(handlePosition)) {
    // hasLeft && hasBottom
    return { left: right - width, top, right, bottom: top + height }
  } else {
    // hasLeft && hasTop
    return { left: right - width, top: bottom - height, right, bottom }
  }
}

export function computeResizeCrop(options: ResizeOptions): Rect {
  const { cropStart, handlePosition, delta, viewportRect, minSize, maxSize, aspectRatio } = options
  let { x, y, width, height } = cropStart
  let left = x
  let top = y
  let right = x + width
  let bottom = y + height

  const { minWidth, minHeight, maxWidth, maxHeight, hasAspect } = resolveSizeLimits({
    minSize,
    maxSize,
    viewportSize: viewportRect,
    aspectRatio,
  })

  // Apply delta to edges
  const edgesAfterDelta = applyDeltaToEdges({
    bounds: { left, top, right, bottom },
    delta,
    handlePosition,
    viewportRect,
    minSize,
    maxSize,
  })
  left = edgesAfterDelta.left
  top = edgesAfterDelta.top
  right = edgesAfterDelta.right
  bottom = edgesAfterDelta.bottom

  if (hasAspect) {
    const limits = { minWidth, minHeight, maxWidth, maxHeight, hasAspect }

    if (isCornerHandle(handlePosition)) {
      let tempW = right - left
      let tempH = tempW / aspectRatio!

      if (tempH > bottom - top || top + tempH > viewportRect.height || left + tempW > viewportRect.width) {
        tempH = bottom - top
        tempW = tempH * aspectRatio!
      }

      const constrained = clampAspectSize({
        widthValue: tempW,
        heightValue: tempH,
        limits,
        viewportRect,
        aspectRatio: aspectRatio!,
      })

      const result = applyCornerResize({
        bounds: { left, top, right, bottom },
        width: constrained.width,
        height: constrained.height,
        handlePosition,
      })
      left = result.left
      top = result.top
      right = result.right
      bottom = result.bottom
    } else if (isHorizontalEdgeHandle(handlePosition)) {
      const result = applyAspectToHorizontalResize({
        bounds: { left, top, right, bottom },
        limits,
        viewportRect,
        aspectRatio: aspectRatio!,
        handlePosition,
      })
      left = result.left
      top = result.top
      right = result.right
      bottom = result.bottom
    } else if (isVerticalEdgeHandle(handlePosition)) {
      const result = applyAspectToVerticalResize({
        bounds: { left, top, right, bottom },
        limits,
        viewportRect,
        aspectRatio: aspectRatio!,
        handlePosition,
      })
      left = result.left
      top = result.top
      right = result.right
      bottom = result.bottom
    }
  }

  const maxLeft = max(0, viewportRect.width - minWidth)
  const maxTop = max(0, viewportRect.height - minHeight)
  left = clampValue(left, 0, maxLeft)
  top = clampValue(top, 0, maxTop)

  const maxRight = min(viewportRect.width, left + maxWidth)
  const maxBottom = min(viewportRect.height, top + maxHeight)
  right = clampValue(right, left + minWidth, maxRight)
  bottom = clampValue(bottom, top + minHeight, maxBottom)

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  }
}

/* -----------------------------------------------------------------------------
 * Crop Movement Utilities
 * ---------------------------------------------------------------------------*/

export function computeMoveCrop(cropStart: Rect, delta: { x: number; y: number }, viewportRect: Size): Rect {
  return {
    x: clampValue(cropStart.x + delta.x, 0, viewportRect.width - cropStart.width),
    y: clampValue(cropStart.y + delta.y, 0, viewportRect.height - cropStart.height),
    width: cropStart.width,
    height: cropStart.height,
  }
}

/* -----------------------------------------------------------------------------
 * Offset Clamping Utilities
 * ---------------------------------------------------------------------------*/

interface ClampOffsetParams {
  zoom: number
  rotation: number
  viewportSize: Size
  offset: Point
  fixedCropArea?: boolean
  crop?: Rect
  naturalSize?: Size
}

export function clampOffset(params: ClampOffsetParams): Point {
  const { zoom, rotation, viewportSize, offset, fixedCropArea, crop, naturalSize } = params

  const { cos, sin } = getRotationTransform(rotation)

  if (fixedCropArea && crop && naturalSize) {
    const aabb = computeAABB(naturalSize, zoom, cos, sin)
    const center = getViewportCenter(viewportSize)

    const cropRight = crop.x + crop.width
    const cropBottom = crop.y + crop.height

    const minPoint = {
      x: cropRight - center.x - aabb.width / 2,
      y: cropBottom - center.y - aabb.height / 2,
    }

    const maxPoint = {
      x: crop.x - center.x + aabb.width / 2,
      y: crop.y - center.y + aabb.height / 2,
    }

    return clampPoint(offset, minPoint, maxPoint)
  }

  const aabb = computeAABB(viewportSize, zoom, cos, sin)

  const extraWidth = max(0, aabb.width - viewportSize.width)
  const extraHeight = max(0, aabb.height - viewportSize.height)

  const minPoint = { x: -extraWidth / 2, y: -extraHeight / 2 }
  const maxPoint = { x: extraWidth / 2, y: extraHeight / 2 }

  return clampPoint(offset, minPoint, maxPoint)
}

/* -----------------------------------------------------------------------------
 * Keyboard Crop Utilities
 * ---------------------------------------------------------------------------*/

const expandLeft = (crop: Rect, step: number, maxWidth: number): { x: number; width: number } => {
  const newX = max(0, crop.x - step)
  const newWidth = crop.width + (crop.x - newX)
  if (newWidth <= maxWidth) {
    return { x: newX, width: newWidth }
  }
  return { x: crop.x + crop.width - maxWidth, width: maxWidth }
}

const expandTop = (crop: Rect, step: number, maxHeight: number): { y: number; height: number } => {
  const newY = max(0, crop.y - step)
  const newHeight = crop.height + (crop.y - newY)
  if (newHeight <= maxHeight) {
    return { y: newY, height: newHeight }
  }
  return { y: crop.y + crop.height - maxHeight, height: maxHeight }
}

const shrinkFromLeft = (crop: Rect, step: number, minWidth: number): { x: number; width: number } => {
  const newX = min(crop.x + step, crop.x + crop.width - minWidth)
  return { x: newX, width: crop.width - (newX - crop.x) }
}

const shrinkFromTop = (crop: Rect, step: number, minHeight: number): { y: number; height: number } => {
  const newY = min(crop.y + step, crop.y + crop.height - minHeight)
  return { y: newY, height: crop.height - (newY - crop.y) }
}

export function computeKeyboardCrop(
  key: string,
  handlePosition: HandlePosition,
  step: number,
  crop: Rect,
  viewportRect: Size,
  minSize: Size,
  maxSize: Size,
): Rect {
  const nextCrop = { ...crop }

  const { minWidth, minHeight, maxWidth, maxHeight } = resolveSizeLimits({
    minSize,
    maxSize,
    viewportSize: viewportRect,
  })

  const isCorner = isCornerHandle(handlePosition)

  if (key === "ArrowLeft") {
    if (isLeftHandle(handlePosition)) {
      const expanded = expandLeft(crop, step, maxWidth)
      nextCrop.x = expanded.x
      nextCrop.width = expanded.width

      if (isCorner && isTopHandle(handlePosition)) {
        const expandedY = expandTop(crop, step, maxHeight)
        nextCrop.y = expandedY.y
        nextCrop.height = expandedY.height
      } else if (isCorner && isBottomHandle(handlePosition)) {
        const newHeight = nextCrop.height + step
        nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight))
      }
    } else if (isRightHandle(handlePosition)) {
      nextCrop.width = max(minWidth, nextCrop.width - step)

      if (isCorner && isTopHandle(handlePosition)) {
        const shrunk = shrinkFromTop(crop, step, minHeight)
        nextCrop.y = shrunk.y
        nextCrop.height = shrunk.height
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = max(minHeight, nextCrop.height - step)
      }
    }
  } else if (key === "ArrowRight") {
    if (isLeftHandle(handlePosition)) {
      const shrunk = shrinkFromLeft(crop, step, minWidth)
      nextCrop.x = shrunk.x
      nextCrop.width = shrunk.width

      if (isCorner && isTopHandle(handlePosition)) {
        const shrunkY = shrinkFromTop(crop, step, minHeight)
        nextCrop.y = shrunkY.y
        nextCrop.height = shrunkY.height
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = max(minHeight, nextCrop.height - step)
      }
    } else if (isRightHandle(handlePosition)) {
      const newWidth = nextCrop.width + step
      nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth))

      if (isCorner && isTopHandle(handlePosition)) {
        const expanded = expandTop(crop, step, maxHeight)
        nextCrop.y = expanded.y
        nextCrop.height = expanded.height
      } else if (isCorner && isBottomHandle(handlePosition)) {
        const newHeight = nextCrop.height + step
        nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight))
      }
    }
  }

  if (key === "ArrowUp") {
    if (isTopHandle(handlePosition)) {
      const expanded = expandTop(crop, step, maxHeight)
      nextCrop.y = expanded.y
      nextCrop.height = expanded.height

      if (isCorner && isLeftHandle(handlePosition)) {
        const expandedX = expandLeft(crop, step, maxWidth)
        nextCrop.x = expandedX.x
        nextCrop.width = expandedX.width
      } else if (isCorner && isRightHandle(handlePosition)) {
        const newWidth = nextCrop.width + step
        nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth))
      }
    } else if (isBottomHandle(handlePosition)) {
      nextCrop.height = max(minHeight, nextCrop.height - step)

      if (isCorner && isLeftHandle(handlePosition)) {
        const shrunk = shrinkFromLeft(crop, step, minWidth)
        nextCrop.x = shrunk.x
        nextCrop.width = shrunk.width
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = max(minWidth, nextCrop.width - step)
      }
    }
  } else if (key === "ArrowDown") {
    if (isTopHandle(handlePosition)) {
      const shrunk = shrinkFromTop(crop, step, minHeight)
      nextCrop.y = shrunk.y
      nextCrop.height = shrunk.height

      if (isCorner && isLeftHandle(handlePosition)) {
        const shrunkX = shrinkFromLeft(crop, step, minWidth)
        nextCrop.x = shrunkX.x
        nextCrop.width = shrunkX.width
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = max(minWidth, nextCrop.width - step)
      }
    } else if (isBottomHandle(handlePosition)) {
      const newHeight = nextCrop.height + step
      nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight))

      if (isCorner && isLeftHandle(handlePosition)) {
        const expanded = expandLeft(crop, step, maxWidth)
        nextCrop.x = expanded.x
        nextCrop.width = expanded.width
      } else if (isCorner && isRightHandle(handlePosition)) {
        const newWidth = nextCrop.width + step
        nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth))
      }
    }
  }

  return nextCrop
}

export function getKeyboardMoveDelta(key: string, step: number): Point {
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
      return ZERO_POINT
  }
}

/* -----------------------------------------------------------------------------
 * Crop Configuration Utilities
 * ---------------------------------------------------------------------------*/

export const resolveCropAspectRatio = (
  shape: ImageCropperProps["cropShape"],
  aspectRatio: ImageCropperProps["aspectRatio"],
) => (shape === "circle" ? 1 : aspectRatio)

export const getCropSizeLimits = (prop: PropFn<ImageCropperSchema>) => ({
  minSize: { width: prop("minWidth"), height: prop("minHeight") },
  maxSize: { width: prop("maxWidth"), height: prop("maxHeight") },
})

export const getNudgeStep = (
  prop: PropFn<ImageCropperSchema>,
  modifiers: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean },
) => {
  if (modifiers.ctrlKey || modifiers.metaKey) return prop("nudgeStepCtrl")
  if (modifiers.shiftKey) return prop("nudgeStepShift")
  return prop("nudgeStep")
}

const DEFAULT_VIEWPORT_FILL = 0.8

export const computeDefaultCropDimensions = (
  viewportRect: Size,
  aspectRatio: number | undefined,
  fixedCropArea: boolean,
): Size => {
  const targetWidth = viewportRect.width * DEFAULT_VIEWPORT_FILL
  const targetHeight = viewportRect.height * DEFAULT_VIEWPORT_FILL

  if (typeof aspectRatio === "number" && aspectRatio > 0) {
    if (fixedCropArea) {
      let height = viewportRect.height
      let width = height * aspectRatio

      if (width > viewportRect.width) {
        width = viewportRect.width
        height = width / aspectRatio
      }

      return { width, height }
    }

    const targetAspect = targetWidth / targetHeight

    if (aspectRatio > targetAspect) {
      const width = targetWidth
      const height = width / aspectRatio
      return { width, height }
    }

    const height = targetHeight
    const width = height * aspectRatio
    return { width, height }
  }

  if (fixedCropArea) {
    const size = min(viewportRect.width, viewportRect.height)
    return { width: size, height: size }
  }

  return { width: targetWidth, height: targetHeight }
}

/* -----------------------------------------------------------------------------
 * Flip State Utilities
 * ---------------------------------------------------------------------------*/

export const normalizeFlipState = (nextFlip: Partial<FlipState> | undefined, currentFlip: FlipState): FlipState => {
  if (!nextFlip) return currentFlip
  return {
    horizontal: isBoolean(nextFlip.horizontal) ? nextFlip.horizontal : currentFlip.horizontal,
    vertical: isBoolean(nextFlip.vertical) ? nextFlip.vertical : currentFlip.vertical,
  }
}

export const isEqualFlip = (a: FlipState, b: FlipState): boolean => {
  return a.horizontal === b.horizontal && a.vertical === b.vertical
}

/* -----------------------------------------------------------------------------
 * Geometry Utilities
 * ---------------------------------------------------------------------------*/

export const isVisibleRect = (rect: Size) => rect.width > 0 && rect.height > 0

export const getCenterPoint = (rect: Rect): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
})

export const getViewportCenter = (size: Size): Point => ({
  x: size.width / 2,
  y: size.height / 2,
})

export const centerRect = (size: Size, viewport: Size): Point => ({
  x: max(0, (viewport.width - size.width) / 2),
  y: max(0, (viewport.height - size.height) / 2),
})

export const getMidpoint = (p1: Point, p2: Point, offset: Point = ZERO_POINT): Point => ({
  x: (p1.x + p2.x) / 2 - offset.x,
  y: (p1.y + p2.y) / 2 - offset.y,
})

export const getMaxBounds = (cropSize: Size, viewportSize: Size): Point => ({
  x: max(0, viewportSize.width - cropSize.width),
  y: max(0, viewportSize.height - cropSize.height),
})

export const isSameSize = (a: Size, b: Size): boolean => {
  return a.width === b.width && a.height === b.height
}

/* -----------------------------------------------------------------------------
 * Point Utilities
 * ---------------------------------------------------------------------------*/

export const ZERO_POINT: Point = { x: 0, y: 0 }

export const getTouchDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return hypot(dx, dy)
}

export const clampPoint = (point: Point, min: Point, max: Point): Point => ({
  x: clampValue(point.x, min.x, max.x),
  y: clampValue(point.y, min.y, max.y),
})

export const subtractPoints = (a: Point, b: Point): Point => ({
  x: a.x - b.x,
  y: a.y - b.y,
})

export const addPoints = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
})

/* -----------------------------------------------------------------------------
 * Rect Utilities
 * ---------------------------------------------------------------------------*/

export const roundRect = (rect: Rect): Rect => ({
  x: round(rect.x),
  y: round(rect.y),
  width: round(rect.width),
  height: round(rect.height),
})

export const scaleRect = (rect: Rect, scale: Point): Rect => ({
  x: rect.x * scale.x,
  y: rect.y * scale.y,
  width: rect.width * scale.x,
  height: rect.height * scale.y,
})

/* -----------------------------------------------------------------------------
 * Transform Utilities
 * ---------------------------------------------------------------------------*/

export const getRotationTransform = (rotation: number) => {
  const theta = ((rotation % 360) * PI) / 180
  return {
    cos: abs(cos(theta)),
    sin: abs(sin(theta)),
  }
}

export const computeAABB = (size: Size, zoom: number, cos: number, sin: number): Size => {
  const w = size.width * zoom
  const h = size.height * zoom
  return {
    width: w * cos + h * sin,
    height: w * sin + h * cos,
  }
}

export const scaleSize = (size: Size, scale: number): Size => ({
  width: size.width * scale,
  height: size.height * scale,
})
