import { expect, test } from "@playwright/test"
import { a11y, setup } from "./test-utils"

const dialog_1 = {
  trigger: setup("trigger-1"),
  underlay: setup("underlay-1"),
  close: setup("close-1"),
}

const dialog_2 = {
  trigger: setup("trigger-2"),
  underlay: setup("underlay-2"),
  close: setup("close-2"),
}

const special_close = setup("special-close")

test.describe("dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dialog")
    await page.click(dialog_1.trigger.id)
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page, "[data-part=underlay] > [role=dialog]")
  })

  test("should focus on close button when dialog is open", async ({ page }) => {
    await expect(dialog_1.close.el(page)).toBeFocused()
  })

  test("should trap focus within dialog", async ({ page }) => {
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await expect(dialog_1.close.el(page)).toBeFocused()
  })

  test("should close modal on escape", async ({ page }) => {
    await page.keyboard.press("Escape")
    await expect(dialog_1.trigger.el(page)).toBeFocused()
  })

  test("should close modal on underlay click", async ({ page }) => {
    await page.click(dialog_1.underlay.id, { force: true, position: { x: 10, y: 10 } })
    await expect(dialog_1.trigger.el(page)).toBeFocused()
  })

  test.describe("nested dialog", () => {
    test.beforeEach(async ({ page }) => {
      await page.click(dialog_2.trigger.id)
    })

    test("should focus close button", async ({ page }) => {
      await expect(dialog_2.close.el(page)).toBeFocused()
    })

    test("should trap focus", async ({ page }) => {
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
      await expect(dialog_2.close.el(page)).toBeFocused()
    })

    test("should focus on nested buttton on escape", async ({ page }) => {
      await page.keyboard.press("Escape")
      await expect(dialog_2.trigger.el(page)).toBeFocused()
    })

    test("should close modal on underlay click", async ({ page }) => {
      await page.click(dialog_2.underlay.id, { force: true, position: { x: 10, y: 10 } })
      await expect(dialog_2.trigger.el(page)).toBeFocused()
    })

    test("should close parent modal from child", async ({ page }) => {
      await page.click(special_close.id)
      await expect(dialog_2.underlay.el(page)).not.toBeVisible()
      await expect(dialog_1.underlay.el(page)).not.toBeVisible()
      await expect(dialog_1.trigger.el(page)).toBeFocused()
    })
  })
})
