import { test, expect, type Page } from "@playwright/test"
import { a11y, testid } from "./_utils"

const menu = (id: string) => ({
  trigger: testid(`${id}:trigger`),
  content: testid(`${id}:content`),
})

const libraries = menu("libraries")
const frameworks = menu("frameworks")
const styles = menu("styles")

const menuItem = (id: string) => testid(`${id}:menu-item`)

test.describe("nav-menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nav-menu")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test.describe("keyboard: menus closed", () => {
    ;["ArrowDown", "ArrowRight"].forEach((key) => {
      test(`on '${key}': should move focus to the next trigger`, async ({ page }) => {
        await page.focus(libraries.trigger)
        await page.keyboard.press(key)
        await expect(page.locator(frameworks.trigger)).toBeFocused()
      })
    })
    ;["ArrowUp", "ArrowLeft"].forEach((key) => {
      test(`on '${key}': should move focus to the previous trigger`, async ({ page }) => {
        await page.focus(frameworks.trigger)
        await page.keyboard.press(key)
        await expect(page.locator(libraries.trigger)).toBeFocused()
      })
    })

    test("on `Home`: should move focus to the first trigger", async ({ page }) => {
      await page.focus(styles.trigger)
      await page.keyboard.press("Home")
      await expect(page.locator(libraries.trigger)).toBeFocused()
    })

    test("on `End`: should move focus to the last trigger", async ({ page }) => {
      await page.focus(libraries.trigger)
      await page.keyboard.press("End")
      await expect(page.locator(styles.trigger)).toBeFocused()
    })

    test("clicking a trigger should open its menu (but the trigger stays focused)", async ({ page }) => {
      await page.focus(libraries.trigger)
      await page.keyboard.press("Enter")
      await expect(page.locator(libraries.content)).toBeVisible()
      await expect(page.locator(libraries.trigger)).toBeFocused()
    })
  })

  test.describe("keyboard: when menu open", () => {
    test.beforeEach(async ({ page }) => {
      await page.focus(libraries.trigger)
      await page.keyboard.press("Enter")
    })

    test("on 'ArrowRight': should move focus to the next trigger and collapse menu", async ({ page }) => {
      await page.keyboard.press("ArrowRight")
      await expect(page.locator(frameworks.trigger)).toBeFocused()
      await expect(page.locator(libraries.content)).not.toBeVisible()
    })

    test("on 'ArrowDown': should move focus to the first item", async ({ page }) => {
      // Assuming nav menu orientation is horizontal
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(menuItem("react"))).toBeFocused()
    })

    test("on first item focus and 'Escape': should collapse the menu and move focus to the trigger", async ({
      page,
    }) => {
      // navigate from trigger to first item
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Escape")
      await expect(page.locator(libraries.trigger)).toBeFocused()
      await expect(page.locator(libraries.content)).not.toBeVisible()
    })

    test("on first item focus and 'End': should move focus to the last item", async ({ page }) => {
      // navigate from trigger to first item
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("End")
      await expect(page.locator(menuItem("solidjs"))).toBeFocused()
    })

    const clickFirstItem = async (page: Page) => {
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
    }

    test("on item click: should collapse the menu", async ({ page }) => {
      clickFirstItem(page)
      await expect(page.locator(libraries.content)).not.toBeVisible()
    })

    test("after item click: clicked item should have aria-current", async ({ page }) => {
      clickFirstItem(page)
      await expect(page.locator(menuItem("react"))).toHaveAttribute("aria-current", "page")
    })

    test("should tab through items and then to the next trigger", async ({ page }) => {
      await page.keyboard.press("ArrowDown")
      // Tab from "React" through "Vue" and "SolidJS"
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
      await expect(page.locator(frameworks.trigger)).toBeFocused()
      await expect(page.locator(libraries.content)).not.toBeVisible()
    })
  })
})
