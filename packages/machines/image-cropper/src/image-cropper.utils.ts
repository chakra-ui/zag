import type { Point, Rect, Size } from "@zag-js/types"
import { clampValue } from "@zag-js/utils"
import type { HandlePosition, ImageCropperProps, ImageCropperSchema } from "./image-cropper.types"
import type { PropFn } from "@zag-js/core"

interface ResizeOptions {
  cropStart: Rect
  handlePosition: HandlePosition
  delta: { x: number; y: number }
  viewportRect: Size
  minSize: Size
  maxSize: Size
  aspectRatio?: number | undefined
}

interface HandleDirections {
  hasLeft: boolean
  hasRight: boolean
  hasTop: boolean
  hasBottom: boolean
}

interface SizeLimits {
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  hasAspect: boolean
}

interface ClampAspectParams {
  widthValue: number
  heightValue: number
  limits: SizeLimits
  viewportRect: Size
  aspectRatio: number
}

const getHandleDirections = (handlePosition: HandlePosition): HandleDirections => ({
  hasLeft: handlePosition.includes("left"),
  hasRight: handlePosition.includes("right"),
  hasTop: handlePosition.includes("top"),
  hasBottom: handlePosition.includes("bottom"),
})

const resolveSizeLimits = (options: {
  minSize: Size
  maxSize: Size
  viewportRect: Size
  aspectRatio?: number | undefined
}): SizeLimits => {
  const { minSize, maxSize, viewportRect, aspectRatio } = options

  let minWidth = Math.min(minSize.width, viewportRect.width)
  let minHeight = Math.min(minSize.height, viewportRect.height)

  let maxWidth = maxSize?.width ?? viewportRect.width
  if (!Number.isFinite(maxWidth)) maxWidth = viewportRect.width
  maxWidth = Math.min(maxWidth, viewportRect.width)

  let maxHeight = maxSize?.height ?? viewportRect.height
  if (!Number.isFinite(maxHeight)) maxHeight = viewportRect.height
  maxHeight = Math.min(maxHeight, viewportRect.height)

  maxWidth = Math.max(minWidth, maxWidth)
  maxHeight = Math.max(minHeight, maxHeight)

  const hasAspect = typeof aspectRatio === "number" && aspectRatio > 0

  if (hasAspect) {
    const ratio = aspectRatio!
    const minWidthWithAspect = Math.max(minWidth, minHeight * ratio)
    const minHeightWithAspect = minWidthWithAspect / ratio
    minWidth = Math.min(minWidthWithAspect, viewportRect.width)
    minHeight = Math.min(minHeightWithAspect, viewportRect.height)

    let constrainedMaxWidth = Math.min(maxWidth, maxHeight * ratio, viewportRect.width)
    let constrainedMaxHeight = constrainedMaxWidth / ratio

    if (constrainedMaxHeight > maxHeight || constrainedMaxHeight > viewportRect.height) {
      constrainedMaxHeight = Math.min(maxHeight, viewportRect.height)
      constrainedMaxWidth = constrainedMaxHeight * ratio
    }

    maxWidth = Math.max(minWidth, Math.min(constrainedMaxWidth, viewportRect.width))
    maxHeight = Math.max(minHeight, Math.min(constrainedMaxHeight, viewportRect.height))
  } else {
    maxWidth = Math.max(minWidth, Math.min(maxWidth, viewportRect.width))
    maxHeight = Math.max(minHeight, Math.min(maxHeight, viewportRect.height))
  }

  return { minWidth, minHeight, maxWidth, maxHeight, hasAspect }
}

