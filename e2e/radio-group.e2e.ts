import { expect, Page, test } from "@playwright/test"
import { a11y, controls, testid } from "./__utils"

const apple = {
  radio: testid("radio-apple"),
  label: testid("label-apple"),
  input: testid("input-apple"),
  control: testid("control-apple"),
}

const grape = {
  radio: testid("radio-grape"),
  label: testid("label-grape"),
  input: testid("input-grape"),
  control: testid("control-grape"),
}

const expectToBeChecked = async (page: Page, item: typeof apple) => {
  await expect(page.locator(item.radio)).toHaveAttribute("data-checked", "")
  await expect(page.locator(item.label)).toHaveAttribute("data-checked", "")
  await expect(page.locator(item.control)).toHaveAttribute("data-checked", "")
}

test.beforeEach(async ({ page }) => {
  await page.goto("/radio")
})

test("should have no accessibility violation", async ({ page }) => {
  await a11y(page)
})

test("should be checked when clicked", async ({ page }) => {
  await page.click(apple.radio)
  await expectToBeChecked(page, apple)

  await page.click(grape.radio)
  await expectToBeChecked(page, grape)
})

test("should be focused when page is tabbed", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(apple.input)).toBeFocused()
  await expect(page.locator(apple.control)).toHaveAttribute("data-focus", "")
})

test("should be checked when spacebar is pressed while focused", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await page.keyboard.press(" ")
  await expectToBeChecked(page, apple)
})

test("should have disabled attributes when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await expect(page.locator(apple.input)).toHaveAttribute("data-disabled", "")
  await expect(page.locator(apple.input)).toBeDisabled()
})

test("should not be focusable when disabled", async ({ page }) => {
  await controls(page).bool("disabled")
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(apple.input)).not.toBeFocused()
})

test("should be focusable when readonly", async ({ page }) => {
  await controls(page).bool("readOnly")
  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(apple.input)).toBeFocused()
})

test("should be focused on active radio item when page is tabbed", async ({ page }) => {
  await page.click(grape.radio)
  await expectToBeChecked(page, grape)

  await page.click("main")
  await page.keyboard.press("Tab")
  await expect(page.locator(grape.input)).toBeFocused()
  await expect(page.locator(grape.control)).toHaveAttribute("data-focus", "")
})

test("should check items when navigating by arrows", async ({ page }) => {
  await page.click(apple.radio)
  await expectToBeChecked(page, apple)

  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowDown")

  await expectToBeChecked(page, grape)
})
