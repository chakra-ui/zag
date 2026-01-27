import { expect, test } from "@playwright/test"

const trigger = (id: number) => `[data-scope="dialog"][data-part="trigger"][data-value="${id}"]`
const content = '[data-scope="dialog"][data-part="content"]'
const closeTrigger = '[data-scope="dialog"][data-part="close-trigger"]'

test.describe("dialog / multiple triggers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog-multiple-trigger")
  })

  test("should open dialog from different triggers", async ({ page }) => {
    // Open from first trigger
    await page.click(trigger(1))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Alice Johnson")

    // Close dialog
    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()

    // Open from different trigger - should show different user
    await page.click(trigger(3))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Carol Davis")
  })

  test("should close dialog on close trigger click", async ({ page }) => {
    await page.click(trigger(2))
    await expect(page.locator(content)).toBeVisible()
    await expect(page.locator(content)).toContainText("Bob Smith")

    await page.click(closeTrigger)
    await expect(page.locator(content)).toBeHidden()
  })

  test("should close dialog on escape", async ({ page }) => {
    await page.click(trigger(1))
    await expect(page.locator(content)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
  })

  test("should focus trigger on close", async ({ page }) => {
    await page.click(trigger(4))
    await expect(page.locator(content)).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.locator(content)).toBeHidden()
    await expect(page.locator(trigger(4))).toBeFocused()
  })
})
