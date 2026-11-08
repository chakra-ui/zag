import { expect, test } from "./_test"

test.describe("password-input confirm-password", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/password-input/confirm-password")
  })

  test("toggling either field flips both", async ({ page }) => {
    const password = page.getByLabel("New password", { exact: true })
    const confirm = page.getByLabel("Confirm password", { exact: true })
    await expect(password).toHaveAttribute("type", "password")
    await expect(confirm).toHaveAttribute("type", "password")

    await page.getByRole("button", { name: "Show password" }).click()
    await expect(password).toHaveAttribute("type", "text")
    await expect(confirm).toHaveAttribute("type", "text")
    await expect(page.getByRole("button", { name: "Hide confirmation" })).toBeVisible()

    await page.getByRole("button", { name: "Hide confirmation" }).click()
    await expect(password).toHaveAttribute("type", "password")
    await expect(confirm).toHaveAttribute("type", "password")
    await expect(page.getByRole("button", { name: "Show password" })).toBeVisible()
  })

  test("status reports whether the passwords match", async ({ page }) => {
    const password = page.getByLabel("New password", { exact: true })
    const confirm = page.getByLabel("Confirm password", { exact: true })
    const status = page.getByRole("status")

    await expect(status).toHaveText("Enter both passwords")
    await password.fill("correct-horse-9")
    await confirm.fill("correct-horse")
    await expect(status).toHaveText("Passwords don't match")
    await expect(confirm).toHaveAttribute("aria-invalid", "true")

    await confirm.fill("correct-horse-9")
    await expect(status).toHaveText("Passwords match")
    await expect(confirm).not.toHaveAttribute("aria-invalid")
  })
})