const clampAspectSize = (params: ClampAspectParams): { width: number; height: number } => {
  const { widthValue, heightValue, limits, viewportRect, aspectRatio } = params
  const { minWidth, minHeight, maxWidth, maxHeight } = limits

  const clampByWidth = (value: number) => {
    let width = clampValue(value, minWidth, maxWidth)
    width = Math.min(width, viewportRect.width)
    let height = width / aspectRatio

    if (height < minHeight) {
      height = minHeight
      width = clampValue(height * aspectRatio, minWidth, maxWidth)
      width = Math.min(width, viewportRect.width)
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = Math.min(maxHeight, viewportRect.height)
      width = clampValue(height * aspectRatio, minWidth, maxWidth)
      width = Math.min(width, viewportRect.width)
      height = width / aspectRatio
    }

    if (height > viewportRect.height) {
      height = viewportRect.height
      width = clampValue(height * aspectRatio, minWidth, maxWidth)
      width = Math.min(width, viewportRect.width)
      height = width / aspectRatio
      if (height < minHeight) {
        height = minHeight
        width = clampValue(height * aspectRatio, minWidth, maxWidth)
        width = Math.min(width, viewportRect.width)
        height = width / aspectRatio
      }
    }

    return { width, height }
  }

  const clampByHeight = (value: number) => {
    let height = clampValue(value, minHeight, maxHeight)
    height = Math.min(height, viewportRect.height)
    let width = height * aspectRatio
    width = clampValue(width, minWidth, maxWidth)
    width = Math.min(width, viewportRect.width)
    let adjustedHeight = width / aspectRatio

    if (adjustedHeight < minHeight) {
      adjustedHeight = minHeight
      width = clampValue(adjustedHeight * aspectRatio, minWidth, maxWidth)
      width = Math.min(width, viewportRect.width)
      adjustedHeight = width / aspectRatio
    }

    if (adjustedHeight > maxHeight) {
      adjustedHeight = Math.min(maxHeight, viewportRect.height)
      width = clampValue(adjustedHeight * aspectRatio, minWidth, maxWidth)
      width = Math.min(width, viewportRect.width)
      adjustedHeight = width / aspectRatio
    }

    if (width > viewportRect.width) {
      width = viewportRect.width
      adjustedHeight = width / aspectRatio
      if (adjustedHeight > maxHeight) {
        adjustedHeight = Math.min(maxHeight, viewportRect.height)
        width = clampValue(adjustedHeight * aspectRatio, minWidth, maxWidth)
        width = Math.min(width, viewportRect.width)
        adjustedHeight = width / aspectRatio
      }
      if (adjustedHeight < minHeight) {
        adjustedHeight = minHeight
        width = clampValue(adjustedHeight * aspectRatio, minWidth, maxWidth)
        width = Math.min(width, viewportRect.width)
        adjustedHeight = width / aspectRatio
      }
    }

    return { width, height: adjustedHeight }
  }

  const byWidth = clampByWidth(widthValue)
  const byHeight = clampByHeight(heightValue)

  const deltaWidth = Math.abs(byWidth.width - widthValue) + Math.abs(byWidth.height - heightValue)
  const deltaHeight = Math.abs(byHeight.width - widthValue) + Math.abs(byHeight.height - heightValue)

  return deltaHeight < deltaWidth ? byHeight : byWidth
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
    viewportRect,
    aspectRatio,
  })

  const { hasLeft, hasRight, hasTop, hasBottom } = getHandleDirections(handlePosition)

  if (hasLeft) {
    const minLeft = Math.max(0, right - maxWidth)
    const maxLeft = right - minWidth
    left = clampValue(left + delta.x, minLeft, maxLeft)
  }

  if (hasRight) {
    const minRight = left + minWidth
    const maxRight = Math.min(viewportRect.width, left + maxWidth)
    right = clampValue(right + delta.x, minRight, maxRight)
  }

  if (hasTop) {
    const minTop = Math.max(0, bottom - maxHeight)
    const maxTop = bottom - minHeight
    top = clampValue(top + delta.y, minTop, maxTop)
  }

  if (hasBottom) {
    const minBottom = top + minHeight
    const maxBottom = Math.min(viewportRect.height, top + maxHeight)
    bottom = clampValue(bottom + delta.y, minBottom, maxBottom)
  }

  if (hasAspect) {
    let newWidth = right - left
    let newHeight = bottom - top

    if ((hasLeft || hasRight) && (hasTop || hasBottom)) {
      let tempW = newWidth
      let tempH = tempW / aspectRatio!

      if (tempH > newHeight || top + tempH > viewportRect.height || left + tempW > viewportRect.width) {
        tempH = newHeight
        tempW = tempH * aspectRatio!
      }

      const constrained = clampAspectSize({
        widthValue: tempW,
        heightValue: tempH,
        limits: { minWidth, minHeight, maxWidth, maxHeight, hasAspect },
        viewportRect,
        aspectRatio: aspectRatio!,
      })
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
      let nextHeight = nextWidth / aspectRatio!

      const constrained = clampAspectSize({
        widthValue: nextWidth,
        heightValue: nextHeight,
        limits: { minWidth, minHeight, maxWidth, maxHeight, hasAspect },
        viewportRect,
        aspectRatio: aspectRatio!,
      })
      nextWidth = constrained.width
      nextHeight = constrained.height

      const halfH = nextHeight / 2
      top = centerY - halfH
      bottom = centerY + halfH

      if (top < 0) {
        top = 0
        bottom = nextHeight
      }

      if (bottom > viewportRect.height) {
        bottom = viewportRect.height
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
      const constrained = clampAspectSize({
        widthValue: newWidth,
        heightValue: nextHeight,
        limits: { minWidth, minHeight, maxWidth, maxHeight, hasAspect },
        viewportRect,
        aspectRatio: aspectRatio!,
      })
      const nextWidth = constrained.width
      nextHeight = constrained.height

      const halfW = nextWidth / 2
      left = centerX - halfW
      right = centerX + halfW

      if (left < 0) {
        left = 0
        right = nextWidth
      }

      if (right > viewportRect.width) {
        right = viewportRect.width
        left = right - nextWidth
      }

      if (hasBottom) {
        bottom = top + nextHeight
      } else {
        top = bottom - nextHeight
      }
    }
  }

  const maxLeft = Math.max(0, viewportRect.width - minWidth)
  const maxTop = Math.max(0, viewportRect.height - minHeight)
  left = clampValue(left, 0, maxLeft)
  top = clampValue(top, 0, maxTop)

  const maxRight = Math.min(viewportRect.width, left + maxWidth)
  const maxBottom = Math.min(viewportRect.height, top + maxHeight)
  right = clampValue(right, left + minWidth, maxRight)
  bottom = clampValue(bottom, top + minHeight, maxBottom)

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
  viewportRect: { width: number; height: number },
): Rect {
  return {
    x: clampValue(cropStart.x + delta.x, 0, viewportRect.width - cropStart.width),
    y: clampValue(cropStart.y + delta.y, 0, viewportRect.height - cropStart.height),
    width: cropStart.width,
    height: cropStart.height,
  }
}

