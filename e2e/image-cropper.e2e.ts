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

  test("[minSize] should respect minimum crop size", async () => {
    await I.controls.num("minWidth", "80")
    await I.controls.num("minHeight", "60")
    await I.wait(100)

    await I.dragHandle("bottom-right", -500, -500)
    await I.wait(100)

    const { width, height } = await I.getSelectionRect()

    expect(width).toBe(80)
    expect(height).toBe(60)
  })

  test("[maxSize] should respect maximum crop size", async () => {
    await I.controls.num("maxWidth", "200")
    await I.controls.num("maxHeight", "150")
    await I.wait(100)

    await I.dragHandle("bottom-right", 500, 500)
    await I.wait(100)

    const selectionRect = await I.getSelectionRect()
    const viewportRect = await I.getViewportRect()

    const expectedWidth = Math.min(200, viewportRect.width)
    const expectedHeight = Math.min(150, viewportRect.height)

    expect(selectionRect.width).toBe(expectedWidth)
    expect(selectionRect.height).toBe(expectedHeight)
  })

  test("[zoom] should allow programmatic zoom changes", async () => {
    await I.zoomSlider.fill("2")

    const transform = await I.getImageTransform()
    const { scaleX, scaleY } = await I.getScaleFromMatrix(transform)

    expect(scaleX).toBe(2)
    expect(scaleY).toBe(2)
  })

  test("[keyboard] should resize corner handle diagonally with left arrow", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("top-left")
    await I.pressKey("ArrowLeft")

    const newRect = await I.getSelectionRect()

    expect(newRect.x).toBe(initialRect.x - 1)
    expect(newRect.y).toBe(initialRect.y - 1)
    expect(newRect.width).toBe(initialRect.width + 1)
    expect(newRect.height).toBe(initialRect.height + 1)
  })

  test("[keyboard] should resize corner handle diagonally with up arrow", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("top-left")
    await I.pressKey("ArrowUp")

    const newRect = await I.getSelectionRect()

    expect(newRect.x).toBe(initialRect.x - 1)
    expect(newRect.y).toBe(initialRect.y - 1)
    expect(newRect.width).toBe(initialRect.width + 1)
    expect(newRect.height).toBe(initialRect.height + 1)
  })

  test("[keyboard] should resize corner handle diagonally with right arrow", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("top-left")
    await I.pressKey("ArrowRight")

    const newRect = await I.getSelectionRect()

    expect(newRect.x).toBe(initialRect.x + 1)
    expect(newRect.y).toBe(initialRect.y + 1)
    expect(newRect.width).toBe(initialRect.width - 1)
    expect(newRect.height).toBe(initialRect.height - 1)
  })

  test("[keyboard] should resize corner handle diagonally with down arrow", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("top-left")
    await I.pressKey("ArrowDown")

    const newRect = await I.getSelectionRect()

    expect(newRect.x).toBe(initialRect.x + 1)
    expect(newRect.y).toBe(initialRect.y + 1)
    expect(newRect.width).toBe(initialRect.width - 1)
    expect(newRect.height).toBe(initialRect.height - 1)
  })

  test("[keyboard] should resize bottom-right corner handle correctly", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("bottom-right")
    await I.pressKey("ArrowRight")

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 1)
    expect(newRect.height).toBe(initialRect.height + 1)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[keyboard] should resize edge handle in single direction", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("right")
    await I.pressKey("ArrowRight")

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 1)
    expect(newRect.height).toBe(initialRect.height)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[keyboard] should use larger step with shift modifier", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("bottom-right")
    await I.pressKeyWithModifiers("ArrowRight", { shift: true })

    const newRect = await I.getSelectionRect()

    expect(newRect.width - initialRect.width).toBe(10)
    expect(newRect.height - initialRect.height).toBe(10)
  })

  test("[keyboard] should use largest step with ctrl modifier", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("bottom-right")

    await I.pressKeyWithModifiers("ArrowLeft", { ctrl: true })

    const newRect = await I.getSelectionRect()

    // Notice that newRect and initialRect are swapped since default crop area size is large
    expect(initialRect.width - newRect.width).toBe(50)
    expect(initialRect.height - newRect.height).toBe(50)
  })

  test("[keyboard] should use largest step with meta modifier", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusHandle("bottom-right")

    await I.pressKeyWithModifiers("ArrowLeft", { meta: true })

    const newRect = await I.getSelectionRect()

    // Notice that newRect and initialRect are swapped since default crop area size is large
    expect(initialRect.width - newRect.width).toBe(50)
    expect(initialRect.height - newRect.height).toBe(50)
  })

  test("[keyboard] should respect minimum size constraints", async () => {
    await I.controls.num("minWidth", "100")
    await I.controls.num("minHeight", "80")

    await I.focusHandle("bottom-right")

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowLeft", { ctrl: true })
    }

    const { width, height } = await I.getSelectionRect()

    expect(width).toBe(100)
    expect(height).toBe(80)
  })

  test("[keyboard] should respect maximum size constraints", async () => {
    await I.controls.num("maxWidth", "250")
    await I.controls.num("maxHeight", "200")

    await I.focusHandle("bottom-right")

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowRight", { ctrl: true })
    }

    const { width, height } = await I.getSelectionRect()

    expect(width).toBe(250)
    expect(height).toBe(200)
  })

  test("[keyboard] should not move selection outside viewport bounds", async () => {
    await I.focusHandle("top-left")

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowLeft", { ctrl: true })
    }

    const selectionRect = await I.getSelectionRect()
    const viewportRect = await I.getViewportRect()

    expect(viewportRect.x - selectionRect.x).toBe(0)
    expect(viewportRect.y - selectionRect.y).toBe(0)
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
