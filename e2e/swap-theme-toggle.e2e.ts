import { expect, test } from "./_test"

test.describe("swap theme-toggle", () => {
  test("flips between sun and moon and removes the exiting icon", async ({ page }) => {
    await page.goto("/swap/theme-toggle")
    const button = page.locator("main").getByRole("button")
    const sun = page.getByTestId("icon-sun")
    const moon = page.getByTestId("icon-moon")

    await expect(button).toHaveAccessibleName("Switch to dark theme")
    await expect(sun).toBeVisible()
    await expect(moon).toBeHidden()

    await button.click()
    await expect(button).toHaveAccessibleName("Switch to light theme")
    await expect(moon).toBeVisible()
    await expect(sun).toBeHidden()

    await button.click()
    await expect(button).toHaveAccessibleName("Switch to dark theme")
    await expect(sun).toBeVisible()
    await expect(moon).toBeHidden()
  })
})
