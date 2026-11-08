import { expect, test } from "./_test"

test.describe("switch two-factor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/switch/two-factor")
  })

  test("the description is attached to the switch", async ({ page }) => {
    const input = page.getByRole("checkbox", { name: "Two-factor authentication" })
    await expect(input).toHaveAttribute("required", "")
    await expect(input).toHaveAccessibleDescription(/6-digit code/)
  })

  test("saving with it off shows the error, turning it on clears it", async ({ page }) => {
    const input = page.getByRole("checkbox", { name: "Two-factor authentication" })
    const error = page.getByText("Turn on two-factor authentication to continue.")
    await expect(error).toBeHidden()
    await expect(input).not.toHaveAttribute("aria-invalid", "true")

    await page.getByRole("button", { name: "Save security settings" }).click()
    await expect(error).toBeVisible()
    await expect(input).toHaveAttribute("aria-invalid", "true")
    await expect(input).toHaveAccessibleDescription(/Turn on two-factor authentication to continue\./)
    await expect(page.getByTestId("switch-two-factor")).toHaveAttribute("data-invalid", "")
    await expect(page.getByRole("status")).toBeHidden()

    await page.getByTestId("switch-two-factor").click()
    await expect(error).toBeHidden()
    await expect(input).not.toHaveAttribute("aria-invalid", "true")

    await page.getByRole("button", { name: "Save security settings" }).click()
    await expect(page.getByRole("status")).toHaveText("Two-factor authentication is on.")
  })
})
