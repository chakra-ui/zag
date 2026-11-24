import type { Point, Rect, Size } from "@zag-js/types"
import type { CropSourcePoints, FlipState } from "../image-cropper.types"

const { min, max, abs, PI, cos, sin } = Math

export interface Matrix {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

interface ImageTransformParams {
  zoom: number
  offset: Point
  rotation: number
  flip: FlipState
}

export interface CropExportParams extends ImageTransformParams {
  crop: Rect
  imageRect: Rect
  naturalSize: Size
}

interface ViewportToNaturalParams extends ImageTransformParams {
  point: Point
  imageRect: Rect
  naturalSize: Size
}

export function getImageTransform(params: ImageTransformParams): Matrix {
  const { zoom, offset, rotation, flip } = params
  const theta = ((rotation % 360) * PI) / 180
  const safeZoom = zoom > 0 ? zoom : 1
  const scaleX = safeZoom * (flip.horizontal ? -1 : 1)
  const scaleY = safeZoom * (flip.vertical ? -1 : 1)

  return {
    a: cos(theta) * scaleX,
    b: sin(theta) * scaleX,
    c: -sin(theta) * scaleY,
    d: cos(theta) * scaleY,
    e: offset.x,
    f: offset.y,
  }
}

export function getImageTransformCss(params: ImageTransformParams): string {
  const { a, b, c, d, e, f } = getImageTransform(params)
  return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`
}

export function getNaturalToViewportMatrix(params: Omit<CropExportParams, "crop">): Matrix {
  const { imageRect, naturalSize } = params
  const transform = getImageTransform(params)
  const imageWidth = imageRect.width > 0 ? imageRect.width : naturalSize.width || 1
  const imageHeight = imageRect.height > 0 ? imageRect.height : naturalSize.height || 1
  const naturalWidth = naturalSize.width || imageWidth
  const naturalHeight = naturalSize.height || imageHeight
  const scaleX = imageWidth / naturalWidth
  const scaleY = imageHeight / naturalHeight
  const a = transform.a * scaleX
  const b = transform.b * scaleX
  const c = transform.c * scaleY
  const d = transform.d * scaleY
  const centerX = imageRect.x + imageWidth / 2
  const centerY = imageRect.y + imageHeight / 2
  const naturalCenterX = naturalWidth / 2
  const naturalCenterY = naturalHeight / 2

  return {
    a,
    b,
    c,
    d,
    e: centerX + transform.e - a * naturalCenterX - c * naturalCenterY,
    f: centerY + transform.f - b * naturalCenterX - d * naturalCenterY,
  }
}

function transformPoint(matrix: Matrix, point: Point): Point {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  }
}

function invertMatrix(matrix: Matrix): Matrix {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c
  return {
    a: matrix.d / determinant,
    b: -matrix.b / determinant,
    c: -matrix.c / determinant,
    d: matrix.a / determinant,
    e: (matrix.c * matrix.f - matrix.d * matrix.e) / determinant,
    f: (matrix.b * matrix.e - matrix.a * matrix.f) / determinant,
  }
}

export function viewportToNaturalPoint(params: ViewportToNaturalParams): Point {
  const matrix = getNaturalToViewportMatrix(params)
  return transformPoint(invertMatrix(matrix), params.point)
}

export function getCropSourcePoints(params: CropExportParams): CropSourcePoints {
  const { crop } = params
  const map = (point: Point) => viewportToNaturalPoint({ ...params, point })

  return {
    topLeft: map({ x: crop.x, y: crop.y }),
    topRight: map({ x: crop.x + crop.width, y: crop.y }),
    bottomRight: map({ x: crop.x + crop.width, y: crop.y + crop.height }),
    bottomLeft: map({ x: crop.x, y: crop.y + crop.height }),
  }
}

/**
 * The crop in the image's own pixels, measured after the image is flipped and then rotated,
 * so it stays an exact rectangle under any rotation.
 */
export function getCropRect(params: CropExportParams): Rect {
  const { naturalSize, imageRect, rotation, flip } = params
  const theta = ((rotation % 360) * PI) / 180
  const c = cos(theta)
  const s = sin(theta)
  const width = naturalSize.width || imageRect.width
  const height = naturalSize.height || imageRect.height
  const turnedWidth = width * abs(c) + height * abs(s)
  const turnedHeight = width * abs(s) + height * abs(c)

  const points = Object.values(getCropSourcePoints(params)).map((point) => {
    const x = (point.x - width / 2) * (flip.horizontal ? -1 : 1)
    const y = (point.y - height / 2) * (flip.vertical ? -1 : 1)
    return { x: c * x - s * y + turnedWidth / 2, y: s * x + c * y + turnedHeight / 2 }
  })

  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const x = min(...xs)
  const y = min(...ys)
  return { x, y, width: max(...xs) - x, height: max(...ys) - y }
}
