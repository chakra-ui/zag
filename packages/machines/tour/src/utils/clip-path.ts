import type { AnchorRect } from "@zag-js/popper"

interface CompositeRadius {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}

interface Options {
  rect: Required<AnchorRect>
  rootSize: { width: number; height: number }
  radius: number | CompositeRadius
}

export function getClipPath(options: Options) {
  const {
    radius = 0,
    rootSize: { width: w, height: h },
    rect: { width, height, x, y },
  } = options

  const {
    topLeft = 0,
    topRight = 0,
    bottomRight = 0,
    bottomLeft = 0,
  } = typeof radius === "number"
    ? { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius }
    : radius

  return `M${w},${h}\
  H0\
  V0\
  H${w}\
  V${h}\
  Z\
  M${x + topLeft},${y}\
  a${topLeft},${topLeft},0,0,0-${topLeft},${topLeft}\
  V${height + y - bottomLeft}\
  a${bottomLeft},${bottomLeft},0,0,0,${bottomLeft},${bottomLeft}\
  H${width + x - bottomRight}\
  a${bottomRight},${bottomRight},0,0,0,${bottomRight}-${bottomRight}\
  V${y + topRight}\
  a${topRight},${topRight},0,0,0-${topRight}-${topRight}\
  Z`
}
