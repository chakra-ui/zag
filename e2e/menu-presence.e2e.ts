import { test } from "./_test"
import { MenuModel } from "./models/menu.model"

let I: MenuModel

// the content mounts through presence, a render after the menu opens
test.describe("menu / presence", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuModel(page)
  })

  test("should close on escape pressed before the next frame", async ({ page }) => {
    const t0 = new Date("2025-06-01T12:00:00")
    await page.clock.install({ time: t0 })
    await I.goto("/menu/presence")

    await page.clock.pauseAt(new Date(t0.getTime() + 60_000))

    await I.clickTrigger()
    await I.seeDropdown()
    await I.pressKey("Escape")
    await I.seeTriggerIsCollapsed()

    await page.clock.resume()
    await I.dontSeeDropdown()

    await I.clickTrigger()
    await I.seeDropdown()
  })
})
