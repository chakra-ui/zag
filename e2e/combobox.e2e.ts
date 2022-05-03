import { test, expect, Page, Locator } from "@playwright/test"
import { testid, a11y } from "./__utils"

const input = testid("input")
const button = testid("input-arrow")
const listbox = testid("combobox-listbox")
const options = "[data-part=option]:not([data-disabled])"

const expectToBeChecked = async (page: Page, el: Locator) => {
  return await expect(el).toHaveAttribute("data-checked", "")
}

const expectToBeHighlighted = async (page: Page, el: Locator) => {
  return await expect(el).toHaveAttribute("data-highlighted", "")
}

const expectToBeSelected = async (page: Page, el: Locator) => {
  return await expect(el).toHaveAttribute("aria-selected", "true")
}

test.describe("combobox", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/combobox")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test("[pointer] should open combobox menu when arrow is clicked", async ({ page }) => {
    await page.click(button)
    await expect(page.locator(listbox)).toBeVisible()
    await expect(page.locator(input)).toBeFocused()
  })

  test("[typeahead / autohighlight / selection] should open combobox menu when typing", async ({ page }) => {
    await page.type(input, "an")
    await expect(page.locator(listbox)).toBeVisible()

    const option = page.locator(options).first()
    await expectToBeHighlighted(page, option)

    await page.keyboard.press("Enter")
    await expect(page.locator(input)).toHaveValue(await option.textContent())
    await expect(page.locator(listbox)).toBeHidden()
  })

  test("[pointer / selection]", async ({ page }) => {
    await page.click(button)

    const option_els = page.locator(options)
    await option_els.nth(0).hover()
    await expectToBeHighlighted(page, option_els.nth(0))

    await option_els.nth(1).hover()
    await option_els.nth(3).hover()
    const option = option_els.nth(3)
    option.click()

    await expect(page.locator(input)).toHaveValue(await option.textContent())
    await expect(page.locator(listbox)).toBeHidden()
  })

  test("[keyboard] on arrow down, open and highlight first enabled option", async ({ page }) => {
    await page.focus(input)
    await page.keyboard.press("ArrowDown")
    const option = page.locator(options).first()
    await expect(page.locator(listbox)).toBeVisible()
    await expectToBeHighlighted(page, option)
  })

  test("[keyboard] on arrow up, open and highlight last enabled option", async ({ page }) => {
    await page.focus(input)
    await page.keyboard.press("ArrowUp")
    const option = page.locator(options).last()
    await expect(page.locator(listbox)).toBeVisible()
    await expectToBeHighlighted(page, option)
  })

  test("[keyboard / opened] on home and end, when open, focus first and last option", async ({ page }) => {
    const option_els = page.locator(options)

    await page.click(button)

    // navigate a bit with the keyboard
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("ArrowDown")

    await page.keyboard.press("Home")
    await expectToBeHighlighted(page, option_els.first())

    await page.keyboard.press("End")
    await expectToBeHighlighted(page, option_els.last())
  })

  test("[keyboard / closed] on home and end, caret moves to start and end", async ({ page }) => {
    await page.click(button)
    await page.type(input, "an")

    // close
    await page.keyboard.press("Escape")

    await page.keyboard.press("Home")
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).selectionStart)).toBe(0)

    await page.keyboard.press("End")
    expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).selectionStart)).toBe(2)
  })
})
