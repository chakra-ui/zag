import { expect, test } from "./_test"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer / draggable false", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer/draggable-false")
  })

  test("sheet content should not be draggable", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()

    await I.dragContent({ direction: "down", distance: 100, duration: 500, release: false })
    const heightAfterContentDrag = await I.getContentVisibleHeight()
    expect(initialHeight - heightAfterContentDrag).toBe(0)

    // Release mouse before starting a new drag gesture
    await page.mouse.up()

    await I.mouseDragGrabber({ direction: "down", distance: 100, duration: 500, release: false })
    const heightAfterGrabberDrag = await I.getContentVisibleHeight()
    expect(initialHeight - heightAfterGrabberDrag).toBe(100)
  })
})
