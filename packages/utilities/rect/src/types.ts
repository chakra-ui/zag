/* -----------------------------------------------------------------------------
 * Basic
 * -----------------------------------------------------------------------------*/

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Bounds {
  minX: number
  midX: number
  maxX: number
  minY: number
  midY: number
  maxY: number
}

export interface CenterPoint {
  center: Point
}

export interface RectInit extends Point, Size {}

export interface Rect extends Point, Size, Bounds, CenterPoint {}

/* -----------------------------------------------------------------------------
 * Edge and Side
 * -----------------------------------------------------------------------------*/

export type RectSide = "top" | "right" | "bottom" | "left"

export type RectPoint =
  | "top-left"
  | "top-center"
  | "top-right"
  | "right-center"
  | "left-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"
  | "center"

export type RectEdge = [Point, Point]

export type RectPoints = [Point, Point, Point, Point]

export type RectEdges = Record<RectSide, RectEdge> & {
  value: RectEdge[]
}

export type RectCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight"

export type RectCorners = Record<RectCorner, Point> & {
  value: RectPoints
}

export type RectCenter = "topCenter" | "rightCenter" | "leftCenter" | "bottomCenter"

export type RectCenters = Record<RectCenter, Point> & {
  value: RectPoints
}

export type RectInset = Partial<Record<RectSide, number>>

export interface SymmetricRectInset {
  dx?: number
  dy?: number
}

export interface ScalingOptions {
  scalingOriginMode: "center" | "extent"
  lockAspectRatio: boolean
}

/* -----------------------------------------------------------------------------
 * Alignment
 * -----------------------------------------------------------------------------*/

export interface AlignOptions {
  h: HAlign
  v: VAlign
}

export type HAlign = "left-inside" | "left-outside" | "center" | "right-inside" | "right-outside"

export type VAlign = "top-inside" | "top-outside" | "center" | "bottom-inside" | "bottom-outside"
