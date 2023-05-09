import { expect, Page, test } from "@playwright/test"
import { a11y, controls, part } from "./__utils"

const root = part("root")
const label = part("label")
const control = part("control")
const input = part("input")

const expectToBeChecked = async (page: Page) => {
  await expect(page.locator(root)).toHaveAttribute("data-checked", "")
  await expect(page.locator(label)).toHaveAttribute("data-checked", "")
  await expect(page.locator(control)).toHaveAttribute("data-checked", "")
}

test.beforeEach(async ({ page }) => {
  await page.goto("/switch")
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
  await expect(page.locator(input)).toHaveAttribute("data-disabled", "")
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
