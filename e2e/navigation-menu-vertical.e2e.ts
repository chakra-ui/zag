import { expect, test } from "./_test"

test.describe("navigation-menu vertical", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/navigation-menu/vertical")
  })

  test("arrow keys move between triggers and skip the disabled one", async ({ page }) => {
    const account = page.getByRole("button", { name: "Account" })
    const billing = page.getByRole("button", { name: "Billing" })
    const notifications = page.getByRole("button", { name: "Notifications" })

    await expect(billing).toBeDisabled()
    await account.focus()
    await page.keyboard.press("ArrowDown")
    await expect(notifications).toBeFocused()

    await page.keyboard.press("ArrowUp")
    await expect(account).toBeFocused()
  })

  test("ArrowRight enters the open content", async ({ page }) => {
    const account = page.getByRole("button", { name: "Account" })
    await account.click()
    await expect(account).toHaveAttribute("aria-expanded", "true")
    await expect(page.getByRole("link", { name: "Profile" })).toBeVisible()

    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("link", { name: "Profile" })).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(page.getByRole("link", { name: "Profile" })).toBeHidden()
    await expect(account).toBeFocused()
  })

  test("the disabled item never opens", async ({ page }) => {
    await page.getByRole("button", { name: "Billing" }).click({ force: true })
    await expect(page.getByRole("link", { name: "Invoices" })).toBeHidden()
  })
})
