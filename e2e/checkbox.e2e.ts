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

test("should have aria-checked as mixed when indeterminate ", async ({ page }) => {
  await controls(page).bool("indeterminate")
  await expect(page.locator(input)).toHaveAttribute("aria-checked", "mixed")
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

test("should be focusable when readonly", async ({ page }) => {
  await controls(page).bool("readOnly")
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(input)).toBeFocused()
})

test("should not be changeable when readonly", async ({ page }) => {
  await controls(page).bool("readOnly")
  await page.click(root)
  await expect(page.locator(input)).toHaveAttribute("aria-checked", "false")
})
