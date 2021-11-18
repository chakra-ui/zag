import type { Point } from "@ui-machines/point-utils"

export type RectValue = {
  x: number
  y: number
  width: number
  height: number
}

export type RectDerivedValue = {
  area: number
  minX: number
  midX: number
  maxX: number
  minY: number
  midY: number
  maxY: number
}

export type Rect = RectValue & RectDerivedValue

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
