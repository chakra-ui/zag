interface EnforceAspectRatioOptions {
  left: number
  top: number
  right: number
  bottom: number
  handlePosition: string
  bounds: { width: number; height: number }
  aspectRatio?: number
}

export function enforceAspectRatio(options: EnforceAspectRatioOptions) {
  const { bounds, aspectRatio } = options
  if (!aspectRatio || aspectRatio <= 0) return options

  let { left, top, right, bottom, handlePosition } = options
  let w = right - left
  let h = bottom - top

  const hasLeft = handlePosition.includes("left")
  const hasRight = handlePosition.includes("right")
  const hasTop = handlePosition.includes("top")
  const hasBottom = handlePosition.includes("bottom")

  // Keep the opposite corner fixed,
  // adjust dragged sides.
  if ((hasLeft || hasRight) && (hasTop || hasBottom)) {
    // Try deriving height from width; if it overflows, derive width from height.
    let newW = w
    let newH = Math.round(w / aspectRatio)
    if (newH > h || top + newH > bounds.height || left + newW > bounds.width) {
      newH = h
      newW = Math.round(h * aspectRatio)
    }

    if (hasRight && hasBottom) {
      right = left + newW
      bottom = top + newH
    } else if (hasRight && hasTop) {
      right = left + newW
      top = bottom - newH
    } else if (hasLeft && hasBottom) {
      left = right - newW
      bottom = top + newH
    } else if (hasLeft && hasTop) {
      left = right - newW
      top = bottom - newH
    }
  }
  // Horizontal edge only,
  // keep vertical center, expand height to match width/aspect.
  else if ((hasLeft || hasRight) && !(hasTop || hasBottom)) {
    const cy = (top + bottom) / 2
    let newH = Math.round(w / aspectRatio)
    let halfH = Math.floor(newH / 2)

    top = Math.max(0, cy - halfH)
    bottom = Math.min(bounds.height, top + newH)
    newH = bottom - top

    const newW = Math.round(newH * aspectRatio)
    if (hasRight) right = left + newW
    else left = right - newW
  }
  // Vertical edge only,
  // keep horizontal center, expand width to match height*aspect.
  else if ((hasTop || hasBottom) && !(hasLeft || hasRight)) {
    const cx = (left + right) / 2
    let newW = Math.round(h * aspectRatio)
    let halfW = Math.floor(newW / 2)

    left = Math.max(0, cx - halfW)
    right = Math.min(bounds.width, left + newW)
    newW = right - left

    const newH = Math.round(newW / aspectRatio)
    if (hasBottom) bottom = top + newH
    else top = bottom - newH
  }

  left = Math.max(0, Math.min(left, bounds.width))
  top = Math.max(0, Math.min(top, bounds.height))
  right = Math.max(left, Math.min(right, bounds.width))
  bottom = Math.max(top, Math.min(bottom, bounds.height))

  return { left, top, right, bottom }
}
