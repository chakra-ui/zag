import { expect, test } from "./_test"

test.describe("toggle mute", () => {
  test("indicator swaps icons while the name stays stable", async ({ page }) => {
    await page.goto("/toggle/mute")
    const toggle = page.getByRole("button", { name: "Mute" })
    const indicator = page.locator("[data-toggle-indicator]")

    await expect(toggle).toHaveAccessibleName("Mute")
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
    await expect(indicator).not.toHaveAttribute("data-pressed", "")
    await expect(indicator.getByTestId("icon-speaker")).toBeVisible()
    await expect(indicator.getByTestId("icon-muted")).toHaveCount(0)

    await toggle.click()
    await expect(toggle).toHaveAccessibleName("Mute")
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
    await expect(indicator).toHaveAttribute("data-pressed", "")
    await expect(indicator.getByTestId("icon-muted")).toBeVisible()
    await expect(indicator.getByTestId("icon-speaker")).toHaveCount(0)

    await toggle.click()
    await expect(indicator.getByTestId("icon-speaker")).toBeVisible()
    await expect(indicator.getByTestId("icon-muted")).toHaveCount(0)
  })
})
