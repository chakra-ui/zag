import { expect, test } from "./_test"

test.describe("switch settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/switch/settings")
  })

  test("low power mode disables the other switches, turning it off enables them again", async ({ page }) => {
    const lowPower = page.getByRole("checkbox", { name: "Low power mode" })
    const background = page.getByRole("checkbox", { name: "Background refresh" })
    const location = page.getByRole("checkbox", { name: "Location services" })

    await expect(background).toBeChecked()
    await expect(background).toBeEnabled()
    await expect(location).toBeEnabled()

    await page.getByTestId("switch-low-power").click()
    await expect(lowPower).toBeChecked()
    await expect(background).toBeDisabled()
    await expect(location).toBeDisabled()
    await expect(page.getByTestId("switch-background")).toHaveAttribute("data-disabled", "")

    // disabled switches cannot be toggled
    await page.getByTestId("switch-background").click({ force: true })
    await page.getByTestId("switch-location").click({ force: true })
    await expect(background).toBeChecked()
    await expect(location).toBeChecked()

    await page.getByTestId("switch-low-power").click()
    await expect(lowPower).not.toBeChecked()
    await expect(background).toBeEnabled()
    await expect(location).toBeEnabled()
    await expect(page.getByTestId("switch-background")).not.toHaveAttribute("data-disabled", "")

    // and they work again
    await page.getByTestId("switch-background").click()
    await expect(background).not.toBeChecked()
  })

  test("a switch toggled before low power keeps its state while disabled", async ({ page }) => {
    await page.getByTestId("switch-location").click()
    await expect(page.getByRole("checkbox", { name: "Location services" })).not.toBeChecked()

    await page.getByTestId("switch-low-power").click()
    await expect(page.getByRole("checkbox", { name: "Location services" })).toBeDisabled()
    await expect(page.getByRole("checkbox", { name: "Location services" })).not.toBeChecked()
  })
})
