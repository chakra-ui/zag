import { expect, test } from "@playwright/test"
import { a11y, testid } from "./_utils"

const dialog_1 = {
  trigger: testid("trigger-1"),
  positioner: testid("positioner-1"),
  close: testid("close-1"),
}

const dialog_2 = {
  trigger: testid("trigger-2"),
  positioner: testid("positioner-2"),
  close: testid("close-2"),
}

const special_close = testid("special-close")

test.describe("dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog")
    await page.click(dialog_1.trigger)
  })
  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page, "[role=dialog]")
  })

  test("should focus on close button when dialog is open", async ({ page }) => {
    await expect(page.locator(dialog_1.close)).toBeFocused()
  })

  test.fixme("should trap focus", async ({ page }) => {
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(page.locator(dialog_1.close)).toBeFocused()
  })

  test("should close modal on escape", async ({ page }) => {
    await page.keyboard.press("Escape")
    await expect(page.locator(dialog_1.trigger)).toBeFocused()
  })

  test.fixme("should close modal on outside click", async ({ page }) => {
    await page.click("body", { force: true, position: { x: 10, y: 10 } })
    await expect(page.locator(dialog_1.trigger)).toBeFocused()
  })
})

test.describe("nested dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog")
    await page.click(dialog_1.trigger)
    await page.click(dialog_2.trigger, { delay: 17 })
  })

  test("should focus close button", async ({ page }) => {
    await expect(page.locator(dialog_2.close)).toBeFocused()
  })

  test.fixme("should trap focus", async ({ page }) => {
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(page.locator(dialog_2.close)).toBeFocused()
  })

  test.fixme("should focus on nested buttton on escape", async ({ page }) => {
    await page.keyboard.press("Escape", { delay: 17 })
    await expect(page.locator(dialog_2.positioner)).not.toBeVisible()
    await expect(page.locator(dialog_2.trigger)).toBeFocused()
  })

  test("should close modal on outside click", async ({ page }) => {
    await page.click("body", { force: true, delay: 17, position: { x: 10, y: 10 } })
    await expect(page.locator(dialog_2.trigger)).toBeFocused()
  })

  test("should close parent modal from child", async ({ page }) => {
    await page.click(special_close)
    await expect(page.locator(dialog_2.positioner)).not.toBeVisible()
    await expect(page.locator(dialog_1.positioner)).not.toBeVisible()
    await expect(page.locator(dialog_1.trigger)).toBeFocused()
  })
})
