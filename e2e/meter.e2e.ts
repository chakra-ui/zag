import { expect, test } from "@playwright/test"

test.describe("meter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/meter/basic")
  })

  test("should have the correct ARIA attributes", async ({ page }) => {
    const track = page.locator("[role=meter]")
    await expect(track).toHaveAttribute("aria-valuemin", "0")
    await expect(track).toHaveAttribute("aria-valuemax", "100")
    await expect(track).toHaveAttribute("aria-valuenow", "50")
    await expect(track).toHaveAttribute("data-state", "normal")
  })

  test("should update state based on thresholds", async ({ page }) => {
    const track = page.locator("[role=meter]")

    await page.getByTestId("set-20").click()
    await expect(track).toHaveAttribute("aria-valuenow", "20")
    await expect(track).toHaveAttribute("data-state", "low")

    await page.getByTestId("set-75").click()
    await expect(track).toHaveAttribute("aria-valuenow", "75")
    await expect(track).toHaveAttribute("data-state", "high")

    await page.getByTestId("set-80").click()
    await expect(track).toHaveAttribute("aria-valuenow", "80")
    await expect(track).toHaveAttribute("data-state", "high")
  })
})
