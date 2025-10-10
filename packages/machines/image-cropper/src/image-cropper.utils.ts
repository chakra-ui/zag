import type { Point, Rect, Size } from "@zag-js/types"
import { clampValue } from "@zag-js/utils"
import type { HandlePosition } from "./image-cropper.types"

interface ResizeOptions {
  cropStart: Rect
  handlePosition: HandlePosition
  delta: { x: number; y: number }
  bounds: Size
  minSize: Size
  maxSize?: Size
  aspectRatio?: number | undefined
}

export function computeResizeCrop(options: ResizeOptions): Rect {
  const { cropStart, handlePosition, delta, bounds, minSize, maxSize, aspectRatio } = options
  let { x, y, width, height } = cropStart
  let left = x
  let top = y
  let right = x + width
  let bottom = y + height

  const hasAspect = typeof aspectRatio === "number" && aspectRatio > 0

  let minWidth = Math.min(minSize.width, bounds.width)
  let minHeight = Math.min(minSize.height, bounds.height)

  let maxWidth = maxSize?.width ?? bounds.width
  if (!Number.isFinite(maxWidth)) maxWidth = bounds.width
  maxWidth = Math.min(maxWidth, bounds.width)

  let maxHeight = maxSize?.height ?? bounds.height
  if (!Number.isFinite(maxHeight)) maxHeight = bounds.height
  maxHeight = Math.min(maxHeight, bounds.height)

  maxWidth = Math.max(minWidth, maxWidth)
  maxHeight = Math.max(minHeight, maxHeight)

  if (hasAspect) {
    const mw = Math.max(minWidth, minHeight * aspectRatio)
    const mh = mw / aspectRatio
    minWidth = Math.min(mw, bounds.width)
    minHeight = Math.min(mh, bounds.height)

    let constrainedMaxWidth = Math.min(maxWidth, maxHeight * aspectRatio, bounds.width)
    let constrainedMaxHeight = constrainedMaxWidth / aspectRatio

    if (constrainedMaxHeight > maxHeight || constrainedMaxHeight > bounds.height) {
      constrainedMaxHeight = Math.min(maxHeight, bounds.height)
      constrainedMaxWidth = constrainedMaxHeight * aspectRatio
    }

    maxWidth = Math.max(minWidth, Math.min(constrainedMaxWidth, bounds.width))
    maxHeight = Math.max(minHeight, Math.min(constrainedMaxHeight, bounds.height))
  } else {
    maxWidth = Math.max(minWidth, Math.min(maxWidth, bounds.width))
    maxHeight = Math.max(minHeight, Math.min(maxHeight, bounds.height))
  }

  const hasLeft = handlePosition.includes("left")
  const hasRight = handlePosition.includes("right")
  const hasTop = handlePosition.includes("top")
  const hasBottom = handlePosition.includes("bottom")

  if (hasLeft) {
    const minLeft = Math.max(0, right - maxWidth)
    const maxLeft = right - minWidth
    left = clampValue(left + delta.x, minLeft, maxLeft)
  }

  if (hasRight) {
    const minRight = left + minWidth
    const maxRight = Math.min(bounds.width, left + maxWidth)
    right = clampValue(right + delta.x, minRight, maxRight)
  }

  if (hasTop) {
    const minTop = Math.max(0, bottom - maxHeight)
    const maxTop = bottom - minHeight
    top = clampValue(top + delta.y, minTop, maxTop)
  }

  if (hasBottom) {
    const minBottom = top + minHeight
    const maxBottom = Math.min(bounds.height, top + maxHeight)
    bottom = clampValue(bottom + delta.y, minBottom, maxBottom)
  }

  if (hasAspect) {
    const clampAspectSize = (widthValue: number, heightValue: number) => {
      const clampByWidth = (value: number) => {
        let w = clampValue(value, minWidth, maxWidth)
        w = Math.min(w, bounds.width)
        let h = w / aspectRatio

        if (h < minHeight) {
          h = minHeight
          w = clampValue(h * aspectRatio, minWidth, maxWidth)
          w = Math.min(w, bounds.width)
          h = w / aspectRatio
        }

        if (h > maxHeight) {
          h = Math.min(maxHeight, bounds.height)
          w = clampValue(h * aspectRatio, minWidth, maxWidth)
          w = Math.min(w, bounds.width)
          h = w / aspectRatio
        }

        if (h > bounds.height) {
          h = bounds.height
          w = clampValue(h * aspectRatio, minWidth, maxWidth)
          w = Math.min(w, bounds.width)
          h = w / aspectRatio
          if (h < minHeight) {
            h = minHeight
            w = clampValue(h * aspectRatio, minWidth, maxWidth)
            w = Math.min(w, bounds.width)
            h = w / aspectRatio
          }
        }

        return { width: w, height: h }
      }

      const clampByHeight = (value: number) => {
        let h = clampValue(value, minHeight, maxHeight)
        h = Math.min(h, bounds.height)
        let w = h * aspectRatio
        w = clampValue(w, minWidth, maxWidth)
        w = Math.min(w, bounds.width)
        let adjustedH = w / aspectRatio

        if (adjustedH < minHeight) {
          adjustedH = minHeight
          w = clampValue(adjustedH * aspectRatio, minWidth, maxWidth)
          w = Math.min(w, bounds.width)
          adjustedH = w / aspectRatio
        }

        if (adjustedH > maxHeight) {
          adjustedH = Math.min(maxHeight, bounds.height)
          w = clampValue(adjustedH * aspectRatio, minWidth, maxWidth)
          w = Math.min(w, bounds.width)
          adjustedH = w / aspectRatio
        }

        if (w > bounds.width) {
          w = bounds.width
          adjustedH = w / aspectRatio
          if (adjustedH > maxHeight) {
            adjustedH = Math.min(maxHeight, bounds.height)
            w = clampValue(adjustedH * aspectRatio, minWidth, maxWidth)
            w = Math.min(w, bounds.width)
            adjustedH = w / aspectRatio
          }
          if (adjustedH < minHeight) {
            adjustedH = minHeight
            w = clampValue(adjustedH * aspectRatio, minWidth, maxWidth)
            w = Math.min(w, bounds.width)
            adjustedH = w / aspectRatio
          }
        }

        return { width: w, height: adjustedH }
      }

      const byWidth = clampByWidth(widthValue)
      const byHeight = clampByHeight(heightValue)

      const deltaWidth = Math.abs(byWidth.width - widthValue) + Math.abs(byWidth.height - heightValue)
      const deltaHeight = Math.abs(byHeight.width - widthValue) + Math.abs(byHeight.height - heightValue)

      return deltaHeight < deltaWidth ? byHeight : byWidth
    }

    let newWidth = right - left
    let newHeight = bottom - top

    if ((hasLeft || hasRight) && (hasTop || hasBottom)) {
      let tempW = newWidth
      let tempH = tempW / aspectRatio

      if (tempH > newHeight || top + tempH > bounds.height || left + tempW > bounds.width) {
        tempH = newHeight
        tempW = tempH * aspectRatio
      }

      const constrained = clampAspectSize(tempW, tempH)
      tempW = constrained.width
      tempH = constrained.height

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
    } else if ((hasLeft || hasRight) && !(hasTop || hasBottom)) {
      const centerY = (top + bottom) / 2
      let nextWidth = newWidth
      let nextHeight = nextWidth / aspectRatio

      const constrained = clampAspectSize(nextWidth, nextHeight)
      nextWidth = constrained.width
      nextHeight = constrained.height

      const halfH = nextHeight / 2
      top = centerY - halfH
      bottom = centerY + halfH

      if (top < 0) {
        top = 0
        bottom = nextHeight
      }

      if (bottom > bounds.height) {
        bottom = bounds.height
        top = bottom - nextHeight
      }

      if (hasRight) {
        right = left + nextWidth
      } else {
        left = right - nextWidth
      }
    } else if ((hasTop || hasBottom) && !(hasLeft || hasRight)) {
      const centerX = (left + right) / 2
      let nextHeight = newHeight
      const constrained = clampAspectSize(newWidth, nextHeight)
      const nextWidth = constrained.width
      nextHeight = constrained.height

      const halfW = nextWidth / 2
      left = centerX - halfW
      right = centerX + halfW

      if (left < 0) {
        left = 0
        right = nextWidth
      }

      if (right > bounds.width) {
        right = bounds.width
        left = right - nextWidth
      }

      if (hasBottom) {
        bottom = top + nextHeight
      } else {
        top = bottom - nextHeight
      }
    }
  }

  const maxLeft = Math.max(0, bounds.width - minWidth)
  const maxTop = Math.max(0, bounds.height - minHeight)
  left = clampValue(left, 0, maxLeft)
  top = clampValue(top, 0, maxTop)

  if (hasAspect) {
    const maxRight = Math.min(bounds.width, left + maxWidth)
    const maxBottom = Math.min(bounds.height, top + maxHeight)
    right = clampValue(right, left + minWidth, maxRight)
    bottom = clampValue(bottom, top + minHeight, maxBottom)
  } else {
    const maxRight = Math.min(bounds.width, left + maxWidth)
    const maxBottom = Math.min(bounds.height, top + maxHeight)
    right = clampValue(right, left + minWidth, maxRight)
    bottom = clampValue(bottom, top + minHeight, maxBottom)
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

interface ClampOffsetParams {
  zoom: number
  rotation: number
  bounds: { width: number; height: number }
  offset: Point
  fixedCropArea?: boolean
  crop?: Rect
  naturalSize?: Size
}

export function clampOffset(params: ClampOffsetParams): Point {
  const { zoom, rotation, bounds, offset, fixedCropArea, crop, naturalSize } = params

  if (fixedCropArea && crop && naturalSize) {
    const theta = ((rotation % 360) * Math.PI) / 180
    const c = Math.abs(Math.cos(theta))
    const s = Math.abs(Math.sin(theta))

    const imgW = naturalSize.width * zoom
    const imgH = naturalSize.height * zoom

    const aabbW = imgW * c + imgH * s
    const aabbH = imgW * s + imgH * c

    const centerX = bounds.width / 2
    const centerY = bounds.height / 2

    const cropLeft = crop.x
    const cropRight = crop.x + crop.width
    const cropTop = crop.y
    const cropBottom = crop.y + crop.height

    const minX = cropRight - centerX - aabbW / 2
    const maxX = cropLeft - centerX + aabbW / 2
    const minY = cropBottom - centerY - aabbH / 2
    const maxY = cropTop - centerY + aabbH / 2

    return {
      x: clampValue(offset.x, minX, maxX),
      y: clampValue(offset.y, minY, maxY),
    }
  }

  const theta = ((rotation % 360) * Math.PI) / 180
  const c = Math.abs(Math.cos(theta))
  const s = Math.abs(Math.sin(theta))

  const contentW = bounds.width * zoom
  const contentH = bounds.height * zoom

  const aabbW = contentW * c + contentH * s
  const aabbH = contentW * s + contentH * c

  const extraWidth = Math.max(0, aabbW - bounds.width)
  const extraHeight = Math.max(0, aabbH - bounds.height)

  const minX = -extraWidth / 2
  const maxX = extraWidth / 2
  const minY = -extraHeight / 2
  const maxY = extraHeight / 2

  return {
    x: clampValue(offset.x, minX, maxX),
    y: clampValue(offset.y, minY, maxY),
  }
}
