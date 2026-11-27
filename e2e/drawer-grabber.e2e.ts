import { test } from "./_test"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer / grabber", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer/snap-points")
    await I.clickTrigger()
    await I.waitForOpenState()
  })

  test("is a labelled button when there are snap points to step through", async () => {
    await I.seeGrabberIsButton()
    await I.seeSnapPoint("20rem")
  })

  test("steps with the arrow keys, Home and End", async () => {
    await I.focusGrabber()
    await I.pressKey("ArrowUp")
    await I.seeSnapPoint("1")
    await I.pressKey("ArrowUp")
    await I.seeSnapPoint("1")
    await I.pressKey("ArrowDown")
    await I.seeSnapPoint("20rem")
    await I.pressKey("End")
    await I.seeSnapPoint("1")
    await I.pressKey("Home")
    await I.seeSnapPoint("20rem")
  })

  test("steps to the next snap point on press, wrapping around", async () => {
    await I.clickGrabber()
    await I.seeSnapPoint("1")
    await I.clickGrabber()
    await I.seeSnapPoint("20rem")
  })
})
