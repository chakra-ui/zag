import { expect, test } from "@playwright/test"
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

    await I.clickOutsideSheet()

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

    await I.dragGrabber("down", 200, 100)
    await I.dontSeeContent()
  })

  test("should close when dragged down past closeThreshold", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()
    const dragDistance = Math.floor(initialHeight * 0.3)

    await I.dragGrabber("down", dragDistance)
    await I.dontSeeContent()
  })

  test("should stay open when dragged down slightly", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    await I.dragGrabber("down", 100)
    await I.seeContent()
  })

  test("should no effect when dragged up", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()
    await I.dragGrabber("up", 150)

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
})

test.describe("drawer [draggable=false]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer-draggable-false")
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

    await I.dragGrabber("down", 100, 500, false)
    const heightAfterGrabberDrag = await I.getContentVisibleHeight()
    expect(initialHeight - heightAfterGrabberDrag).toBe(100)
  })
})

test.describe("drawer [snapPoints]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer-snap-points")
  })

  test("should snap to defined positions", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()
    const viewportHeight = await I.page.evaluate(() => window.innerHeight)
    const lowerHeight = Math.min(initialHeight, viewportHeight * 0.25)
    const dragTo250 = Math.max(0, initialHeight - 250) + 20

    // Drag down enough to target the 250px snap point without crossing below the lowest snap point.
    await I.dragGrabber("down", dragTo250)
    await I.waitForSnapComplete()

    let currentHeight = await I.getContentVisibleHeight()

    const firstSnapIs250 = Math.abs(currentHeight - 250) <= 1
    const firstSnapIsLower = Math.abs(currentHeight - lowerHeight) <= 1
    expect(firstSnapIs250 || firstSnapIsLower).toBe(true)

    // Drag up to target the 250px snap point.
    await I.dragGrabber("up", 120)
    await I.waitForSnapComplete()

    currentHeight = await I.getContentVisibleHeight()

    expect(currentHeight).toBeCloseTo(250, 0)
  })
})

test.describe("drawer [defaultSnapPoint]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer-default-active-snap-point")
  })

  test("should open at default snap point and drag to 250px and 100%", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    // First, measure full height at the 100% snap point.
    await I.dragGrabber("up", 800)
    await I.waitForSnapComplete()

    const fullHeight = await I.getContentVisibleHeight()
    const viewportHeight = await I.page.evaluate(() => window.innerHeight)
    const lowerHeight = Math.min(fullHeight, viewportHeight * 0.25)

    // Close and reopen to test default snap point
    await I.pressKey("Escape")
    await I.dontSeeContent()
    await I.waitForClosedState()

    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    // Should open at default snap point (25%)
    await I.waitForVisibleHeightNear(lowerHeight, 6)

    // Drag up to reach 250px snap point using distance from measured default height.
    const dragTo250 = Math.max(80, Math.ceil(250 - lowerHeight + 40))
    await I.dragGrabber("up", dragTo250)
    await I.waitForSnapComplete()

    // Should have snapped to 250px fixed snap point
    await I.waitForVisibleHeightNear(250, 6)

    // Drag up to reach full height (100%) from the 250px snap point.
    const dragToFull = Math.max(100, Math.ceil(fullHeight - 250 + 40))
    await I.dragGrabber("up", dragToFull)
    await I.waitForSnapComplete()

    // Should be at maximum height (100% snap point)
    await I.waitForVisibleHeightNear(fullHeight, 6)
  })
})
