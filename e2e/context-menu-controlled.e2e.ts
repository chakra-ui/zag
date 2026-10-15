import { test } from "@playwright/test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

test.describe("controlled context menu / touch", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
    await I.goto("/context-menu/controlled")
  })

  test("should not open on tap", async ({ page }) => {
    const point = await I.getContextTriggerPoint()
    await I.tapContextTrigger(point)

    await page.waitForTimeout(1000)
    await I.dontSeeDropdown()
  })

  test("should open on long-press", async ({ page }) => {
    const point = await I.getContextTriggerPoint()
    await I.longPressContextTrigger(point)

    await page.waitForTimeout(800)
    await I.seeDropdown()
    await I.seeMenuIsPositionedNear(point)

    await I.releaseContextTrigger(point)
    await I.seeDropdown()
  })
})
