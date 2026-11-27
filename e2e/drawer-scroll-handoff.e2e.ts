import { expect, test } from "./_test"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer / scroll handoff", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto()
    await I.clickTrigger()
    await I.waitForOpenState()
  })

  test("a pull on a scrolled list scrolls it back and keeps the drawer open", async () => {
    await I.scrollContent(300)
    await I.realTouchDragList({ direction: "down", distance: 120 })
    expect(await I.getListScrollTop()).toBeLessThan(300)
    await I.seeContent()
  })

  test("a pull on the list at its top closes the drawer", async () => {
    // past half the drawer, so it closes by distance however fast the release reads
    await I.realTouchDragList({ direction: "down", distance: 420, from: "edge" })
    await I.waitForClosedState()
    await I.dontSeeContent()
  })

  test("a push up on the list at its top scrolls it", async () => {
    await I.realTouchDragList({ direction: "up", distance: 200 })
    expect(await I.getListScrollTop()).toBeGreaterThan(0)
    await I.seeContent()
  })
})
