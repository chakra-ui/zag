import { expect, test } from "@playwright/test"
import { BottomSheetModel } from "./models/bottom-sheet.model"

let I: BottomSheetModel

const ANIMATION_DURATION = 500

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

  test("should close when backdrop is clicked", async () => {
    await I.clickTrigger()
    await I.seeContent()

    await I.clickBackdrop()
    await I.dontSeeContent()
    await I.dontSeeBackdrop()
  })

  test("should close on escape", async () => {
    await I.clickTrigger()
    await I.pressKey("Escape")

    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("should close when dragged down past swipeVelocityThreshold", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

    await I.dragGrabber("down", 100, 100)
    await I.dontSeeContent()
  })

  test("should close when dragged down past closeThreshold", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

    const initialHeight = await I.getContentVisibleHeight()
    const dragDistance = Math.floor(initialHeight * 0.3)

    await I.dragGrabber("down", dragDistance)
    await I.dontSeeContent()
  })

  test("should stay open when dragged down slightly", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

    await I.dragGrabber("down", 100)
    await I.seeContent()
  })

  test("should no effect when dragged up", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

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

    await page.waitForTimeout(ANIMATION_DURATION)

    const initialHeight = await I.getContentVisibleHeight()

    await I.dragNoDragArea("down", 100, 500, false)
    const heightAfterNoDragAreaDrag = await I.getContentVisibleHeight()

    expect(initialHeight - heightAfterNoDragAreaDrag).toBe(0)

    await page.mouse.up()

    await I.seeContent()
    const finalHeight = await I.getContentVisibleHeight()
    expect(finalHeight).toBe(initialHeight)
  })

  test("[grabberOnly] should only allow dragging from grabber", async ({ page }) => {
    await I.controls.bool("grabberOnly", true)

    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

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

  test("should snap to defined positions", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

    const initialHeight = await I.getContentVisibleHeight()
    const middleHeight = initialHeight * 0.5
    const lowerHeight = initialHeight * 0.25

    // Drag down to middle position (50%)
    await I.dragGrabber("down", initialHeight / 2)
    await page.waitForTimeout(ANIMATION_DURATION)

    let currentHeight = await I.getContentVisibleHeight()

    // Should snap to middle (50%)
    expect(currentHeight).toBe(middleHeight)

    // Drag down more to snap to lower position (25%)
    await I.dragGrabber("down", currentHeight / 2)
    await page.waitForTimeout(ANIMATION_DURATION)

    currentHeight = await I.getContentVisibleHeight()

    // Should be at a lower snap point
    expect(currentHeight).toBe(lowerHeight)
  })
})

test.describe("bottom-sheet [defaultSnapPoint]", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
    await I.goto("/bottom-sheet-default-snap-point")
  })

  test("should open at default snap point and drag to 50% and 100%", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

    const fullHeight = 500
    const middleHeight = fullHeight * 0.5
    const lowerHeight = fullHeight * 0.25

    let currentHeight = await I.getContentVisibleHeight()

    // Should open at default snap point (25%)
    expect(currentHeight).toBe(lowerHeight)

    // Drag up to reach middle position (50%)
    await I.dragGrabber("up", 175)
    await page.waitForTimeout(ANIMATION_DURATION)

    currentHeight = await I.getContentVisibleHeight()

    // Should have snapped to middle position (50%)
    expect(currentHeight).toBe(middleHeight)

    // Drag up more to reach full height (100%)
    await I.dragGrabber("up", 250)
    await page.waitForTimeout(ANIMATION_DURATION)

    currentHeight = await I.getContentVisibleHeight()

    // Should be at maximum height (100% snap point)
    expect(currentHeight).toBe(fullHeight)

    // Try dragging up more - should not increase further as it's at max
    await I.dragGrabber("up", 100)
    await page.waitForTimeout(ANIMATION_DURATION)

    currentHeight = await I.getContentVisibleHeight()
    expect(currentHeight).toBe(fullHeight)
  })
})
