import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/select/nested-dialog")
  await page.getByTestId("parent-trigger").click()
  await page.getByTestId("child-trigger").click()
})

test("lazy select stacks above nested dialogs on first open and reopen", async ({ page }) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByTestId("select-trigger").click()
    const positioner = page.getByTestId("select-positioner")
    await expect(positioner).toHaveCSS("z-index", "1302")
    await expect(page.getByTestId("select-content")).toBeFocused()

    // A visibility check alone does not detect an option covered by the parent layer.
    await expect
      .poll(() =>
        page.getByRole("option", { name: "Apple" }).evaluate((el) => {
          const rect = el.getBoundingClientRect()
          return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
        }),
      )
      .toBe(true)
    await page.keyboard.press("Home")
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("select-trigger")).toHaveText("Apple")
    await expect(page.getByTestId("select-content")).toHaveCount(0)
  }
})

test("Escape closes select then child then parent and preserves exit stacking", async ({ page }) => {
  await page.getByTestId("select-trigger").click()
  const positioner = page.getByTestId("select-positioner")
  await expect(positioner).toHaveCSS("z-index", "1302")
  await page.keyboard.press("Escape")
  await expect(page.getByTestId("select-content")).toHaveAttribute("data-state", "closed")
  await expect(positioner).toHaveCSS("z-index", "1302")
  await expect(page.getByTestId("select-trigger")).toBeFocused()
  await expect(page.getByTestId("select-content")).toHaveCount(0)
  await expect(page.getByTestId("child-content")).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(page.getByTestId("child-content")).toHaveCount(0)
  await expect(page.getByTestId("child-trigger")).toBeFocused()
  await expect(page.getByTestId("parent-content")).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(page.getByTestId("parent-content")).toHaveCount(0)
  await expect(page.getByTestId("parent-trigger")).toBeFocused()
})

test("supports typeahead and clicking an option above the child dialog", async ({ page }) => {
  await page.getByTestId("select-trigger").click()
  await page.keyboard.type("ch")
  await page.keyboard.press("Enter")
  await expect(page.getByTestId("select-trigger")).toHaveText("Cherry")
  await expect(page.getByTestId("select-content")).toHaveCount(0)

  await page.getByTestId("select-trigger").click()
  await page.getByRole("option", { name: "Banana" }).click()
  await expect(page.getByTestId("select-trigger")).toHaveText("Banana")
  await expect(page.getByTestId("select-content")).toHaveCount(0)
  await expect(page.getByTestId("child-content")).toBeVisible()
})
