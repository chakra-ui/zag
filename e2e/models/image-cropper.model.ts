import { expect, type Page } from "@playwright/test"
import { a11y, rect } from "../_utils"
import { Model } from "./model"

export class ImageCropperModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/image-cropper") {
    return this.page.goto(url)
  }

  get viewport() {
    return this.page.locator("[data-scope='image-cropper'][data-part='viewport']")
  }

  get image() {
    return this.page.locator("[data-scope='image-cropper'][data-part='image']")
  }

  get selection() {
    return this.page.locator("[data-scope='image-cropper'][data-part='selection']")
  }

  get overlay() {
    return this.page.locator("[data-scope='image-cropper'][data-part='overlay']")
  }

  get zoomSlider() {
    return this.page.locator("input[type='range'][data-testid='zoom-slider']")
  }

  get rotationSlider() {
    return this.page.locator("input[type='range'][data-testid='rotation-slider']")
  }

  get flipHorizontalCheckbox() {
    return this.page.getByLabel("Horizontal")
  }

  get flipVerticalCheckbox() {
    return this.page.getByLabel("Vertical")
  }

  get toggleHorizontalFlipButton() {
    return this.page.getByRole("button", { name: "Toggle horizontal flip" })
  }

  get toggleVerticalFlipButton() {
    return this.page.getByRole("button", { name: "Toggle vertical flip" })
  }

  get resetFlipButton() {
    return this.page.getByRole("button", { name: "Reset flips" })
  }

  getHandle(position: string) {
    return this.page.locator(`[data-scope='image-cropper'][data-part='handle'][data-position='${position}']`)
  }

  async getSelectionRect() {
    const bbox = await rect(this.selection)
    return bbox
  }

  async getViewportRect() {
    return rect(this.viewport)
  }

  async getImageTransform() {
    return this.image.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.transform
    })
  }

  async getRotationFromMatrix(transform: string) {
    if (!transform || transform === "none") return 0

    const match = transform.match(/^matrix\(([^)]+)\)$/)
    if (!match) return 0

    const values = match[1].split(",").map(parseFloat)
    const [a, b] = values

    let angle = Math.atan2(b, a) * (180 / Math.PI)
    if (angle < 0) angle += 360
    return angle
  }

  async getScaleFromMatrix(transform: string) {
    if (!transform || transform === "none") {
      return { scaleX: 1, scaleY: 1 }
    }

    const match = transform.match(/^matrix\(([^)]+)\)$/)
    if (!match) return { scaleX: 1, scaleY: 1 }

    const values = match[1].split(",").map(parseFloat)
    const [a, b, c, d] = values

    const scaleX = Math.sqrt(a * a + b * b)
    const scaleY = Math.sqrt(c * c + d * d)

    return { scaleX, scaleY }
  }

  async getTranslateFromMatrix(transform: string) {
    if (!transform || transform === "none") {
      return { translateX: 0, translateY: 0 }
    }

    const match = transform.match(/^matrix\(([^)]+)\)$/)
    if (!match) return { translateX: 0, translateY: 0 }

    const values = match[1].split(",").map(parseFloat)
    const [, , , , e, f] = values

    return { translateX: e, translateY: f }
  }

  async getFlipState() {
    return this.image.evaluate((el) => ({
      horizontal: "flipHorizontal" in el.dataset,
      vertical: "flipVertical" in el.dataset,
    }))
  }

  async dragSelection(deltaX: number, deltaY: number) {
    const selectionBox = await rect(this.selection)
    const startX = selectionBox.midX
    const startY = selectionBox.midY

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY + deltaY)
    await this.page.mouse.up()
  }

  async dragHandle(position: string, deltaX: number, deltaY: number, options?: { shift?: boolean }) {
    const handle = this.getHandle(position)
    const handleBox = await rect(handle)

    await this.page.mouse.move(handleBox.midX, handleBox.midY)

    if (options?.shift) {
      await this.page.keyboard.down("Shift")
    }

    await this.page.mouse.down()
    await this.page.mouse.move(handleBox.midX + deltaX, handleBox.midY + deltaY, { steps: 10 })
    await this.page.mouse.up()

    if (options?.shift) {
      await this.page.keyboard.up("Shift")
    }
  }

  async panImage(deltaX: number, deltaY: number) {
    // Click on overlay (outside selection) to trigger pan
    const viewportBox = await rect(this.viewport)
    const selectionBox = await rect(this.selection)

    // Click in top-left corner of viewport, outside selection
    const startX = viewportBox.x + 10
    const startY = viewportBox.y + 10

    // Make sure we're not clicking on the selection
    const isOutsideSelection = startX < selectionBox.x || startY < selectionBox.y

    if (!isOutsideSelection) {
      // If selection is in top-left, use bottom-right instead
      const altX = viewportBox.maxX - 10
      const altY = viewportBox.maxY - 10

      await this.page.mouse.move(altX, altY)
      await this.page.mouse.down()
      await this.page.mouse.move(altX + deltaX, altY + deltaY)
      await this.page.mouse.up()
    } else {
      await this.page.mouse.move(startX, startY)
      await this.page.mouse.down()
      await this.page.mouse.move(startX + deltaX, startY + deltaY)
      await this.page.mouse.up()
    }
  }

  async setFlipCheckbox(axis: "horizontal" | "vertical", checked: boolean) {
    const checkbox = axis === "horizontal" ? this.flipHorizontalCheckbox : this.flipVerticalCheckbox
    await checkbox.setChecked(checked)
  }

  async toggleFlip(axis: "horizontal" | "vertical") {
    const button = axis === "horizontal" ? this.toggleHorizontalFlipButton : this.toggleVerticalFlipButton
    await button.click()
  }

  async resetFlip() {
    await this.resetFlipButton.click()
  }

  async zoomWithWheel(deltaY: number, point?: { x: number; y: number }) {
    const viewportBox = await rect(this.viewport)
    const x = point?.x ?? viewportBox.midX
    const y = point?.y ?? viewportBox.midY

    await this.page.mouse.move(x, y)
    await this.page.mouse.wheel(0, deltaY)
  }

  async seeSelectionPosition(expectedX: number, expectedY: number) {
    const bbox = await this.getSelectionRect()
    expect(bbox.x).toBe(expectedX)
    expect(bbox.y).toBe(expectedY)
  }

  async seeSelectionSize(expectedWidth: number, expectedHeight: number) {
    const bbox = await this.getSelectionRect()
    expect(bbox.width).toBe(expectedWidth)
    expect(bbox.height).toBe(expectedHeight)
  }

  async seeSelectionVisible() {
    await expect(this.selection).toBeVisible()
  }

  async seeImageVisible() {
    await expect(this.image).toBeVisible()
  }

  async waitForImageLoad() {
    await this.image.evaluate((img: HTMLImageElement) => {
      if (img.complete) return
      return new Promise((resolve) => {
        img.onload = () => resolve(true)
      })
    })
  }

  async focusSelection() {
    await this.selection.focus()
  }

  async pressKeyWithModifiers(
    key: string,
    options?: { shift?: boolean; ctrl?: boolean; meta?: boolean; alt?: boolean },
  ) {
    const modifiers: string[] = []
    if (options?.shift) modifiers.push("Shift")
    if (options?.ctrl) modifiers.push("Control")
    if (options?.meta) modifiers.push("Meta")
    if (options?.alt) modifiers.push("Alt")

    for (const mod of modifiers) {
      await this.page.keyboard.down(mod)
    }

    await this.page.keyboard.press(key)

    for (const mod of modifiers.reverse()) {
      await this.page.keyboard.up(mod)
    }
  }

  get resizeHandleSelect() {
    return this.page.locator("[data-testid='resize-handle-select']")
  }

  get resizeStepInput() {
    return this.page.locator("[data-testid='resize-step-input']")
  }

  get growButton() {
    return this.page.locator("[data-testid='grow-button']")
  }

  get shrinkButton() {
    return this.page.locator("[data-testid='shrink-button']")
  }

  async selectResizeHandle(position: string) {
    await this.resizeHandleSelect.selectOption(position)
  }

  async setResizeStep(step: number) {
    await this.resizeStepInput.fill(String(step))
  }

  async clickGrow() {
    await this.growButton.click()
  }

  async clickShrink() {
    await this.shrinkButton.click()
  }
}
