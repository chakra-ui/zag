import { test, expect, type Page } from "@playwright/test"
import { a11y, clickOutside, testid } from "./_utils"

const item = (id: string) => ({
  trigger: testid(`${id}:trigger`),
  link: testid(`${id}:link`),
  content: testid(`${id}:content`),
})

const librariesTrigger = item("libraries").trigger
const frameworksTrigger = item("frameworks").trigger
const toolsTrigger = item("tools").link

const librariesContent = item("libraries").content

const reactLink = item("react").link
const vueLink = item("vue").link
const solidLink = item("solid").link

const clickFirstItem = async (page: Page) => {
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
}

test.describe("nav-menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nav-menu")
  })

  test("should have no accessibility violations", async ({ page }) => {
    await a11y(page)
  })

  test.describe("keyboard: list with triggers", () => {
    test("on `ArrowDown`: should move focus to the next trigger", async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(frameworksTrigger)).toBeFocused()
    })

    test("on `ArrowRight`: should move focus to the next trigger", async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("ArrowRight")
      await expect(page.locator(frameworksTrigger)).toBeFocused()
    })

    test("on `ArrowUp`: should move focus to the previous trigger", async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowUp")
      await expect(page.locator(librariesTrigger)).toBeFocused()
    })

    test("on `ArrowLeft`: should move focus to the previous trigger", async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowLeft")
      await expect(page.locator(librariesTrigger)).toBeFocused()
    })

    test("on `End`: should move focus to the last trigger", async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("End")
      await expect(page.locator(toolsTrigger)).toBeFocused()
    })

    test("on `Home`: should move focus to the first trigger", async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("End")
      await page.keyboard.press("Home")
      await expect(page.locator(librariesTrigger)).toBeFocused()
    })

    test("clicking on a trigger should open its menu (but the trigger stays focused)", async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("Enter")
      await expect(page.locator(librariesContent)).toBeVisible()
      await expect(page.locator(librariesTrigger)).toBeFocused()
    })
  })

  test.describe("keyboard: menu open", () => {
    test.beforeEach(async ({ page }) => {
      await page.focus(librariesTrigger)
      await page.keyboard.press("Enter")
    })

    test("on `ArrowRight` from trigger: should move focus to the next trigger, keeping the menu open", async ({
      page,
    }) => {
      await page.keyboard.press("ArrowRight")
      await expect(page.locator(frameworksTrigger)).toBeFocused()
      await expect(page.locator(librariesContent)).toBeVisible()
    })

    test("on `ArrowDown` from trigger: should move focus to the first item, then again to the next item", async ({
      page,
    }) => {
      // Assuming nav menu orientation is horizontal
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(reactLink)).toBeFocused()
      await page.keyboard.press("ArrowDown")
      await expect(page.locator(vueLink)).toBeFocused()
    })

    test("on first item focus and 'Escape': should collapse the menu and move focus to the trigger", async ({
      page,
    }) => {
      // navigate from trigger to first item
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Escape")
      await expect(page.locator(librariesTrigger)).toBeFocused()
      await expect(page.locator(librariesContent)).not.toBeVisible()
    })

    test("on first item focus and 'End': should move focus to the last item", async ({ page }) => {
      // navigate from trigger to first item
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("End")
      await expect(page.locator(solidLink)).toBeFocused()
    })

    test("should tab through items and then to the next trigger", async ({ page }) => {
      await page.keyboard.press("ArrowDown")
      // Tab from "React" through "Vue", "Angular", and "Solid"
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
      await page.keyboard.press("Tab")
      await expect(page.locator(frameworksTrigger)).toBeFocused()
      await expect(page.locator(librariesContent)).toBeVisible()
    })
  })

  test.describe("click", () => {
    test.beforeEach(async ({ page }) => {
      await page.click(librariesTrigger)
    })
    test("should open menu on trigger click", async ({ page }) => {
      await expect(page.locator(librariesContent)).toBeVisible()
    })

    test("should collapse menu when clicking a link", async ({ page }) => {
      await page.click(reactLink)
      await expect(page.locator(librariesContent)).not.toBeVisible()
    })

    test("clicking outside the open menu will collapse it", async ({ page }) => {
      await clickOutside(page)
      await expect(page.locator(librariesContent)).not.toBeVisible()
    })

    test("on item click: should collapse the menu", async ({ page }) => {
      clickFirstItem(page)
      await expect(page.locator(librariesContent)).not.toBeVisible()
    })

    test("after item click: clicked item should have aria-current", async ({ page }) => {
      clickFirstItem(page)
      await expect(page.locator(reactLink)).toHaveAttribute("aria-current", "page")
    })
  })
})
