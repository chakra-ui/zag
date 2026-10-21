import { expect, test } from "@playwright/test"
import { DialogModel } from "./models/dialog.model"

let I: DialogModel

test.describe("dialog [non-modal]", () => {
  test.beforeEach(async ({ page }) => {
    I = new DialogModel(page, "1")
    await I.goto("/dialog/non-modal")
  })

  test("should restore focus to the trigger on escape", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.pressKey("Escape")
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("should restore focus to the trigger on close", async () => {
    await I.clickTrigger()
    await I.clickClose()
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("should restore focus to the trigger on outside press of plain content", async ({ page }) => {
    await I.clickTrigger()
    await page.getByTestId("outside-content").click()
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })

  test("should keep focus on the focusable element pressed outside", async ({ page }) => {
    await I.clickTrigger()
    await page.getByTestId("outside-input").click()
    await I.dontSeeContent()
    await expect(page.getByTestId("outside-input")).toBeFocused()
  })
})
