import { expect, test } from "./_test"

test.describe("swap menu-toggle", () => {
  test("swaps hamburger and close icons and updates the button state", async ({ page }) => {
    await page.goto("/swap/menu-toggle")
    const button = page.locator("main").getByRole("button")
    const menu = page.getByTestId("icon-menu")
    const close = page.getByTestId("icon-close")

    await expect(button).toHaveAccessibleName("Open menu")
    await expect(menu).toBeVisible()
    await expect(close).toBeHidden()
    await expect(button).toHaveAttribute("aria-expanded", "false")

    await button.click()
    await expect(button).toHaveAccessibleName("Close menu")
    await expect(button).toHaveAttribute("aria-expanded", "true")
    await expect(close).toBeVisible()
    await expect(menu).toBeHidden()

    await button.click()
    await expect(button).toHaveAccessibleName("Open menu")
    await expect(button).toHaveAttribute("aria-expanded", "false")
    await expect(menu).toBeVisible()
    await expect(close).toBeHidden()
  })
})
