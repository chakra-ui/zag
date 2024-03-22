import type { Point } from "./types"

export class AffineTransform {
  m00: number
  m01: number
  m02: number
  m10: number
  m11: number
  m12: number

  constructor([m00, m01, m02, m10, m11, m12]: Iterable<number> = [0, 0, 0, 0, 0, 0]) {
    this.m00 = m00
    this.m01 = m01
    this.m02 = m02
    this.m10 = m10
    this.m11 = m11
    this.m12 = m12
  }

  applyTo(point: Point): Point {
    const { x, y } = point
    const { m00, m01, m02, m10, m11, m12 } = this

    return {
      x: m00 * x + m01 * y + m02,
      y: m10 * x + m11 * y + m12,
    }
  }

  prepend(other: AffineTransform): AffineTransform {
    return new AffineTransform([
      this.m00 * other.m00 + this.m01 * other.m10, // m00
      this.m00 * other.m01 + this.m01 * other.m11, // m01
      this.m00 * other.m02 + this.m01 * other.m12 + this.m02, // m02
      this.m10 * other.m00 + this.m11 * other.m10, // m10
      this.m10 * other.m01 + this.m11 * other.m11, // m11
      this.m10 * other.m02 + this.m11 * other.m12 + this.m12, // m12
    ])
  }

  append(other: AffineTransform): AffineTransform {
    return new AffineTransform([
      other.m00 * this.m00 + other.m01 * this.m10, // m00
      other.m00 * this.m01 + other.m01 * this.m11, // m01
      other.m00 * this.m02 + other.m01 * this.m12 + other.m02, // m02
      other.m10 * this.m00 + other.m11 * this.m10, // m10
      other.m10 * this.m01 + other.m11 * this.m11, // m11
      other.m10 * this.m02 + other.m11 * this.m12 + other.m12, // m12
    ])
  }

  get determinant() {
    return this.m00 * this.m11 - this.m01 * this.m10
  }

  get isInvertible() {
    const det = this.determinant

    return isFinite(det) && isFinite(this.m02) && isFinite(this.m12) && det !== 0
  }

  invert() {
    const det = this.determinant

    return new AffineTransform([
      this.m11 / det, // m00
      -this.m01 / det, // m01
      (this.m01 * this.m12 - this.m11 * this.m02) / det, // m02
      -this.m10 / det, // m10
      this.m00 / det, // m11
      (this.m10 * this.m02 - this.m00 * this.m12) / det, // m12
    ])
  }

  get array(): number[] {
    return [this.m00, this.m01, this.m02, this.m10, this.m11, this.m12, 0, 0, 1]
  }

  get float32Array(): Float32Array {
    return new Float32Array(this.array)
  }

  // Static

  static get identity(): AffineTransform {
    return new AffineTransform([1, 0, 0, 0, 1, 0])
  }

  static rotate(theta: number, origin?: Point): AffineTransform {
    const rotation = new AffineTransform([Math.cos(theta), -Math.sin(theta), 0, Math.sin(theta), Math.cos(theta), 0])

    if (origin && (origin.x !== 0 || origin.y !== 0)) {
      return AffineTransform.multiply(
        AffineTransform.translate(origin.x, origin.y),
        rotation,
        AffineTransform.translate(-origin.x, -origin.y),
      )
    }

    return rotation
  }

  rotate: (typeof AffineTransform)["rotate"] = (...args) => {
    return this.prepend(AffineTransform.rotate(...args))
  }

  static scale(sx: number, sy: number = sx, origin: Point = { x: 0, y: 0 }): AffineTransform {
    const scale = new AffineTransform([sx, 0, 0, 0, sy, 0])

    if (origin.x !== 0 || origin.y !== 0) {
      return AffineTransform.multiply(
        AffineTransform.translate(origin.x, origin.y),
        scale,
        AffineTransform.translate(-origin.x, -origin.y),
      )
    }

    return scale
  }

  scale: (typeof AffineTransform)["scale"] = (...args) => {
    return this.prepend(AffineTransform.scale(...args))
  }

  static translate(tx: number, ty: number): AffineTransform {
    return new AffineTransform([1, 0, tx, 0, 1, ty])
  }

  translate: (typeof AffineTransform)["translate"] = (...args) => {
    return this.prepend(AffineTransform.translate(...args))
  }

  static multiply(...[first, ...rest]: AffineTransform[]): AffineTransform {
    if (!first) return AffineTransform.identity
    return rest.reduce((result, item) => result.prepend(item), first)
  }

  get a() {
    return this.m00
  }

  get b() {
    return this.m10
  }

  get c() {
    return this.m01
  }

  get d() {
    return this.m11
  }

  get tx() {
    return this.m02
  }

  get ty() {
    return this.m12
  }

  get scaleComponents(): Point {
    return { x: this.a, y: this.d }
  }

  get translationComponents(): Point {
    return { x: this.tx, y: this.ty }
  }

  get skewComponents(): Point {
    return { x: this.c, y: this.b }
  }

  toString() {
    return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.tx}, ${this.ty})`
  }
}
