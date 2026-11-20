import { expect, test } from "./_test"

const item = (page: import("@playwright/test").Page, text: string) =>
  page
    .locator("[data-cascade-select-item]")
    .filter({ has: page.locator("[data-cascade-select-item-text]", { hasText: new RegExp(`^${text}$`) }) })

test.describe("cascade-select form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cascade-select/form")
  })

  test("submitting empty marks the field invalid", async ({ page }) => {
    await page.getByRole("button", { name: "Save address" }).click()
    await expect(page.getByText("Choose a delivery region")).toBeVisible()
    await expect(page.locator("[data-cascade-select-root]")).toHaveAttribute("data-invalid", "")
    await expect(page.locator("[data-cascade-select-trigger]")).toHaveAttribute("data-invalid", "")
    await expect(page.getByTestId("form-output")).toHaveCount(0)
  })

  test("submits the picked path and reset clears it", async ({ page }) => {
    await page.locator("[data-cascade-select-trigger]").click()
    await item(page, "North America").click()
    await item(page, "United States").click()
    await item(page, "New York").click()
    await expect(page.locator("[data-cascade-select-value-text]")).toContainText("New York")

    await page.getByRole("button", { name: "Save address" }).click()
    await expect(page.getByTestId("form-output")).toHaveText("region=north-america,united-states,new-york:NY")
    await expect(page.getByText("Choose a delivery region")).toHaveCount(0)
    await expect(page.locator("[data-cascade-select-root]")).not.toHaveAttribute("data-invalid", "")

    await page.getByRole("button", { name: "Clear form" }).click()
    await expect(page.getByTestId("form-output")).toHaveCount(0)
    await expect(page.locator("[data-cascade-select-value-text]")).toHaveText("Select a region")
  })
})
