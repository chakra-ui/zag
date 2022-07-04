import type { RectEdge, RectValue } from "./types"

const point = (x: number, y: number) => ({ x, y })

export class Rect {
  static create(v: RectValue) {
    return new Rect(v)
  }
  protected constructor(private v: RectValue) {}
  set(n: Partial<RectValue>) {
    return new Rect(Object.assign({}, this.v, n))
  }
  clone() {
    return new Rect(this.v)
  }
  get x() {
    return this.v.x
  }
  get y() {
    return this.v.y
  }
  get width() {
    return this.v.width
  }
  get height() {
    return this.v.height
  }
  get minX() {
    return this.v.x
  }
  get midX() {
    return this.v.x + this.v.width / 2
  }
  get maxX() {
    return this.v.x + this.v.width
  }
  get minY() {
    return this.v.y
  }
  get midY() {
    return this.v.y + this.v.height / 2
  }
  get maxY() {
    return this.v.y + this.v.height
  }
  get center() {
    return point(this.midX, this.midY)
  }
  get centers() {
    const top = point(this.midX, this.minY)
    const right = point(this.maxX, this.midY)
    const bottom = point(this.midX, this.maxY)
    const left = point(this.minX, this.midY)
    return { top, right, bottom, left }
  }
  get corners() {
    const top = point(this.minX, this.minY)
    const right = point(this.maxX, this.minY)
    const bottom = point(this.maxX, this.maxY)
    const left = point(this.minX, this.maxY)
    return { top, right, bottom, left }
  }

  get edges() {
    const c = this.corners
    const top: RectEdge = [c.top, c.right]
    const right: RectEdge = [c.right, c.bottom]
    const bottom: RectEdge = [c.left, c.bottom]
    const left: RectEdge = [c.top, c.left]
    return { top, right, bottom, left }
  }
}
