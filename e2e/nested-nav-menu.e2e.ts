import { test, expect } from "@playwright/test"
import { testid } from "./_utils"
const menu = (id: string) => ({
  trigger: testid(`${id}:trigger`),
  content: testid(`${id}:content`),
})

const libraries = menu("libraries")

const moreMenu = menu("more")

const menuItem = (id: string) => testid(`${id}:menu-item`)

test.describe("nested nav-menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nested-nav-menu")
  })

  test.describe("keyboard: moving to nested menu", () => {
    test.beforeEach(async ({ page }) => {
      await page.focus(libraries.trigger)
      await page.keyboard.press("Enter")
      Array.from({ length: 4 }).forEach(async () => {
        await page.keyboard.press("ArrowDown")
        return
      })
    })
    test("should focus on nested trigger", async ({ page }) => {
      await expect(page.locator(menu("more").trigger)).toBeFocused()
    })

    test("opens nested menu when with trigger click and get first item focus", async ({ page }) => {
      await page.keyboard.press("Enter")
      await expect(page.locator(moreMenu.content)).toBeVisible()

      await page.keyboard.press("ArrowDown")
      await expect(page.locator(menuItem("svelte"))).toBeFocused()
    })

    test('after nested item focus: "Escape" should place focus back to nested trigger', async ({ page }) => {
      await page.keyboard.press("Enter")
      await page.keyboard.press("ArrowDown")

      await page.keyboard.press("Escape")

      await expect(page.locator(moreMenu.trigger)).toBeFocused()
    })

    test("clicking a nested link collapses the entire menu set", async ({ page }) => {
      await page.keyboard.press("Enter")
      await page.keyboard.press("ArrowDown")

      await page.keyboard.press("Enter")
      await expect(page.locator(libraries.content)).not.toBeVisible()
    })
  })
})
