import { expect, test } from "@playwright/test"
import { BottomSheetModel } from "./models/bottom-sheet.model"

let I: BottomSheetModel

test.describe("bottom-sheet", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
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

test.describe("bottom-sheet [draggable=false]", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
    await I.goto("/bottom-sheet-draggable-false")
  })

  test("sheet content should not be draggable", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    await I.dragContent("down", 100, 500, false)
    const heightAfterContentDrag = await I.getContentVisibleHeight()
    expect(initialHeight - heightAfterContentDrag).toBe(0)

    await I.dragGrabber("down", 100, 500, false)
    const heightAfterGrabberDrag = await I.getContentVisibleHeight()
    expect(initialHeight - heightAfterGrabberDrag).toBe(100)
  })
})

test.describe("bottom-sheet [snapPoints]", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
    await I.goto("/bottom-sheet-snap-points")
  })

  test("should snap to defined positions", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()
    const lowerHeight = initialHeight * 0.25

    // Drag down significantly to trigger snap to 250px fixed snap point
    await I.dragGrabber("down", 300)
    await I.waitForSnapComplete()

    let currentHeight = await I.getContentVisibleHeight()

    // Should snap to 250px fixed snap point
    expect(currentHeight).toBe(250)

    // Drag down to snap to 25% position (drag less to avoid closing)
    await I.dragGrabber("down", 60)
    await I.waitForSnapComplete()

    currentHeight = await I.getContentVisibleHeight()

    // Should be at 25% snap point (allow small rounding differences)
    expect(currentHeight).toBeCloseTo(lowerHeight, 0)
  })
})

test.describe("bottom-sheet [defaultActiveSnapPoint]", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
    await I.goto("/bottom-sheet-default-active-snap-point")
  })

  test.skip("should open at default snap point and drag to 250px and 100%", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    let currentHeight = await I.getContentVisibleHeight()

    // Calculate expected heights based on actual content height
    // First, drag to 100% to get the full height
    await I.dragGrabber("up", 600)
    await I.waitForSnapComplete()

    const fullHeight = await I.getContentVisibleHeight()
    const lowerHeight = fullHeight * 0.25

    // Close and reopen to test default snap point
    await I.pressKey("Escape")
    await I.dontSeeContent()

    // Small delay to ensure state is fully reset
    await I.wait(100)

    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    currentHeight = await I.getContentVisibleHeight()

    // Should open at default snap point (25%)
    expect(currentHeight).toBeCloseTo(lowerHeight, 0)

    // Drag up to reach 250px snap point
    await I.dragGrabber("up", 100)
    await I.waitForSnapComplete()

    currentHeight = await I.getContentVisibleHeight()

    // Should have snapped to 250px fixed snap point
    expect(currentHeight).toBe(250)

    // Drag up more to reach full height (100%)
    await I.dragGrabber("up", 500)
    await I.waitForSnapComplete()

    currentHeight = await I.getContentVisibleHeight()

    // Should be at maximum height (100% snap point)
    expect(currentHeight).toBe(fullHeight)
  })
})
