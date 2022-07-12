import { expect, test } from "@playwright/test"
import { a11y, testid } from "./__utils"

const dialog_1 = {
  trigger: testid("trigger-1"),
  underlay: testid("underlay-1"),
  close: testid("close-1"),
}

const dialog_2 = {
  trigger: testid("trigger-2"),
  underlay: testid("underlay-2"),
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

  test("should trap focus within dialog", async ({ page }) => {
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

  test("should close modal on underlay click", async ({ page }) => {
    await page.click(dialog_1.underlay, { force: true, position: { x: 10, y: 10 } })
    await expect(page.locator(dialog_1.trigger)).toBeFocused()
  })

  test.describe("nested dialog", () => {
    test.beforeEach(async ({ page }) => {
      await page.click(dialog_2.trigger)
    })

    test("should focus close button", async ({ page }) => {
      await expect(page.locator(dialog_2.close)).toBeFocused()
    })

    test("should trap focus", async ({ page }) => {
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
      await expect(page.locator(dialog_2.close)).toBeFocused()
    })

    test("should focus on nested buttton on escape", async ({ page }) => {
      await page.keyboard.press("Escape")
      await expect(page.locator(dialog_2.trigger)).toBeFocused()
    })

    test("should close modal on underlay click", async ({ page }) => {
      await Promise.all([
        page.click(dialog_2.underlay, { force: true, position: { x: 10, y: 10 } }),
        expect(page.locator(dialog_2.trigger)).toBeFocused(),
      ])
    })

    test("should close parent modal from child", async ({ page }) => {
      await page.click(special_close)
      await expect(page.locator(dialog_2.underlay)).not.toBeVisible()
      await expect(page.locator(dialog_1.underlay)).not.toBeVisible()
      await expect(page.locator(dialog_1.trigger)).toBeFocused()
    })
  })
})

test.describe("dialog default open", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog-default-open")
  })

  test("should be open and focus on close button", async ({ page }) => {
    await expect(page.locator(dialog_1.close)).toBeFocused()
  })
})
