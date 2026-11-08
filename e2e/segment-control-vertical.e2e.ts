import { expect, test } from "./_test"

test.describe("segment-control vertical", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/segment-control/vertical")
  })

  test("ArrowDown and ArrowUp move the selection and the panel", async ({ page }) => {
    const panel = page.getByTestId("panel")
    await expect(page.getByRole("radiogroup")).toHaveAttribute("aria-orientation", "vertical")
    await expect(panel).toContainText("Your name, photo and public bio.")

    await page.getByRole("radio", { name: "Profile" }).focus()
    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("radio", { name: "Notifications" })).toBeChecked()
    await expect(panel).toContainText("Choose which emails and push alerts you receive.")

    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("radio", { name: "Billing" })).toBeChecked()
    await expect(panel).toContainText("Update your card")

    await page.keyboard.press("ArrowUp")
    await expect(page.getByRole("radio", { name: "Notifications" })).toBeChecked()
  })

  test("items stack and the indicator follows vertically", async ({ page }) => {
    const profile = (await page.getByTestId("radio-profile").boundingBox())!
    const security = (await page.getByTestId("radio-security").boundingBox())!
    expect(security.y).toBeGreaterThan(profile.y + profile.height - 1)
    expect(Math.abs(security.x - profile.x)).toBeLessThan(2)

    const indicator = page.locator("[data-radio-group-indicator]")
    await expect(indicator).toBeVisible()
    const before = (await indicator.boundingBox())!
    await page.getByTestId("radio-security").click()
    await expect(page.getByTestId("panel")).toContainText("two-factor")
    await expect.poll(async () => (await indicator.boundingBox())!.y).toBeGreaterThan(before.y + profile.height * 2)
  })
})
