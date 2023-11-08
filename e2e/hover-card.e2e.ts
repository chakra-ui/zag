import { expect, test } from "@playwright/test"
import { a11y, part } from "./_utils"

const trigger = part("trigger")
const content = part("content")
const testText = part("test-text")

test.beforeEach(async ({ page }) => {
  await page.goto("/hover-card")
})

test("should have no accessibility violation", async ({ page }) => {
  await a11y(page, trigger)
})

test("content should be hidden by default", async ({ page }) => {
  await expect(page.locator(content)).not.toBeVisible()
})

test("should be opened after hovering trigger", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()
})

test("should have no accessibility violation in content", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await a11y(page, content)
})

test("should be opened after focusing trigger", async ({ page }) => {
  await page.focus(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()
})

test("should be closed after blurring trigger", async ({ page }) => {
  await page.focus(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.locator(trigger).evaluate((e) => e.blur())
  await page.waitForTimeout(500)
  await expect(page.locator(content)).not.toBeVisible()
})

test("should be closed after blurring trigger with keyboard", async ({ page }) => {
  await page.click("main")
  await page.keyboard.press("Tab")
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.keyboard.press("Tab")

  await page.waitForTimeout(500)
  await expect(page.locator(content)).not.toBeVisible()
})

test("should remain open after blurring trigger if pointer opens card", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.focus(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.locator(trigger).evaluate((e) => e.blur())
  await page.waitForTimeout(500)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(testText)
  await page.waitForTimeout(500)
  await expect(page.locator(content)).not.toBeVisible()
})

test("should remain open after moving from trigger to content", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(content)
  await expect(page.locator(content)).toBeVisible()
})

test("should remain open after moving from content back to trigger", async ({ page }) => {
  await page.hover(trigger)
  await page.waitForSelector(content)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(content)
  await expect(page.locator(content)).toBeVisible()

  await page.hover(trigger)
  await expect(page.locator(content)).toBeVisible()
})
