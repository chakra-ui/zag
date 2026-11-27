import { test } from "./_test"
import { part } from "./_utils"
import { DrawerModel } from "./models/drawer.model"

let I: DrawerModel

test.describe("drawer / non-modal", () => {
  test.beforeEach(async ({ page }) => {
    I = new DrawerModel(page)
    await I.goto("/drawer/non-modal")
  })

  test("should restore focus to the trigger on escape", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.pressKey("Escape")
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("should restore focus to the trigger on close", async ({ page }) => {
    await I.clickTrigger()
    await I.seeContent()
    await page.locator(part("drawer", "close-trigger")).click()
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })
})
