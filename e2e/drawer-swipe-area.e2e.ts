import { test } from "@playwright/test"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer [swipe-area]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer/swipe-area")
  })

  test("should open when swiped up from swipe area", async () => {
    await I.swipeArea("up", 300)
    await I.seeContent()
    await I.seeBackdrop()
  })

  test("should not open on pointer down without swipe", async ({ page }) => {
    const swipeArea = page.locator("[data-part=swipe-area]")
    const box = await swipeArea.boundingBox()
    if (!box) throw new Error("Swipe area not found")

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(200)
    await page.mouse.up()

    await I.dontSeeContent()
  })

  test("should not open on small swipe", async () => {
    await I.swipeArea("up", 3)
    await I.dontSeeContent()
  })

  test("should close when clicked outside after swipe open", async () => {
    await I.swipeArea("up", 300)
    await I.waitForOpenState()

    await I.clickOutside()

    await I.dontSeeContent()
    await I.dontSeeBackdrop()
  })

  test("should close on escape after swipe open", async () => {
    await I.swipeArea("up", 300)
    await I.waitForOpenState()

    await I.pressKey("Escape")

    await I.dontSeeContent()
  })

  test("should close when swiped down after swipe open", async () => {
    await I.swipeArea("up", 300)
    await I.waitForOpenState()

    await I.mouseDragGrabber("down", 200, 100)

    await I.dontSeeContent()
    await I.dontSeeBackdrop()
  })

  test("should close via close button after swipe open", async ({ page }) => {
    await I.swipeArea("up", 300)
    await I.waitForOpenState()

    await page.click("[data-part=close-trigger]")

    await I.dontSeeContent()
    await I.dontSeeBackdrop()
  })
})
