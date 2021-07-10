import { isTouchEvent } from "./assertion"

const defaultPagePoint = { pageX: 0, pageY: 0 }

export type PointType = "page" | "client"

export type PointDelta = {
  dx: number
  dy: number
}

export type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent

export type PointValue = {
  x: number
  y: number
}

/**
 * A structure that contains a point in a two-dimensional coordinate system.
 */
export class Point {
  // The x-coordinate of the point.
  x: number
  // The y-coordinate of the point.
  y: number
  // The x-progress relative to another point
  xPercent = 1
  // The y-progress relative to another point
  yPercent = 1

  /**
   * Creates a point with the specified `x` and `y` values.
   */
  constructor(point: PointValue) {
    this.x = point.x
    this.y = point.y
  }

  /**
   * The point details as an object
   */
  get value(): PointValue {
    return { x: this.x, y: this.y }
  }

  /**
   * Returns a point instance from a touch event
   */
  static fromTouchEvent(event: TouchEvent, pointType: PointType = "page") {
    const primaryTouch = event.touches[0] || event.changedTouches[0]
    const point = primaryTouch || defaultPagePoint

    return new Point({
      x: point[`${pointType}X`],
      y: point[`${pointType}Y`],
    })
  }

  /**
   * Returns a point instance from a mouse event
   */
  static fromMouseEvent(
    event: MouseEvent | PointerEvent,
    pointType: PointType = "page",
  ) {
    return new Point({
      x: event[`${pointType}X`],
      y: event[`${pointType}Y`],
    })
  }

  /**
   * Returns a point instance from a pointer event
   */
  static fromPointerEvent(
    event: AnyPointerEvent,
    pointType: PointType = "page",
  ) {
    return isTouchEvent(event)
      ? Point.fromTouchEvent(event, pointType)
      : Point.fromMouseEvent(event, pointType)
  }

  /**
   * Returns a the distance between two points
   */
  static distance(a: Point, b: Point) {
    const deltaX = Math.abs(a.x - b.x)
    const deltaY = Math.abs(a.y - b.y)
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  }

  /**
   * The point with values (0,0).
   */
  static zero = new Point({ x: 0, y: 0 })

  /**
   * Returns a function used to check the closest point
   * from a list of points
   */
  static closest(...points: Point[]) {
    return (pointToCheck: Point) => {
      const distances = points.map((point) =>
        Point.distance(point, pointToCheck),
      )
      const closestDistance = Math.min(...distances)
      return distances.indexOf(closestDistance)
    }
  }

  /**
   * Returns the angle between two points
   */
  static angle(a: Point, b: Point) {
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90
  }

  /**
   * Returns a the distance from another point
   */
  distance(point?: Point) {
    return Point.distance(this, point ?? Point.zero)
  }

  /**
   * Returns a point coordinates relative to an HTMLELement
   */
  relativeToNode(el: HTMLElement) {
    const rect = el.getBoundingClientRect()
    const { width, height } = rect

    const left = rect.left - el.clientLeft + el.scrollLeft
    const top = rect.top - el.clientTop + el.scrollTop

    const x = this.x - left
    const y = this.y - top

    return new Point({ x, y }).percent({
      xLength: width,
      yLength: height,
    })
  }

  private percent(options: { xLength: number; yLength: number }) {
    const { xLength, yLength } = options
    this.xPercent = this.x / xLength
    this.yPercent = this.y / yLength
    return this
  }

  /**
   * Returns a string representation of the point
   */
  toString() {
    return `Point: [x: ${this.x}, y: ${this.y}]`
  }
}
