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

  test("should close when dragged down past threshold", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

    await I.dragGrabber("down", 100, 100)
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

  test("[multiple snapPoints] should snap to defined positions", async ({ page }) => {
    await I.controls.array("snapPoints", [0.25, 0.5, 1])

    await I.clickTrigger()
    await I.seeContent()

    await page.waitForTimeout(ANIMATION_DURATION)

    const initialHeight = await I.getContentVisibleHeight()
    const middleHeight = initialHeight * 0.5
    const lowerHeight = initialHeight * 0.25

    // Drag down to middle position (50%)
    await I.dragGrabber("down", initialHeight / 2)

    let currentHeight = await I.getContentVisibleHeight()

    // Should snap to middle (50%)
    expect(currentHeight).toBe(middleHeight)

    // Drag down more to snap to lower position (25%)
    await I.dragGrabber("down", currentHeight / 2)

    currentHeight = await I.getContentVisibleHeight()

    // Should be at a lower snap point
    expect(currentHeight).toBe(lowerHeight)
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
})
