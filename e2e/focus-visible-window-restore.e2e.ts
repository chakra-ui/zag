import { expect, test } from "./_test"

test.describe("focus-visible window-restore", () => {
  test("recent searches open on focus, but not when the window restores focus", async ({ page }) => {
    await page.goto("/focus-visible/window-restore")
    const search = page.getByRole("searchbox", { name: "Search docs" })
    const recent = page.getByRole("list", { name: "Recent searches" })
    const lastFocus = page.getByTestId("last-focus")

    await search.click()
    await expect(recent).toBeVisible()
    await expect(lastFocus).toHaveText("Moved by you")

    // switching tabs: the field loses focus, the window blurs, then the browser restores focus
    await search.evaluate((el) => el.blur())
    await expect(recent).toBeHidden()
    await page.evaluate(() => window.dispatchEvent(new FocusEvent("blur")))
    await search.focus()

    await expect(lastFocus).toHaveText("Restored by the window")
    await expect(recent).toBeHidden()

    await search.evaluate((el) => el.blur())
    await search.click()
    await expect(lastFocus).toHaveText("Moved by you")
    await expect(recent).toBeVisible()
  })

  test("picking a recent search fills the field", async ({ page }) => {
    await page.goto("/focus-visible/window-restore")
    const search = page.getByRole("searchbox", { name: "Search docs" })
    await search.click()
    await page.getByRole("button", { name: "Controlled state" }).click()
    await expect(search).toHaveValue("Controlled state")
    await expect(search).toBeFocused()
  })
})
