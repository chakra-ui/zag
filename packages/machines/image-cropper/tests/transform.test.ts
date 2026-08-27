import type { Point, Rect, Size } from "@zag-js/types"
import { describe, expect, test } from "vitest"
import {
  getCropOutputSize,
  getCropSourcePoints,
  getCropSourceRect,
  getImageTransformCss,
  getNaturalToViewportMatrix,
  viewportToNaturalPoint,
} from "../src/utils/transform"
import type { FlipState } from "../src/image-cropper.types"

const ZERO: Point = { x: 0, y: 0 }
const NO_FLIP: FlipState = { horizontal: false, vertical: false }

const sourceRect = (params: {
  crop: Rect
  zoom?: number
  offset?: Point
  viewportSize: Size
  naturalSize: Size
  rotation?: number
  flip?: FlipState
}) => {
  const { viewportSize, ...rest } = params
  return getCropSourceRect({
    zoom: 1,
    offset: ZERO,
    rotation: 0,
    flip: NO_FLIP,
    imageRect: { x: 0, y: 0, ...viewportSize },
    ...rest,
  })
}

describe("@zag-js/image-cropper getCropSourceRect", () => {
  test("identity: natural size equals viewport size", () => {
    // When the image is painted at exactly the viewport size, the source rect
    // is identical to the crop rect (1:1 mapping).
    const crop = { x: 100, y: 50, width: 200, height: 150 }
    const result = sourceRect({
      crop,
      viewportSize: { width: 500, height: 300 },
      naturalSize: { width: 500, height: 300 },
    })

    expect(result).toEqual(crop)
  })

  test("scales crop into natural pixels when image is larger than viewport", () => {
    // Viewport 500x300, natural 1000x600 -> uniform 2x scale.
    const result = sourceRect({
      crop: { x: 100, y: 50, width: 200, height: 150 },
      viewportSize: { width: 500, height: 300 },
      naturalSize: { width: 1000, height: 600 },
    })

    expect(result).toEqual({ x: 200, y: 100, width: 400, height: 300 })
  })

  test("handles non-uniform scale (display aspect ratio differs from natural)", () => {
    // Viewport 500x300, natural 1000x300 -> scaleX = 2, scaleY = 1.
    const result = sourceRect({
      crop: { x: 100, y: 50, width: 200, height: 150 },
      viewportSize: { width: 500, height: 300 },
      naturalSize: { width: 1000, height: 300 },
    })

    expect(result).toEqual({ x: 200, y: 50, width: 400, height: 150 })
  })

  test("zoom shrinks the sampled source region", () => {
    // A centered crop at 2x zoom: half the viewport-space crop maps to the
    // natural image, centered on the image.
    const result = sourceRect({
      crop: { x: 150, y: 150, width: 100, height: 100 },
      zoom: 2,
      viewportSize: { width: 400, height: 400 },
      naturalSize: { width: 400, height: 400 },
    })

    // Crop center (200,200) = viewport center -> natural center (200,200).
    // Source size halves: 100 / 2 = 50.
    expect(result).toEqual({ x: 175, y: 175, width: 50, height: 50 })
  })

  test("offset (pan) shifts the sampled source region", () => {
    // Panning the image right by 50px moves the sampled region left by 50px
    // (scaled by natural/viewport = 1 here).
    const base = sourceRect({
      crop: { x: 150, y: 150, width: 100, height: 100 },
      viewportSize: { width: 400, height: 400 },
      naturalSize: { width: 400, height: 400 },
    })

    const panned = sourceRect({
      crop: { x: 150, y: 150, width: 100, height: 100 },
      offset: { x: 50, y: 0 },
      viewportSize: { width: 400, height: 400 },
      naturalSize: { width: 400, height: 400 },
    })

    expect(panned.x).toBe(base.x - 50)
    expect(panned.width).toBe(base.width)
  })

  test("offset is scaled into natural pixels", () => {
    // 2x scale: a 50px viewport pan maps to a 100px natural-pixel shift.
    const result = sourceRect({
      crop: { x: 100, y: 100, width: 100, height: 100 },
      offset: { x: 50, y: 0 },
      viewportSize: { width: 500, height: 500 },
      naturalSize: { width: 1000, height: 1000 },
    })

    const noOffset = sourceRect({
      crop: { x: 100, y: 100, width: 100, height: 100 },
      viewportSize: { width: 500, height: 500 },
      naturalSize: { width: 1000, height: 1000 },
    })

    expect(result.x).toBe(noOffset.x - 100)
  })

  test("zoom and offset combine consistently", () => {
    const result = sourceRect({
      crop: { x: 100, y: 100, width: 200, height: 200 },
      zoom: 2,
      offset: { x: 40, y: 20 },
      viewportSize: { width: 400, height: 400 },
      naturalSize: { width: 800, height: 800 },
    })

    // scaleX = scaleY = 2, zoom = 2 -> overall scale 1 for sizes
    // sourceWidth = (200 / 2) * 2 = 200
    expect(result.width).toBe(200)
    expect(result.height).toBe(200)

    // cropCenter = (200,200), viewportCenter = (200,200)
    // sourceCenterX = 400 + ((200 - 200 - 40) / 2) * 2 = 400 - 40 = 360
    // sourceCenterY = 400 + ((200 - 200 - 20) / 2) * 2 = 400 - 20 = 380
    expect(result.x).toBe(360 - 100)
    expect(result.y).toBe(380 - 100)
  })

  test("guards against an unmeasured (zero) viewport", () => {
    const result = sourceRect({
      crop: { x: 0, y: 0, width: 100, height: 100 },
      viewportSize: { width: 0, height: 0 },
      naturalSize: { width: 1000, height: 1000 },
    })

    expect(Number.isFinite(result.x)).toBe(true)
    expect(Number.isFinite(result.y)).toBe(true)
    expect(Number.isFinite(result.width)).toBe(true)
    expect(Number.isFinite(result.height)).toBe(true)
  })

  test("guards against zero zoom", () => {
    const result = sourceRect({
      crop: { x: 0, y: 0, width: 100, height: 100 },
      zoom: 0,
      viewportSize: { width: 100, height: 100 },
      naturalSize: { width: 100, height: 100 },
    })

    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 })
  })

  test("horizontal flip mirrors the sampled source region (#3238)", () => {
    // 1200×800 source in a 600×400 viewport; crop over the top-right of the viewport.
    // After a horizontal flip the crop shows the top-left (red) quadrant, so the
    // natural-space rect must sit in x ∈ [0, 600], not [600, 1200].
    const result = sourceRect({
      crop: { x: 300, y: 40, width: 260, height: 180 },
      flip: { horizontal: true, vertical: false },
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    })

    expect(result.x + result.width).toBeLessThanOrEqual(600 + 1e-6)
    expect(result.x).toBeGreaterThanOrEqual(-1e-6)
  })

  test("vertical flip mirrors the sampled source region (#3238)", () => {
    const result = sourceRect({
      crop: { x: 300, y: 40, width: 260, height: 180 },
      flip: { horizontal: false, vertical: true },
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    })

    // Top-right crop flipped vertically samples the bottom-right quadrant.
    const centerY = result.y + result.height / 2
    expect(centerY).toBeGreaterThan(400)
  })

  test("viewportToNaturalPoint round-trips a flipped source pixel (#3238)", () => {
    // Forward: natural (300,200) with horizontal flip lands at viewport (450,100).
    // Inverse must recover (300,200).
    const natural = viewportToNaturalPoint({
      point: { x: 450, y: 100 },
      zoom: 1,
      offset: ZERO,
      rotation: 0,
      flip: { horizontal: true, vertical: false },
      imageRect: { x: 0, y: 0, width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    })

    expect(natural.x).toBeCloseTo(300, 5)
    expect(natural.y).toBeCloseTo(200, 5)
  })

  test("uses the rendered image position and size", () => {
    const result = viewportToNaturalPoint({
      point: { x: 350, y: 200 },
      zoom: 1,
      offset: ZERO,
      rotation: 0,
      flip: NO_FLIP,
      imageRect: { x: 100, y: 50, width: 500, height: 300 },
      naturalSize: { width: 1000, height: 600 },
    })

    expect(result).toEqual({ x: 500, y: 300 })
  })

  test("maps crop corners through rotation, flip, zoom, and pan", () => {
    const params = {
      crop: { x: 220, y: 90, width: 160, height: 120 },
      zoom: 1.5,
      offset: { x: 30, y: -20 },
      rotation: 45,
      flip: { horizontal: true, vertical: false },
      imageRect: { x: 50, y: 25, width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    }

    const points = getCropSourcePoints(params)
    const matrix = getNaturalToViewportMatrix(params)
    const map = (point: Point) => ({
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    })

    expect(map(points.topLeft).x).toBeCloseTo(params.crop.x, 10)
    expect(map(points.topLeft).y).toBeCloseTo(params.crop.y, 10)
    expect(map(points.bottomRight).x).toBeCloseTo(params.crop.x + params.crop.width, 10)
    expect(map(points.bottomRight).y).toBeCloseTo(params.crop.y + params.crop.height, 10)
  })

  test("rotation expands the source rect to the oriented crop's AABB", () => {
    const unrotated = sourceRect({
      crop: { x: 250, y: 150, width: 100, height: 100 },
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    })

    const rotated = sourceRect({
      crop: { x: 250, y: 150, width: 100, height: 100 },
      rotation: 45,
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    })

    // A rotated square's AABB is larger than the axis-aligned square.
    expect(rotated.width).toBeGreaterThan(unrotated.width)
    expect(rotated.height).toBeGreaterThan(unrotated.height)
  })

  test("getCropOutputSize keeps natural resolution under zoom", () => {
    // Viewport crop 260×180, natural/viewport scale 2, zoom 1 → 520×360.
    const size = getCropOutputSize({
      crop: { x: 300, y: 40, width: 260, height: 180 },
      zoom: 1,
      imageRect: { x: 0, y: 0, width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    })

    expect(size).toEqual({ width: 520, height: 360 })
  })

  test("getCropOutputSize respects the maximum dimensions", () => {
    const params = {
      crop: { x: 0, y: 0, width: 600, height: 400 },
      zoom: 1,
      imageRect: { x: 0, y: 0, width: 600, height: 400 },
      naturalSize: { width: 12000, height: 8000 },
    }

    expect(getCropOutputSize(params)).toEqual({ width: 12000, height: 8000 })
    expect(getCropOutputSize(params, { width: 4096, height: 4096 })).toEqual({ width: 4096, height: 2731 })
  })

  test("serializes the canonical preview transform as a CSS matrix", () => {
    const transform = getImageTransformCss({
      zoom: 2,
      offset: { x: 10, y: 20 },
      rotation: 90,
      flip: { horizontal: true, vertical: false },
    })

    expect(transform).toBe("matrix(-1.2246467991473532e-16, -2, -2, 1.2246467991473532e-16, 10, 20)")
  })
})
