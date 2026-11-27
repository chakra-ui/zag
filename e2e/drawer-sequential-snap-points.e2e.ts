import { expect, test } from "./_test"
import { controls } from "./_utils"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer / sequential snap points", () => {
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
    await I.mouseDragGrabber({ direction: "up", distance: 100 })
    await I.waitForSnapComplete()

    const newHeight = await I.getContentVisibleHeight()
    expect(newHeight).toBeGreaterThan(initialHeight + 50)
  })

  test("should not dismiss on fast swipe down from full height, should snap instead", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    // Sequential mode: 20rem → 1 (full) in one step
    await I.mouseDragGrabber({ direction: "up", distance: 200 })
    await I.waitForSnapComplete()
    await I.waitForOpenState()

    // Swipe down — should snap to lower point, NOT dismiss
    await I.mouseDragGrabber({ direction: "down", distance: 150 })
    await I.waitForSnapComplete()

    // Drawer should still be visible (snapped, not dismissed)
    await I.seeContent()
  })
})
