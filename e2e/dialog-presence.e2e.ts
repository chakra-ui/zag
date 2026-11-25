import { test } from "./_test"
import { DialogModel } from "./models/dialog.model"

let I: DialogModel

test.describe("dialog / presence", () => {
  test.beforeEach(async ({ page }) => {
    I = new DialogModel(page, "1")
  })

  test("should focus the first input before the next frame", async ({ page }) => {
    const t0 = new Date("2025-06-01T12:00:00")
    await page.clock.install({ time: t0 })
    await I.goto("/dialog/presence")

    await page.clock.pauseAt(new Date(t0.getTime() + 60_000))

    await I.clickTrigger()
    await I.seeContent()
    await I.seeInputIsFocused()

    await page.clock.resume()
    await I.pressKey("Escape")
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })
})
