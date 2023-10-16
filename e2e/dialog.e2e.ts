import { expect, type Page, test } from "@playwright/test"
import { a11y, testid } from "./__utils"

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

async function openDialog(page: Page) {
  await page.goto("/dialog")
  await page.click(dialog_1.trigger)
}

async function openNestedDialog(page: Page) {
  await page.click(dialog_2.trigger)
}

test.describe("dialog", () => {
  test("should have no accessibility violation", async ({ page }) => {
    await openDialog(page)
    await a11y(page, "[role=dialog]")
  })

  test("should focus on close button when dialog is open", async ({ page }) => {
    await openDialog(page)
    await expect(page.locator(dialog_1.close)).toBeFocused()
  })

  test("should trap focus within dialog", async ({ page }) => {
    await openDialog(page)
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(page.locator(dialog_1.close)).toBeFocused()
  })

  test("should close modal on escape", async ({ page }) => {
    await openDialog(page)
    await page.keyboard.press("Escape")
    await expect(page.locator(dialog_1.trigger)).toBeFocused()
  })

  test("should close modal on positioner click", async ({ page }) => {
    await openDialog(page)
    await page.click(dialog_1.positioner, { force: true, position: { x: 10, y: 10 } })
    await expect(page.locator(dialog_1.trigger)).toBeFocused()
  })
})

test.describe("nested dialog", () => {
  test("should focus close button", async ({ page }) => {
    await openDialog(page)
    await openNestedDialog(page)
    await expect(page.locator(dialog_2.close)).toBeFocused()
  })

  test("should trap focus", async ({ page }) => {
    await openDialog(page)
    await openNestedDialog(page)
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(page.locator(dialog_2.close)).toBeFocused()
  })

  test("should focus on nested buttton on escape", async ({ page }) => {
    await openDialog(page)
    await openNestedDialog(page)
    await page.keyboard.press("Escape")
    await expect(page.locator(dialog_2.positioner)).not.toBeVisible()
    await expect(page.locator(dialog_2.trigger)).toBeFocused()
  })

  test("should close modal on positioner click", async ({ page }) => {
    await openDialog(page)
    await openNestedDialog(page)
    await page.click(dialog_2.positioner, { force: true, position: { x: 10, y: 10 } })
    await expect(page.locator(dialog_2.trigger)).toBeFocused()
  })

  test("should close parent modal from child", async ({ page }) => {
    await openDialog(page)
    await openNestedDialog(page)
    await page.click(special_close)
    await expect(page.locator(dialog_2.positioner)).not.toBeVisible()
    await expect(page.locator(dialog_1.positioner)).not.toBeVisible()
    await expect(page.locator(dialog_1.trigger)).toBeFocused()
  })
})
