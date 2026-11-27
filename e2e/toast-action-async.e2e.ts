import { expect, test } from "./_test"
import { ToastModel } from "./models/toast.model"

let I: ToastModel

test.describe("toast / async action", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("action-async")
  })

  test("stays open while an action that prevents the dismiss runs", async ({ page }) => {
    await I.clickExact("Archive message")
    await I.clickAction("Undo")
    await expect(page.locator("[data-toast-title]")).toHaveText("Undoing…")

    await expect(page.getByText("Message in inbox")).toBeVisible()
    await I.seeNumOfToasts(0)
  })

  test("stays open for a retry when the action fails", async ({ page }) => {
    await page.getByLabel("Fail the undo").check()
    await I.clickExact("Archive message")
    await I.clickAction("Undo")

    await expect(page.locator("[data-toast-title]")).toHaveText("Couldn't undo. Try again.")
    await I.seeNumOfToasts(1)
  })
})
