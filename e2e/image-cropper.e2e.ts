import { test, expect } from "@playwright/test"
import { ImageCropperModel } from "./models/image-cropper.model"

let I: ImageCropperModel

test.describe("image-cropper / resizable", () => {
  test.beforeEach(async ({ page }) => {
    I = new ImageCropperModel(page)
    await I.goto()
    await I.waitForImageLoad()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("should display image and crop selection", async () => {
    await I.seeImageVisible()
    await I.seeSelectionVisible()
  })

  test("[pointer] should move crop selection by dragging", async () => {
    const initialRect = await I.getSelectionRect()

    await I.dragSelection(50, 30)

    await I.seeSelectionPosition(initialRect.x + 50, initialRect.y + 30)

    await I.seeSelectionSize(initialRect.width, initialRect.height)
  })

  test("[pointer] should resize crop selection using corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.dragHandle("bottom-right", 10, 15)

    await I.seeSelectionSize(initialRect.width + 10, initialRect.height + 15)
  })

  test("[pointer] should resize crop selection using side handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.dragHandle("right", 20, 0)

    await I.seeSelectionSize(initialRect.width + 20, initialRect.height)
  })

  test("[pointer] should resize crop selection using top handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.dragHandle("top", 0, -20)

    await I.seeSelectionSize(initialRect.width, initialRect.height + 20)
  })

  test("[zoom] should zoom in using wheel", async () => {
    await I.zoomWithWheel(-100)
    await I.wait(100)

    const transform = await I.getImageTransform()
    const { scaleX, scaleY } = await I.getScaleFromMatrix(transform)

    expect(scaleX).toBe(1.1)
    expect(scaleY).toBe(1.1)
  })

  test("[zoom] should zoom out using wheel", async () => {
    await I.zoomWithWheel(-100)
    await I.wait(100)

    await I.zoomWithWheel(100)
    await I.wait(100)

    const transform = await I.getImageTransform()
    const { scaleX, scaleY } = await I.getScaleFromMatrix(transform)

    expect(scaleX).toBe(1)
    expect(scaleY).toBe(1)
  })

  test("[pan] should pan image when dragging overlay", async () => {
    await I.zoomWithWheel(-100)
    await I.wait(100)

    await I.panImage(50, 30)
    await I.wait(100)

    const transform = await I.getImageTransform()
    const { translateX, translateY } = await I.getTranslateFromMatrix(transform)

    expect(translateX).toBe(25)
    expect(translateY).toBe(15)
  })

  test("[aspectRatio] should maintain aspect ratio when resizing with constraint", async () => {
    await I.controls.num("aspectRatio", "1")
    await I.wait(100)

    await I.dragHandle("bottom-right", 60, 60)
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    const aspectRatio = newRect.width / newRect.height
    const expectedRatio = 1

    expect(aspectRatio).toBe(expectedRatio)
  })

  test("[rotation] should rotate image", async () => {
    await I.rotationSlider.fill("45")

    const transform = await I.getImageTransform()
    const rotation = await I.getRotationFromMatrix(transform)

    expect(rotation).toBe(45)
  })

  test("[keyboard + pointer] should lock aspect ratio with shift key during resize", async () => {
    const initialRect = await I.getSelectionRect()
    const initialAspectRatio = initialRect.width / initialRect.height

    await I.dragHandle("bottom-right", -60, -100, { shift: true })
    await I.wait(100)

    const newRect = await I.getSelectionRect()
    const newAspectRatio = newRect.width / newRect.height

    expect(newAspectRatio).toBeCloseTo(initialAspectRatio, 2)
  })

  test("[zoom] should allow programmatic zoom changes", async () => {
    await I.zoomSlider.fill("2")

    const transform = await I.getImageTransform()
    const { scaleX, scaleY } = await I.getScaleFromMatrix(transform)

    expect(scaleX).toBe(2)
    expect(scaleY).toBe(2)
  })
})

test.describe("image-cropper / minCropSize", () => {
  test.beforeEach(async ({ page }) => {
    I = new ImageCropperModel(page)
    await I.goto("/image-cropper-min-crop-size")
    await I.waitForImageLoad()
  })

  test("should respect minimum crop size", async () => {
    await I.dragHandle("bottom-right", -500, -500)
    await I.wait(100)

    const { width, height } = await I.getSelectionRect()

    expect(width).toBe(80)
    expect(height).toBe(60)
  })
})

test.describe("image-cropper / fixedCropArea", () => {
  test.beforeEach(async ({ page }) => {
    I = new ImageCropperModel(page)
    await I.goto("/image-cropper-fixed")
    await I.waitForImageLoad()
  })

  test("should prevent crop area from moving when fixed", async () => {
    const initialRect = await I.getSelectionRect()

    await I.dragSelection(50, 30)
    await I.wait(100)

    await I.seeSelectionPosition(initialRect.x, initialRect.y)
  })
})
