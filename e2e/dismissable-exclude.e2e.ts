import { expect, test } from "./_test"

test.describe("dismissable exclude", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dismissable/exclude")
    await page.getByTestId("trigger").click()
    await expect(page.getByTestId("panel")).toBeVisible()
  })

  test("should stay open when an excluded toolbar is used", async ({ page }) => {
    await page.getByRole("button", { name: "Rating" }).click()
    await expect(page.getByTestId("status")).toHaveText("Sorted by Rating")
    await expect(page.getByTestId("panel")).toBeVisible()

    await page.getByRole("button", { name: "Newest" }).click()
    await expect(page.getByTestId("status")).toHaveText("Sorted by Newest")
    await expect(page.getByTestId("panel")).toBeVisible()
  })

  test("should close when clicking outside the layer and the toolbar", async ({ page }) => {
    await page.getByTestId("outside").click()
    await expect(page.getByTestId("panel")).toBeHidden()
  })
})
