import { expect, test, type Page } from "@playwright/test"
import { a11y, controls, part } from "./_utils"

const root = part("root")
const trigger = part("trigger")
const content = part("content")

const expectToBeOpen = async (page: Page) => {
  await expect(page.locator(root)).toHaveAttribute("data-state", "open")
  await expect(page.locator(trigger)).toHaveAttribute("data-state", "open")
  await expect(page.locator(content)).toHaveAttribute("data-state", "open")
}

test.beforeEach(async ({ page }) => {
  await page.goto("/collapsible")
})

test("should have no accessibility violation", async ({ page }) => {
  await a11y(page)
})

test("should be open when clicked", async ({ page }) => {
  await page.click(trigger)
  await expectToBeOpen(page)
})

test("should be focused when page is tabbed", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(trigger)).toBeFocused()
  await expect(page.locator(trigger)).toHaveAttribute("data-focus", "")
})

test("should be open when spacebar is pressed while focused", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await page.keyboard.press(" ")
  await expectToBeOpen(page)
})

test("should have disabled attributes when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await expect(page.locator(trigger)).toHaveAttribute("data-disabled", "")
  await expect(page.locator(trigger)).toBeDisabled()
})

test("should not be focusable when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(trigger)).not.toBeFocused()
})

test("input is not blurred on trigger click", async ({ page }) => {
  let blurCount = 0
  await page.exposeFunction("trackBlur", () => blurCount++)
  await page.locator(trigger).evaluate((input) => {
    input.addEventListener("blur", (window as any).trackBlur)
  })
  await page.click(trigger)
  await page.click(trigger)
  await page.click(trigger)
  expect(blurCount).toBe(0)
})
