import { test } from "@playwright/test"
import { DialogModel } from "./models/dialog.model"

let parentDialog: DialogModel
let childDialog: DialogModel

test.describe("dialog", () => {
  test.beforeEach(async ({ page }) => {
    parentDialog = new DialogModel(page, "1")
    childDialog = new DialogModel(page, "2")
    await parentDialog.goto()
  })

  test("should have no accessibility violation", async () => {
    await parentDialog.clickTrigger()
    await parentDialog.checkAccessibility()
  })

  test("should focus on close button when dialog is open", async () => {
    await parentDialog.clickTrigger()
    await parentDialog.seeCloseIsFocused()
  })

  test("should close modal on escape", async () => {
    await parentDialog.clickTrigger()
    await parentDialog.pressKey("Escape")

    await parentDialog.dontSeeContent()
    await parentDialog.seeTriggerIsFocused()
  })

  test("[nested] should focus close button", async () => {
    await parentDialog.clickTrigger()
    await childDialog.clickTrigger({ delay: 17 })

    await childDialog.seeCloseIsFocused()
  })

  test("[nested] should close parent modal from child", async ({ page }) => {
    await parentDialog.clickTrigger()
    await childDialog.clickTrigger({ delay: 17 })

    await page.click("[data-testid=special-close]")

    await childDialog.dontSeeContent()
    await parentDialog.dontSeeContent()
    await parentDialog.seeTriggerIsFocused()
  })

  test("[nested] focus return to child dialog trigger", async () => {
    await parentDialog.clickTrigger()
    await childDialog.clickTrigger({ delay: 17 })

    await childDialog.pressKey("Escape")
    await childDialog.seeTriggerIsFocused()
  })
})
