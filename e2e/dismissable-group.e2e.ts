import { expect, test } from "./_test"

test.describe("dismissable group", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dismissable/group")
    await page.getByTestId("trigger-a").click()
    await page.getByTestId("open-details").click()
  })

  test("should keep the panel it opened from inside another open when the first closes", async ({ page }) => {
    await expect(page.getByTestId("panel-a")).toBeVisible()
    await expect(page.getByTestId("panel-b")).toBeVisible()

    await page.getByTestId("trigger-a").click()
    await expect(page.getByTestId("panel-a")).toBeHidden()
    await expect(page.getByTestId("panel-b")).toBeVisible()
  })

  test("should close the topmost panel first on Escape", async ({ page }) => {
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("panel-b")).toBeHidden()
    await expect(page.getByTestId("panel-a")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByTestId("panel-a")).toBeHidden()
  })

  test("should close everything on an outside click", async ({ page }) => {
    await page.getByTestId("outside").click()
    await expect(page.getByTestId("panel-a")).toBeHidden()
    await expect(page.getByTestId("panel-b")).toBeHidden()
  })
})
