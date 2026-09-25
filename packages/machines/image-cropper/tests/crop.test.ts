import { describe, expect, test } from "vitest"
import { clampOffset, computeMoveCrop, computeResizeCrop, constrainCrop } from "../src/utils/crop"

describe("@zag-js/image-cropper crop utils", () => {
  test("computeMoveCrop keeps the crop inside the viewport", () => {
    const crop = { x: 100, y: 50, width: 200, height: 150 }
    const viewport = { width: 500, height: 300 }

    expect(computeMoveCrop(crop, { x: -200, y: 200 }, viewport)).toEqual({
      x: 0,
      y: 150,
      width: 200,
      height: 150,
    })
  })

  test("computeResizeCrop preserves the aspect ratio and maximum size", () => {
    const result = computeResizeCrop({
      cropStart: { x: 100, y: 100, width: 200, height: 100 },
      handlePosition: "se",
      delta: { x: 200, y: 200 },
      viewportRect: { width: 500, height: 400 },
      minSize: { width: 40, height: 40 },
      maxSize: { width: 300, height: 300 },
      aspectRatio: 2,
    })

    expect(result).toEqual({ x: 100, y: 100, width: 300, height: 150 })
  })

  test("constrainCrop applies the aspect ratio and keeps the crop inside the viewport", () => {
    const result = constrainCrop({
      crop: { x: 450, y: -20, width: 200, height: 50 },
      viewportRect: { width: 500, height: 300 },
      minSize: { width: 40, height: 40 },
      maxSize: { width: Infinity, height: Infinity },
      aspectRatio: 2,
    })

    expect(result).toEqual({ x: 400, y: 0, width: 100, height: 50 })
  })

  test("constrainCrop respects the minimum and maximum size", () => {
    const viewportRect = { width: 500, height: 300 }
    const minSize = { width: 40, height: 40 }
    const maxSize = { width: 300, height: 200 }

    expect(constrainCrop({ crop: { x: 10, y: 10, width: 10, height: 10 }, viewportRect, minSize, maxSize })).toEqual({
      x: 10,
      y: 10,
      width: 40,
      height: 40,
    })

    expect(constrainCrop({ crop: { x: 10, y: 10, width: 800, height: 800 }, viewportRect, minSize, maxSize })).toEqual({
      x: 10,
      y: 10,
      width: 300,
      height: 200,
    })
  })

  test("clampOffset accounts for the rotated image bounds", () => {
    const result = clampOffset({
      zoom: 1,
      rotation: 90,
      viewportSize: { width: 600, height: 400 },
      offset: { x: 200, y: 200 },
    })

    expect(result).toEqual({ x: 0, y: 100 })
  })

  test("clampOffset keeps a fixed crop covered", () => {
    const result = clampOffset({
      zoom: 1.5,
      rotation: 0,
      viewportSize: { width: 600, height: 400 },
      offset: { x: 999, y: -999 },
      fixedCropArea: true,
      crop: { x: 100, y: 50, width: 200, height: 150 },
    })

    expect(result).toEqual({ x: 250, y: -300 })
  })
})
