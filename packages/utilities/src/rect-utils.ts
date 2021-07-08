import { Point, PointDelta } from "./point-utils"

/**
 * A structure that contains the location and dimensions of a rectangle.
 */
export class Rect {
  height: number
  width: number
  x: number
  y: number

  /**
   * Creates a rectangle with the specified origin and size.
   */
  constructor(public value: Required<DOMRectInit>) {
    this.height = value.height
    this.width = value.width
    this.x = value.x
    this.y = value.y
  }

  /**
   * Creates a rectangle from an HTML element
   */
  static fromElement(element: HTMLElement) {
    return new Rect(element.getBoundingClientRect())
  }

  /**
   * Creates a rectangle from two points
   */
  static fromTwoPoints(a: Point, b: Point) {
    return new Rect({
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      width: Math.abs(a.x - b.x),
      height: Math.abs(a.y - b.y),
    })
  }

  /**
   * Returns the smallest value for the x-coordinate of the rectangle.
   */
  get minX() {
    return this.x
  }

  /**
   * Returns the x-coordinate that establishes the center of a rectangle.
   */
  get midX() {
    return this.x + this.width / 2
  }

  /**
   * Returns the largest value of the x-coordinate for the rectangle.
   */
  get maxX() {
    return this.x + this.width
  }

  /**
   * Returns the smallest value for the y-coordinate of the rectangle.
   */
  get minY() {
    return this.y
  }

  /**
   * Returns the y-coordinate that establishes the center of the rectangle.
   */
  get midY() {
    return this.y + this.height / 2
  }

  /**
   * Returns the largest value for the y-coordinate of the rectangle.
   */
  get maxY() {
    return this.y + this.height
  }

  /**
   * Returns the center point (x, y) of the rectangle
   */
  get centerPoint() {
    return new Point({ x: this.midX, y: this.midY })
  }

  /**
   * Returns the co-ordinates of the rectangle corners/edges
   */
  get cornerPoints() {
    return [
      { x: this.minX, y: this.minY },
      { x: this.minX, y: this.maxY },
      { x: this.maxX, y: this.minY },
      { x: this.maxX, y: this.maxY },
    ] as const
  }

  /**
   * Returns the mid-point values of the rectangle's edges
   */
  get midPoints() {
    const edge1 = { x: this.midX, y: this.minY }
    const edge2 = { x: this.maxX, y: this.midY }
    const edge3 = { x: this.midX, y: this.maxY }
    const edge4 = { x: this.minX, y: this.midY }
    return [edge1, edge2, edge3, edge4] as const
  }

  /**
   * Returns the aspect ratio of the rectangle
   */
  get aspectRatio() {
    return this.width / this.height
  }

  /**
   * Returns whether a rectangle contains a specified point.
   */
  containsPoint(point: Point) {
    if (point.x < this.minX) return false
    if (point.x > this.maxX) return false

    if (point.y < this.minY) return false
    if (point.y > this.maxY) return false

    if (isNaN(this.x)) return false
    if (isNaN(this.y)) return false

    return true
  }

  /**
   * Returns the distance of a rect from a point
   */
  distanceFromPoint(point: Point) {
    let x = 0
    let y = 0

    if (point.x < this.x) {
      x = this.x - point.x
    } else if (point.x > this.maxX) {
      x = point.x - this.maxX
    }

    if (point.y < this.y) {
      y = this.y - point.y
    } else if (point.y > this.maxY) {
      y = point.y - this.maxY
    }

    const to = new Point({ x, y })
    return Point.distance(Point.zero, to)
  }

  /**
   * Returns a new rectangle with its origin shifted by the specified delta
   */
  shiftBy(delta: PointDelta) {
    const xOffset = typeof delta.dx === "number" ? delta.dx : 0
    const yOffset = typeof delta.dy === "number" ? delta.dy : 0
    return new Rect({
      width: this.width,
      height: this.height,
      x: this.x + xOffset,
      y: this.y + yOffset,
    })
  }

  /**
   * Returns a string representation of the rect
   */
  toString() {
    return `Rect: [x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height}]`
  }
}
