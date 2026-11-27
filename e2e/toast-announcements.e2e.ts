import { expect, test } from "./_test"
import { ToastModel } from "./models/toast.model"

let I: ToastModel

test.describe("toast / announcements", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("basic")
  })

  test("reads a toast's title and description politely", async ({ page }) => {
    await I.clickExact("Show toast")
    await expect(page.locator('[data-live-announcer][aria-live="polite"]')).toHaveText(
      "Event created. Sunday, December 3 at 9:00 AM",
    )
  })

  test("reads an error assertively", async ({ page }) => {
    await I.clickExact("Error")
    await expect(page.locator('[data-live-announcer][aria-live="assertive"]')).toHaveText(
      "Couldn't save changes. Check your connection.",
    )
  })

  test("reads toasts that arrive together as one announcement", async ({ page }) => {
    await page.evaluate(() => {
      const [success, info] = ["Success", "Info"].map((name) =>
        [...document.querySelectorAll("button")].find((button) => button.textContent === name),
      )
      success?.click()
      info?.click()
    })
    await expect(page.locator('[data-live-announcer][aria-live="polite"]')).toHaveText(
      "Changes saved. A new version is available",
    )
  })

  test("doesn't make the visible stack a live region", async ({ page }) => {
    await I.clickExact("Show toast")
    await expect(page.locator("[data-toast-group][aria-live]")).toHaveCount(0)
    await expect(page.locator("[data-toast-root]").first()).toHaveAttribute("role", "group")
  })
})
