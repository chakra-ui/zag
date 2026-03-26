import { expect, test } from "@playwright/test"
import { FloatingPanelModel } from "./models/floating-panel.model"

let I: FloatingPanelModel

test.describe("floating-panel", () => {
  test.beforeEach(async ({ page }) => {
    I = new FloatingPanelModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.clickTrigger()
    await I.checkAccessibility()
  })

  test("should open and close panel", async () => {
    await I.clickTrigger()
    await I.seeContent()

    await I.clickClose()
    await I.dontSeeContent()
  })

  test("should minimize and restore panel", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeBody()

    // Minimize
    await I.clickMinimize()
    await I.seeMinimized()
    await I.dontSeeBody()

    // Restore
    await I.clickRestore()
    await I.dontSeeMinimized()
    await I.seeBody()
  })

  test("should maximize and restore panel", async () => {
    await I.clickTrigger()
    await I.seeContent()
    const original = await I.getContentSize()

    // Maximize
    await I.clickMaximize()
    await I.seeMaximized()

    // Restore
    await I.clickRestore()
    await I.dontSeeMaximized()
    await I.seeContentHasPosition(original.x, original.y, 8)
    await I.seeContentHasSize(original.width, original.height, 8)
  })

  test("should restore when double-clicking title while minimized", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeBody()

    // Minimize
    await I.clickMinimize()
    await I.seeMinimized()
    await I.dontSeeBody()

    // Double-click title should restore (not maximize)
    await I.doubleClickDragTrigger()
    await I.dontSeeMinimized()
    await I.dontSeeMaximized()
    await I.seeBody()
  })

  test("should restore when double-clicking title while maximized", async () => {
    await I.clickTrigger()
    await I.seeContent()

    // Maximize
    await I.clickMaximize()
    await I.seeMaximized()

    // Double-click title should restore
    await I.doubleClickDragTrigger()
    await I.dontSeeMaximized()
  })

  test("should maximize when double-clicking title in default state", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.dontSeeStaged()

    // Double-click title should maximize
    await I.doubleClickDragTrigger()
    await I.seeMaximized()
  })

  test("should close panel on escape", async () => {
    await I.clickTrigger()
    await I.seeContent()

    await I.pressKey("Escape")
    await I.dontSeeContent()
  })

  test("should restore to original size after minimize → double-click → restore flow", async () => {
    await I.clickTrigger()
    await I.seeContent()

    // Get original size
    const originalSize = await I.getContentSize()

    // Minimize
    await I.clickMinimize()
    await I.seeMinimized()

    // Double-click to restore
    await I.doubleClickDragTrigger()
    await I.dontSeeMinimized()

    // Size should be restored to original
    await I.seeContentHasSize(originalSize.width, originalSize.height)
  })

  test("should restore to previous position after maximize in controlled page", async () => {
    await I.goto("/floating-panel/controlled")
    await I.clickTrigger()
    await I.seeContent()

    await I.dragBy({ x: 140, y: 90 })
    const beforeMaximize = await I.getContentSize()

    await I.clickMaximize()
    await I.seeMaximized()

    await I.clickRestore()
    await I.dontSeeMaximized()
    await I.seeContentHasPosition(beforeMaximize.x, beforeMaximize.y, 8)
  })

  test("should not report maximum update depth errors when resizing controlled page", async () => {
    await I.goto("/floating-panel/controlled")
    await I.clickTrigger()
    await I.seeContent()
    I.clearConsoleMessages()

    for (let i = 0; i < 5; i++) {
      await I.resizeBy("se", { x: 40, y: 30 })
      await I.resizeBy("se", { x: -30, y: -20 })
      await I.dragBy({ x: 30, y: 20 })
    }

    await expect(I.page.getByText("ResizeObserver box:")).toBeVisible()
    await I.dontSeeInConsole("Maximum update depth exceeded", 1500)
  })

  test("should prefer controlled open over defaultOpen on initialization", async () => {
    await I.goto("/floating-panel/controlled")
    await I.dontSeeContent()

    await I.clickTrigger()
    await I.seeContent()
  })

  test("should revert position when pressing escape during drag", async () => {
    await I.clickTrigger()
    await I.seeContent()
    const original = await I.getContentSize()

    // Start dragging then press Escape mid-drag
    const box = await I.getContentSize()
    await I.page.mouse.move(box.x + 50, box.y + 10)
    await I.page.mouse.down()
    await I.page.mouse.move(box.x + 200, box.y + 150, { steps: 5 })
    await I.page.keyboard.press("Escape")
    await I.page.mouse.up()

    await I.seeContentHasPosition(original.x, original.y, 8)
  })

  test("should revert size when pressing escape during resize", async () => {
    await I.clickTrigger()
    await I.seeContent()
    const original = await I.getContentSize()

    // Start resizing then press Escape mid-resize
    await I.page.mouse.move(original.x + original.width, original.y + original.height)
    await I.page.mouse.down()
    await I.page.mouse.move(original.x + original.width + 100, original.y + original.height + 80, { steps: 5 })
    await I.page.keyboard.press("Escape")
    await I.page.mouse.up()

    await I.seeContentHasSize(original.width, original.height, 8)
  })

  test("should support api.setPosition and api.setSize in controlled page", async () => {
    await I.goto("/floating-panel/controlled")
    await I.clickTrigger()
    await I.seeContent()

    await I.page.getByRole("button", { name: "API set position: (48, 48)" }).click()
    await I.seeContentHasPosition(48, 48, 10)

    await I.page.getByRole("button", { name: "API set size: 440x300" }).click()
    await I.seeContentHasSize(440, 300, 10)
  })
})
