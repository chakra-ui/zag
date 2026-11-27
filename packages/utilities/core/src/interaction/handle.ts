import type { CompassDirection } from "../geometry/compass"

export type HandlePlacement = CompassDirection

export type HandleEdge = "n" | "e" | "s" | "w"

/**
 * Whether a handle moves the given edge, so `hasEdge("ne", "e")` is true
 */
export const hasEdge = (handle: HandlePlacement, edge: HandleEdge): boolean => handle.includes(edge)

/**
 * Whether a handle sits on a corner, so it moves two edges
 */
export const isCorner = (handle: HandlePlacement): boolean => handle.length === 2

const CURSORS: Record<HandlePlacement, string> = {
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
export const handleCursor = (handle: HandlePlacement): string => CURSORS[handle]

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
export function handleStyle(handle: HandlePlacement, options: HandleStyleOptions = {}): HandleStyle {
  const { align = "inside", edgeLength = "100%" } = options
  // a centered handle straddles its edge; an inside one sits against it
  const start = align === "center" ? "-50%" : "0"
  const end = align === "center" ? "50%" : "0"
  const style: HandleStyle = { position: "absolute", cursor: handleCursor(handle) }

  let x = "-50%"
  if (hasEdge(handle, "w")) {
    style.left = 0
    x = start
  } else if (hasEdge(handle, "e")) {
    style.right = 0
    x = end
  } else {
    style.left = "50%"
    style.width = edgeLength
  }

  let y = "-50%"
  if (hasEdge(handle, "n")) {
    style.top = 0
    y = start
  } else if (hasEdge(handle, "s")) {
    style.bottom = 0
    y = end
  } else {
    style.top = "50%"
    style.height = edgeLength
  }

  if (x !== "0" || y !== "0") style.translate = `${x} ${y}`
  return style
}
