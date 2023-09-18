import { expect, type Page, test, type Locator } from "@playwright/test"
import { a11y, controls, part } from "./__utils"

class PageModel {
  constructor(public readonly page: Page) {}
  get bold() {
    return this.page.locator(part("item")).nth(0)
  }
  get italic() {
    return this.page.locator(part("item")).nth(1)
  }
  get underline() {
    return this.page.locator(part("item")).nth(2)
  }
  expectToBeFocused(locator: Locator) {
    return expect(locator).toHaveAttribute("data-highlighted", "")
  }
  expectNotToBeFocused(locator: Locator) {
    return expect(locator).not.toHaveAttribute("data-highlighted", "")
  }
  expectToBeSelected(locator: Locator) {
    return expect(locator).toHaveAttribute("data-state", "on")
  }
  expectNotToBeSelected(locator: Locator) {
    return expect(locator).not.toHaveAttribute("data-state", "on")
  }
  setMultiple() {
    return controls(this.page).bool("multiple")
  }
}

test.describe("toggle-group", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/toggle-group")
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("[single] should select on click", async ({ page }) => {
    const screen = new PageModel(page)

    await screen.bold.click()
    await screen.expectToBeSelected(screen.bold)

    await screen.italic.click()
    await screen.expectToBeSelected(screen.italic)
    await screen.expectNotToBeSelected(screen.bold)
  })

  test("[single] should select and deselect", async ({ page }) => {
    const screen = new PageModel(page)

    await screen.bold.click()
    await screen.expectToBeSelected(screen.bold)

    await screen.bold.click()
    await screen.expectNotToBeSelected(screen.bold)
  })

  test("[multiple] should select multiple", async ({ page }) => {
    const screen = new PageModel(page)
    await screen.setMultiple()

    await screen.bold.click()
    await screen.italic.click()

    await screen.expectToBeSelected(screen.bold)
    await screen.expectToBeSelected(screen.italic)
  })

  test("[keyboard] when no toggle is selected, focus first toggle", async ({ page }) => {
    const screen = new PageModel(page)

    // focus on outside button
    const outsideButton = page.getByRole("button", { name: "Outside" })
    await outsideButton.focus()
    await page.keyboard.press("Tab")

    await expect(screen.bold).toBeFocused()

    // shift tab back to outside button
    await page.keyboard.press("Shift+Tab")
    await expect(screen.bold).not.toBeFocused()
    await expect(outsideButton).toBeFocused()
  })
})
