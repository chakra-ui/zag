import { expect, test } from "./_test"

test.describe("radio-group plan-picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/radio-group/plan-picker")
  })

  test("clicking a plan updates the external text", async ({ page }) => {
    const selected = page.getByTestId("selected-plan")
    await expect(selected).toHaveText("Selected plan: Free")

    await page.getByTestId("radio-pro").click()
    await expect(page.getByRole("radio", { name: /Pro/ })).toBeChecked()
    await expect(selected).toHaveText("Selected plan: Pro")
  })

  test("the external button selects a plan programmatically", async ({ page }) => {
    await page.getByRole("button", { name: "Switch to Team" }).click()
    await expect(page.getByRole("radio", { name: /Team/ })).toBeChecked()
    await expect(page.getByTestId("selected-plan")).toHaveText("Selected plan: Team")

    // then back through the UI
    await page.getByTestId("radio-free").click()
    await expect(page.getByTestId("selected-plan")).toHaveText("Selected plan: Free")
    await expect(page.getByRole("radio", { name: /Team/ })).not.toBeChecked()
  })

  test("the sold out plan cannot be selected", async ({ page }) => {
    const enterprise = page.getByRole("radio", { name: /Enterprise/ })
    await expect(enterprise).toBeDisabled()
    await expect(page.getByTestId("radio-enterprise")).toContainText("Sold out")

    await page.getByTestId("radio-enterprise").click({ force: true })
    await expect(enterprise).not.toBeChecked()
    await expect(page.getByTestId("selected-plan")).toHaveText("Selected plan: Free")

    // arrow keys skip the disabled plan: Team wraps to Free
    await page.getByRole("button", { name: "Switch to Team" }).click()
    await expect(page.getByRole("radio", { name: /Team/ })).toBeChecked()
    await page.getByRole("radio", { name: /Team/ }).focus()
    await page.keyboard.press("ArrowDown")
    await expect(page.getByRole("radio", { name: /Free/ })).toBeChecked()
    await expect(page.getByRole("radio", { name: /Team/ })).not.toBeChecked()
    await expect(enterprise).not.toBeChecked()
  })
})
