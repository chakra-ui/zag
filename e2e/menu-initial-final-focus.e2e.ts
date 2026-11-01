import { expect, test } from "./_test"

const trigger = "[data-testid=trigger]"
const content = "[data-scope=menu][data-part=content]"
const secondary = "[data-testid=secondary]"
const finalFocus = "[data-testid=final-focus]"
const contextTrigger = "[data-testid=context-trigger]"
const contextContent = "[data-testid=context-content]"
const noFocusTrigger = "[data-testid=no-focus-trigger]"
const noFocusContent = "[data-testid=no-focus-content]"
const outside = "[data-testid=outside]"

test.describe("menu / initialFocusEl and finalFocusEl", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu/initial-final-focus")
  })

  test("should focus initialFocusEl when opened by click", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content).first()).toBeVisible()
    await expect(page.locator(secondary)).toBeFocused()
  })

  test("should focus finalFocusEl on escape", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(secondary)).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(page.locator(content).first()).toBeHidden()
    await expect(page.locator(finalFocus)).toBeFocused()
  })

  test("should not override focus when an outside focusable dismisses the menu", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(secondary)).toBeFocused()

    await page.click(outside)
    await expect(page.locator(content).first()).toBeHidden()
    await expect(page.locator(outside)).toBeFocused()
  })

  test("should focus finalFocusEl when a context menu closes", async ({ page }) => {
    await page.click(contextTrigger, { button: "right" })
    await expect(page.locator(contextContent)).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(page.locator(contextContent)).toBeHidden()
    await expect(page.locator(finalFocus)).toBeFocused()
  })

  test("should not move focus when initialFocusEl returns false", async ({ page }) => {
    await page.focus(noFocusTrigger)
    await page.keyboard.press("Enter")
    await expect(page.locator(noFocusContent)).toBeVisible()
    await expect(page.locator(noFocusTrigger)).toBeFocused()
  })
})
