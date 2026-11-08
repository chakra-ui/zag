import { expect, test } from "./_test"

test.describe("fieldset server errors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/fieldset/server-errors")
  })

  test("submitting the empty form shows server errors and marks the inputs invalid", async ({ page }) => {
    const group = page.getByRole("group", { name: "Create your account" })
    const email = page.getByLabel("Email")
    const username = page.getByLabel("Username")

    await expect(page.getByText("Fix the highlighted fields to continue")).toBeHidden()
    await expect(email).not.toHaveAttribute("aria-invalid")

    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page.getByTestId("status")).toHaveText("Checking with the server…")

    await expect(page.getByText("Enter your email address")).toBeVisible()
    await expect(page.getByText("Choose a username")).toBeVisible()
    await expect(page.getByText("Fix the highlighted fields to continue")).toBeVisible()
    await expect(group).toHaveAttribute("aria-invalid", "true")
    await expect(email).toHaveAttribute("aria-invalid", "true")
    await expect(username).toHaveAttribute("aria-invalid", "true")
    await expect(group).toHaveAccessibleDescription(/Fix the highlighted fields to continue/)
  })

  test("a taken username is rejected, then a free one succeeds", async ({ page }) => {
    await page.getByLabel("Email").fill("ada@example.com")
    await page.getByLabel("Username").fill("lope")
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page.getByText("That username is already taken")).toBeVisible()
    await expect(page.getByLabel("Username")).toHaveAttribute("aria-invalid", "true")
    await expect(page.getByLabel("Email")).not.toHaveAttribute("aria-invalid")

    await page.getByLabel("Username").fill("ada")
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page.getByTestId("status")).toHaveText("Account created for ada")
    await expect(page.getByText("That username is already taken")).toBeHidden()
    await expect(page.getByLabel("Username")).not.toHaveAttribute("aria-invalid")
    await expect(page.getByRole("group", { name: "Create your account" })).not.toHaveAttribute("aria-invalid")
  })

  test("reset clears the errors", async ({ page }) => {
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page.getByText("Choose a username")).toBeVisible()
    await page.getByRole("button", { name: "Reset" }).click()
    await expect(page.getByText("Choose a username")).toBeHidden()
    await expect(page.getByLabel("Username")).not.toHaveAttribute("aria-invalid")
  })

  test("a late result after Reset is ignored", async ({ page }) => {
    await page.getByRole("button", { name: "Create account" }).click()
    await page.getByRole("button", { name: "Reset" }).click()
    await page.waitForTimeout(400)
    await expect(page.getByText("Choose a username")).toBeHidden()
    await expect(page.getByLabel("Username")).not.toHaveAttribute("aria-invalid")
    await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled()
  })
})