interface ClampOffsetParams {
  zoom: number
  rotation: number
  viewportRect: { width: number; height: number }
  offset: Point
  fixedCropArea?: boolean
  crop?: Rect
  naturalSize?: Size
}

export function clampOffset(params: ClampOffsetParams): Point {
  const { zoom, rotation, viewportRect, offset, fixedCropArea, crop, naturalSize } = params

  if (fixedCropArea && crop && naturalSize) {
    const theta = ((rotation % 360) * Math.PI) / 180
    const c = Math.abs(Math.cos(theta))
    const s = Math.abs(Math.sin(theta))

    const imgW = naturalSize.width * zoom
    const imgH = naturalSize.height * zoom

    const aabbW = imgW * c + imgH * s
    const aabbH = imgW * s + imgH * c

    const centerX = viewportRect.width / 2
    const centerY = viewportRect.height / 2

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

  const contentW = viewportRect.width * zoom
  const contentH = viewportRect.height * zoom

  const aabbW = contentW * c + contentH * s
  const aabbH = contentW * s + contentH * c

  const extraWidth = Math.max(0, aabbW - viewportRect.width)
  const extraHeight = Math.max(0, aabbH - viewportRect.height)

  const minX = -extraWidth / 2
  const maxX = extraWidth / 2
  const minY = -extraHeight / 2
  const maxY = extraHeight / 2

  return {
    x: clampValue(offset.x, minX, maxX),
    y: clampValue(offset.y, minY, maxY),
  }
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

  const { hasLeft, hasRight, hasTop, hasBottom } = getHandleDirections(handlePosition)

  const { minWidth, minHeight, maxWidth, maxHeight } = resolveSizeLimits({
    minSize,
    maxSize,
    viewportRect,
  })

  const isCorner = (hasLeft || hasRight) && (hasTop || hasBottom)

  if (key === "ArrowLeft") {
    if (hasLeft) {
      const newX = Math.max(0, nextCrop.x - step)
      const newWidth = crop.width + (crop.x - newX)
      if (newWidth <= maxWidth) {
        nextCrop.x = newX
        nextCrop.width = newWidth
      } else {
        nextCrop.x = crop.x + crop.width - maxWidth
        nextCrop.width = maxWidth
      }

      if (isCorner && hasTop) {
        const newY = Math.max(0, nextCrop.y - step)
        const newHeight = crop.height + (crop.y - newY)
        if (newHeight <= maxHeight) {
          nextCrop.y = newY
          nextCrop.height = newHeight
        } else {
          nextCrop.y = crop.y + crop.height - maxHeight
          nextCrop.height = maxHeight
        }
      } else if (isCorner && hasBottom) {
        const newHeight = nextCrop.height + step
        nextCrop.height = Math.min(viewportRect.height - nextCrop.y, Math.min(maxHeight, newHeight))
      }
    } else if (hasRight) {
      nextCrop.width = Math.max(minWidth, nextCrop.width - step)

      if (isCorner && hasTop) {
        const newY = Math.min(crop.y + step, crop.y + crop.height - minHeight)
        nextCrop.y = newY
        nextCrop.height = crop.height - (newY - crop.y)
      } else if (isCorner && hasBottom) {
        nextCrop.height = Math.max(minHeight, nextCrop.height - step)
      }
    }
  } else if (key === "ArrowRight") {
    if (hasLeft) {
      const newX = Math.min(crop.x + step, crop.x + crop.width - minWidth)
      nextCrop.x = newX
      nextCrop.width = crop.width - (newX - crop.x)

      if (isCorner && hasTop) {
        const newY = Math.min(crop.y + step, crop.y + crop.height - minHeight)
        nextCrop.y = newY
        nextCrop.height = crop.height - (newY - crop.y)
      } else if (isCorner && hasBottom) {
        nextCrop.height = Math.max(minHeight, nextCrop.height - step)
      }
    } else if (hasRight) {
      const newWidth = nextCrop.width + step
      nextCrop.width = Math.min(viewportRect.width - nextCrop.x, Math.min(maxWidth, newWidth))

      if (isCorner && hasTop) {
        const newY = Math.max(0, nextCrop.y - step)
        const newHeight = crop.height + (crop.y - newY)
        if (newHeight <= maxHeight) {
          nextCrop.y = newY
          nextCrop.height = newHeight
        } else {
          nextCrop.y = crop.y + crop.height - maxHeight
          nextCrop.height = maxHeight
        }
      } else if (isCorner && hasBottom) {
        const newHeight = nextCrop.height + step
        nextCrop.height = Math.min(viewportRect.height - nextCrop.y, Math.min(maxHeight, newHeight))
      }
    }
  }

  if (key === "ArrowUp") {
    if (hasTop) {
      const newY = Math.max(0, nextCrop.y - step)
      const newHeight = crop.height + (crop.y - newY)
      if (newHeight <= maxHeight) {
        nextCrop.y = newY
        nextCrop.height = newHeight
      } else {
        nextCrop.y = crop.y + crop.height - maxHeight
        nextCrop.height = maxHeight
      }

      if (isCorner && hasLeft) {
        const newX = Math.max(0, nextCrop.x - step)
        const newWidth = crop.width + (crop.x - newX)
        if (newWidth <= maxWidth) {
          nextCrop.x = newX
          nextCrop.width = newWidth
        } else {
          nextCrop.x = crop.x + crop.width - maxWidth
          nextCrop.width = maxWidth
        }
      } else if (isCorner && hasRight) {
        const newWidth = nextCrop.width + step
        nextCrop.width = Math.min(viewportRect.width - nextCrop.x, Math.min(maxWidth, newWidth))
      }
    } else if (hasBottom) {
      nextCrop.height = Math.max(minHeight, nextCrop.height - step)

      if (isCorner && hasLeft) {
        const newX = Math.min(crop.x + step, crop.x + crop.width - minWidth)
        nextCrop.x = newX
        nextCrop.width = crop.width - (newX - crop.x)
      } else if (isCorner && hasRight) {
        nextCrop.width = Math.max(minWidth, nextCrop.width - step)
      }
    }
  } else if (key === "ArrowDown") {
    if (hasTop) {
      const newY = Math.min(crop.y + step, crop.y + crop.height - minHeight)
      nextCrop.y = newY
      nextCrop.height = crop.height - (newY - crop.y)

      if (isCorner && hasLeft) {
        const newX = Math.min(crop.x + step, crop.x + crop.width - minWidth)
        nextCrop.x = newX
        nextCrop.width = crop.width - (newX - crop.x)
      } else if (isCorner && hasRight) {
        nextCrop.width = Math.max(minWidth, nextCrop.width - step)
      }
    } else if (hasBottom) {
      const newHeight = nextCrop.height + step
      nextCrop.height = Math.min(viewportRect.height - nextCrop.y, Math.min(maxHeight, newHeight))

      if (isCorner && hasLeft) {
        const newX = Math.max(0, nextCrop.x - step)
        const newWidth = crop.width + (crop.x - newX)
        if (newWidth <= maxWidth) {
          nextCrop.x = newX
          nextCrop.width = newWidth
        } else {
          nextCrop.x = crop.x + crop.width - maxWidth
          nextCrop.width = maxWidth
        }
      } else if (isCorner && hasRight) {
        const newWidth = nextCrop.width + step
        nextCrop.width = Math.min(viewportRect.width - nextCrop.x, Math.min(maxWidth, newWidth))
      }
    }
  }

  return nextCrop
}

export function getKeyboardMoveDelta(key: string, step: number): { x: number; y: number } {
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

export const resolveResizeDelta = (handlePosition: HandlePosition, delta: { x: number; y: number } | undefined) => {
  if (!delta) return null

  const xDirection = handlePosition.includes("left") || handlePosition.includes("right")
  const yDirection = handlePosition.includes("top") || handlePosition.includes("bottom")

  const resolved = {
    x: xDirection ? (delta.x ?? 0) : 0,
    y: yDirection ? (delta.y ?? 0) : 0,
  }

  if (resolved.x === 0 && resolved.y === 0) return null

  return resolved
}

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
  if (modifiers.ctrlKey || modifiers.metaKey) {
    return prop("nudgeStepCtrl")
  }
  if (modifiers.shiftKey) {
    return prop("nudgeStepShift")
  }
  return prop("nudgeStep")
}

const DEFAULT_VIEWPORT_FILL = 0.8

export const computeDefaultCropDimensions = (
  viewportRect: Size,
  aspectRatio: number | undefined,
  fixedCropArea: boolean,
): { width: number; height: number } => {
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
    const size = Math.min(viewportRect.width, viewportRect.height)
    return { width: size, height: size }
  }

  return { width: targetWidth, height: targetHeight }
}
