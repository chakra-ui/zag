import { expect, test } from "@playwright/test"
import { testid } from "./_utils"

const trigger = testid("trigger")
const menu = testid("menu")

test.describe("menu option", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu-options")
  })

  test("should check/uncheck radio item", async ({ page }) => {
    const ascending = page.locator(`[id=asc]`).first()
    const descending = page.locator(`[id=desc]`).first()

    await page.click(trigger)
    await ascending.click()

    await expect(page.locator(menu)).not.toBeVisible()
    await expect(ascending).toBeChecked()

    await page.click(trigger)
    await descending.click()
    await expect(descending).toBeChecked()
    await expect(ascending).not.toBeChecked()
  })

  test("should check/uncheck checkbox item", async ({ page }) => {
    const email = page.locator(`[id=email]`).first()
    const phone = page.locator(`[id=phone]`).first()

    await page.click(trigger)
    await email.click()

    await expect(page.locator(menu)).not.toBeVisible()
    await expect(email).toBeChecked()

    await page.click(trigger)
    await phone.click()
    await expect(phone).toBeChecked()
    await expect(email).toBeChecked()
  })
})
