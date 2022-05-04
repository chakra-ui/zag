import { test, expect } from "@playwright/test"
import { testid, a11y, controls } from "./__utils"

const trigger = testid("popover-trigger")
const content = testid("popover-content")
const close = testid("popover-close-button")

const buttonBefore = testid("button-before")
const buttonAfter = testid("button-after")
const link = testid("focusable-link")
const text = testid("plain-text")

test.describe("popover", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/popover")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test("[focus] should move focus inside the popover content to the first focusable element", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(link)).toBeFocused()
  })

  test("[keyboard] should open the Popover on press `Enter`", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("Enter")
    await expect(page.locator(content)).toBeVisible()
  })

  test("[keyboard] should close the Popover on press `Escape`", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("Enter")
    await expect(page.locator(content)).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
    await expect(page.locator(trigger)).toBeFocused()
  })

  test("[keyboard / modal] on tab: should trap focus within popover content", async ({ page }) => {
    await controls(page).bool("modal")

    await page.focus(trigger)
    await page.keyboard.press("Enter")

    await expect(page.locator(link)).toBeFocused()
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(page.locator(link)).toBeFocused()
  })

  test("[keyboard / non-modal] on tab outside: should move focus to next tabbable element after button", async ({
    page,
  }) => {
    await page.focus(trigger)
    await page.keyboard.press("Enter")

    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")

    await expect(page.locator(buttonAfter)).toBeFocused()
  })

  test("[keyboard / non-modal] on shift-tab outside: should move focus to trigger", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("Enter")

    await page.keyboard.press("Shift+Tab")
    await expect(page.locator(trigger)).toBeFocused()
    await expect(page.locator(content)).toBeHidden()
  })

  test("[keyboard] escape closes the popover", async ({ page }) => {
    await page.focus(trigger)
    await page.keyboard.press("Enter")
    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
    await expect(page.locator(trigger)).toBeFocused()
  })

  test("[pointer] close the popover on click close button", async ({ page }) => {
    await page.click(trigger)
    await page.locator(close).click()
    await expect(page.locator(content)).toBeHidden()
  })

  test("[pointer] should to open/close a popover on trigger click", async ({ page }) => {
    await page.click(trigger)
    await expect(page.locator(content)).toBeVisible()
    await page.click(trigger)
    await expect(page.locator(content)).toBeHidden()
  })

  test("[pointer] when clicking outside, should re-focus the button on click non-focusable element", async ({
    page,
  }) => {
    await page.click(trigger)
    await page.locator(text).click({ force: true })
    await expect(page.locator(trigger)).toBeFocused()
  })

  test("[pointer] when clicking outside on focusable element, should not re-focus the button", async ({ page }) => {
    await page.click(trigger)
    await page.click(buttonBefore)
    await expect(page.locator(buttonBefore)).toBeFocused()
    await expect(page.locator(content)).toBeHidden()
    await expect(page.locator(trigger)).not.toBeFocused()
  })
})
