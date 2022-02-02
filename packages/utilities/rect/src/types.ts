export type Point = { x: number; y: number }

export type RectValue = {
  x: number
  y: number
  width: number
  height: number
}

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

export type SymmetricRectInset = { dx?: number; dy?: number }
