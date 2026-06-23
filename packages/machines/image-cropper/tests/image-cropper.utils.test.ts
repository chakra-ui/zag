import type { Point, Rect, Size } from "@zag-js/types"
import { describe, expect, test } from "vitest"
import { getCropSourceRect } from "../src/image-cropper.utils"

const ZERO: Point = { x: 0, y: 0 }

const sourceRect = (params: { crop: Rect; zoom?: number; offset?: Point; viewportSize: Size; naturalSize: Size }) =>
  getCropSourceRect({
    zoom: 1,
    offset: ZERO,
    ...params,
  })

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
})
