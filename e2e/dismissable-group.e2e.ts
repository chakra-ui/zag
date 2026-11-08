import { expect, test } from "./_test"

test.describe("dismissable group", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dismissable/group")
  })

  test("should keep both peers open and close the topmost on Escape", async ({ page }) => {
    await page.getByTestId("trigger-a").click()
    await expect(page.getByTestId("panel-a")).toBeVisible()
    await page.getByTestId("trigger-b").click()
    await expect(page.getByTestId("panel-b")).toBeVisible()
    await expect(page.getByTestId("panel-a")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByTestId("panel-b")).toBeHidden()
    await expect(page.getByTestId("panel-a")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByTestId("panel-a")).toBeHidden()
  })

  test("should close a peer without closing the other when it is toggled", async ({ page }) => {
    await page.getByTestId("trigger-a").click()
    await page.getByTestId("trigger-b").click()
    await page.getByTestId("trigger-a").click()
    await expect(page.getByTestId("panel-a")).toBeHidden()
    await expect(page.getByTestId("panel-b")).toBeVisible()
  })

  test("should close everything on an outside click", async ({ page }) => {
    await page.getByTestId("trigger-a").click()
    await page.getByTestId("trigger-b").click()
    await page.getByTestId("outside").click()
    await expect(page.getByTestId("panel-a")).toBeHidden()
    await expect(page.getByTestId("panel-b")).toBeHidden()
  })
})
