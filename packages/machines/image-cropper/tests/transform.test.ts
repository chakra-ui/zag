import type { Point, Rect, Size } from "@zag-js/types"
import { describe, expect, test } from "vitest"
import {
  getCropRect,
  getCropSourcePoints,
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
  return getCropRect({
    zoom: 1,
    offset: ZERO,
    rotation: 0,
    flip: NO_FLIP,
    imageRect: { x: 0, y: 0, ...viewportSize },
    ...rest,
  })
}

describe("@zag-js/image-cropper getCropRect", () => {
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

  test("measures a flipped crop where it shows in the flipped image", () => {
    // A top-right crop of a flipped image is top-right of the flipped image;
    // `corners` still holds the mirrored source region (#3238).
    const params = {
      crop: { x: 300, y: 40, width: 260, height: 180 },
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    }
    const expected = { x: 600, y: 80, width: 520, height: 360 }

    for (const flip of [
      { horizontal: true, vertical: false },
      { horizontal: false, vertical: true },
    ]) {
      const result = sourceRect({ ...params, flip })
      expect(result.x).toBeCloseTo(expected.x, 8)
      expect(result.y).toBeCloseTo(expected.y, 8)
      expect(result.width).toBeCloseTo(expected.width, 8)
      expect(result.height).toBeCloseTo(expected.height, 8)
    }
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

  test("keeps the crop size exact under rotation", () => {
    const params = {
      crop: { x: 250, y: 150, width: 100, height: 60 },
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    }
    const unrotated = sourceRect(params)
    const rotated = sourceRect({ ...params, rotation: 45 })

    expect(rotated.width).toBeCloseTo(unrotated.width, 8)
    expect(rotated.height).toBeCloseTo(unrotated.height, 8)
  })

  test("measures the crop in the rotated image", () => {
    // A 90° turn makes the 1200×800 image 800×1200, and the centered crop stays centered in it
    const result = sourceRect({
      crop: { x: 250, y: 150, width: 100, height: 100 },
      rotation: 90,
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 1200, height: 800 },
    })

    expect(result.x).toBeCloseTo(300, 8)
    expect(result.y).toBeCloseTo(500, 8)
    expect(result.width).toBeCloseTo(200, 8)
  })

  test("measures the crop in the flipped image", () => {
    const result = sourceRect({
      crop: { x: 0, y: 0, width: 100, height: 100 },
      flip: { horizontal: true, vertical: false },
      viewportSize: { width: 600, height: 400 },
      naturalSize: { width: 600, height: 400 },
    })

    // the left of the view shows the right of the image, which is the left of the flipped image
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 })
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
