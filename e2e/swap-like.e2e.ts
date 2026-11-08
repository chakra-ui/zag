import { expect, test } from "./_test"

test.describe("swap like", () => {
  test("swaps heart icons and updates the count and pressed state", async ({ page }) => {
    await page.goto("/swap/like")
    const button = page.locator("main").getByRole("button")
    const count = page.getByTestId("like-count")

    await expect(page.getByTestId("icon-unliked")).toBeVisible()
    await expect(page.getByTestId("icon-liked")).toBeHidden()
    await expect(button).toHaveAttribute("aria-pressed", "false")
    await expect(button).toHaveAccessibleName("Like, 128")
    await expect(count).toHaveText("128")

    await button.click()
    await expect(button).toHaveAccessibleName("Like, 129")
    await expect(button).toHaveAttribute("aria-pressed", "true")
    await expect(count).toHaveText("129")
    await expect(page.getByTestId("icon-liked")).toBeVisible()
    await expect(page.getByTestId("icon-unliked")).toBeHidden()

    await button.click()
    await expect(button).toHaveAccessibleName("Like, 128")
    await expect(button).toHaveAttribute("aria-pressed", "false")
    await expect(count).toHaveText("128")
    await expect(page.getByTestId("icon-unliked")).toBeVisible()
    await expect(page.getByTestId("icon-liked")).toBeHidden()
  })
})
