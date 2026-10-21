import { expect, test } from "@playwright/test"

test.use({ hasTouch: true })

test("touch opens nested menus and selection restores root trigger focus", async ({ page }) => {
  await page.goto("/menu/nested")
  const trigger = page.getByTestId("trigger")
  await trigger.tap()
  await expect(page.getByTestId("menu")).toBeFocused()
  await page.getByTestId("more-tools").tap()
  await expect(page.getByTestId("more-tools-submenu")).toBeFocused()
  await page.getByTestId("open-nested").tap()
  const nested = page.getByTestId("open-nested-submenu")
  await expect(nested).toBeFocused()
  await nested.getByRole("menuitem").first().tap()
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(trigger).toBeFocused()
})
