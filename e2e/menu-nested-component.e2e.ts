import { expect, test } from "./_test"
import { testid } from "./_utils"
import { MenuModel } from "./models/menu.model"

test.describe("menu / nested component", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "vue", "Vue example")

  test("should open a submenu that receives an inline object prop", async ({ page }) => {
    const I = new MenuModel(page)
    await I.goto("/menu/nested-component")

    await I.clickTrigger()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")

    await page.keyboard.press("ArrowRight")
    await expect(page.locator(testid("share-submenu"))).toBeFocused()

    await I.dontSeeInConsole("Maximum recursive updates")
  })
})
