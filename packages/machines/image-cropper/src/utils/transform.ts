import type { Point, Rect, Size } from "@zag-js/types"
import type { CropSourcePoints, FlipState } from "../image-cropper.types"

const { min, max, round, PI, cos, sin } = Math

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

export function getCropSourceRect(params: CropExportParams): Rect {
  const points = Object.values(getCropSourcePoints(params))
  let minX = points[0].x
  let maxX = points[0].x
  let minY = points[0].y
  let maxY = points[0].y

  for (const point of points) {
    minX = min(minX, point.x)
    maxX = max(maxX, point.x)
    minY = min(minY, point.y)
    maxY = max(maxY, point.y)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function getNaturalCropSize(
  params: Pick<CropExportParams, "crop" | "zoom" | "imageRect" | "naturalSize">,
): Size {
  const { crop, zoom, imageRect, naturalSize } = params
  const safeZoom = zoom > 0 ? zoom : 1
  const imageWidth = imageRect.width > 0 ? imageRect.width : naturalSize.width || 1
  const imageHeight = imageRect.height > 0 ? imageRect.height : naturalSize.height || 1
  const scaleX = (naturalSize.width || imageWidth) / imageWidth / safeZoom
  const scaleY = (naturalSize.height || imageHeight) / imageHeight / safeZoom

  return {
    width: max(1, round(crop.width * scaleX)),
    height: max(1, round(crop.height * scaleY)),
  }
}

export function getCropOutputSize(
  params: Pick<CropExportParams, "crop" | "zoom" | "imageRect" | "naturalSize">,
  maxSize?: Size,
): Size {
  const size = getNaturalCropSize(params)
  if (!maxSize) return size

  const scale = min(1, max(1, maxSize.width) / size.width, max(1, maxSize.height) / size.height)

  return {
    width: max(1, round(size.width * scale)),
    height: max(1, round(size.height * scale)),
  }
}

export function applyCropExportTransform(
  ctx: CanvasRenderingContext2D,
  params: CropExportParams,
  outputSize: Size,
): void {
  const { crop } = params
  const matrix = getNaturalToViewportMatrix(params)
  const scaleX = outputSize.width / crop.width
  const scaleY = outputSize.height / crop.height

  ctx.setTransform(
    matrix.a * scaleX,
    matrix.b * scaleY,
    matrix.c * scaleX,
    matrix.d * scaleY,
    (matrix.e - crop.x) * scaleX,
    (matrix.f - crop.y) * scaleY,
  )
}
