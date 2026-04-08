import type { PropFn } from "@zag-js/core"
import { clampPointInRange, getCenterPoint } from "@zag-js/rect-utils"
import type { Point, Rect, Size } from "@zag-js/types"
import { isBoolean } from "@zag-js/utils"
import type { FlipState, ImageCropperProps, ImageCropperSchema } from "./image-cropper.types"

const { max, abs, PI, cos, sin } = Math

export const getMaxBounds = (cropSize: Size, viewportSize: Size): Point => ({
  x: max(0, viewportSize.width - cropSize.width),
  y: max(0, viewportSize.height - cropSize.height),
})

export const getViewportCenter = (size: Size): Point => getCenterPoint({ x: 0, y: 0, ...size })

/* -----------------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------------------*/

const ASPECT_RATIO_TOLERANCE = 0.001
export const MIN_PINCH_DISTANCE = 1

export const isAspectRatioEqual = (a: number, b: number): boolean => {
  return abs(a - b) < ASPECT_RATIO_TOLERANCE
}

/* -----------------------------------------------------------------------------
 * Offset Clamping (image-specific: zoom + rotation)
 * ---------------------------------------------------------------------------*/

interface ClampOffsetParams {
  zoom: number
  rotation: number
  viewportSize: Size
  offset: Point
  fixedCropArea?: boolean
  crop?: Rect
}

export function clampOffset(params: ClampOffsetParams): Point {
  const { zoom, rotation, viewportSize, offset, fixedCropArea, crop } = params

  const rot = getRotationTransform(rotation)

  if (fixedCropArea && crop) {
    const aabb = computeAABB(viewportSize, zoom, rot.cos, rot.sin)
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

    return clampPointInRange(offset, minPoint, maxPoint)
  }

  const aabb = computeAABB(viewportSize, zoom, rot.cos, rot.sin)

  const extraWidth = max(0, aabb.width - viewportSize.width)
  const extraHeight = max(0, aabb.height - viewportSize.height)

  const minPoint = { x: -extraWidth / 2, y: -extraHeight / 2 }
  const maxPoint = { x: extraWidth / 2, y: extraHeight / 2 }

  return clampPointInRange(offset, minPoint, maxPoint)
}

/* -----------------------------------------------------------------------------
 * Crop Configuration (image-specific)
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
  const { min } = Math
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
 * Flip State (image-specific)
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
 * Rotation Transform (image-specific)
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
