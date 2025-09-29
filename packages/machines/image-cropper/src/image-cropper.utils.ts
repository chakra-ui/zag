import type { Rect, Size } from "@zag-js/types"
import { clampValue } from "@zag-js/utils"
import type { HandlePosition } from "./image-cropper.types"

interface ResizeOptions {
  crop: Rect
  handlePosition: HandlePosition
  delta: { x: number; y: number }
  bounds: Size
  minSize: Size
  aspectRatio?: number | undefined
}

export function computeResizeCrop(options: ResizeOptions): Rect {
  const { crop, handlePosition, delta, bounds, minSize, aspectRatio } = options
  let { x, y, width, height } = crop
  let left = x
  let top = y
  let right = x + width
  let bottom = y + height

  const minWidth = Math.min(minSize.width, bounds.width)
  const minHeight = Math.min(minSize.height, bounds.height)

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

  if (aspectRatio && isFinite(aspectRatio) && aspectRatio > 0) {
    let newWidth = right - left
    let newHeight = bottom - top

    // Case: corner handles
    if ((hasLeft || hasRight) && (hasTop || hasBottom)) {
      let tempW = newWidth
      let tempH = Math.round(tempW / aspectRatio)
      if (tempH > newHeight || top + tempH > bounds.height || left + tempW > bounds.width) {
        tempH = newHeight
        tempW = Math.round(tempH * aspectRatio)
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
      let newH = Math.round(newWidth / aspectRatio)
      const halfH = Math.floor(newH / 2)

      top = Math.max(0, centerY - halfH)
      bottom = Math.min(bounds.height, top + newH)
      newH = bottom - top
      newWidth = Math.round(newH * aspectRatio)

      if (hasRight) {
        right = left + newWidth
      } else {
        left = right - newWidth
      }

      // Case: top or bottom handles
    } else if ((hasTop || hasBottom) && !(hasLeft || hasRight)) {
      const centerX = (left + right) / 2
      let newW = Math.round(newHeight * aspectRatio)
      const halfW = Math.floor(newW / 2)

      left = Math.max(0, centerX - halfW)
      right = Math.min(bounds.width, left + newW)
      newW = right - left
      newHeight = Math.round(newW / aspectRatio)

      if (hasBottom) {
        bottom = top + newHeight
      } else {
        top = bottom - newHeight
      }
    }
  }

  left = clampValue(left, 0, bounds.width)
  top = clampValue(top, 0, bounds.height)
  right = clampValue(right, left + minWidth, bounds.width)
  bottom = clampValue(bottom, top + minHeight, bounds.height)

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  }
}

export function computeMoveCrop(
  crop: Rect,
  delta: { x: number; y: number },
  bounds: { width: number; height: number },
): Rect {
  return {
    x: clampValue(crop.x + delta.x, 0, bounds.width - crop.width),
    y: clampValue(crop.y + delta.y, 0, bounds.height - crop.height),
    width: crop.width,
    height: crop.height,
  }
}
