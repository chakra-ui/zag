import type { Point, Rect, Size } from "@zag-js/types"
import { clampValue } from "@zag-js/utils"
import type { HandlePosition } from "./image-cropper.types"

interface ResizeOptions {
  cropStart: Rect
  handlePosition: HandlePosition
  delta: { x: number; y: number }
  bounds: Size
  minSize: Size
  aspectRatio?: number | undefined
}

export function computeResizeCrop(options: ResizeOptions): Rect {
  const { cropStart, handlePosition, delta, bounds, minSize, aspectRatio } = options
  let { x, y, width, height } = cropStart
  let left = x
  let top = y
  let right = x + width
  let bottom = y + height

  const hasAspect = !!aspectRatio && isFinite(aspectRatio) && aspectRatio > 0

  let minWidth = Math.min(minSize.width, bounds.width)
  let minHeight = Math.min(minSize.height, bounds.height)

  if (hasAspect) {
    const mw = Math.max(minWidth, minHeight * aspectRatio)
    const mh = mw / aspectRatio
    minWidth = Math.min(mw, bounds.width)
    minHeight = Math.min(mh, bounds.height)
  }

  const hasLeft = handlePosition.includes("left")
  const hasRight = handlePosition.includes("right")
  const hasTop = handlePosition.includes("top")
  const hasBottom = handlePosition.includes("bottom")

  if (hasLeft) {
    left = clampValue(left + delta.x, 0, right - minWidth)
  }

  if (hasRight) {
    right = clampValue(right + delta.x, left + minWidth, bounds.width)
  }

  if (hasTop) {
    top = clampValue(top + delta.y, 0, bottom - minHeight)
  }

  if (hasBottom) {
    bottom = clampValue(bottom + delta.y, top + minHeight, bounds.height)
  }

  if (hasAspect) {
    let newWidth = right - left
    let newHeight = bottom - top

    // Case: corner handles
    if ((hasLeft || hasRight) && (hasTop || hasBottom)) {
      let tempW = newWidth
      let tempH = tempW / aspectRatio
      if (tempH > newHeight || top + tempH > bounds.height || left + tempW > bounds.width) {
        tempH = newHeight
        tempW = tempH * aspectRatio
      }

      if (tempW < minWidth || tempH < minHeight) {
        tempW = Math.max(tempW, minWidth)
        tempH = tempW / aspectRatio
        if (tempH < minHeight) {
          tempH = minHeight
          tempW = tempH * aspectRatio
        }
      }

      if (hasRight && hasBottom) {
        right = left + tempW
        bottom = top + tempH
      } else if (hasRight && hasTop) {
        right = left + tempW
        top = bottom - tempH
      } else if (hasLeft && hasBottom) {
        left = right - tempW
        bottom = top + tempH
      } else if (hasLeft && hasTop) {
        left = right - tempW
        top = bottom - tempH
      }

      // Case: left or right handles
    } else if ((hasLeft || hasRight) && !(hasTop || hasBottom)) {
      const centerY = (top + bottom) / 2
      let newH = newWidth / aspectRatio
      if (newWidth < minWidth) {
        newWidth = minWidth
        newH = newWidth / aspectRatio
      }

      if (newH > bounds.height) {
        newH = bounds.height
        newWidth = newH * aspectRatio
      }

      let halfH = newH / 2
      top = centerY - halfH
      bottom = centerY + halfH
      if (top < 0) {
        top = 0
        bottom = top + newH
      }
      if (bottom > bounds.height) {
        bottom = bounds.height
        top = bottom - newH
      }

      if (hasRight) {
        right = left + newWidth
      } else {
        left = right - newWidth
      }

      // Case: top or bottom handles
    } else if ((hasTop || hasBottom) && !(hasLeft || hasRight)) {
      const centerX = (left + right) / 2

      let newW = newHeight * aspectRatio

      if (newHeight < minHeight) {
        newHeight = minHeight
        newW = newHeight * aspectRatio
      }

      if (newW > bounds.width) {
        newW = bounds.width
        newHeight = newW / aspectRatio
      }

      let halfW = newW / 2
      left = centerX - halfW
      right = centerX + halfW

      if (left < 0) {
        left = 0
        right = left + newW
      }

      if (right > bounds.width) {
        right = bounds.width
        left = right - newW
      }

      if (hasBottom) {
        bottom = top + newHeight
      } else {
        top = bottom - newHeight
      }
    }
  }

  left = clampValue(left, 0, bounds.width)
  top = clampValue(top, 0, bounds.height)

  if (hasAspect) {
    right = clampValue(right, left, bounds.width)
    bottom = clampValue(bottom, top, bounds.height)
  } else {
    right = clampValue(right, left + minWidth, bounds.width)
    bottom = clampValue(bottom, top + minHeight, bounds.height)
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  }
}

export function computeMoveCrop(
  cropStart: Rect,
  delta: { x: number; y: number },
  bounds: { width: number; height: number },
): Rect {
  return {
    x: clampValue(cropStart.x + delta.x, 0, bounds.width - cropStart.width),
    y: clampValue(cropStart.y + delta.y, 0, bounds.height - cropStart.height),
    width: cropStart.width,
    height: cropStart.height,
  }
}

export const normalizeNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0

export const normalizePoint = (point: Point) => ({
  x: normalizeNumber(point?.x),
  y: normalizeNumber(point?.y),
})

export const clampOffsetValue = (value: number, viewportSize: number, imageSize: number) => {
  if (!Number.isFinite(value)) return 0
  if (!Number.isFinite(viewportSize) || viewportSize <= 0) return value
  if (!Number.isFinite(imageSize) || imageSize <= 0) return value
  const limit = viewportSize - imageSize
  const min = Math.min(0, limit)
  const max = Math.max(0, limit)
  return clampValue(value, min, max)
}

interface ClampImageOffsetParams {
  offset: Point
  zoom: number
  viewport: Size
  naturalSize: Size
}

export const clampImageOffset = ({ offset, zoom, viewport, naturalSize }: ClampImageOffsetParams): Point => {
  const normalizedOffset = normalizePoint(offset)
  if (!Number.isFinite(zoom) || zoom <= 0) {
    return normalizedOffset
  }

  const viewportWidth = normalizeNumber(viewport?.width)
  const viewportHeight = normalizeNumber(viewport?.height)
  const imageWidth = normalizeNumber(naturalSize?.width) * zoom
  const imageHeight = normalizeNumber(naturalSize?.height) * zoom

  return {
    x: clampOffsetValue(normalizedOffset.x, viewportWidth, imageWidth),
    y: clampOffsetValue(normalizedOffset.y, viewportHeight, imageHeight),
  }
}
