import { expect, test } from "./_test"

test.describe("focus-visible card-grid", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/focus-visible/card-grid")
  })

  test("keyboard focus marks the grid, pointer focus doesn't", async ({ page }) => {
    const grid = page.getByTestId("card-grid")
    const first = page.getByRole("button", { name: "Design system" })
    const second = page.getByRole("button", { name: "Mobile app" })

    await page.getByText("Tab through the projects").click()
    await page.keyboard.press("Tab")
    await expect(first).toBeFocused()
    await expect(grid).toHaveAttribute("data-focus-visible", "")

    await page.keyboard.press("Tab")
    await expect(second).toBeFocused()
    await expect(grid).toHaveAttribute("data-focus-visible", "")

    await first.click()
    await expect(first).toBeFocused()
    await expect(grid).not.toHaveAttribute("data-focus-visible", "")
  })

  test("leaving the grid clears the mark", async ({ page }) => {
    const grid = page.getByTestId("card-grid")
    await page.getByText("Tab through the projects").click()
    await page.keyboard.press("Tab")
    await expect(grid).toHaveAttribute("data-focus-visible", "")

    await page.keyboard.press("Shift+Tab")
    await expect(grid).not.toHaveAttribute("data-focus-visible", "")
  })
})
