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

  test("[flip] should set flips via checkboxes", async () => {
    let flipState = await I.getFlipState()
    expect(flipState.horizontal).toBe(false)
    expect(flipState.vertical).toBe(false)

    await I.setFlipCheckbox("horizontal", true)
    await I.setFlipCheckbox("vertical", true)

    flipState = await I.getFlipState()
    expect(flipState.horizontal).toBe(true)
    expect(flipState.vertical).toBe(true)
    await expect(I.flipHorizontalCheckbox).toBeChecked()
    await expect(I.flipVerticalCheckbox).toBeChecked()

    await I.setFlipCheckbox("horizontal", false)
    await I.setFlipCheckbox("vertical", false)

    flipState = await I.getFlipState()
    expect(flipState.horizontal).toBe(false)
    expect(flipState.vertical).toBe(false)
    await expect(I.flipHorizontalCheckbox).not.toBeChecked()
    await expect(I.flipVerticalCheckbox).not.toBeChecked()
  })

  test("[flip] should toggle and reset flips with actions", async () => {
    await I.toggleFlip("horizontal")
    let flipState = await I.getFlipState()
    expect(flipState.horizontal).toBe(true)
    await expect(I.flipHorizontalCheckbox).toBeChecked()

    await I.toggleFlip("horizontal")
    flipState = await I.getFlipState()
    expect(flipState.horizontal).toBe(false)
    await expect(I.flipHorizontalCheckbox).not.toBeChecked()

    await I.toggleFlip("vertical")
    flipState = await I.getFlipState()
    expect(flipState.vertical).toBe(true)
    await expect(I.flipVerticalCheckbox).toBeChecked()

    await I.resetFlip()
    flipState = await I.getFlipState()
    expect(flipState.horizontal).toBe(false)
    expect(flipState.vertical).toBe(false)
    await expect(I.flipHorizontalCheckbox).not.toBeChecked()
    await expect(I.flipVerticalCheckbox).not.toBeChecked()
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

  test("[keyboard] should move crop selection with arrow keys", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusSelection()
    await I.pressKey("ArrowRight")
    await I.pressKey("ArrowDown")

    const newRect = await I.getSelectionRect()

    expect(newRect.x).toBe(initialRect.x + 1)
    expect(newRect.y).toBe(initialRect.y + 1)
    expect(newRect.width).toBe(initialRect.width)
    expect(newRect.height).toBe(initialRect.height)
  })

  test("[keyboard] should resize width using Alt+Arrow keys", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusSelection()
    await I.pressKeyWithModifiers("ArrowRight", { alt: true })

    let rect = await I.getSelectionRect()
    expect(rect.width).toBe(initialRect.width + 1)
    expect(rect.x).toBe(initialRect.x)

    await I.pressKeyWithModifiers("ArrowLeft", { alt: true })

    rect = await I.getSelectionRect()
    expect(rect.width).toBe(initialRect.width)
    expect(rect.x).toBe(initialRect.x)
  })

  test("[keyboard] should resize height using Alt+Arrow keys", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusSelection()
    await I.pressKeyWithModifiers("ArrowDown", { alt: true })

    let rect = await I.getSelectionRect()
    expect(rect.height).toBe(initialRect.height + 1)
    expect(rect.y).toBe(initialRect.y)

    await I.pressKeyWithModifiers("ArrowUp", { alt: true })

    rect = await I.getSelectionRect()
    expect(rect.height).toBe(initialRect.height)
    expect(rect.y).toBe(initialRect.y)
  })

  test("[keyboard] should use larger step with shift modifier when resizing", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusSelection()
    await I.pressKeyWithModifiers("ArrowRight", { alt: true, shift: true })

    const newRect = await I.getSelectionRect()

    expect(newRect.width - initialRect.width).toBe(10)
    expect(newRect.height).toBe(initialRect.height)
  })

  test("[keyboard] should use largest step with ctrl modifier when resizing", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusSelection()
    await I.pressKeyWithModifiers("ArrowLeft", { alt: true, ctrl: true })

    const newRect = await I.getSelectionRect()

    expect(initialRect.width - newRect.width).toBe(50)
    expect(newRect.height).toBe(initialRect.height)
  })

  test("[keyboard] should use largest step with meta modifier when resizing", async () => {
    const initialRect = await I.getSelectionRect()

    await I.focusSelection()
    await I.pressKeyWithModifiers("ArrowLeft", { alt: true, meta: true })

    const newRect = await I.getSelectionRect()

    expect(initialRect.width - newRect.width).toBe(50)
    expect(newRect.height).toBe(initialRect.height)
  })

  test("[keyboard] should respect minimum size constraints when resizing", async () => {
    await I.controls.num("minWidth", "100")
    await I.controls.num("minHeight", "80")
    await I.wait(100)

    await I.focusSelection()

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowLeft", { alt: true, ctrl: true })
    }

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowUp", { alt: true, ctrl: true })
    }

    const { width, height } = await I.getSelectionRect()

    expect(width).toBe(100)
    expect(height).toBe(80)
  })

  test("[keyboard] should respect maximum size constraints when resizing", async () => {
    await I.controls.num("maxWidth", "250")
    await I.controls.num("maxHeight", "200")
    await I.wait(100)

    await I.focusSelection()

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowRight", { alt: true, ctrl: true })
    }

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowDown", { alt: true, ctrl: true })
    }

    const selectionRect = await I.getSelectionRect()
    const viewportRect = await I.getViewportRect()

    const expectedWidth = Math.min(250, viewportRect.width)
    const expectedHeight = Math.min(200, viewportRect.height)

    expect(selectionRect.width).toBe(expectedWidth)
    expect(selectionRect.height).toBe(expectedHeight)
  })

  test("[keyboard] should not move selection outside viewport bounds", async () => {
    await I.focusSelection()

    for (let i = 0; i < 10; i++) {
      await I.pressKeyWithModifiers("ArrowLeft", { ctrl: true })
      await I.pressKeyWithModifiers("ArrowUp", { ctrl: true })
    }

    const selectionRect = await I.getSelectionRect()
    const viewportRect = await I.getViewportRect()
    const relativeX = Math.round(selectionRect.x - viewportRect.x)
    const relativeY = Math.round(selectionRect.y - viewportRect.y)

    expect(relativeX).toBe(0)
    expect(relativeY).toBe(0)
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

test.describe("image-cropper / resize API", () => {
  test.beforeEach(async ({ page }) => {
    I = new ImageCropperModel(page)
    await I.goto()
    await I.waitForImageLoad()
  })

  test("[api] should grow selection using right handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("right")
    await I.setResizeStep(20)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 20)
    expect(newRect.height).toBe(initialRect.height)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should shrink selection using right handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("right")
    await I.setResizeStep(15)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width - 15)
    expect(newRect.height).toBe(initialRect.height)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should grow selection using left handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("left")
    await I.setResizeStep(20)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 20)
    expect(newRect.height).toBe(initialRect.height)
    expect(newRect.x).toBe(initialRect.x - 20)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should shrink selection using left handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("left")
    await I.setResizeStep(15)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width - 15)
    expect(newRect.height).toBe(initialRect.height)
    expect(newRect.x).toBe(initialRect.x + 15)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should grow selection using bottom handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("bottom")
    await I.setResizeStep(25)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width)
    expect(newRect.height).toBe(initialRect.height + 25)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should shrink selection using bottom handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("bottom")
    await I.setResizeStep(20)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width)
    expect(newRect.height).toBe(initialRect.height - 20)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should grow selection using top handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("top")
    await I.setResizeStep(25)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width)
    expect(newRect.height).toBe(initialRect.height + 25)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y - 25)
  })

  test("[api] should shrink selection using top handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("top")
    await I.setResizeStep(20)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width)
    expect(newRect.height).toBe(initialRect.height - 20)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y + 20)
  })

  test("[api] should grow selection using bottom-right corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("bottom-right")
    await I.setResizeStep(30)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 30)
    expect(newRect.height).toBe(initialRect.height + 30)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should shrink selection using bottom-right corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("bottom-right")
    await I.setResizeStep(25)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width - 25)
    expect(newRect.height).toBe(initialRect.height - 25)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should grow selection using top-left corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("top-left")
    await I.setResizeStep(30)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 30)
    expect(newRect.height).toBe(initialRect.height + 30)
    expect(newRect.x).toBe(initialRect.x - 30)
    expect(newRect.y).toBe(initialRect.y - 30)
  })

  test("[api] should shrink selection using top-left corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("top-left")
    await I.setResizeStep(25)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width - 25)
    expect(newRect.height).toBe(initialRect.height - 25)
    expect(newRect.x).toBe(initialRect.x + 25)
    expect(newRect.y).toBe(initialRect.y + 25)
  })

  test("[api] should grow selection using top-right corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("top-right")
    await I.setResizeStep(30)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 30)
    expect(newRect.height).toBe(initialRect.height + 30)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y - 30)
  })

  test("[api] should shrink selection using top-right corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("top-right")
    await I.setResizeStep(25)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width - 25)
    expect(newRect.height).toBe(initialRect.height - 25)
    expect(newRect.x).toBe(initialRect.x)
    expect(newRect.y).toBe(initialRect.y + 25)
  })

  test("[api] should grow selection using bottom-left corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("bottom-left")
    await I.setResizeStep(30)
    await I.clickGrow()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width + 30)
    expect(newRect.height).toBe(initialRect.height + 30)
    expect(newRect.x).toBe(initialRect.x - 30)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should shrink selection using bottom-left corner handle", async () => {
    const initialRect = await I.getSelectionRect()

    await I.selectResizeHandle("bottom-left")
    await I.setResizeStep(25)
    await I.clickShrink()
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toBe(initialRect.width - 25)
    expect(newRect.height).toBe(initialRect.height - 25)
    expect(newRect.x).toBe(initialRect.x + 25)
    expect(newRect.y).toBe(initialRect.y)
  })

  test("[api] should respect minimum size when shrinking", async () => {
    await I.controls.num("minWidth", "100")
    await I.controls.num("minHeight", "80")
    await I.wait(100)

    await I.selectResizeHandle("bottom-right")
    await I.setResizeStep(500)
    await I.clickShrink()
    await I.wait(100)

    const { width, height } = await I.getSelectionRect()

    expect(width).toBe(100)
    expect(height).toBe(80)
  })

  test("[api] should respect maximum size when growing", async () => {
    await I.controls.num("maxWidth", "200")
    await I.controls.num("maxHeight", "150")
    await I.wait(100)

    await I.selectResizeHandle("bottom-right")
    await I.setResizeStep(500)
    await I.clickGrow()
    await I.wait(100)

    const selectionRect = await I.getSelectionRect()
    const viewportRect = await I.getViewportRect()

    const expectedWidth = Math.min(200, viewportRect.width)
    const expectedHeight = Math.min(150, viewportRect.height)

    expect(selectionRect.width).toBe(expectedWidth)
    expect(selectionRect.height).toBe(expectedHeight)
  })
})

test.describe("image-cropper / circle", () => {
  test.beforeEach(async ({ page }) => {
    I = new ImageCropperModel(page)
    await I.goto("/image-cropper-circle")
    await I.waitForImageLoad()
  })

  test("should display the crop area in 1:1 aspect ratio", async () => {
    const { width, height } = await I.getSelectionRect()
    expect(width).toBe(height)
  })

  test("should keep the crop area in 1:1 aspect ratio when resizing", async () => {
    await I.dragHandle("bottom-right", 60, 100)
    await I.wait(100)

    const newRect = await I.getSelectionRect()

    expect(newRect.width).toEqual(newRect.height)
  })
})
