import type { CompassDirection } from "../geometry/compass"

export type HandlePosition = CompassDirection

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
const CURSORS: Record<HandlePosition, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
}

/**
 * The resize cursor for a handle. It points both ways, since a handle can grow or shrink the box.
 */
export const getHandleCursor = (handle: HandlePosition): string => CURSORS[handle]

export interface HandleStyleOptions {
  /**
   * `"inside"` keeps the handle within the box's edge; `"center"` centers it on the edge.
   * @default "inside"
   */
  align?: "inside" | "center" | undefined
  /**
   * The length of an edge handle along its edge.
   * @default "100%"
   */
  edgeLength?: string | undefined
}

// a type alias, not an interface, so it fits style records with an index signature
export type HandleStyle = {
  position: "absolute"
  cursor: string
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
  width?: string
  height?: string
  translate?: string
}

/**
 * Places a resize handle on its edge or corner of a positioned box.
 */
export function getHandleStyle(handle: HandlePosition, options: HandleStyleOptions = {}): HandleStyle {
  const { align = "inside", edgeLength = "100%" } = options
  // a centered handle straddles its edge; an inside one sits against it
  const start = align === "center" ? "-50%" : "0"
  const end = align === "center" ? "50%" : "0"
  const style: HandleStyle = { position: "absolute", cursor: getHandleCursor(handle) }

  let x = "-50%"
  if (isLeftHandle(handle)) {
    style.left = 0
    x = start
  } else if (isRightHandle(handle)) {
    style.right = 0
    x = end
  } else {
    style.left = "50%"
    style.width = edgeLength
  }

  let y = "-50%"
  if (isTopHandle(handle)) {
    style.top = 0
    y = start
  } else if (isBottomHandle(handle)) {
    style.bottom = 0
    y = end
  } else {
    style.top = "50%"
    style.height = edgeLength
  }

  if (x !== "0" || y !== "0") style.translate = `${x} ${y}`
  return style
}
