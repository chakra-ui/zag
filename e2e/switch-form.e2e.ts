import { expect, test } from "./_test"

test.describe("switch form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/switch/form")
  })

  test("the switch is named, required and has a custom value", async ({ page }) => {
    const input = page.getByRole("checkbox", { name: "Weekly newsletter" })
    await expect(input).toHaveAttribute("name", "newsletter")
    await expect(input).toHaveAttribute("value", "yes")
    await expect(input).toHaveAttribute("required", "")
  })

  test("submitting while on sends newsletter=yes, off sends nothing", async ({ page }) => {
    const output = page.getByTestId("form-output")
    await expect(output).toBeHidden()

    await page.getByTestId("switch-newsletter").click()
    await page.getByRole("button", { name: "Subscribe" }).click()
    await expect(output).toHaveText("newsletter=yes")

    await page.getByTestId("switch-newsletter").click()
    await page.getByRole("button", { name: "Subscribe" }).click()
    await expect(output).toHaveText("(no fields sent)")
  })

  test("reset turns the switch off and state agrees with the DOM", async ({ page }) => {
    const input = page.getByRole("checkbox", { name: "Weekly newsletter" })
    const output = page.getByTestId("form-output")

    await page.getByTestId("switch-newsletter").click()
    await expect(input).toBeChecked()
    await page.getByRole("button", { name: "Subscribe" }).click()
    await expect(output).toHaveText("newsletter=yes")

    await page.getByRole("button", { name: "Reset" }).click()
    await expect(output).toBeHidden()
    await expect(input).not.toBeChecked()
    await expect(page.getByTestId("switch-newsletter")).toHaveAttribute("data-state", "unchecked")
    await expect(page.locator("[data-switch-control]")).toHaveAttribute("data-state", "unchecked")

    // the machine state agrees: submitting sends nothing
    await page.getByRole("button", { name: "Subscribe" }).click()
    await expect(output).toHaveText("(no fields sent)")

    // and it can be turned on again after a reset
    await page.getByTestId("switch-newsletter").click()
    await expect(input).toBeChecked()
    await expect(page.locator("[data-switch-control]")).toHaveAttribute("data-state", "checked")
  })
})
