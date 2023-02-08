import { expect, test } from "@playwright/test"
import { nativeInput, testid } from "./__utils"

const first = testid("input-1")
const second = testid("input-2")
const third = testid("input-3")
const clear = testid("clear-button")

test.describe("pin input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pin-input")
  })

  test("on type: should move focus to the next input", async ({ page }) => {
    await page.locator(first).type("1")
    await expect(page.locator(second)).toBeFocused()
    await page.locator(second).type("2")
    await expect(page.locator(third)).toBeFocused()
    await page.locator(third).type("3")
  })

  test("on backspace: should clear value and move focus to prev input", async ({ page }) => {
    await page.locator(first).type("1")
    await expect(page.locator(second)).toBeFocused()
    await page.locator(second).type("2")
    await expect(page.locator(third)).toBeFocused()
    await page.locator(third).press("Backspace")
    await expect(page.locator(second)).toBeFocused()
    await expect(page.locator(second)).toHaveValue("")
  })

  test("on arrow: should change focus between inputs", async ({ page }) => {
    // fill out all fields
    await page.locator(first).type("1")
    await page.locator(second).type("2")
    await page.locator(third).type("3")

    // navigate with arrow keys
    await page.keyboard.press("ArrowLeft")
    await expect(page.locator(second)).toBeFocused()
    await page.keyboard.press("ArrowRight")
    await expect(page.locator(third)).toBeFocused()
  })

  test("on clear: should clear values and focus first", async ({ page }) => {
    // fill out all fields
    await page.locator(first).type("1")
    await page.locator(second).type("2")
    await page.locator(third).type("3")

    // click clear
    await page.locator(clear).click()
    await expect(page.locator(first)).toBeFocused()
    await expect(page.locator(first)).toHaveValue("")
    await expect(page.locator(second)).toHaveValue("")
    await expect(page.locator(third)).toHaveValue("")
  })

  test("on paste: should autofill all fields", async ({ page }) => {
    await page.locator(first).focus()
    await page.$eval(first, nativeInput, "123")
    await expect(page.locator(first)).toHaveValue("1")
    await expect(page.locator(second)).toHaveValue("2")
    await expect(page.locator(third)).toHaveValue("3")
    await expect(page.locator(third)).toBeFocused()
  })

  test("on paste: should autofill all fields if focused field is not empty", async ({ page }) => {
    await page.locator(first).type("1")
    await page.locator(first).focus()
    await page.$eval(first, nativeInput, "123")
    await expect(page.locator(first)).toHaveValue("1")
    await expect(page.locator(second)).toHaveValue("2")
    await expect(page.locator(third)).toHaveValue("3")
    await expect(page.locator(third)).toBeFocused()
  })

  test("[different] should allow only single character", async ({ page }) => {
    await page.locator(first).type("1")
    await page.locator(second).type("2")
    await page.locator(first).focus()
    await page.locator(first).type("3")
    await expect(page.locator(first)).toHaveValue("3")
  })

  test("[same] should allow only single character", async ({ page }) => {
    await page.locator(first).type("1")
    await page.locator(first).focus()
    await page.locator(first).type("1")
    await expect(page.locator(first)).toHaveValue("1")
  })
})
