import { expect, type Page } from "@playwright/test"
import { esc } from "../_utils"
import { Model } from "./model"

export class DndModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(example = "list") {
    return this.page.goto(`/dnd/${example}`)
  }

  getDragHandle(value: string) {
    return this.page.locator(`[data-dnd-drag-handle][data-value=${esc(value)}]`)
  }

  getDraggable(value: string) {
    return this.page.locator(`[data-dnd-draggable][data-value=${esc(value)}]`)
  }

  getDropTarget(value: string) {
    return this.page.locator(`[data-dnd-drop-target][data-value=${esc(value)}]`)
  }

  getDropIndicator(value: string, placement: string) {
    return this.page.locator(`[data-dnd-drop-indicator][data-value=${esc(value)}][data-placement=${esc(placement)}]`)
  }

  getRoot() {
    return this.page.locator("[data-dnd-root]")
  }

  async getOrder() {
    return this.page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-dnd-draggable]")).map((el) => el.textContent?.trim()),
    )
  }

  async isDragging() {
    return this.getRoot().evaluate((el) => el.hasAttribute("data-dragging"))
  }

  async getActiveIndicator() {
    return this.page.evaluate(() => {
      const el = document.querySelector("[data-dnd-drop-indicator][data-active]")
      return el ? { value: el.getAttribute("data-value"), placement: el.getAttribute("data-placement") } : null
    })
  }

  async dragTo(fromValue: string, toValue: string, placement: "before" | "after" = "before") {
    const handle = this.getDragHandle(fromValue)
    const target = this.getDropTarget(toValue)

    await handle.waitFor({ state: "visible" })
    await target.waitFor({ state: "visible" })

    const handleBox = await handle.boundingBox()
    const targetBox = await target.boundingBox()
    if (!handleBox || !targetBox) throw new Error(`Elements not found: ${fromValue} → ${toValue}`)

    await this.page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await this.page.mouse.down()

    // Wait for drag state to activate
    await expect(this.getRoot()).toHaveAttribute("data-dragging", "")

    const yTarget = placement === "before" ? targetBox.y + 3 : targetBox.y + targetBox.height - 3
    await this.page.mouse.move(targetBox.x + targetBox.width / 2, yTarget, { steps: 5 })

    await this.page.mouse.up()

    // Wait for drag state to clear
    await expect(this.getRoot()).not.toHaveAttribute("data-dragging")
  }

  async focusHandle(value: string) {
    await this.getDragHandle(value).focus()
  }

  async seeOrder(expected: string[]) {
    await expect.poll(() => this.getOrder(), { timeout: 2000 }).toEqual(expected)
  }

  async seeDragging(value: string) {
    await expect(this.getDraggable(value)).toHaveAttribute("data-dragging", "")
  }

  async seeNotDragging() {
    await expect(this.getRoot()).not.toHaveAttribute("data-dragging")
  }

  async seeIndicator(value: string, placement: string) {
    await expect.poll(() => this.getActiveIndicator(), { timeout: 2000 }).toEqual({ value, placement })
  }

  async selectItem(value: string) {
    await this.getDraggable(value).click()
  }

  getDragPreview() {
    return this.page.locator("[data-dnd-drag-preview]")
  }

  async seeDragPreview(text: string) {
    await expect(this.getDragPreview()).toBeVisible()
    await expect(this.getDragPreview()).toContainText(text)
  }

  async seeNoDragPreview() {
    await expect(this.getDragPreview()).toBeHidden()
  }

  private getScrollContainer() {
    return this.page.evaluate(() => {
      const root = document.querySelector("[data-dnd-root]")
      if (!root) return null
      for (const child of root.children) {
        if (child instanceof HTMLElement && /(auto|scroll)/.test(getComputedStyle(child).overflowY)) {
          const r = child.getBoundingClientRect()
          return { scrollTop: child.scrollTop, x: r.x, y: r.y, width: r.width, height: r.height }
        }
      }
      return null
    })
  }

  async getScrollTop() {
    const container = await this.getScrollContainer()
    return container?.scrollTop ?? 0
  }

  async getScrollContainerBox() {
    const container = await this.getScrollContainer()
    return container ? { x: container.x, y: container.y, width: container.width, height: container.height } : null
  }
}
