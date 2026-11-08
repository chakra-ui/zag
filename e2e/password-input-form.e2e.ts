import { expect, test } from "./_test"

test.describe("password-input form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/password-input/form")
  })

  test("input is named and required", async ({ page }) => {
    const input = page.getByLabel("Password", { exact: true })
    await expect(input).toHaveAttribute("name", "password")
    await expect(input).toHaveAttribute("required", "")
  })

  test("empty submit is blocked, filled submit shows a masked value, reset clears", async ({ page }) => {
    const input = page.getByLabel("Password", { exact: true })
    const output = page.getByTestId("form-output")

    await page.getByRole("button", { name: "Save password" }).click()
    await expect(output).toBeHidden()
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true)

    await input.fill("correct-horse-9")
    await page.getByRole("button", { name: "Save password" }).click()
    await expect(output).toContainText('"password": "•••• (15 characters)"')
    await expect(output).not.toContainText("correct-horse-9")

    await page.getByRole("button", { name: "Reset" }).click()
    await expect(output).toBeHidden()
    await expect(input).toHaveValue("")
  })
})
