import { expect, test } from "@playwright/test"
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
    await parentDialog.seeCloseIsFocused()
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

  test.fixme("[nested] focus return to child dialog trigger", async () => {
    await parentDialog.clickTrigger()
    await childDialog.clickTrigger({ delay: 17 })

    await childDialog.pressKey("Escape")
    await childDialog.seeTriggerIsFocused()
  })
})

test.describe("dialog / nested premounted", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog/nested-premounted")
  })

  test("should expose only the topmost dialog to assistive technology", async ({ page }) => {
    const dialog = (name: string) => page.getByRole("dialog", { name })

    await page.locator("[data-testid='trigger-1']").click()
    await page.locator("[data-testid='trigger-2']").click()
    await expect(dialog("Dialog 2")).toBeVisible()
    await expect(dialog("Dialog 1")).toHaveCount(0)

    await page.locator("[data-testid='open-3']").click()
    await expect(dialog("Dialog 3")).toBeVisible()
    await expect(dialog("Dialog 2")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(dialog("Dialog 2")).toBeVisible()
    await expect(dialog("Dialog 1")).toHaveCount(0)

    await page.keyboard.press("Escape")
    await expect(dialog("Dialog 1")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator("[data-aria-hidden]")).toHaveCount(0)
  })

  test("should expose a menu opened from inside the dialog", async ({ page }) => {
    await page.locator("[data-testid='trigger-1']").click()
    await page.locator("[data-testid='menu-trigger']").click()
    await expect(page.getByRole("menu")).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible()
  })
})
