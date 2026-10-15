import { expect, test } from "@playwright/test"
import { testid } from "./_utils"

const trigger = testid("trigger")
const menu = testid("menu")
const share = { trigger: testid("share"), menu: testid("share-submenu") }
const exportMenu = { trigger: testid("export"), menu: testid("export-submenu") }
const deleteItem = testid("delete")

test.describe("nested controlled menu / pointer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu/nested-controlled")
    await page.click(trigger)
    await expect(page.locator(menu)).toBeVisible()
  })

  test("should open the submenu when the pointer rests on its trigger", async ({ page }) => {
    await page.hover(share.trigger)
    await expect(page.locator(share.menu)).toBeVisible()
  })

  test("should not open the submenu when the pointer leaves its trigger before the open delay", async ({ page }) => {
    await page.hover(share.trigger)
    await page.hover(deleteItem)
    await page.waitForTimeout(400)

    await expect(page.locator(share.menu)).toBeHidden()
    await expect(page.locator(menu)).toBeFocused()
    await expect(page.locator(deleteItem)).toHaveAttribute("data-highlighted", "")
  })

  test("should not open the submenus the pointer swept across", async ({ page }) => {
    await page.hover(share.trigger)
    await page.hover(exportMenu.trigger)
    await page.hover(deleteItem)
    await page.waitForTimeout(400)

    await expect(page.locator(share.menu)).toBeHidden()
    await expect(page.locator(exportMenu.menu)).toBeHidden()
    await expect(page.locator(menu)).toBeFocused()
  })

  test("should keep the submenu open when moving the pointer into it", async ({ page }) => {
    await page.hover(share.trigger)
    await expect(page.locator(share.menu)).toBeVisible()

    await page.hover(testid("email"))
    await page.waitForTimeout(400)

    await expect(page.locator(share.menu)).toBeVisible()
    await expect(page.locator(testid("email"))).toHaveAttribute("data-highlighted", "")
  })
})
