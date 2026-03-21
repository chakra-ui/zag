import { expect, test } from "@playwright/test"
import { controls } from "./_utils"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.clickTrigger()
    await I.checkAccessibility()
  })

  test("should open when trigger is clicked", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeBackdrop()
  })

  test("should close when clicked outside", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    await I.clickOutside()

    await I.dontSeeContent()
    await I.dontSeeBackdrop()
  })

  test("should close on escape", async () => {
    await I.clickTrigger()
    await I.pressKey("Escape")

    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("should close when dragged down past swipeVelocityThreshold", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    await I.mouseDragGrabber("down", 200, 100)
    await I.dontSeeContent()
  })

  test("should close when dragged down past closeThreshold", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()
    const dragDistance = Math.floor(initialHeight * 0.55)

    await I.mouseDragGrabber("down", dragDistance)
    await I.dontSeeContent()
  })

  test("should stay open when dragged down slightly", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    await I.mouseDragGrabber("down", 100)
    await I.seeContent()
  })

  test("should stay interactive on touch drag", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    await I.touchDragGrabber("down", 100)
    await I.waitForSnapComplete()

    const finalHeight = await I.getContentVisibleHeight()
    expect(finalHeight).toBeGreaterThanOrEqual(initialHeight - 4)
  })

  test("should stay interactive on touch pointer drag", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    await I.touchPointerDragGrabber("down", 100)
    await I.waitForSnapComplete()

    const finalHeight = await I.getContentVisibleHeight()
    expect(finalHeight).toBeGreaterThanOrEqual(initialHeight - 4)
  })

  test("should no effect when dragged up", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()
    await I.mouseDragGrabber("up", 150)

    const newHeight = await I.getContentVisibleHeight()

    expect(newHeight).toBe(initialHeight)
  })

  test("should allow scrolling within content", async () => {
    await I.clickTrigger()
    await I.seeContent()

    const isAtTop = await I.isScrollableAtTop()
    expect(isAtTop).toBe(true)

    await I.scrollContent(200)

    const isStillAtTop = await I.isScrollableAtTop()
    expect(isStillAtTop).toBe(false)
  })

  test("should not allow dragging from no-drag area", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    await I.dragNoDragArea("down", 100, 500, false)
    await I.waitForSnapComplete()
    const heightAfterNoDragAreaDrag = await I.getContentVisibleHeight()

    expect(initialHeight - heightAfterNoDragAreaDrag).toBe(0)

    await page.mouse.up()

    await I.seeContent()
    const finalHeight = await I.getContentVisibleHeight()
    expect(finalHeight).toBe(initialHeight)
  })

  test("should not start dragging when text is selected in content", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    await I.selectTitleText()

    const hasSelectionInContent = await I.hasSelectionInContent()
    expect(hasSelectionInContent).toBe(true)

    const selectedText = await I.getSelectedText()
    expect(selectedText.length).toBeGreaterThan(0)

    await I.dragContent("down", 100)
    await I.waitForSnapComplete()

    const finalHeight = await I.getContentVisibleHeight()
    expect(finalHeight).toBe(initialHeight)
  })
})

test.describe("drawer [draggable=false]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer/draggable-false")
  })

  test("sheet content should not be draggable", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    await I.dragContent("down", 100, 500, false)
    const heightAfterContentDrag = await I.getContentVisibleHeight()
    expect(initialHeight - heightAfterContentDrag).toBe(0)

    // Release mouse before starting a new drag gesture
    await page.mouse.up()

    await I.mouseDragGrabber("down", 100, 500, false)
    const heightAfterGrabberDrag = await I.getContentVisibleHeight()
    expect(initialHeight - heightAfterGrabberDrag).toBe(100)
  })
})

test.describe("drawer [snapPoints]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer/snap-points")
  })

  test("should snap to defined positions", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const rem20Px = await I.page.evaluate(() => {
      const rootPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
      return 20 * rootPx
    })

    const initialHeight = await I.getContentVisibleHeight()
    expect(Math.abs(initialHeight - rem20Px)).toBeLessThanOrEqual(4)

    await I.mouseDragGrabber("up", 250)
    await I.waitForSnapComplete()

    let currentHeight = await I.getContentVisibleHeight()
    expect(currentHeight).toBeGreaterThan(initialHeight + 80)

    await I.mouseDragGrabber("down", 250)
    await I.waitForSnapComplete()

    currentHeight = await I.getContentVisibleHeight()
    expect(Math.abs(currentHeight - rem20Px)).toBeLessThanOrEqual(4)
  })
})

test.describe("drawer [snapToSequentialPoints]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer/snap-points")
    await controls(page).bool("snapToSequentialPoints", true)
  })

  test("should advance one step on swipe up", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    // Swipe up to expand to next snap point
    await I.mouseDragGrabber("up", 100)
    await I.waitForSnapComplete()

    const newHeight = await I.getContentVisibleHeight()
    expect(newHeight).toBeGreaterThan(initialHeight + 50)
  })

  test("should not dismiss on fast swipe down from full height, should snap instead", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    // Sequential mode: 20rem → 1 (full) in one step
    await I.mouseDragGrabber("up", 200)
    await I.waitForSnapComplete()
    await I.waitForOpenState()

    // Swipe down — should snap to lower point, NOT dismiss
    await I.mouseDragGrabber("down", 150)
    await I.waitForSnapComplete()

    // Drawer should still be visible (snapped, not dismissed)
    await I.seeContent()
  })
})
