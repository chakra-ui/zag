import { expect, test } from "./_test"

test.describe("editable table-cells", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editable/table-cells")
  })

  test("double-click to edit, Enter commits and logs the rename", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: "Platform" })
    await row.getByLabel("Rename row 2").dblclick()

    const input = row.getByRole("textbox", { name: "Name, row 2" })
    await expect(input).toBeFocused()
    await input.fill("Grace B. Hopper")
    await input.press("Enter")

    await expect(row.locator("[data-editable-preview]")).toHaveText("Grace B. Hopper")
    await expect(page.getByTestId("activity").getByRole("listitem").first()).toHaveText(
      "Renamed Grace Hopper to Grace B. Hopper",
    )
  })

  test("Escape restores the name and logs the revert", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: "Research" })
    await row.getByLabel("Rename row 3").dblclick()

    const input = row.getByRole("textbox", { name: "Name, row 3" })
    await input.fill("A. Turing")
    await input.press("Escape")

    await expect(row.locator("[data-editable-preview]")).toHaveText("Alan Turing")
    await expect(page.getByTestId("activity").getByRole("listitem").first()).toHaveText("Kept Alan Turing")
  })

  test("a single click doesn't start editing", async ({ page }) => {
    const row = page.locator("tbody tr").filter({ hasText: "Engineering" })
    await row.locator("[data-editable-preview]").click()
    await expect(row.getByRole("textbox")).toBeHidden()
  })
})
