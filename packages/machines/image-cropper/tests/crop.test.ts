import { describe, expect, test } from "vitest"
import { clampOffset } from "../src/utils/crop"

describe("@zag-js/image-cropper crop utils", () => {
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
