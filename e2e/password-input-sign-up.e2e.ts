import { expect, test } from "./_test"

test.describe("password-input sign-up", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/password-input/sign-up")
  })

  test("asks the browser to suggest a new password", async ({ page }) => {
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("autocomplete", "new-password")
  })

  test("rules update as you type and the input is invalid until they pass", async ({ page }) => {
    const input = page.getByLabel("Password", { exact: true })
    const length = page.getByTestId("rule-length")
    const number = page.getByTestId("rule-number")

    await expect(input).not.toHaveAttribute("aria-invalid")
    await expect(length).toHaveText("At least 8 characters (not met)")
    await expect(number).toHaveText("Contains a number (not met)")

    await input.fill("abc")
    await expect(input).toHaveAttribute("aria-invalid", "true")
    await expect(length).toHaveText("At least 8 characters (not met)")

    await input.fill("abcdefgh")
    await expect(length).toHaveText("At least 8 characters (met)")
    await expect(number).toHaveText("Contains a number (not met)")
    await expect(input).toHaveAttribute("aria-invalid", "true")

    await input.fill("abcdefg1")
    await expect(number).toHaveText("Contains a number (met)")
    await expect(input).not.toHaveAttribute("aria-invalid")

    await input.fill("")
    await expect(input).not.toHaveAttribute("aria-invalid")
  })

  test("never echoes the password on the page", async ({ page }) => {
    await page.getByLabel("Password", { exact: true }).fill("hunter2hunter2")
    await expect(page.getByText("hunter2hunter2")).toHaveCount(0)
  })
})
