import { test } from "@playwright/test"
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

    // Maximize
    await I.clickMaximize()
    await I.seeMaximized()

    // Restore
    await I.clickRestore()
    await I.dontSeeMaximized()
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
})
