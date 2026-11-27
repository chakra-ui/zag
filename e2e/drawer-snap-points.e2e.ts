import { expect, test } from "./_test"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer / snap points", () => {
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

    await I.mouseDragGrabber({ direction: "up", distance: 250 })
    await I.waitForSnapComplete()

    let currentHeight = await I.getContentVisibleHeight()
    expect(currentHeight).toBeGreaterThan(initialHeight + 80)

    await I.mouseDragGrabber({ direction: "down", distance: 250 })
    await I.waitForSnapComplete()

    currentHeight = await I.getContentVisibleHeight()
    expect(Math.abs(currentHeight - rem20Px)).toBeLessThanOrEqual(4)
  })
})
