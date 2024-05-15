import { expect, type Page, test } from "@playwright/test"
import { a11y, controls, part, testid } from "./_utils"

const root = part("root")
const label = part("label")
const control = part("control")
const input = testid("hidden-input")

const expectToBeChecked = async (page: Page) => {
  await expect(page.locator(root)).toHaveAttribute("data-state", "checked")
  await expect(page.locator(label)).toHaveAttribute("data-state", "checked")
  await expect(page.locator(control)).toHaveAttribute("data-state", "checked")
}

test.beforeEach(async ({ page }) => {
  await page.goto("/checkbox")
})

test("should have no accessibility violation", async ({ page }) => {
  await a11y(page)
})

test("should be checked when clicked", async ({ page }) => {
  await page.click(root)
  await expectToBeChecked(page)
})

test("should be focused when page is tabbed", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(input)).toBeFocused()
  await expect(page.locator(control)).toHaveAttribute("data-focus", "")
})

test("should be checked when spacebar is pressed while focused", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await page.keyboard.press(" ")
  await expectToBeChecked(page)
})

test("should have disabled attributes when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await expect(page.locator(input)).toBeDisabled()
})

test("should not be focusable when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(input)).not.toBeFocused()
})

test("input is not blurred on label click", async ({ page }) => {
  let blurCount = 0
  await page.exposeFunction("trackBlur", () => blurCount++)
  await page.locator(input).evaluate((input) => {
    input.addEventListener("blur", (window as any).trackBlur)
  })
  await page.click(label)
  await page.click(label)
  await page.click(label)
  expect(blurCount).toBe(0)
})
