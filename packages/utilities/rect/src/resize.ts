import { AffineTransform } from "./affine-transform"
import { compassDirectionMap, oppositeDirectionMap, type CompassDirection } from "./compass"
import type { Point, Rect, RectInit, ScalingOptions } from "./types"

const { sign, abs, min } = Math

function getRectExtentPoint(rect: Rect, direction: CompassDirection) {
  const { minX, minY, maxX, maxY, midX, midY } = rect
  const x = direction.includes("w") ? minX : direction.includes("e") ? maxX : midX
  const y = direction.includes("n") ? minY : direction.includes("s") ? maxY : midY
  return { x, y }
}

function getOppositeDirection(direction: CompassDirection) {
  return oppositeDirectionMap[direction]
}

export function resizeRect(rect: Rect, offset: Point, direction: CompassDirection, opts: ScalingOptions) {
  const { scalingOriginMode, lockAspectRatio } = opts

  const extent = getRectExtentPoint(rect, direction)

  const oppositeDirection = getOppositeDirection(direction)
  const oppositeExtent = getRectExtentPoint(rect, oppositeDirection)

  if (scalingOriginMode === "center") {
    offset = { x: offset.x * 2, y: offset.y * 2 }
  }

  const newExtent = {
    x: extent.x + offset.x,
    y: extent.y + offset.y,
  }

  const multiplier = {
    x: compassDirectionMap[direction].x * 2 - 1,
    y: compassDirectionMap[direction].y * 2 - 1,
  }

  const newSize = {
    width: newExtent.x - oppositeExtent.x,
    height: newExtent.y - oppositeExtent.y,
  }

  const scaleX = (multiplier.x * newSize.width) / rect.width
  const scaleY = (multiplier.y * newSize.height) / rect.height

  const largestMagnitude = abs(scaleX) > abs(scaleY) ? scaleX : scaleY

  const scale = lockAspectRatio
    ? { x: largestMagnitude, y: largestMagnitude }
    : {
        x: extent.x === oppositeExtent.x ? 1 : scaleX,
        y: extent.y === oppositeExtent.y ? 1 : scaleY,
      }

  if (extent.y === oppositeExtent.y) {
    scale.y = abs(scale.y)
  } else if (sign(scale.y) !== sign(scaleY)) {
    scale.y *= -1
  }

  if (extent.x === oppositeExtent.x) {
    scale.x = abs(scale.x)
  } else if (sign(scale.x) !== sign(scaleX)) {
    scale.x *= -1
  }

  switch (scalingOriginMode) {
    case "extent":
      return transformRect(rect, AffineTransform.scale(scale.x, scale.y, oppositeExtent), false)
    case "center":
      return transformRect(
        rect,
        AffineTransform.scale(scale.x, scale.y, {
          x: rect.midX,
          y: rect.midY,
        }),
        false,
      )
  }
}

function createRectFromPoints(initialPoint: Point, finalPoint: Point, normalized: boolean = true): RectInit {
  if (normalized) {
    return {
      x: min(finalPoint.x, initialPoint.x),
      y: min(finalPoint.y, initialPoint.y),
      width: abs(finalPoint.x - initialPoint.x),
      height: abs(finalPoint.y - initialPoint.y),
    }
  }

  return {
    x: initialPoint.x,
    y: initialPoint.y,
    width: finalPoint.x - initialPoint.x,
    height: finalPoint.y - initialPoint.y,
  }
}

function transformRect(rect: Rect, transform: AffineTransform, normalized = true): RectInit {
  const p1 = transform.applyTo({ x: rect.minX, y: rect.minY })
  const p2 = transform.applyTo({ x: rect.maxX, y: rect.maxY })
  return createRectFromPoints(p1, p2, normalized)
}
